"""
Reviewer Agent
==============
Validates the Writer's draft against the original query and the
Researcher's ground-truth numbers.

Returns a structured ReviewResult dataclass with:
  - final_response  : approved or corrected response text
  - confidence      : 1-5 score
  - verdict         : "APPROVED" | "NEEDS_CORRECTION"
  - corrections     : description of issues found (or "None")

Temperature is 0.1 — we want near-deterministic fact-checking.
"""

from __future__ import annotations

import re
from dataclasses import dataclass

import httpx

from config import settings


SYSTEM_PROMPT = """\
You are a strict Financial Response Reviewer and Quality Controller.

Your job is to review a draft financial advice response and ensure it is:
1. ACCURATE   — all numbers match the research data exactly
2. RELEVANT   — directly answers the user's question
3. COMPLETE   — covers the key points without being too long
4. SAFE       — no speculation, no promises of returns, no invented data

OUTPUT FORMAT (use this exact structure):
VERDICT: [APPROVED / NEEDS_CORRECTION]
CONFIDENCE: [1-5 where 5 = perfect]
ISSUES: [list any problems found, or "None"]
FINAL_RESPONSE:
[either the original draft if approved, or your corrected version]

IMPORTANT: Always output the FINAL_RESPONSE section — it is what the user sees.
If the draft is good, copy it exactly under FINAL_RESPONSE.
If it has issues, write a corrected version."""


@dataclass
class ReviewResult:
    final_response: str
    confidence: int
    verdict: str          # "APPROVED" | "NEEDS_CORRECTION"
    corrections: str      # human-readable issues, or "None"
    raw: str              # full LLM output for debugging


async def run(query: str, analysis: str, draft: str) -> ReviewResult:
    """
    Fact-check *draft* against *analysis* and return a ReviewResult.

    Parameters
    ----------
    query    : Original user question
    analysis : Researcher's structured analysis (ground truth)
    draft    : Writer's drafted response

    Returns
    -------
    ReviewResult
    """
    user_prompt = (
        f'USER QUERY: "{query}"\n\n'
        f"RESEARCH DATA (ground truth — numbers must match):\n{analysis}\n\n"
        f"DRAFT RESPONSE TO REVIEW:\n{draft}\n\n"
        "Review and produce your verdict now."
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
                "temperature": 0.1,
                "max_tokens": 700,
            },
        )

    response.raise_for_status()
    raw = response.json()["choices"][0]["message"]["content"]

    # --- Parse structured output ---
    verdict_m    = re.search(r"VERDICT:\s*(APPROVED|NEEDS_CORRECTION)", raw, re.I)
    confidence_m = re.search(r"CONFIDENCE:\s*([1-5])", raw)
    issues_m     = re.search(r"ISSUES:\s*(.*?)(?=FINAL_RESPONSE:|$)", raw, re.S | re.I)
    final_m      = re.search(r"FINAL_RESPONSE:\s*([\s\S]*?)$", raw, re.I)

    verdict     = (verdict_m.group(1).upper()   if verdict_m    else "APPROVED")
    confidence  = (int(confidence_m.group(1))   if confidence_m else 3)
    corrections = (issues_m.group(1).strip()     if issues_m     else "None")
    final_response = (final_m.group(1).strip()  if final_m      else draft)

    return ReviewResult(
        final_response=final_response,
        confidence=confidence,
        verdict=verdict,
        corrections=corrections,
        raw=raw,
    )
