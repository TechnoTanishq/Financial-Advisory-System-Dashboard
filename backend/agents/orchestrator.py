"""
Orchestrator
============
Runs the full 5-agent pipeline in sequence:

    RAG Retriever → Researcher → Planner → Writer (stream) → Reviewer

Yields Server-Sent Event (SSE) dicts so the FastAPI route can forward
them directly to the browser.

SSE event types
---------------
progress   : {"step": str, "status": "active"|"done"|"error", "label": str}
token      : {"token": str}          — streamed writer tokens
complete   : {"result": {...}}       — final payload after reviewer
error      : {"message": str}        — pipeline-level failure
"""

from __future__ import annotations

import json
from typing import Any, AsyncGenerator

from agents import rag_retriever, researcher, planner, writer, reviewer


# ---------------------------------------------------------------------------
# Step metadata (mirrors AGENT_STEPS in the React frontend)
# ---------------------------------------------------------------------------

AGENT_STEPS: list[dict[str, str]] = [
    {"id": "retriever",  "label": "RAG Retriever", "emoji": "🔍",
     "description": "Finding relevant data..."},
    {"id": "researcher", "label": "Researcher",    "emoji": "🧠",
     "description": "Analyzing patterns & numbers..."},
    {"id": "planner",    "label": "Planner",       "emoji": "📋",
     "description": "Crafting response strategy..."},
    {"id": "writer",     "label": "Writer",        "emoji": "✍️",
     "description": "Drafting your answer..."},
    {"id": "reviewer",   "label": "Reviewer",      "emoji": "✅",
     "description": "Verifying accuracy..."},
]


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _sse(event_type: str, data: dict[str, Any]) -> dict[str, Any]:
    """Wrap payload so the route can serialise it as an SSE line."""
    return {"event": event_type, "data": data}


def _progress(step_id: str, status: str, description: str = "") -> dict:
    return _sse("progress", {
        "step": step_id,
        "status": status,
        "label": description,
    })


# ---------------------------------------------------------------------------
# Main pipeline generator
# ---------------------------------------------------------------------------

async def run_pipeline(
    query: str,
    transactions: list[dict],
) -> AsyncGenerator[dict[str, Any], None]:
    """
    Async generator that runs the pipeline and yields SSE event dicts.

    Usage in a FastAPI route
    ------------------------
    async for event in orchestrator.run_pipeline(query, transactions):
        yield f"event: {event['event']}\\ndata: {json.dumps(event['data'])}\\n\\n"
    """

    # ── 1. RAG Retriever ────────────────────────────────────────────────────
    yield _progress("retriever", "active", "🔍 Finding relevant data...")

    try:
        retrieval = rag_retriever.retrieve(transactions, query, top_k=5)
    except Exception as exc:
        yield _progress("retriever", "error")
        yield _sse("error", {"message": f"RAG Retriever failed: {exc}"})
        return

    yield _progress("retriever", "done")

    # Short-circuit when no data is loaded
    if not retrieval.chunks:
        for step in ["researcher", "planner", "writer", "reviewer"]:
            yield _progress(step, "done")
        yield _sse("complete", {
            "final_response": (
                "I don't have any transaction data to work with yet. "
                "Please sync your transactions from the Dashboard first, "
                "then come back and ask me anything!"
            ),
            "confidence": 5,
            "verdict": "APPROVED",
            "source_labels": [],
        })
        return

    # ── 2. Researcher ────────────────────────────────────────────────────────
    yield _progress("researcher", "active", "🧠 Analyzing patterns & numbers...")

    try:
        analysis = await researcher.run(query, retrieval.context_text)
    except Exception as exc:
        yield _progress("researcher", "error")
        yield _sse("error", {"message": f"Researcher agent failed: {exc}"})
        return

    yield _progress("researcher", "done")

    # ── 3. Planner ───────────────────────────────────────────────────────────
    yield _progress("planner", "active", "📋 Crafting response strategy...")

    try:
        plan = await planner.run(query, analysis)
    except Exception as exc:
        yield _progress("planner", "error")
        yield _sse("error", {"message": f"Planner agent failed: {exc}"})
        return

    yield _progress("planner", "done")

    # ── 4. Writer (streaming) ────────────────────────────────────────────────
    yield _progress("writer", "active", "✍️ Drafting your answer...")

    draft = ""
    try:
        async for token in writer.run_stream(query, analysis, plan):
            draft += token
            yield _sse("token", {"token": token})
    except Exception as exc:
        yield _progress("writer", "error")
        yield _sse("error", {"message": f"Writer agent failed: {exc}"})
        return

    yield _progress("writer", "done")

    # ── 5. Reviewer ──────────────────────────────────────────────────────────
    yield _progress("reviewer", "active", "✅ Verifying accuracy...")

    try:
        review = await reviewer.run(query, analysis, draft)
    except Exception as exc:
        yield _progress("reviewer", "error")
        yield _sse("error", {"message": f"Reviewer agent failed: {exc}"})
        return

    yield _progress("reviewer", "done")

    # ── Final result ─────────────────────────────────────────────────────────
    yield _sse("complete", {
        "final_response":  review.final_response,
        "confidence":      review.confidence,
        "verdict":         review.verdict,
        "corrections":     review.corrections,
        "source_labels":   retrieval.source_labels,
        "total_chunks":    retrieval.total_chunks_scanned,
        "intents":         list(retrieval.intents),
    })
