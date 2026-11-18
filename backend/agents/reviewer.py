"""
Reviewer Agent
==============
Fact-checks the Writer's draft and returns a ReviewResult with
confidence score (1-5) and final approved/corrected response.
Temperature 0.1 — near-deterministic fact-checking.
"""

from __future__ import annotations

import re
from dataclasses import dataclass

from agents.groq_client import groq_post


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
    verdict: str
    corrections: str
    raw: str


async def run(query: str, analysis: str, draft: str) -> ReviewResult:
    user_prompt = (
        f'USER QUERY: "{query}"\n\n'
        f"RESEARCH DATA (ground truth — numbers must match):\n{analysis}\n\n"
        f"DRAFT RESPONSE TO REVIEW:\n{draft}\n\n"
        "Review and produce your verdict now."
    )

    data = await groq_post(
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user",   "content": user_prompt},
        ],
        temperature=0.1,
        max_tokens=700,
    )
    raw = data["choices"][0]["message"]["content"]

    verdict_m    = re.search(r"VERDICT:\s*(APPROVED|NEEDS_CORRECTION)", raw, re.I)
    confidence_m = re.search(r"CONFIDENCE:\s*([1-5])", raw)
    issues_m     = re.search(r"ISSUES:\s*(.*?)(?=FINAL_RESPONSE:|$)", raw, re.S | re.I)
    final_m      = re.search(r"FINAL_RESPONSE:\s*([\s\S]*?)$", raw, re.I)

    return ReviewResult(
        final_response=(final_m.group(1).strip()  if final_m      else draft),
        confidence=    (int(confidence_m.group(1)) if confidence_m else 3),
        verdict=       (verdict_m.group(1).upper() if verdict_m    else "APPROVED"),
        corrections=   (issues_m.group(1).strip()  if issues_m     else "None"),
        raw=raw,
    )
