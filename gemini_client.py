"""Gemini 3 API client wrapper for text and multimodal interactions."""

import json
import os
import time
import logging

from google import genai
from google.genai import errors as genai_errors
from PIL import Image

logger = logging.getLogger(__name__)

# Model cascade — try each in order until one works
MODEL_CASCADE = [
    "gemini-3-flash-preview",
    "gemini-2.5-flash",
    "gemini-2.0-flash",
]

MAX_RETRIES = 2
RETRY_BASE_DELAY = 1  # seconds


def _get_client() -> genai.Client:
    """Configure and return the Gemini client."""
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        raise RuntimeError("GEMINI_API_KEY environment variable is not set")
    return genai.Client(api_key=api_key)


def _call_with_retry(client, preferred_model, contents, config):
    """Call generate_content with retry logic and model cascade fallback.

    Tries the preferred_model first, then falls through the full cascade.
    """
    # Build ordered list: preferred first, then the rest
    models_to_try = [preferred_model]
    for m in MODEL_CASCADE:
        if m not in models_to_try:
            models_to_try.append(m)

    last_error = None
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
                last_error = e
                delay = RETRY_BASE_DELAY * (2 ** attempt)
                logger.warning(
                    "Model %s attempt %d failed (503): %s. Retrying in %ds...",
                    model_name, attempt + 1, str(e)[:100], delay
                )
                time.sleep(delay)
            except genai_errors.ClientError as e:
                if "429" in str(e) or "RESOURCE_EXHAUSTED" in str(e):
                    last_error = e
                    delay = RETRY_BASE_DELAY * (2 ** attempt)
                    logger.warning(
                        "Rate limited on %s attempt %d. Retrying in %ds...",
                        model_name, attempt + 1, delay
                    )
                    time.sleep(delay)
                else:
                    raise

        logger.warning("All retries exhausted for %s, trying next model...", model_name)

    raise RuntimeError(f"All models exhausted. Last error: {last_error}")


def generate_json(system_prompt: str, user_prompt: str, temperature: float = 0.9) -> dict:
    """Generate structured JSON from Gemini."""
    client = _get_client()
    config = {
        "system_instruction": system_prompt,
        "response_mime_type": "application/json",
        "temperature": temperature,
    }
    response = _call_with_retry(client, MODEL_CASCADE[0], user_prompt, config)
    return json.loads(response.text)


def generate_text(system_prompt: str, user_prompt: str, temperature: float = 0.9) -> str:
    """Generate plain text from Gemini."""
    client = _get_client()
    config = {
        "system_instruction": system_prompt,
        "temperature": temperature,
    }
    response = _call_with_retry(client, MODEL_CASCADE[0], user_prompt, config)
    return response.text


def analyze_image(system_prompt: str, user_prompt: str, image: Image.Image, temperature: float = 0.7) -> dict:
    """Analyze an image with Gemini multimodal and return structured JSON."""
    client = _get_client()
    config = {
        "system_instruction": system_prompt,
        "response_mime_type": "application/json",
        "temperature": temperature,
    }
    response = _call_with_retry(client, MODEL_CASCADE[0], [user_prompt, image], config)
    return json.loads(response.text)


def validate_answer(system_prompt: str, user_prompt: str) -> dict:
    """Validate a player's answer using a fast model."""
    client = _get_client()
    config = {
        "system_instruction": system_prompt,
        "response_mime_type": "application/json",
        "temperature": 0.2,
    }
    # Start with the fastest model for validation
    response = _call_with_retry(client, "gemini-2.0-flash", user_prompt, config)
    return json.loads(response.text)
