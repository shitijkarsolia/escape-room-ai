"""Gemini 3 API client wrapper for text and multimodal interactions."""

import json
import os
import time
import logging

from google import genai
from google.genai import errors as genai_errors
from PIL import Image

logger = logging.getLogger(__name__)

# Primary model, with fallback
PRIMARY_MODEL = "gemini-3-flash-preview"
FALLBACK_MODEL = "gemini-2.5-flash"

MAX_RETRIES = 2
RETRY_BASE_DELAY = 1  # seconds


def _get_client() -> genai.Client:
    """Configure and return the Gemini client."""
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        raise RuntimeError("GEMINI_API_KEY environment variable is not set")
    return genai.Client(api_key=api_key)


def _call_with_retry(client, model, contents, config):
    """Call generate_content with retry logic and model fallback."""
    models_to_try = [PRIMARY_MODEL, FALLBACK_MODEL]

    for model_name in models_to_try:
        for attempt in range(MAX_RETRIES):
            try:
                response = client.models.generate_content(
                    model=model_name,
                    contents=contents,
                    config=config,
                )
                return response
            except genai_errors.ServerError as e:
                delay = RETRY_BASE_DELAY * (2 ** attempt)
                logger.warning(
                    "Model %s attempt %d failed (503): %s. Retrying in %ds...",
                    model_name, attempt + 1, str(e)[:100], delay
                )
                time.sleep(delay)
            except genai_errors.ClientError as e:
                if "429" in str(e) or "RESOURCE_EXHAUSTED" in str(e):
                    delay = RETRY_BASE_DELAY * (2 ** attempt)
                    logger.warning(
                        "Rate limited on %s attempt %d. Retrying in %ds...",
                        model_name, attempt + 1, delay
                    )
                    time.sleep(delay)
                else:
                    raise

        logger.warning("All retries exhausted for model %s, trying fallback...", model_name)

    raise RuntimeError("All models and retries exhausted. Please try again later.")


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
    config = {
        "system_instruction": system_prompt,
        "response_mime_type": "application/json",
        "temperature": temperature,
    }
    response = _call_with_retry(client, PRIMARY_MODEL, user_prompt, config)
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
    config = {
        "system_instruction": system_prompt,
        "temperature": temperature,
    }
    response = _call_with_retry(client, PRIMARY_MODEL, user_prompt, config)
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
    config = {
        "system_instruction": system_prompt,
        "response_mime_type": "application/json",
        "temperature": temperature,
    }
    response = _call_with_retry(client, PRIMARY_MODEL, [user_prompt, image], config)
    return json.loads(response.text)


def validate_answer(system_prompt: str, user_prompt: str) -> dict:
    """Validate a player's answer using Gemini.

    Uses the fallback (faster) model with low temperature for quick validation.

    Args:
        system_prompt: System instruction for validation.
        user_prompt: Contains the puzzle, expected answer, and player's answer.

    Returns:
        Parsed JSON dict with 'correct' (bool) and 'feedback' (str).
    """
    client = _get_client()
    config = {
        "system_instruction": system_prompt,
        "response_mime_type": "application/json",
        "temperature": 0.2,
    }
    # Use fallback model first for speed — validation is simple
    response = _call_with_retry(client, FALLBACK_MODEL, user_prompt, config)
    return json.loads(response.text)
