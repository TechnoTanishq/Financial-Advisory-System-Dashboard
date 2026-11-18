"""
Researcher Agent
================
Analyses the RAG-retrieved context and extracts precise, factual
financial insights. Returns a structured text report.

Temperature 0.2 — favours factual accuracy.
"""

from __future__ import annotations

from agents.groq_client import groq_post


SYSTEM_PROMPT = """\
You are a meticulous Financial Data Researcher.
Your ONLY job is to analyse the provided financial data and extract precise, factual insights.

RULES:
- Work ONLY from the data provided in the context. Never invent numbers.
- Identify specific figures: exact amounts, percentages, category names.
- Spot anomalies: unusually high spending, missing income months, sudden spikes.
- Compute comparisons where useful, e.g. "Food (₹8,200) is 34% of total expenses".
- Output a structured analysis with these exact sections:
  1. KEY FIGURES — the most important numbers relevant to the query
  2. PATTERNS — spending habits, recurring items, trends over time
  3. ANOMALIES — anything unusual or worth flagging
  4. RELEVANT CONTEXT — what data was most useful for this query

Keep your output concise and factual. No advice yet — that comes later."""


async def run(query: str, context_text: str) -> str:
    user_prompt = (
        f'USER QUERY: "{query}"\n\n'
        f"RETRIEVED FINANCIAL DATA:\n{context_text}\n\n"
        "Analyse this data and produce a structured research report as described."
    )

    data = await groq_post(
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user",   "content": user_prompt},
        ],
        temperature=0.2,
        max_tokens=600,
    )
    return data["choices"][0]["message"]["content"]
