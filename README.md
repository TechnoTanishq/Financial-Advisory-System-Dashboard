# Finance Assistant

A personal finance dashboard built with React, Vite, and Tailwind CSS. Upload your bank statement CSV and get instant analytics, spending breakdowns, budget tracking, and AI-powered financial advice.

# Live Link 
<a> https://finance-advisory.netlify.app/</a>

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
- **AI Chatbot** — Ask questions about your finances powered by a local Ollama LLM (`llama3.2:1b`)
- **Transactions** — Paginated transaction history with filters
- **Profile** — View and edit your profile details
- **Settings** — Customize currency, date format, theme, notifications, privacy, and data export
- **Dark / Light Mode** — Toggle across the entire app
- **Notifications** — In-app notification panel with read/unread state

## Tech Stack

| Layer       | Library |
| UI | React 19, Tailwind CSS 4 |
| Routing | React Router DOM 7 |
| Charts | Recharts 3 |
| Icons | Lucide React |
| Build | Vite 7 |
| Linting | ESLint 9 |

## Getting Started

### Prerequisites

- Node.js 18+
- Backend API running on `http://localhost:8083` (for auth and transaction history)
- [Ollama](https://ollama.com) running locally with `llama3.2:1b` pulled (for the chatbot)

### Install & Run

```bash
cd finance-assistant
npm install
npm run dev
```

App runs at `http://localhost:5173` by default.

### Build for Production

```bash
npm run build
npm run preview
```

## CSV Format

The dashboard accepts CSV files with the following columns:

```
Date, Description, Debit, Credit, Balance
```

Transactions are auto-categorized based on keywords in the description (e.g., Zomato → Food & Dining, Uber → Transport).

## Routes

| Path | Page |
|---|---|
| `/` | Landing |
| `/login` | Login / Signup |
| `/dashboard` | Main Dashboard |
| `/chatbot` | AI Financial Chatbot |
| `/transactions` | Transaction History |
| `/profile` | User Profile |
| `/agent-flow` | Agent Demo Flow |

## Backend API

The app expects a REST API at `http://localhost:8083` with:

- `POST /auth/login` — `{ upiId, password }` → `{ token, user }`
- `POST /auth/signup` — `{ name, upiId, password, mobile, pin }`
- `GET /transactions/history` — Returns transaction list (requires auth token)
