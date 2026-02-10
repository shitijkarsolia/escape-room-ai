"""Background puzzle pre-generation cache.

Generates all puzzles ahead of time in background threads so the player
never waits for AI after the first puzzle.

Fix #5: Cache entries have a TTL (30 min) and the total cache is capped
at MAX_SESSIONS to prevent unbounded memory growth.
"""

import threading
import logging
import time
import copy
from typing import Optional

from game_engine import GameEngine, GameState, PuzzleState, TOTAL_PUZZLES

logger = logging.getLogger(__name__)

# --- Fix #5: TTL and size limits ---
CACHE_TTL_SECONDS = 30 * 60   # 30 minutes
MAX_SESSIONS = 200             # max concurrent cached sessions

# In-memory cache: session_id -> { "puzzles": {idx: dict}, "created_at": float }
_cache: dict[str, dict] = {}
_cache_lock = threading.Lock()

# Track which sessions have background generation running
_generating: dict[str, bool] = {}

engine = GameEngine()


def _generate_puzzles_background(session_id: str, state: GameState):
    """Generate puzzles 2..N in the background and cache them."""
    logger.info("🚀 [Cache] Starting background generation for session %s (puzzles 2-%d)", session_id, TOTAL_PUZZLES)

    # We need a copy of the state to avoid race conditions
    bg_state = GameState.from_dict(state.to_dict())

    for puzzle_idx in range(1, TOTAL_PUZZLES):
        # Check if session was invalidated (player left)
        with _cache_lock:
            if session_id not in _cache:
                logger.info("🛑 [Cache] Session %s invalidated, stopping background gen", session_id)
                return

        try:
            # Set the puzzle index we want to generate
            bg_state.current_puzzle_index = puzzle_idx

            t0 = time.time()
            bg_state = engine.generate_puzzle(bg_state)
            elapsed = time.time() - t0

            puzzle = bg_state.current_puzzle
            if puzzle:
                with _cache_lock:
                    if session_id in _cache:
                        _cache[session_id]["puzzles"][puzzle_idx] = {
                            "puzzle": puzzle.to_dict(),
                            "narrative_text": puzzle.narrative_text,
                        }
                        logger.info(
                            "✅ [Cache] Puzzle %d/%d cached for session %s (%.1fs) — %s",
                            puzzle_idx + 1, TOTAL_PUZZLES, session_id, elapsed,
                            puzzle.question[:60]
                        )
                    else:
                        logger.info("🛑 [Cache] Session %s gone, discarding puzzle %d", session_id, puzzle_idx + 1)
                        return
        except Exception as e:
            logger.error("❌ [Cache] Failed to generate puzzle %d for session %s: %s", puzzle_idx + 1, session_id, e)
            # Don't stop — try the next one, the game can fall back to on-demand generation

    with _cache_lock:
        _generating.pop(session_id, None)

    logger.info("🏁 [Cache] Background generation complete for session %s", session_id)


def _evict_expired() -> None:
    """Remove expired sessions and enforce MAX_SESSIONS cap.  Caller must hold _cache_lock."""
    now = time.time()
    expired = [sid for sid, entry in _cache.items()
               if now - entry.get("created_at", 0) > CACHE_TTL_SECONDS]
    for sid in expired:
        del _cache[sid]
        _generating.pop(sid, None)
    if expired:
        logger.info("🧹 [Cache] Evicted %d expired session(s)", len(expired))

    # LRU-style cap: remove oldest sessions if over limit
    if len(_cache) > MAX_SESSIONS:
        sorted_sids = sorted(_cache, key=lambda s: _cache[s].get("created_at", 0))
        to_remove = sorted_sids[:len(_cache) - MAX_SESSIONS]
        for sid in to_remove:
            del _cache[sid]
            _generating.pop(sid, None)
        logger.info("🧹 [Cache] Evicted %d session(s) over cap", len(to_remove))


def start_precaching(session_id: str, state: GameState):
    """Start background puzzle generation for a new game session.

    Call this right after the first puzzle is generated and the game starts.
    """
    with _cache_lock:
        _evict_expired()
        _cache[session_id] = {"puzzles": {}, "created_at": time.time()}
        _generating[session_id] = True

    thread = threading.Thread(
        target=_generate_puzzles_background,
        args=(session_id, state),
        daemon=True,
    )
    thread.start()


def get_cached_puzzle(session_id: str, puzzle_index: int) -> Optional[dict]:
    """Get a pre-generated puzzle from cache, or None if not ready yet."""
    with _cache_lock:
        entry = _cache.get(session_id)
        if not entry:
            return None
        # Check TTL
        if time.time() - entry.get("created_at", 0) > CACHE_TTL_SECONDS:
            _cache.pop(session_id, None)
            _generating.pop(session_id, None)
            return None
        return entry["puzzles"].get(puzzle_index)


def invalidate_session(session_id: str):
    """Remove all cached puzzles for a session (player left or game ended)."""
    with _cache_lock:
        _cache.pop(session_id, None)
        _generating.pop(session_id, None)


def get_cache_status(session_id: str) -> dict:
    """Get cache status for debugging."""
    with _cache_lock:
        entry = _cache.get(session_id)
        if not entry:
            return {"cached_puzzles": [], "count": 0, "generating": False}
        puzzles = entry.get("puzzles", {})
        return {
            "cached_puzzles": list(puzzles.keys()),
            "count": len(puzzles),
            "generating": _generating.get(session_id, False),
            "age_seconds": round(time.time() - entry.get("created_at", 0), 1),
        }
