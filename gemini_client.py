"""Gemini 3 API client wrapper for text and multimodal interactions."""

import json
import os
from typing import Optional

from google import genai
from PIL import Image


def _get_client() -> genai.Client:
    """Configure and return the Gemini client."""
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        raise RuntimeError("GEMINI_API_KEY environment variable is not set")
    return genai.Client(api_key=api_key)


MODEL = "gemini-2.5-flash-preview-05-20"


def generate_json(system_prompt: str, user_prompt: str, temperature: float = 0.9) -> dict:
    """Generate structured JSON from Gemini.

    Args:
        system_prompt: System instruction for the model.
        user_prompt: The user-facing prompt.
        temperature: Sampling temperature (higher = more creative).

    Returns:
        Parsed JSON dict from the model response.
    """
    client = _get_client()
    response = client.models.generate_content(
        model=MODEL,
        contents=user_prompt,
        config={
            "system_instruction": system_prompt,
            "response_mime_type": "application/json",
            "temperature": temperature,
        },
    )
    return json.loads(response.text)


def generate_text(system_prompt: str, user_prompt: str, temperature: float = 0.9) -> str:
    """Generate plain text from Gemini.

    Args:
        system_prompt: System instruction for the model.
        user_prompt: The user-facing prompt.
        temperature: Sampling temperature.

    Returns:
        Text string from the model response.
    """
    client = _get_client()
    response = client.models.generate_content(
        model=MODEL,
        contents=user_prompt,
        config={
            "system_instruction": system_prompt,
            "temperature": temperature,
        },
    )
    return response.text


def analyze_image(system_prompt: str, user_prompt: str, image: Image.Image, temperature: float = 0.7) -> dict:
    """Analyze an image with Gemini multimodal and return structured JSON.

    Args:
        system_prompt: System instruction for the model.
        user_prompt: The user-facing prompt.
        image: PIL Image to analyze.
        temperature: Sampling temperature.

    Returns:
        Parsed JSON dict from the model response.
    """
    client = _get_client()
    response = client.models.generate_content(
        model=MODEL,
        contents=[user_prompt, image],
        config={
            "system_instruction": system_prompt,
            "response_mime_type": "application/json",
            "temperature": temperature,
        },
    )
    return json.loads(response.text)


def validate_answer(system_prompt: str, user_prompt: str) -> dict:
    """Validate a player's answer using Gemini.

    Uses lower temperature for more deterministic validation.

    Args:
        system_prompt: System instruction for validation.
        user_prompt: Contains the puzzle, expected answer, and player's answer.

    Returns:
        Parsed JSON dict with 'correct' (bool) and 'feedback' (str).
    """
    return generate_json(system_prompt, user_prompt, temperature=0.3)
