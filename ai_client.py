"""OpenAI-compatible API client wrapper for text and multimodal interactions.

Uses a custom OpenAI-compatible endpoint.
"""

import json
import os
import io
import base64
import time
import logging

from openai import OpenAI
from openai import RateLimitError, APIStatusError
from PIL import Image

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

# Model cascade — try each in order until one works
# User preference: **do not use opus**, favor sonnet.
MODEL_CASCADE = [
    "claude-sonnet-4.5",  # primary model for generation
    "claude-haiku-4.5",   # fallback if sonnet is unavailable
]

# Fast model for simple tasks (answer validation)
# Also uses sonnet as requested (no opus).
FAST_MODEL = "claude-sonnet-4.5"

# Vision-capable model
VISION_MODEL = "claude-sonnet-4.5"

MAX_RETRIES = 3
RETRY_BASE_DELAY = 2  # seconds

# Base URL for the OpenAI-compatible endpoint (loaded from environment)
BASE_URL = os.environ.get("API_BASE_URL", "https://api.openai.com/v1")


def _extract_json(text: str) -> dict:
    """Extract JSON from a response that may be wrapped in markdown code fences."""
    text = text.strip()

    # Try direct parse first
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass

    # Strip markdown ```json ... ``` fences
    import re
    match = re.search(r"```(?:json)?\s*\n?(.*?)\n?\s*```", text, re.DOTALL)
    if match:
        try:
            return json.loads(match.group(1).strip())
        except json.JSONDecodeError:
            pass

    # Last resort: find first { ... } block
    start = text.find("{")
    end = text.rfind("}")
    if start != -1 and end != -1 and end > start:
        try:
            return json.loads(text[start:end + 1])
        except json.JSONDecodeError:
            pass

    raise ValueError(f"Could not extract JSON from response: {text[:200]}")


def _get_client() -> OpenAI:
    """Configure and return the OpenAI-compatible client."""
    api_key = os.environ.get("API_KEY")
    if not api_key:
        raise RuntimeError("API_KEY environment variable is not set")
    return OpenAI(api_key=api_key, base_url=BASE_URL)


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
    # Note: response_format not used — not all OpenAI-compatible endpoints support it.
    # JSON output is enforced via system prompts instead.

    last_error = None
    for model_name in models_to_try:
        for attempt in range(MAX_RETRIES):
            try:
                logger.info("🔄 Calling %s (attempt %d/%d)...", model_name, attempt + 1, MAX_RETRIES)
                t0 = time.time()
                response = client.chat.completions.create(
                    model=model_name,
                    messages=messages,
                    **kwargs,
                )
                elapsed = time.time() - t0
                # Validate we got actual content back
                content = response.choices[0].message.content if response.choices else None
                if not content or not content.strip():
                    logger.error("❌ Empty response from %s after %.1fs", model_name, elapsed)
                    raise RuntimeError(f"Empty response from {model_name}")
                logger.info("✅ %s responded in %.1fs (%d chars)", model_name, elapsed, len(content))
                logger.info("📝 Response preview: %s", content[:150].replace('\n', ' '))
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
    """Generate structured JSON."""
    client = _get_client()
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt},
    ]
    response = _call_with_retry(client, MODEL_CASCADE[0], messages, temperature=temperature)
    return _extract_json(response.choices[0].message.content)


def generate_text(system_prompt: str, user_prompt: str, temperature: float = 0.9) -> str:
    """Generate plain text."""
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
    response = _call_with_retry(
        client, VISION_MODEL, messages,
        temperature=temperature,
        models_to_try=[VISION_MODEL],
    )
    return _extract_json(response.choices[0].message.content)


def validate_answer(system_prompt: str, user_prompt: str) -> dict:
    """Validate a player's answer using the fastest available model."""
    client = _get_client()
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt},
    ]
    response = _call_with_retry(
        client, FAST_MODEL, messages,
        temperature=0.2,
        models_to_try=[FAST_MODEL, MODEL_CASCADE[0]],
    )
    return _extract_json(response.choices[0].message.content)
