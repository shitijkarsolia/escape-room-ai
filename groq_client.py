"""Groq API client wrapper for ultra-fast text and multimodal interactions.

Uses Groq's LPU Inference Engine for the fastest LLM inference available.
"""

import json
import os
import io
import base64
import time
import logging

from groq import Groq
from groq import RateLimitError, APIStatusError
from PIL import Image

logger = logging.getLogger(__name__)

# Model cascade — Llama 3.3 70B follows instructions best, GPT-OSS 120B as fallback
MODEL_CASCADE = [
    "llama-3.3-70b-versatile",   # 280 t/s  — best instruction following, production-grade
    "openai/gpt-oss-120b",      # 500 t/s  — high quality fallback
    "openai/gpt-oss-20b",       # 1000 t/s — fast last-resort fallback
]

# Fast model for simple tasks (answer validation)
FAST_MODEL = "llama-3.3-70b-versatile"  # 280 t/s — accurate for yes/no decisions

# Vision-capable model
VISION_MODEL = "meta-llama/llama-4-scout-17b-16e-instruct"  # 750 t/s

MAX_RETRIES = 3
RETRY_BASE_DELAY = 2  # seconds


def _get_client() -> Groq:
    """Configure and return the Groq client."""
    api_key = os.environ.get("GROQ_API_KEY")
    if not api_key:
        raise RuntimeError("GROQ_API_KEY environment variable is not set")
    return Groq(api_key=api_key)


def _call_with_retry(client, preferred_model, messages, json_mode=False, temperature=0.9, models_to_try=None):
    """Call chat completions with retry logic and model cascade fallback.

    Tries the preferred_model first, then falls through the full cascade.
    """
    if models_to_try is None:
        models_to_try = [preferred_model]
        for m in MODEL_CASCADE:
            if m not in models_to_try:
                models_to_try.append(m)

    kwargs = {
        "temperature": temperature,
    }
    if json_mode:
        kwargs["response_format"] = {"type": "json_object"}

    last_error = None
    for model_name in models_to_try:
        for attempt in range(MAX_RETRIES):
            try:
                response = client.chat.completions.create(
                    model=model_name,
                    messages=messages,
                    **kwargs,
                )
                return response
            except RateLimitError as e:
                last_error = e
                delay = RETRY_BASE_DELAY * (2 ** attempt)
                logger.warning(
                    "Rate limited on %s attempt %d. Retrying in %ds...",
                    model_name, attempt + 1, delay
                )
                time.sleep(delay)
            except APIStatusError as e:
                if e.status_code in (503, 502, 500):
                    last_error = e
                    delay = RETRY_BASE_DELAY * (2 ** attempt)
                    logger.warning(
                        "Model %s attempt %d failed (%d): %s. Retrying in %ds...",
                        model_name, attempt + 1, e.status_code, str(e)[:100], delay
                    )
                    time.sleep(delay)
                else:
                    raise

        logger.warning("All retries exhausted for %s, trying next model...", model_name)

    raise RuntimeError(f"All models exhausted. Last error: {last_error}")


def generate_json(system_prompt: str, user_prompt: str, temperature: float = 0.9) -> dict:
    """Generate structured JSON via Groq."""
    client = _get_client()
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt},
    ]
    response = _call_with_retry(client, MODEL_CASCADE[0], messages, json_mode=True, temperature=temperature)
    return json.loads(response.choices[0].message.content)


def generate_text(system_prompt: str, user_prompt: str, temperature: float = 0.9) -> str:
    """Generate plain text via Groq."""
    client = _get_client()
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt},
    ]
    response = _call_with_retry(client, MODEL_CASCADE[0], messages, temperature=temperature)
    return response.choices[0].message.content


def analyze_image(system_prompt: str, user_prompt: str, image: Image.Image, temperature: float = 0.7) -> dict:
    """Analyze an image with a vision model and return structured JSON."""
    client = _get_client()

    # Convert PIL Image to base64
    buffer = io.BytesIO()
    img_format = "PNG" if image.mode == "RGBA" else "JPEG"
    image.save(buffer, format=img_format)
    base64_image = base64.b64encode(buffer.getvalue()).decode("utf-8")
    mime_type = "image/png" if img_format == "PNG" else "image/jpeg"

    messages = [
        {"role": "system", "content": system_prompt},
        {
            "role": "user",
            "content": [
                {"type": "text", "text": user_prompt},
                {
                    "type": "image_url",
                    "image_url": {
                        "url": f"data:{mime_type};base64,{base64_image}",
                    },
                },
            ],
        },
    ]
    # Vision models only — no cascade to non-vision models
    response = _call_with_retry(
        client, VISION_MODEL, messages,
        json_mode=True, temperature=temperature,
        models_to_try=[VISION_MODEL],
    )
    return json.loads(response.choices[0].message.content)


def validate_answer(system_prompt: str, user_prompt: str) -> dict:
    """Validate a player's answer using the fastest available model."""
    client = _get_client()
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt},
    ]
    # Use the fastest model for simple validation tasks
    response = _call_with_retry(
        client, FAST_MODEL, messages,
        json_mode=True, temperature=0.2,
        models_to_try=[FAST_MODEL, MODEL_CASCADE[0]],
    )
    return json.loads(response.choices[0].message.content)
