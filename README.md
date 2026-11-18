# Finance Assistant

A personal finance dashboard built with React, Vite, and Tailwind CSS — powered by a **5-agent Python RAG backend** that answers financial questions grounded in your real transaction data.

## Live Demo

🌐 **[https://finance-advisory.netlify.app/](https://finance-advisory.netlify.app/)**

---

## Features

- **Landing Page** — Marketing page with live chart previews and a demo flow
- **Authentication** — Login / Signup with UPI ID via a backend API
- **Dashboard** — Upload CSV bank statements and visualize:
  - Income vs. expense summary
  - Category-wise spending breakdown (pie + bar charts)
  - Daily spending trends (area chart)
  - Monthly income/expense comparison
  - Top 5 expenses
  - Budget tracking with alerts
- **AI Chatbot** — Agentic RAG chatbot powered by a 5-agent Python pipeline:
  - 🔍 **RAG Retriever** — finds the most relevant chunks of your transaction data
  - 🧠 **Researcher** — extracts exact figures, patterns, and anomalies
  - 📋 **Planner** — decides response sections, tone, and depth
  - ✍️ **Writer** — streams the final answer token by token
  - ✅ **Reviewer** — fact-checks numbers and assigns a confidence score (1–5)
- **Transactions** — Paginated transaction history with filters
- **Profile** — View and edit your profile details
- **Dark / Light Mode** — Toggle across the entire app

---

## Tech Stack

### Frontend

| Layer    | Library               |
|----------|-----------------------|
| UI       | React 19, Tailwind CSS 4 |
| Routing  | React Router DOM 7    |
| Charts   | Recharts 3            |
| Icons    | Lucide React          |
| Build    | Vite 7                |
| Linting  | ESLint 9              |

### Backend (AI Agent Server)

| Layer       | Library / Tool                      |
|-------------|-------------------------------------|
| Framework   | FastAPI + Uvicorn                   |
| HTTP Client | httpx (async)                       |
| LLM         | Groq API — `llama-3.1-8b-instant`   |
| Validation  | Pydantic v2, pydantic-settings      |
| Streaming   | Server-Sent Events (sse-starlette)  |
| Runtime     | Python 3.13                         |

---

## Project Structure

```
finance-assistant/
├── backend/                   # Python agentic RAG server
│   ├── agents/
│   │   ├── rag_retriever.py   # Chunks transactions, retrieves top-K relevant context
│   │   ├── researcher.py      # LLM: extracts facts & patterns (temp 0.2)
│   │   ├── planner.py         # LLM: decides response strategy (temp 0.3)
│   │   ├── writer.py          # LLM: streams the draft response (temp 0.6)
│   │   ├── reviewer.py        # LLM: fact-checks & confidence score (temp 0.1)
│   │   └── orchestrator.py    # Pipeline runner, yields SSE events
│   ├── api/
│   │   └── routes.py          # POST /chat/stream, POST /chat, GET /health
│   ├── config.py              # Pydantic-settings (reads .env)
│   ├── main.py                # FastAPI app + CORS
│   └── requirements.txt
├── src/
│   ├── pages/
│   │   ├── FinancialAnalyticsLanding.jsx
│   │   ├── FinancialAdvisoryDashboard.jsx
│   │   ├── FinancialChatbot.jsx   # Consumes Python backend SSE stream
│   │   ├── FinancialLoginPage.jsx
│   │   ├── Transactions.jsx
│   │   ├── Profile.jsx
│   │   ├── PlanningSection.jsx
│   │   └── NeonAgentFlow.jsx
│   ├── api.js                 # Central API base URL
│   ├── App.jsx
│   └── main.jsx
├── .env                       # VITE_GROQ_API_KEY, VITE_AGENT_API_URL
└── package.json
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.11+
- A [Groq API key](https://console.groq.com) (free tier works)
- The existing Node.js backend running on `http://localhost:8083` (auth + transaction history)

### 1. Frontend

```bash
cd finance-assistant
npm install
npm run dev
```

Runs at `http://localhost:5173`.

### 2. Python Agent Backend

```bash
cd finance-assistant/backend

# Create and activate virtual environment
python -m venv .venv
.venv\Scripts\activate        # Windows
# source .venv/bin/activate   # macOS / Linux

# Install dependencies
pip install -r requirements.txt

# Add your Groq key to .env (copy from .env.example)
# GROQ_API_KEY=gsk_...
# VITE_AGENT_API_URL is already set in the frontend .env

# Start the server
uvicorn main:app --reload --port 8000
```

Runs at `http://localhost:8000`. Docs at `http://localhost:8000/docs`.

### 3. Frontend environment variables

Ensure `finance-assistant/.env` contains:

```env
VITE_GROQ_API_KEY=gsk_your_key_here
VITE_AGENT_API_URL=http://localhost:8000/api/v1
```

### Build for Production

```bash
npm run build
npm run preview
```

---

## Agent Backend API

| Method | Path                      | Description                        |
|--------|---------------------------|------------------------------------|
| `POST` | `/api/v1/chat/stream`     | SSE stream — full 5-agent pipeline |
| `POST` | `/api/v1/chat`            | JSON — same pipeline, no streaming |
| `GET`  | `/api/v1/health`          | Liveness probe                     |

### SSE Event Types

| Event      | Payload                                                            |
|------------|--------------------------------------------------------------------|
| `progress` | `{ step, status: "active"\|"done"\|"error", label }`              |
| `token`    | `{ token }` — Writer streams these live                           |
| `complete` | `{ final_response, confidence, verdict, source_labels, ... }`     |
| `error`    | `{ message }`                                                      |
| `done`     | `{}` — stream end signal                                           |

### Request Body

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

---

## Routes

| Path           | Page                  |
|----------------|-----------------------|
| `/`            | Landing               |
| `/login`       | Login / Signup        |
| `/dashboard`   | Main Dashboard        |
| `/chatbot`     | AI Financial Chatbot  |
| `/transactions`| Transaction History   |
| `/profile`     | User Profile          |
| `/agent-flow`  | Agent Demo Flow       |

---

## Auth & Transaction Backend API

The app expects a REST API at the URL set in `VITE_API_BASE` (default: deployed Render URL) with:

- `POST /auth/login` — `{ upiId, password }` → `{ token, user }`
- `POST /auth/signup` — `{ name, upiId, password, mobile, pin }`
- `GET /transactions/analytics` — Returns transaction list (requires Bearer token)

---

## CSV Format

The dashboard accepts CSV files with these columns:

```
Date, Description, Debit, Credit, Balance
```

Transactions are auto-categorized from description keywords (e.g. Zomato → Food & Dining, Uber → Transport).
