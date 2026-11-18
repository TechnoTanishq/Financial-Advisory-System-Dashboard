"""
Groq HTTP client with automatic key fallback on 429.

Usage
-----
from agents.groq_client import groq_post, groq_stream

# Non-streaming call
data = await groq_post(messages=[...], temperature=0.2, max_tokens=600)

# Streaming call — yields raw text tokens
async for token in groq_stream(messages=[...], temperature=0.6, max_tokens=600):
    ...
"""

from __future__ import annotations

import json
from typing import AsyncGenerator

import httpx

from config import settings


def _keys() -> list[str]:
    """Return primary key, then fallback key (if configured)."""
    keys = [settings.groq_api_key]
    if settings.groq_api_key_fallback:
        keys.append(settings.groq_api_key_fallback)
    return keys


# ── Non-streaming ─────────────────────────────────────────────────────────────

async def groq_post(
    messages: list[dict],
    temperature: float = 0.3,
    max_tokens: int = 600,
) -> dict:
    """
    POST to Groq chat completions.
    On 429 with the primary key, retries immediately with the fallback key.
    Returns the parsed JSON response dict.
    Raises httpx.HTTPStatusError on any other non-2xx status.
    """
    last_exc: Exception | None = None

    async with httpx.AsyncClient(timeout=30) as client:
        for key in _keys():
            response = await client.post(
                settings.groq_url,
                headers={
                    "Authorization": f"Bearer {key}",
                    "Content-Type": "application/json",
                },
                json={
                    "model":       settings.groq_model,
                    "messages":    messages,
                    "temperature": temperature,
                    "max_tokens":  max_tokens,
                },
            )

            if response.status_code == 429 and key != _keys()[-1]:
                # Rate-limited on this key — try next key immediately
                last_exc = httpx.HTTPStatusError(
                    f"429 on key …{key[-6:]}", request=response.request, response=response
                )
                continue

            response.raise_for_status()
            return response.json()

    raise last_exc  # all keys exhausted


# ── Streaming ─────────────────────────────────────────────────────────────────

async def groq_stream(
    messages: list[dict],
    temperature: float = 0.6,
    max_tokens: int = 600,
) -> AsyncGenerator[str, None]:
    """
    Stream tokens from Groq chat completions.
    On 429 with the primary key, retries immediately with the fallback key.
    Yields each text token as a plain string.
    """
    keys = _keys()

    for i, key in enumerate(keys):
        try:
            async with httpx.AsyncClient(timeout=60) as client:
                async with client.stream(
                    "POST",
                    settings.groq_url,
                    headers={
                        "Authorization": f"Bearer {key}",
                        "Content-Type": "application/json",
                    },
                    json={
                        "model":       settings.groq_model,
                        "messages":    messages,
                        "temperature": temperature,
                        "max_tokens":  max_tokens,
                        "stream":      True,
                    },
                ) as response:
                    if response.status_code == 429 and i < len(keys) - 1:
                        # Rate-limited — try next key
                        continue

                    response.raise_for_status()

                    async for line in response.aiter_lines():
                        if not line.startswith("data: ") or line == "data: [DONE]":
                            continue
                        try:
                            payload = json.loads(line[6:])
                            token: str = payload["choices"][0]["delta"].get("content", "")
                            if token:
                                yield token
                        except (json.JSONDecodeError, KeyError):
                            continue
                    return  # stream completed successfully

        except httpx.HTTPStatusError as exc:
            if exc.response.status_code == 429 and i < len(keys) - 1:
                continue  # try fallback key
            raise
