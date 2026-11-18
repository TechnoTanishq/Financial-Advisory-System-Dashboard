"""
RAG Retriever Agent
===================
Receives a list of transaction dicts and a user query.
Chunks the data into semantic units, scores each chunk against
the query using keyword-to-intent matching, and returns the
top-K most relevant chunks plus a combined context string.

No embedding API required — works entirely in-process.
"""

from __future__ import annotations

import re
from dataclasses import dataclass, field
from typing import Any


# ---------------------------------------------------------------------------
# Intent → keyword map
# ---------------------------------------------------------------------------
INTENT_KEYWORDS: dict[str, list[str]] = {
    "food":          ["food", "eat", "restaurant", "dining", "zomato", "swiggy",
                      "lunch", "dinner", "breakfast", "grocery", "groceries"],
    "transport":     ["transport", "travel", "uber", "ola", "cab", "fuel",
                      "petrol", "metro", "bus", "train", "flight"],
    "shopping":      ["shopping", "amazon", "flipkart", "clothes", "apparel",
                      "purchase", "buy", "mall"],
    "entertainment": ["entertainment", "netflix", "spotify", "movie", "games",
                      "subscription", "hotstar", "prime"],
    "health":        ["health", "medical", "doctor", "hospital", "pharmacy",
                      "medicine", "gym", "fitness"],
    "savings":       ["save", "savings", "emergency", "fund", "invest",
                      "investment", "mutual fund", "sip"],
    "income":        ["income", "salary", "earn", "received", "credit", "inflow"],
    "budget":        ["budget", "overspend", "overspending", "limit",
                      "track", "on track"],
    "trend":         ["trend", "month", "monthly", "over time", "pattern",
                      "history", "last month", "past"],
    "top":           ["top", "most", "highest", "biggest", "largest",
                      "max", "maximum"],
}

# ---------------------------------------------------------------------------
# Data classes
# ---------------------------------------------------------------------------

@dataclass
class Chunk:
    id: str
    type: str                          # summary | category | monthly | top_transactions | recent
    tags: list[str]
    content: str
    metadata: dict[str, Any]
    relevance_score: float = 0.0


@dataclass
class RetrievalResult:
    chunks: list[Chunk]
    intents: set[str]
    context_text: str
    total_chunks_scanned: int
    source_labels: list[dict[str, str]]


# ---------------------------------------------------------------------------
# Intent detection
# ---------------------------------------------------------------------------

def _detect_intents(query: str) -> set[str]:
    q = query.lower()
    matched: set[str] = set()
    for intent, keywords in INTENT_KEYWORDS.items():
        if any(kw in q for kw in keywords):
            matched.add(intent)
    # Always include general fallbacks for open-ended questions
    if not matched:
        matched.update({"trend", "budget", "savings"})
    return matched


# ---------------------------------------------------------------------------
# Chunk builders
# ---------------------------------------------------------------------------

def _build_summary_chunk(transactions: list[dict]) -> Chunk:
    income   = sum(t["amount"] for t in transactions if t["amount"] > 0)
    expenses = abs(sum(t["amount"] for t in transactions if t["amount"] < 0))
    net      = income - expenses
    rate     = round((net / income * 100), 1) if income > 0 else 0.0

    return Chunk(
        id="summary",
        type="summary",
        tags=["budget", "savings", "income", "trend"],
        content=(
            f"Overall Financial Summary:\n"
            f"- Total Income:   ₹{income:,.0f}\n"
            f"- Total Expenses: ₹{expenses:,.0f}\n"
            f"- Net Savings:    ₹{net:,.0f}\n"
            f"- Savings Rate:   {rate}%\n"
            f"- Transactions:   {len(transactions)}"
        ),
        metadata={"income": income, "expenses": expenses,
                  "net": net, "savings_rate": rate},
    )


def _build_category_chunks(transactions: list[dict]) -> list[Chunk]:
    cat_map: dict[str, dict] = {}
    for t in transactions:
        if t["amount"] < 0:
            cat = t.get("category") or "Other"
            if cat not in cat_map:
                cat_map[cat] = {"total": 0.0, "count": 0}
            cat_map[cat]["total"] += abs(t["amount"])
            cat_map[cat]["count"] += 1

    chunks = []
    for cat, data in cat_map.items():
        cat_lower = cat.lower()
        tags = [
            intent for intent, kws in INTENT_KEYWORDS.items()
            if any(kw in cat_lower for kw in kws)
        ] or ["shopping"]
        tags += ["top", "budget"]

        avg = data["total"] / data["count"] if data["count"] else 0
        chunks.append(Chunk(
            id=f"category_{cat}",
            type="category",
            tags=list(set(tags)),
            content=(
                f'Spending in "{cat}" category:\n'
                f"- Total Spent:          ₹{data['total']:,.0f}\n"
                f"- Number of Transactions: {data['count']}\n"
                f"- Average Transaction:  ₹{avg:,.0f}"
            ),
            metadata={"category": cat, "total": data["total"],
                      "count": data["count"]},
        ))
    return chunks


def _build_monthly_chunks(transactions: list[dict]) -> list[Chunk]:
    month_map: dict[str, dict] = {}
    for t in transactions:
        key = (t.get("date") or "unknown")[:7]   # YYYY-MM
        if key not in month_map:
            month_map[key] = {"income": 0.0, "expenses": 0.0, "count": 0}
        if t["amount"] > 0:
            month_map[key]["income"] += t["amount"]
        else:
            month_map[key]["expenses"] += abs(t["amount"])
        month_map[key]["count"] += 1

    chunks = []
    for month, data in sorted(month_map.items(), reverse=True)[:6]:
        net  = data["income"] - data["expenses"]
        rate = round(net / data["income"] * 100, 1) if data["income"] > 0 else 0.0
        chunks.append(Chunk(
            id=f"month_{month}",
            type="monthly",
            tags=["trend", "budget", "savings", "income"],
            content=(
                f"Month {month}:\n"
                f"- Income:       ₹{data['income']:,.0f}\n"
                f"- Expenses:     ₹{data['expenses']:,.0f}\n"
                f"- Net:          ₹{net:,.0f}\n"
                f"- Savings Rate: {rate}%\n"
                f"- Transactions: {data['count']}"
            ),
            metadata={"month": month, **data,
                      "net": net, "savings_rate": rate},
        ))
    return chunks


def _build_top_expenses_chunk(transactions: list[dict]) -> Chunk:
    expenses = sorted(
        [t for t in transactions if t["amount"] < 0],
        key=lambda t: t["amount"],
    )[:10]

    lines = "\n".join(
        f"  - {t.get('date','N/A')} | {t.get('name','?')} | "
        f"₹{abs(t['amount']):,.0f} | {t.get('category','Other')}"
        for t in expenses
    )
    return Chunk(
        id="top_expenses",
        type="top_transactions",
        tags=["top", "shopping", "food", "transport", "budget"],
        content=f"Top 10 Highest Expenses:\n{lines}",
        metadata={"count": len(expenses)},
    )


def _build_recent_chunk(transactions: list[dict]) -> Chunk:
    recent = transactions[:15]
    lines = "\n".join(
        f"  - {t.get('date','N/A')} | {t.get('name','?')} | "
        f"₹{abs(t['amount']):,.0f} | {t.get('type','?')} | "
        f"{t.get('category','Other')}"
        for t in recent
    )
    return Chunk(
        id="recent_transactions",
        type="recent",
        tags=["trend", "budget", "income"],
        content=f"Recent 15 Transactions:\n{lines}",
        metadata={"count": len(recent)},
    )


# ---------------------------------------------------------------------------
# Source label helper
# ---------------------------------------------------------------------------

def _build_source_labels(chunks: list[Chunk]) -> list[dict[str, str]]:
    TYPE_MAP = {
        "summary":          ("📊", "Overall Summary"),
        "top_transactions": ("💸", "Top 10 Expenses"),
        "recent":           ("🕐", "Recent Transactions"),
    }
    labels = []
    for c in chunks:
        if c.type in TYPE_MAP:
            icon, label = TYPE_MAP[c.type]
        elif c.type == "category":
            icon, label = "🏷️", f"Category: {c.metadata.get('category', 'Unknown')}"
        elif c.type == "monthly":
            icon, label = "📅", f"Month: {c.metadata.get('month', 'Unknown')}"
        else:
            icon, label = "📄", c.id
        labels.append({"icon": icon, "label": label})
    return labels


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def retrieve(
    transactions: list[dict],
    query: str,
    top_k: int = 5,
) -> RetrievalResult:
    """
    Build all semantic chunks from *transactions*, score them against
    *query*, and return the top-*top_k* most relevant ones.
    """
    if not transactions:
        return RetrievalResult(
            chunks=[],
            intents=set(),
            context_text=(
                "No transaction data available. "
                "Ask the user to sync transactions from the dashboard first."
            ),
            total_chunks_scanned=0,
            source_labels=[],
        )

    intents = _detect_intents(query)

    all_chunks: list[Chunk] = [
        _build_summary_chunk(transactions),
        *_build_category_chunks(transactions),
        *_build_monthly_chunks(transactions),
        _build_top_expenses_chunk(transactions),
        _build_recent_chunk(transactions),
    ]

    # Score each chunk
    for chunk in all_chunks:
        match_count = sum(1 for tag in chunk.tags if tag in intents)
        boost = 2 if chunk.type == "summary" else 0
        chunk.relevance_score = match_count + boost

    top_chunks = sorted(all_chunks, key=lambda c: c.relevance_score, reverse=True)[:top_k]

    context_text = "\n\n---\n\n".join(
        f"[Context {i+1} — {c.type}]\n{c.content}"
        for i, c in enumerate(top_chunks)
    )

    return RetrievalResult(
        chunks=top_chunks,
        intents=intents,
        context_text=context_text,
        total_chunks_scanned=len(all_chunks),
        source_labels=_build_source_labels(top_chunks),
    )
