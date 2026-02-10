"""Flask application: routes, session management, and game orchestration."""

import os
import io
import json
import secrets

from typing import Optional

from flask import (
    Flask,
    render_template,
    request,
    jsonify,
    redirect,
    session,
    url_for,
)
from PIL import Image
from dotenv import load_dotenv

from game_engine import GameEngine, GameState, TOTAL_PUZZLES, ROOM_TIME_SECONDS
from prompts import THEME_DESCRIPTIONS

load_dotenv()

app = Flask(__name__)
app.secret_key = os.environ.get("FLASK_SECRET_KEY", secrets.token_hex(32))

engine = GameEngine()


# ---------------------------------------------------------------------------
# Helper: session state management
# ---------------------------------------------------------------------------
def get_game_state() -> Optional[GameState]:
    """Load game state from Flask session."""
    data = session.get("game_state")
    if data:
        return GameState.from_dict(data)
    return None


def save_game_state(state: GameState):
    """Save game state to Flask session."""
    session["game_state"] = state.to_dict()


# ---------------------------------------------------------------------------
# Routes: Pages
# ---------------------------------------------------------------------------
@app.route("/")
def lobby():
    """Lobby page: theme selection."""
    # Clear any existing game
    session.pop("game_state", None)
    return render_template("lobby.html", themes=THEME_DESCRIPTIONS)


@app.route("/room")
def room():
    """Main game room page."""
    state = get_game_state()
    if not state or state.status == "lobby":
        return redirect(url_for("lobby"))
    if state.status in ("victory", "defeat"):
        return redirect(url_for("result"))

    puzzle = state.current_puzzle
    theme_data = THEME_DESCRIPTIONS.get(state.theme, {})

    return render_template(
        "room.html",
        theme=state.theme,
        theme_data=theme_data,
        puzzle=puzzle.to_dict() if puzzle else None,
        puzzle_number=state.current_puzzle_index + 1,
        total_puzzles=TOTAL_PUZZLES,
        score=state.score,
        remaining_seconds=state.remaining_seconds,
        room_time=ROOM_TIME_SECONDS,
        narrative_log=state.narrative_log,
    )


@app.route("/result")
def result():
    """Victory/defeat result page."""
    state = get_game_state()
    if not state or state.status not in ("victory", "defeat"):
        return redirect(url_for("lobby"))

    breakdown = engine.get_score_breakdown(state)
    theme_data = THEME_DESCRIPTIONS.get(state.theme, {})

    return render_template(
        "result.html",
        breakdown=breakdown,
        theme=state.theme,
        theme_data=theme_data,
    )


# ---------------------------------------------------------------------------
# Routes: API (JSON endpoints for fetch calls)
# ---------------------------------------------------------------------------
@app.route("/start", methods=["POST"])
def start_game():
    """Start a new game with the selected theme."""
    data = request.get_json()
    theme = data.get("theme", "theoffice")
    difficulty = int(data.get("difficulty", 2))

    if theme not in THEME_DESCRIPTIONS:
        return jsonify({"error": "Invalid theme"}), 400

    try:
        state = engine.start_game(theme, difficulty=difficulty)
        state = engine.generate_puzzle(state)
        save_game_state(state)
    except Exception as e:
        app.logger.error("Failed to start game: %s", e)
        return jsonify({"error": f"AI is busy — please try again in a moment. ({type(e).__name__})"}), 503

    return jsonify({
        "success": True,
        "redirect": url_for("room"),
    })


@app.route("/answer", methods=["POST"])
def submit_answer():
    """Submit an answer for the current puzzle."""
    state = get_game_state()
    if not state or state.status != "playing":
        return jsonify({"error": "No active game"}), 400

    # Check time
    if state.is_time_up:
        state.status = "defeat"
        save_game_state(state)
        return jsonify({"time_up": True, "redirect": url_for("result")})

    data = request.get_json()
    player_answer = data.get("answer", "").strip()

    if not player_answer:
        return jsonify({"error": "Please enter an answer"}), 400

    try:
        state, result = engine.check_answer(state, player_answer)
    except Exception as e:
        app.logger.error("Answer validation failed: %s", e)
        return jsonify({"correct": False, "feedback": "AI is momentarily busy. Try submitting again."})

    if result.get("game_complete"):
        save_game_state(state)
        return jsonify({
            **result,
            "redirect": url_for("result"),
        })

    if result.get("next_puzzle"):
        # Generate next puzzle
        try:
            state = engine.generate_puzzle(state)
        except Exception as e:
            app.logger.error("Puzzle generation failed: %s", e)
            # Save state so /next-puzzle can retry
            save_game_state(state)
            return jsonify({**result, "needs_retry": True})
        save_game_state(state)
        puzzle = state.current_puzzle
        return jsonify({
            **result,
            "puzzle": puzzle.to_dict() if puzzle else None,
            "puzzle_number": state.current_puzzle_index + 1,
            "remaining_seconds": state.remaining_seconds,
            "narrative_log": state.narrative_log,
        })

    if result.get("time_up"):
        save_game_state(state)
        return jsonify({**result, "redirect": url_for("result")})

    save_game_state(state)
    return jsonify(result)


@app.route("/hint", methods=["POST"])
def get_hint():
    """Request a hint for the current puzzle."""
    state = get_game_state()
    if not state or state.status != "playing":
        return jsonify({"error": "No active game"}), 400

    if state.is_time_up:
        state.status = "defeat"
        save_game_state(state)
        return jsonify({"time_up": True, "redirect": url_for("result")})

    state, result = engine.get_hint(state)
    save_game_state(state)

    return jsonify({
        **result,
        "remaining_seconds": state.remaining_seconds,
    })


@app.route("/start-custom", methods=["POST"])
def start_custom_game():
    """Start a custom game from an uploaded image."""
    if "image" not in request.files:
        return jsonify({"error": "No image uploaded"}), 400

    file = request.files["image"]
    if file.filename == "":
        return jsonify({"error": "No file selected"}), 400

    try:
        image = Image.open(io.BytesIO(file.read()))
        state = engine.start_game("custom")
        state = engine.generate_image_puzzle(state, image)
        save_game_state(state)

        return jsonify({
            "success": True,
            "redirect": url_for("room"),
        })
    except Exception as e:
        app.logger.error("Failed to start custom game: %s", e)
        return jsonify({"error": f"AI is busy — please try again. ({type(e).__name__})"}), 503


@app.route("/reveal", methods=["POST"])
def reveal_answer():
    """Reveal the answer for the current puzzle without skipping or scoring."""
    state = get_game_state()
    if not state or state.status != "playing":
        return jsonify({"error": "No active game"}), 400

    if state.is_time_up:
        state.status = "defeat"
        save_game_state(state)
        return jsonify({"time_up": True, "redirect": url_for("result")})

    puzzle = state.current_puzzle
    if not puzzle:
        return jsonify({"error": "No active puzzle"}), 400

    return jsonify({"answer": puzzle.answer})


@app.route("/skip", methods=["POST"])
def skip_puzzle():
    """Skip the current puzzle (0 points, answer revealed)."""
    state = get_game_state()
    if not state or state.status != "playing":
        return jsonify({"error": "No active game"}), 400

    if state.is_time_up:
        state.status = "defeat"
        save_game_state(state)
        return jsonify({"time_up": True, "redirect": url_for("result")})

    state, result = engine.skip_puzzle(state)

    if result.get("game_complete"):
        save_game_state(state)
        return jsonify({**result, "redirect": url_for("result")})

    if result.get("next_puzzle"):
        try:
            state = engine.generate_puzzle(state)
        except Exception as e:
            app.logger.error("Puzzle generation after skip failed: %s", e)
            save_game_state(state)
            return jsonify({**result, "error_generating": True})

        save_game_state(state)
        puzzle = state.current_puzzle
        return jsonify({
            **result,
            "puzzle": puzzle.to_dict() if puzzle else None,
            "puzzle_number": state.current_puzzle_index + 1,
            "remaining_seconds": state.remaining_seconds,
            "narrative_log": state.narrative_log,
        })

    save_game_state(state)
    return jsonify(result)


@app.route("/next-puzzle", methods=["POST"])
def next_puzzle():
    """Retry generating the next puzzle (called when initial generation failed)."""
    state = get_game_state()
    if not state or state.status != "playing":
        return jsonify({"error": "No active game"}), 400

    if state.is_time_up:
        state.status = "defeat"
        save_game_state(state)
        return jsonify({"time_up": True, "redirect": url_for("result")})

    try:
        state = engine.generate_puzzle(state)
    except Exception as e:
        app.logger.error("Retry puzzle generation failed: %s", e)
        return jsonify({"needs_retry": True})

    save_game_state(state)
    puzzle = state.current_puzzle
    return jsonify({
        "success": True,
        "puzzle": puzzle.to_dict() if puzzle else None,
        "puzzle_number": state.current_puzzle_index + 1,
        "remaining_seconds": state.remaining_seconds,
        "narrative_log": state.narrative_log,
    })


@app.route("/time-check", methods=["POST"])
def time_check():
    """Check if time is still remaining (called periodically by JS)."""
    state = get_game_state()
    if not state or state.status != "playing":
        return jsonify({"active": False})

    if state.is_time_up:
        state.status = "defeat"
        save_game_state(state)
        return jsonify({
            "active": False,
            "time_up": True,
            "redirect": url_for("result"),
        })

    return jsonify({
        "active": True,
        "remaining_seconds": state.remaining_seconds,
    })


# ---------------------------------------------------------------------------
# Run
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5001)
