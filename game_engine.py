"""Game engine: state machine, puzzle lifecycle, scoring, and session management."""

import re
import time
import random
from difflib import SequenceMatcher
from dataclasses import dataclass, field, asdict
from typing import Optional, List

from ai_client import generate_json, validate_answer, analyze_image
from prompts import (
    PUZZLE_GENERATION_SYSTEM,
    ANSWER_VALIDATION_SYSTEM,
    IMAGE_ANALYSIS_SYSTEM,
    HINT_SYSTEM,
    THEME_DESCRIPTIONS,
    puzzle_generation_prompt,
    answer_validation_prompt,
    image_analysis_prompt,
    hint_prompt,
)

TOTAL_PUZZLES = 5
ROOM_TIME_SECONDS = 15 * 60  # 15 minutes
HINT_PENALTY_SECONDS = 60  # 1 minute per hint


@dataclass
class PuzzleState:
    """Current puzzle data."""
    question: str = ""
    puzzle_type: str = ""
    answer: str = ""
    hints: List[str] = field(default_factory=list)
    narrative_text: str = ""
    difficulty: int = 1
    hints_used: int = 0
    attempts: int = 0
    solved: bool = False
    solve_time: float = 0.0  # seconds to solve
    started_at: float = 0.0
    is_easter_egg: bool = False

    def to_dict(self) -> dict:
        return asdict(self)

    @classmethod
    def from_dict(cls, data: dict) -> "PuzzleState":
        # Filter to only known fields (handles old sessions)
        import dataclasses
        valid = {f.name for f in dataclasses.fields(cls)}
        return cls(**{k: v for k, v in data.items() if k in valid})


@dataclass
class GameState:
    """Full game session state."""
    theme: str = ""
    status: str = "lobby"  # lobby | playing | victory | defeat
    current_puzzle_index: int = 0
    puzzles: List[dict] = field(default_factory=list)  # list of PuzzleState dicts
    score: int = 0
    total_hints_used: int = 0
    start_time: float = 0.0
    time_penalties: float = 0.0  # total hint time penalties in seconds
    narrative_log: List[str] = field(default_factory=list)
    difficulty_level: int = 2  # adaptive difficulty 1-5
    solved_count: int = 0
    easter_egg_puzzle: int = -1  # index of the easter egg puzzle

    def to_dict(self) -> dict:
        return asdict(self)

    @classmethod
    def from_dict(cls, data: dict) -> "GameState":
        # Filter to only known fields (handles old sessions)
        import dataclasses
        valid = {f.name for f in dataclasses.fields(cls)}
        return cls(**{k: v for k, v in data.items() if k in valid})

    @property
    def elapsed_seconds(self) -> float:
        if self.start_time == 0:
            return 0
        return time.time() - self.start_time

    @property
    def remaining_seconds(self) -> float:
        remaining = ROOM_TIME_SECONDS - self.elapsed_seconds - self.time_penalties
        return max(0, remaining)

    @property
    def is_time_up(self) -> bool:
        return self.remaining_seconds <= 0

    @property
    def current_puzzle(self) -> Optional[PuzzleState]:
        if 0 <= self.current_puzzle_index < len(self.puzzles):
            return PuzzleState.from_dict(self.puzzles[self.current_puzzle_index])
        return None

    def update_current_puzzle(self, puzzle: PuzzleState):
        if 0 <= self.current_puzzle_index < len(self.puzzles):
            self.puzzles[self.current_puzzle_index] = puzzle.to_dict()


class GameEngine:
    """Manages the escape room game logic."""

    def start_game(self, theme: str, difficulty: int = 2) -> GameState:
        """Initialize a new game session."""
        state = GameState(
            theme=theme,
            status="playing",
            start_time=time.time(),
            difficulty_level=max(1, min(5, difficulty)),
            easter_egg_puzzle=random.randint(1, TOTAL_PUZZLES - 1),  # never first puzzle
        )
        return state

    def generate_puzzle(self, state: GameState) -> GameState:
        """Generate the next puzzle using AI."""
        previous_puzzles = []
        for p_dict in state.puzzles:
            p = PuzzleState.from_dict(p_dict)
            previous_puzzles.append({
                "type": p.puzzle_type,
                "answer": p.answer,
            })

        narrative_so_far = " ".join(state.narrative_log) if state.narrative_log else ""

        is_egg = (state.current_puzzle_index == state.easter_egg_puzzle)

        prompt = puzzle_generation_prompt(
            theme=state.theme,
            puzzle_number=state.current_puzzle_index + 1,
            total_puzzles=TOTAL_PUZZLES,
            difficulty=state.difficulty_level,
            previous_puzzles=previous_puzzles if previous_puzzles else None,
            narrative_so_far=narrative_so_far,
            is_easter_egg=is_egg,
        )

        result = generate_json(PUZZLE_GENERATION_SYSTEM, prompt)

        puzzle = PuzzleState(
            question=result.get("question", ""),
            puzzle_type=result.get("type", "riddle"),
            answer=result.get("answer", "").lower().strip(),
            hints=result.get("hints", []),
            narrative_text=result.get("narrative_text", ""),
            difficulty=result.get("difficulty", state.difficulty_level),
            started_at=time.time(),
            is_easter_egg=is_egg,
        )

        state.puzzles.append(puzzle.to_dict())
        if puzzle.narrative_text:
            state.narrative_log.append(puzzle.narrative_text)

        return state

    @staticmethod
    def _normalize(text: str) -> str:
        """Normalize text for comparison: lowercase, strip, remove articles and punctuation."""
        t = text.lower().strip()
        t = re.sub(r"[^a-z0-9\s]", "", t)          # remove punctuation
        t = re.sub(r"\b(the|a|an)\b", "", t)        # remove articles
        return re.sub(r"\s+", " ", t).strip()

    @staticmethod
    def _local_match(expected: str, player: str) -> Optional[bool]:
        """Try to match locally. Returns True/False if confident, None if unsure."""
        norm_exp = GameEngine._normalize(expected)
        norm_player = GameEngine._normalize(player)

        # Exact match after normalization
        if norm_exp == norm_player:
            return True

        # One is contained in the other
        if norm_exp in norm_player or norm_player in norm_exp:
            # Only if lengths are similar (avoid "a" matching "abracadabra")
            if len(norm_player) >= len(norm_exp) * 0.5:
                return True

        # Fuzzy similarity
        ratio = SequenceMatcher(None, norm_exp, norm_player).ratio()
        if ratio >= 0.85:
            return True
        if ratio <= 0.35:
            return False

        # Ambiguous — let the LLM decide
        return None

    def check_answer(self, state: GameState, player_answer: str) -> tuple[GameState, dict]:
        """Validate a player's answer. Returns (updated_state, result_dict)."""
        puzzle = state.current_puzzle
        if not puzzle:
            return state, {"correct": False, "feedback": "No active puzzle."}

        if state.is_time_up:
            state.status = "defeat"
            return state, {"correct": False, "feedback": "Time's up!", "time_up": True}

        puzzle.attempts += 1

        # ---------- Fast local matching first ----------
        local_result = self._local_match(puzzle.answer, player_answer)

        if local_result is True:
            is_correct = True
            feedback = "Correct! Well done!"
        elif local_result is False:
            is_correct = False
            feedback = "Not quite. Try again!"
        else:
            # Ambiguous — use AI for flexible validation
            try:
                prompt = answer_validation_prompt(
                    question=puzzle.question,
                    expected_answer=puzzle.answer,
                    player_answer=player_answer,
                )
                validation = validate_answer(ANSWER_VALIDATION_SYSTEM, prompt)
                is_correct = validation.get("correct", False)
                feedback = validation.get("feedback", "")
            except Exception:
                # If AI fails, fall back to stricter local match
                ratio = SequenceMatcher(
                    None,
                    self._normalize(puzzle.answer),
                    self._normalize(player_answer),
                ).ratio()
                is_correct = ratio >= 0.6
                feedback = "Correct!" if is_correct else "Not quite. Try again!"

        if is_correct:
            puzzle.solved = True
            puzzle.solve_time = time.time() - puzzle.started_at
            state.update_current_puzzle(puzzle)
            state.solved_count += 1

            # Calculate puzzle score
            base_score = 1000
            time_bonus = max(0, 500 - int(puzzle.solve_time * 2))
            hint_penalty = puzzle.hints_used * 200
            attempt_penalty = (puzzle.attempts - 1) * 100
            puzzle_score = max(100, base_score + time_bonus - hint_penalty - attempt_penalty)
            if puzzle.is_easter_egg:
                puzzle_score *= 2  # 2x easter egg multiplier
            state.score += puzzle_score

            # Update adaptive difficulty
            state = self._adjust_difficulty(state, puzzle)

            # Check if game is complete
            if state.current_puzzle_index + 1 >= TOTAL_PUZZLES:
                state.status = "victory"
                return state, {
                    "correct": True,
                    "feedback": feedback,
                    "score": puzzle_score,
                    "game_complete": True,
                    "total_score": state.score,
                    "is_easter_egg": puzzle.is_easter_egg,
                }

            # Move to next puzzle
            state.current_puzzle_index += 1

            return state, {
                "correct": True,
                "feedback": feedback,
                "score": puzzle_score,
                "next_puzzle": True,
                "is_easter_egg": puzzle.is_easter_egg,
            }
        else:
            state.update_current_puzzle(puzzle)
            return state, {
                "correct": False,
                "feedback": feedback,
            }

    def get_hint(self, state: GameState) -> tuple[GameState, dict]:
        """Generate a hint for the current puzzle."""
        puzzle = state.current_puzzle
        if not puzzle:
            return state, {"hint": "No active puzzle.", "encouragement": ""}

        # Use pre-generated hints first, then ask AI for custom ones
        if puzzle.hints_used < len(puzzle.hints):
            hint_text = puzzle.hints[puzzle.hints_used]
            encouragement = "You've got this! Keep thinking..."
        else:
            prompt = hint_prompt(
                question=puzzle.question,
                answer=puzzle.answer,
                hints_used=puzzle.hints_used,
                theme=state.theme,
            )
            result = generate_json(HINT_SYSTEM, prompt)
            hint_text = result.get("hint", "Think about it from a different angle.")
            encouragement = result.get("encouragement", "Don't give up!")

        puzzle.hints_used += 1
        state.update_current_puzzle(puzzle)
        state.total_hints_used += 1
        state.time_penalties += HINT_PENALTY_SECONDS

        return state, {
            "hint": hint_text,
            "encouragement": encouragement,
            "hints_used": puzzle.hints_used,
            "time_penalty": HINT_PENALTY_SECONDS,
        }

    def generate_image_puzzle(self, state: GameState, image) -> GameState:
        """Generate a puzzle based on an uploaded image."""
        prompt = image_analysis_prompt(
            theme=state.theme,
            puzzle_number=state.current_puzzle_index + 1,
            total_puzzles=TOTAL_PUZZLES,
        )

        result = analyze_image(IMAGE_ANALYSIS_SYSTEM, prompt, image)

        puzzle = PuzzleState(
            question=result.get("question", ""),
            puzzle_type="visual",
            answer=result.get("answer", "").lower().strip(),
            hints=result.get("hints", []),
            narrative_text=result.get("narrative_text", ""),
            difficulty=result.get("difficulty", state.difficulty_level),
            started_at=time.time(),
        )

        # Replace current puzzle slot with image puzzle
        if state.current_puzzle_index < len(state.puzzles):
            state.puzzles[state.current_puzzle_index] = puzzle.to_dict()
        else:
            state.puzzles.append(puzzle.to_dict())

        if puzzle.narrative_text:
            state.narrative_log.append(puzzle.narrative_text)

        return state

    def skip_puzzle(self, state: GameState) -> tuple:
        """Skip the current puzzle. Returns (state, result_dict) with the answer revealed."""
        puzzle = state.current_puzzle
        if not puzzle:
            return state, {"error": "No active puzzle."}

        answer = puzzle.answer
        puzzle.solved = False
        puzzle.solve_time = 0
        state.update_current_puzzle(puzzle)

        # Check if game is complete
        if state.current_puzzle_index + 1 >= TOTAL_PUZZLES:
            state.status = "victory"
            return state, {
                "skipped": True,
                "answer": answer,
                "game_complete": True,
                "total_score": state.score,
            }

        # Move to next puzzle
        state.current_puzzle_index += 1

        return state, {
            "skipped": True,
            "answer": answer,
            "next_puzzle": True,
        }

    def _adjust_difficulty(self, state: GameState, puzzle: PuzzleState) -> GameState:
        """Adjust difficulty based on player performance."""
        if puzzle.solve_time < 30 and puzzle.hints_used == 0:
            # Solved very quickly, no hints — increase difficulty
            state.difficulty_level = min(5, state.difficulty_level + 1)
        elif puzzle.solve_time > 180 or puzzle.hints_used >= 2:
            # Took long or needed many hints — decrease difficulty
            state.difficulty_level = max(1, state.difficulty_level - 1)
        return state

    def get_score_breakdown(self, state: GameState) -> dict:
        """Get detailed score breakdown for the result screen."""
        puzzle_details = []
        for i, p_dict in enumerate(state.puzzles):
            p = PuzzleState.from_dict(p_dict)
            puzzle_details.append({
                "number": i + 1,
                "type": p.puzzle_type,
                "solved": p.solved,
                "attempts": p.attempts,
                "hints_used": p.hints_used,
                "solve_time": round(p.solve_time, 1) if p.solved else None,
            })

        total_time = time.time() - state.start_time if state.start_time else 0

        return {
            "total_score": state.score,
            "puzzles_solved": state.solved_count,
            "total_puzzles": TOTAL_PUZZLES,
            "total_time": round(total_time, 1),
            "total_hints": state.total_hints_used,
            "time_penalties": state.time_penalties,
            "victory": state.status == "victory",
            "puzzle_details": puzzle_details,
            "theme": state.theme,
        }
