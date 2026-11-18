"""
Writer Agent
============
Takes the Planner's plan + Researcher's analysis and writes the
user-facing response.

Streams tokens back via an async generator so the orchestrator can
forward them to the client as Server-Sent Events.
"""

from __future__ import annotations

import json
from typing import AsyncGenerator

import httpx

from config import settings


SYSTEM_PROMPT = """\
You are a warm, expert Personal Financial Advisor AI named FinAdvisor.
You write clear, actionable, and empathetic responses to users about their finances.

FORMATTING RULES:
- Use ## for section headers
- Use bullet points (- ) for lists
- Bold (**text**) key numbers and terms
- Use ₹ for Indian Rupee amounts
- Keep total response under 400 words
- End with one specific, actionable next step

CONTENT RULES:
- Use ONLY the numbers from the Research Analysis — never invent figures
- Follow the Response Plan exactly
- Be direct and specific — avoid vague statements
- Use a friendly, conversational tone"""


async def run_stream(
    query: str,
    analysis: str,
    plan: str,
) -> AsyncGenerator[str, None]:
    """
    Stream the Writer's response token by token.

    Yields each text token as a plain string.
    The full draft is NOT accumulated here — the orchestrator does that.
    """
    user_prompt = (
        f'USER QUERY: "{query}"\n\n'
        f"RESEARCH ANALYSIS (use these numbers):\n{analysis}\n\n"
        f"RESPONSE PLAN (follow this structure):\n{plan}\n\n"
        "Write the final response now. Be specific, warm, and actionable."
    )

    async with httpx.AsyncClient(timeout=60) as client:
        async with client.stream(
            "POST",
            settings.groq_url,
            headers={
                "Authorization": f"Bearer {settings.groq_api_key}",
                "Content-Type": "application/json",
            },
            json={
                "model": settings.groq_model,
                "messages": [
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user",   "content": user_prompt},
                ],
                "temperature": 0.6,
                "max_tokens": 600,
                "stream": True,
            },
        ) as response:
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
                    continue  # skip malformed chunks
