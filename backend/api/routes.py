"""
API Routes
==========
POST /chat/stream
    Accepts query + transactions, runs the full agent pipeline,
    and streams Server-Sent Events back to the client.

POST /chat
    Non-streaming version — waits for the full pipeline and returns
    the final result as JSON (useful for testing).

GET  /health
    Simple liveness probe.
"""

from __future__ import annotations

import json
from typing import Any

from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

from agents.orchestrator import run_pipeline

router = APIRouter()


# ---------------------------------------------------------------------------
# Request / Response models
# ---------------------------------------------------------------------------

class Transaction(BaseModel):
    id:       Any    = None
    name:     str    = ""
    amount:   float  = 0.0
    type:     str    = ""          # "income" | "expense"
    category: str    = "Other"
    date:     str    = ""


class ChatRequest(BaseModel):
    query:        str               = Field(..., min_length=1, max_length=2000)
    transactions: list[Transaction] = Field(default_factory=list)


# ---------------------------------------------------------------------------
# SSE streaming endpoint
# ---------------------------------------------------------------------------

@router.post("/chat/stream")
async def chat_stream(body: ChatRequest) -> StreamingResponse:
    """
    Streams SSE events for each pipeline step.

    Event format:
        event: <type>
        data: <json>

    Event types: progress | token | complete | error
    """
    tx_dicts = [t.model_dump() for t in body.transactions]

    async def event_generator():
        async for event in run_pipeline(body.query, tx_dicts):
            yield (
                f"event: {event['event']}\n"
                f"data: {json.dumps(event['data'])}\n\n"
            )
        # Signal stream end
        yield "event: done\ndata: {}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control":               "no-cache",
            "X-Accel-Buffering":           "no",
            "Access-Control-Allow-Origin": "*",
        },
    )


# ---------------------------------------------------------------------------
# Non-streaming endpoint (collect full result)
# ---------------------------------------------------------------------------

@router.post("/chat")
async def chat(body: ChatRequest) -> dict:
    """
    Runs the full pipeline and returns the final result as JSON.
    Useful for testing or clients that don't support SSE.
    """
    tx_dicts = [t.model_dump() for t in body.transactions]
    result: dict = {}
    draft_tokens: list[str] = []

    async for event in run_pipeline(body.query, tx_dicts):
        if event["event"] == "token":
            draft_tokens.append(event["data"]["token"])
        elif event["event"] == "complete":
            result = event["data"]
        elif event["event"] == "error":
            return {"error": event["data"]["message"]}

    # Attach streamed draft for debugging if reviewer rewrote it
    result["writer_draft"] = "".join(draft_tokens)
    return result


# ---------------------------------------------------------------------------
# Health check
# ---------------------------------------------------------------------------

@router.get("/health")
async def health() -> dict:
    return {"status": "ok"}
