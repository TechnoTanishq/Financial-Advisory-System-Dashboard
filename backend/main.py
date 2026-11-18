"""
main.py — FastAPI application entry point
==========================================
Run locally:
    uvicorn main:app --reload --port 8000

The React frontend at localhost:5173 is whitelisted via CORS.
Add more origins to ALLOWED_ORIGINS in .env as needed.
"""

from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import settings
from api.routes import router

# ---------------------------------------------------------------------------
# App
# ---------------------------------------------------------------------------

app = FastAPI(
    title="FinAdvisor — Agentic RAG Backend",
    description=(
        "5-agent pipeline (RAG Retriever → Researcher → Planner → "
        "Writer → Reviewer) that answers financial questions grounded "
        "in the user's real transaction data."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ---------------------------------------------------------------------------
# CORS — allow the Vite dev server and production build
# ---------------------------------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Routers
# ---------------------------------------------------------------------------

app.include_router(router, prefix="/api/v1")


# ---------------------------------------------------------------------------
# Dev entrypoint
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
