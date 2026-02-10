"""Flask application: routes, session management, and game orchestration."""

import os
import io
import json
import re
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
from flask_wtf.csrf import CSRFProtect
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from PIL import Image
from dotenv import load_dotenv

from game_engine import GameEngine, GameState, PuzzleState, TOTAL_PUZZLES, ROOM_TIME_SECONDS
from prompts import THEME_DESCRIPTIONS
import puzzle_cache

load_dotenv()

app = Flask(__name__)
app.secret_key = os.environ.get("FLASK_SECRET_KEY", secrets.token_hex(32))

# --- Fix #6: Limit upload size to 10 MB ---
app.config["MAX_CONTENT_LENGTH"] = 10 * 1024 * 1024  # 10 MB

# --- Fix #3: CSRF protection on all POST endpoints ---
csrf = CSRFProtect(app)

# --- Fix #4: Rate limiting ---
limiter = Limiter(
    get_remote_address,
    app=app,
    default_limits=["120 per minute"],
    storage_uri="memory://",
)

engine = GameEngine()


def _session_id() -> str:
    """Get or create a stable session ID for puzzle caching."""
    sid = session.get("_cache_id")
    if not sid:
        sid = secrets.token_hex(8)
        session["_cache_id"] = sid
    return sid


def _apply_cached_puzzle(state: GameState, cached: dict) -> GameState:
    """Apply a pre-generated cached puzzle to the game state."""
    puzzle = PuzzleState(**cached["puzzle"])
    state.current_puzzle = puzzle
    state.puzzles.append(cached["puzzle"])
    if cached.get("narrative_text"):
        state.narrative_log.append(cached["narrative_text"])
    return state


def _get_next_puzzle(state: GameState) -> GameState:
    """Get the next puzzle from cache or generate on-demand."""
    sid = _session_id()
    puzzle_idx = state.current_puzzle_index

    # Try cache first
    cached = puzzle_cache.get_cached_puzzle(sid, puzzle_idx)
    if cached:
        app.logger.info("⚡ Using cached puzzle %d", puzzle_idx + 1)
        return _apply_cached_puzzle(state, cached)

    # Fall back to on-demand generation
    app.logger.info("🔄 Cache miss for puzzle %d, generating on-demand...", puzzle_idx + 1)
    return engine.generate_puzzle(state)


# ---------------------------------------------------------------------------
# Helper: sanitize player input (Fix #7)
# ---------------------------------------------------------------------------
def _sanitize_input(text: str, max_length: int = 200) -> str:
    """Sanitize player-supplied text before it enters AI prompts.

    - Truncates to *max_length* characters.
    - Strips leading/trailing whitespace.
    - Removes characters that could be used for prompt-injection framing
      (e.g. triple-backticks, system/user/assistant role markers).
    """
    text = text.strip()[:max_length]
    # Remove markdown code fences that could wrap fake JSON / system prompts
    text = text.replace("```", "")
    # Remove common role-injection markers
    text = re.sub(r"(?i)\b(system|assistant|user)\s*:", "", text)
    # Collapse excessive whitespace
    text = re.sub(r"\s{3,}", "  ", text)
    return text


def _session_id() -> str:
    """Get or create a stable session ID for puzzle caching."""
    sid = session.get("_cache_id")
    if not sid:
        sid = secrets.token_hex(8)
        session["_cache_id"] = sid
    return sid


def _apply_cached_puzzle(state: GameState, cached: dict) -> GameState:
    """Apply a pre-generated cached puzzle to the game state."""
    puzzle = PuzzleState(**cached["puzzle"])
    state.current_puzzle = puzzle
    state.puzzles.append(cached["puzzle"])
    if cached.get("narrative_text"):
        state.narrative_log.append(cached["narrative_text"])
    return state


def _get_next_puzzle(state: GameState) -> GameState:
    """Get the next puzzle from cache or generate on-demand."""
    sid = _session_id()
    puzzle_idx = state.current_puzzle_index

    # Try cache first
    cached = puzzle_cache.get_cached_puzzle(sid, puzzle_idx)
    if cached:
        app.logger.info("⚡ Using cached puzzle %d", puzzle_idx + 1)
        return _apply_cached_puzzle(state, cached)

    # Fall back to on-demand generation
    app.logger.info("🔄 Cache miss for puzzle %d, generating on-demand...", puzzle_idx + 1)
    return engine.generate_puzzle(state)


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
    # Invalidate any cached puzzles from previous game
    sid = session.get("_cache_id")
    if sid:
        puzzle_cache.invalidate_session(sid)
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
@limiter.limit("10 per minute")
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

        # Start background pre-generation of puzzles 2-5
        sid = _session_id()
        puzzle_cache.start_precaching(sid, state)
    except Exception as e:
        app.logger.error("Failed to start game: %s", e)
        return jsonify({"error": f"AI is busy — please try again in a moment. ({type(e).__name__})"}), 503

    return jsonify({
        "success": True,
        "redirect": url_for("room"),
    })


@app.route("/answer", methods=["POST"])
@limiter.limit("30 per minute")
def submit_answer():
    """Submit an answer for the current puzzle."""
    state = get_game_state()
    if not state or state.status != "playing":
        return jsonify({"error": "No active game"}), 400

    # --- Fix #2: Block submission if answer was revealed ---
    if session.get("revealed_puzzle") == state.current_puzzle_index:
        return jsonify({"error": "You already revealed the answer for this puzzle. Use Skip to move on."}), 400

    # Check time
    if state.is_time_up:
        state.status = "defeat"
        save_game_state(state)
        return jsonify({"time_up": True, "redirect": url_for("result")})

    data = request.get_json()
    # --- Fix #7: Sanitize player input ---
    player_answer = _sanitize_input(data.get("answer", ""))

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
        # Try cache first, fall back to on-demand generation
        sid = _session_id()
        next_idx = state.current_puzzle_index
        cached = puzzle_cache.get_cached_puzzle(sid, next_idx)

        if cached:
            app.logger.info("⚡ [Answer] Using cached puzzle %d", next_idx + 1)
            state.puzzles.append(cached["puzzle"])
            if cached.get("narrative_text"):
                state.narrative_log.append(cached["narrative_text"])
        else:
            app.logger.info("🐢 [Answer] Cache miss for puzzle %d, generating on-demand", next_idx + 1)
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
@limiter.limit("20 per minute")
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
@limiter.limit("5 per minute")
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

    # --- Fix #2: Mark this puzzle as revealed so /answer rejects submissions ---
    session["revealed_puzzle"] = state.current_puzzle_index

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
        # Try cache first
        sid = _session_id()
        next_idx = state.current_puzzle_index
        cached = puzzle_cache.get_cached_puzzle(sid, next_idx)

        if cached:
            app.logger.info("⚡ [Skip] Using cached puzzle %d", next_idx + 1)
            state.puzzles.append(cached["puzzle"])
            if cached.get("narrative_text"):
                state.narrative_log.append(cached["narrative_text"])
        else:
            app.logger.info("🐢 [Skip] Cache miss for puzzle %d, generating on-demand", next_idx + 1)
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

    # Try cache first
    sid = _session_id()
    cached = puzzle_cache.get_cached_puzzle(sid, state.current_puzzle_index)
    if cached:
        app.logger.info("⚡ [Cache HIT] Using cached puzzle %d", state.current_puzzle_index + 1)
        state.puzzles.append(cached["puzzle"])
        if cached.get("narrative_text"):
            state.narrative_log.append(cached["narrative_text"])
    else:
        app.logger.info("🐢 [Cache MISS] Generating puzzle %d on-demand", state.current_puzzle_index + 1)
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


@app.route("/cache-status", methods=["GET"])
def cache_status():
    """Debug endpoint: check puzzle cache status for current session."""
    if not app.debug:
        return jsonify({"error": "Not available"}), 404
    sid = session.get("_cache_id")
    if not sid:
        return jsonify({"error": "No session"}), 400
    status = puzzle_cache.get_cache_status(sid)
    return jsonify(status)


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
