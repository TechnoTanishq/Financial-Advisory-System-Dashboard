"""
Planner Agent
=============
Takes the Researcher's analysis and the original query, then decides:
  - Which sections the final answer should cover (2-4 max)
  - Tone: reassuring / cautionary / motivational / analytical / celebratory
  - Depth: brief / standard / detailed
  - Which numbers MUST appear
  - What to avoid
  - A single call-to-action

Temperature 0.3 — deterministic enough to give a consistent plan,
with slight creativity for tone selection.
"""

from __future__ import annotations

import httpx

from config import settings


SYSTEM_PROMPT = """\
You are a Financial Advisory Strategist.
Your job is to create a clear RESPONSE PLAN for a financial advisor AI.

Given the user's question and a research analysis, decide:
1. RESPONSE SECTIONS — a numbered list of sections the Writer should cover (2-4 sections max)
2. TONE — one of: reassuring / cautionary / motivational / analytical / celebratory
3. DEPTH — one of: brief (1-2 sentences per section) / standard (3-4 sentences) / detailed (5+ sentences)
4. MUST INCLUDE — specific numbers or facts from the research that MUST appear in the response
5. AVOID — anything that should NOT be in the response (e.g. speculation, unrelated topics)
6. CALL TO ACTION — one practical next step to suggest at the end

Keep the plan short and structured. The Writer will follow it precisely."""


async def run(query: str, analysis: str) -> str:
    """
    Produce a structured response plan.

    Parameters
    ----------
    query    : Original user question
    analysis : Output text from researcher.run()

    Returns
    -------
    str — structured plan text
    """
    user_prompt = (
        f'USER QUERY: "{query}"\n\n'
        f"RESEARCHER ANALYSIS:\n{analysis}\n\n"
        "Create the response plan now."
    )

    async with httpx.AsyncClient(timeout=30) as client:
        response = await client.post(
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
                "temperature": 0.3,
                "max_tokens": 400,
            },
        )

    response.raise_for_status()
    data = response.json()
    return data["choices"][0]["message"]["content"]
