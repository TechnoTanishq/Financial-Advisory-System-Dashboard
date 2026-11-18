# FinAdvisor — Python Agentic RAG Backend

FastAPI backend that powers the chatbot with a **5-agent pipeline** grounded in the user's real transaction data.

## Architecture

```
POST /api/v1/chat/stream
        │
        ▼
┌─────────────────┐
│  RAG Retriever  │  ← Chunks transactions, scores & retrieves top-5 relevant chunks
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Researcher    │  ← Extracts exact figures, patterns, anomalies (temp 0.2)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│    Planner      │  ← Decides sections, tone, depth, must-include numbers (temp 0.3)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│     Writer      │  ← Drafts the response, streams tokens (temp 0.6)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│    Reviewer     │  ← Fact-checks, scores confidence 1-5, corrects if needed (temp 0.1)
└─────────────────┘
```

## Folder Structure

```
backend/
├── agents/
│   ├── __init__.py
│   ├── rag_retriever.py   # Pure-Python chunking + keyword scoring (no embeddings)
│   ├── researcher.py      # LLM: structured analysis
│   ├── planner.py         # LLM: response strategy
│   ├── writer.py          # LLM: streaming draft
│   ├── reviewer.py        # LLM: fact-check + confidence score
│   └── orchestrator.py    # Pipeline runner, yields SSE events
├── api/
│   ├── __init__.py
│   └── routes.py          # FastAPI routes: /chat/stream, /chat, /health
├── config.py              # Pydantic-settings config (reads .env)
├── main.py                # FastAPI app + CORS + router registration
├── requirements.txt
├── .env                   # Your secrets (git-ignored)
└── .env.example           # Template
```

## Setup & Run

```bash
# 1. Create and activate a virtual environment
python -m venv .venv
.venv\Scripts\activate        # Windows
# source .venv/bin/activate   # macOS / Linux

# 2. Install dependencies
pip install -r requirements.txt

# 3. Copy env template (already done if .env exists)
copy .env.example .env        # Windows
# cp .env.example .env        # macOS / Linux

# 4. Start the server
uvicorn main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`.  
Interactive docs: `http://localhost:8000/docs`

## Endpoints

| Method | Path                   | Description                              |
|--------|------------------------|------------------------------------------|
| `POST` | `/api/v1/chat/stream`  | SSE stream — runs full pipeline          |
| `POST` | `/api/v1/chat`         | JSON response — full pipeline, no stream |
| `GET`  | `/api/v1/health`       | Liveness probe                           |

## SSE Event Types

| Event      | Payload                                           |
|------------|---------------------------------------------------|
| `progress` | `{step, status: active\|done\|error, label}`      |
| `token`    | `{token: str}` — writer streams these             |
| `complete` | `{final_response, confidence, verdict, source_labels, ...}` |
| `error`    | `{message: str}`                                  |
| `done`     | `{}` — stream end signal                          |

## Request Body (`/chat/stream` and `/chat`)

```json
{
  "query": "Where am I spending the most?",
  "transactions": [
    {
      "id": "1",
      "name": "Zomato",
      "amount": -450.0,
      "type": "expense",
      "category": "Food & Dining",
      "date": "2024-11-15"
    }
  ]
}
```
