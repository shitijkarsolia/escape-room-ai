"""System prompts for Gemini 3 interactions."""

from typing import Dict, List, Optional

# ---------------------------------------------------------------------------
# Theme descriptions used across prompts
# ---------------------------------------------------------------------------
THEME_DESCRIPTIONS = {
    "temple": {
        "name": "Ancient Temple",
        "tagline": "Lost ruins hide secrets older than time itself.",
        "setting": (
            "You are trapped inside an ancient temple deep in a forgotten jungle. "
            "Crumbling stone walls are covered in mysterious glyphs. Torchlight flickers "
            "across golden artifacts and vine-covered passageways. The air smells of dust "
            "and ancient incense. Every puzzle you solve opens the next sealed chamber, "
            "bringing you closer to the temple's exit."
        ),
        "icon": "🏛️",
        "accent": "amber",
    },
    "space": {
        "name": "Space Station",
        "tagline": "Oxygen is running out. Solve fast or drift forever.",
        "setting": (
            "You are stranded on an abandoned orbital space station. Emergency lights "
            "pulse red. Holographic displays glitch with fragmented data. The airlock "
            "timer is counting down. Each puzzle you solve restores a subsystem, "
            "bringing the escape pod back online. The void of space waits outside "
            "every window."
        ),
        "icon": "🚀",
        "accent": "cyan",
    },
    "haunted": {
        "name": "Haunted Mansion",
        "tagline": "The doors locked behind you. The ghosts know you're here.",
        "setting": (
            "You are trapped inside a Victorian mansion that hasn't seen sunlight in decades. "
            "Portraits watch you with moving eyes. Floorboards creak with phantom footsteps. "
            "Candles light themselves in empty rooms. Each puzzle you solve unlocks the next "
            "cursed chamber. Solve them all before midnight, or become the mansion's newest ghost."
        ),
        "icon": "👻",
        "accent": "purple",
    },
}

# ---------------------------------------------------------------------------
# Puzzle Generation
# ---------------------------------------------------------------------------
PUZZLE_GENERATION_SYSTEM = """You are a master escape room puzzle designer and game master.
You create clever, engaging puzzles for an interactive escape room game.

RULES:
- Each puzzle must be solvable with logic, wordplay, or lateral thinking.
- The answer should be a single word or short phrase (1-4 words max).
- Provide exactly 3 hints, each progressively more helpful.
- The puzzle must fit the theme and setting naturally.
- Vary puzzle types: riddles, ciphers, logic puzzles, pattern recognition, word puzzles.
- The narrative_text should advance the room's story and flow naturally from the previous puzzle context.

You MUST respond with valid JSON in this exact format:
{
    "question": "The full puzzle text presented to the player",
    "type": "riddle|cipher|logic|pattern|wordplay",
    "answer": "the answer (lowercase)",
    "hints": ["Hint 1 (subtle)", "Hint 2 (moderate)", "Hint 3 (very helpful)"],
    "narrative_text": "A 1-2 sentence narrative that sets the scene for this puzzle within the room's story",
    "difficulty": 1-5
}"""


def puzzle_generation_prompt(
    theme: str,
    puzzle_number: int,
    total_puzzles: int,
    difficulty: int,
    previous_puzzles: Optional[List[dict]] = None,
    narrative_so_far: str = "",
) -> str:
    """Build the user prompt for generating a new puzzle."""
    theme_data = THEME_DESCRIPTIONS[theme]
    prev_context = ""
    if previous_puzzles:
        prev_summary = "\n".join(
            f"  Puzzle {i+1}: type={p['type']}, answer='{p['answer']}'"
            for i, p in enumerate(previous_puzzles)
        )
        prev_context = f"\nPrevious puzzles in this room (avoid repeating types or similar answers):\n{prev_summary}"

    narrative_ctx = ""
    if narrative_so_far:
        narrative_ctx = f"\nNarrative so far:\n{narrative_so_far}"

    return f"""Generate puzzle {puzzle_number} of {total_puzzles} for the escape room.

Theme: {theme_data['name']}
Setting: {theme_data['setting']}
Target difficulty: {difficulty}/5
{prev_context}
{narrative_ctx}

{"This is the FINAL puzzle — make it the most challenging and climactic!" if puzzle_number == total_puzzles else ""}
{"This is the FIRST puzzle — set the scene dramatically in the narrative_text." if puzzle_number == 1 else ""}"""


# ---------------------------------------------------------------------------
# Answer Validation
# ---------------------------------------------------------------------------
ANSWER_VALIDATION_SYSTEM = """You are a fair and flexible puzzle answer validator for an escape room game.
Your job is to determine if the player's answer is correct.

RULES:
- Accept answers that are semantically equivalent to the expected answer.
- Accept minor typos, different capitalization, or slight rephrasing.
- Be generous but not absurdly so — the answer must demonstrate understanding.
- If wrong, give encouraging feedback that subtly nudges toward the right direction WITHOUT revealing the answer.

You MUST respond with valid JSON:
{
    "correct": true/false,
    "feedback": "Your feedback message to the player"
}"""


def answer_validation_prompt(question: str, expected_answer: str, player_answer: str) -> str:
    """Build the user prompt for validating an answer."""
    return f"""Puzzle: {question}

Expected answer: {expected_answer}
Player's answer: {player_answer}

Is the player's answer correct?"""


# ---------------------------------------------------------------------------
# Image Analysis (Multimodal Puzzle)
# ---------------------------------------------------------------------------
IMAGE_ANALYSIS_SYSTEM = """You are a game master for an AI escape room. The player has uploaded an image as a clue.
Analyze the image and create a puzzle based on what you see in it.

The puzzle should require the player to identify or describe something specific in the image.
Keep the answer to 1-4 words.

You MUST respond with valid JSON:
{
    "question": "A puzzle question based on the image content",
    "type": "visual",
    "answer": "the answer (lowercase)",
    "hints": ["Hint 1", "Hint 2", "Hint 3"],
    "narrative_text": "How this image connects to the escape room narrative",
    "difficulty": 1-5,
    "image_description": "Brief description of what you see in the image"
}"""


def image_analysis_prompt(theme: str, puzzle_number: int, total_puzzles: int) -> str:
    """Build the user prompt for image-based puzzle generation."""
    theme_data = THEME_DESCRIPTIONS[theme]
    return f"""The player has uploaded an image as part of puzzle {puzzle_number} of {total_puzzles}.

Theme: {theme_data['name']}
Setting: {theme_data['setting']}

Analyze the image and create a puzzle that ties the image into the escape room narrative.
Make the puzzle engaging and the connection to the theme creative."""


# ---------------------------------------------------------------------------
# Hint Enhancement
# ---------------------------------------------------------------------------
HINT_SYSTEM = """You are a helpful game master. The player is stuck on a puzzle and asking for a hint.
Provide a helpful hint that nudges the player toward the answer without giving it away directly.
Be encouraging and keep the immersive tone of the escape room.

Respond with valid JSON:
{
    "hint": "Your hint text",
    "encouragement": "A short encouraging message"
}"""


def hint_prompt(question: str, answer: str, hints_used: int, theme: str) -> str:
    """Build prompt for generating a contextual hint."""
    theme_data = THEME_DESCRIPTIONS[theme]
    return f"""Theme: {theme_data['name']}
Puzzle: {question}
Answer: {answer}
Hints already given: {hints_used}

Provide hint #{hints_used + 1}. {"Be more direct — the player is really struggling." if hints_used >= 2 else "Be subtle but helpful."}"""
