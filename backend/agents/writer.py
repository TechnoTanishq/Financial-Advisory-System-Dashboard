"""
Writer Agent
============
Streams the final user-facing response token by token.
Temperature 0.6.
"""

from __future__ import annotations

from typing import AsyncGenerator

from agents.groq_client import groq_stream


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
    """Yields each text token from the Writer's streamed response."""
    user_prompt = (
        f'USER QUERY: "{query}"\n\n'
        f"RESEARCH ANALYSIS (use these numbers):\n{analysis}\n\n"
        f"RESPONSE PLAN (follow this structure):\n{plan}\n\n"
        "Write the final response now. Be specific, warm, and actionable."
    )

    async for token in groq_stream(
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user",   "content": user_prompt},
        ],
        temperature=0.6,
        max_tokens=600,
    ):
        yield token
