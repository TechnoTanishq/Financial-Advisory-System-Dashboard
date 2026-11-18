import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Moon, Sun, MessageCircle, Send, Wallet,
  Home, FileText, BarChart3, Calendar, Sparkles,
  User, Bot, RefreshCw, TrendingUp,
  TrendingDown, DollarSign, PiggyBank, BarChart2,
  Lightbulb, AlertCircle, CheckCircle2,
  Copy, ThumbsUp, ThumbsDown, X,
  Download, Share2, Settings, MoreVertical,
  ChevronRight, Zap, Shield, Brain, Feather, Search,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { API_BASE } from '../api';

// ─── Constants ────────────────────────────────────────────────────────────────
const AGENT_API = import.meta.env.VITE_AGENT_API_URL || 'http://localhost:8000/api/v1';
const HISTORY_API = `${API_BASE}/transactions/analytics`;

// Agent pipeline step definitions (must match backend AGENT_STEPS order)
const AGENT_STEPS = [
  { id: 'retriever',  label: 'RAG Retriever', emoji: '🔍', description: 'Finding relevant data...' },
  { id: 'researcher', label: 'Researcher',    emoji: '🧠', description: 'Analyzing patterns & numbers...' },
  { id: 'planner',    label: 'Planner',       emoji: '📋', description: 'Crafting response strategy...' },
  { id: 'writer',     label: 'Writer',        emoji: '✍️', description: 'Drafting your answer...' },
  { id: 'reviewer',   label: 'Reviewer',      emoji: '✅', description: 'Verifying accuracy...' },
];

const AGENT_ICONS = {
  retriever:  Search,
  researcher: Brain,
  planner:    Lightbulb,
  writer:     Feather,
  reviewer:   Shield,
};

const SUGGESTED_QUESTIONS = [
  { icon: TrendingDown,  text: 'Where am I spending the most money?',    category: 'spending' },
  { icon: PiggyBank,     text: 'How much should I save this month?',      category: 'savings' },
  { icon: TrendingUp,    text: 'What investment options suit my profile?', category: 'investment' },
  { icon: DollarSign,    text: 'Am I on track with my budget?',            category: 'budget' },
  { icon: AlertCircle,   text: 'Which expenses can I cut down?',           category: 'advice' },
  { icon: BarChart2,     text: 'Show me my income vs expense trend',       category: 'analytics' },
  { icon: Lightbulb,     text: 'Give me a personalized savings plan',      category: 'planning' },
  { icon: CheckCircle2,  text: 'How do I build an emergency fund?',        category: 'goals' },
];

const CATEGORY_COLORS = {
  spending:   'from-red-500 to-pink-500',
  savings:    'from-emerald-500 to-teal-500',
  investment: 'from-indigo-500 to-purple-500',
  budget:     'from-amber-500 to-orange-500',
  advice:     'from-orange-500 to-red-500',
  analytics:  'from-blue-500 to-cyan-500',
  planning:   'from-violet-500 to-fuchsia-500',
  goals:      'from-teal-500 to-green-500',
};

const QUICK_ACTIONS = [
  { icon: Download, label: 'Export Chat',    action: 'export' },
  { icon: Share2,   label: 'Share Insights', action: 'share' },
  { icon: Settings, label: 'Preferences',    action: 'settings' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatTime(date) {
  return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

function formatMessage(text) {
  if (!text) return null;
  return text.split('\n').map((line, i) => {
    if (line.startsWith('## '))
      return <h3 key={i} className="font-bold text-base mt-3 mb-1 bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">{line.slice(3)}</h3>;
    if (line.startsWith('- ') || line.startsWith('• '))
      return <li key={i} className="ml-4 list-disc text-sm leading-relaxed">{line.slice(2)}</li>;
    if (line.trim() === '')
      return <br key={i} />;
    const parts = line.split(/\*\*(.*?)\*\*/g);
    return (
      <p key={i} className="text-sm leading-relaxed">
        {parts.map((part, j) =>
          j % 2 === 1 ? <strong key={j} className="font-semibold">{part}</strong> : part
        )}
      </p>
    );
  });
}

// ─── Agent Progress Bar ───────────────────────────────────────────────────────
function AgentProgressBar({ agentStatus, dark }) {
  return (
    <div className={`flex items-center gap-1 px-4 py-2.5 rounded-2xl border text-xs flex-wrap ${
      dark ? 'bg-gray-800/80 border-gray-700' : 'bg-gray-50 border-gray-200'
    }`}>
      <span className={`text-xs font-semibold mr-2 ${dark ? 'text-gray-400' : 'text-gray-500'}`}>Agents:</span>
      {AGENT_STEPS.map((step, idx) => {
        const status = agentStatus[step.id] || 'idle';
        const Icon = AGENT_ICONS[step.id];
        return (
          <React.Fragment key={step.id}>
            <div
              title={step.description}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg transition-all duration-300 ${
                status === 'active'
                  ? dark ? 'bg-violet-900/60 border border-violet-600 text-violet-300'
                          : 'bg-violet-50 border border-violet-300 text-violet-700'
                  : status === 'done'
                  ? dark ? 'bg-emerald-900/40 border border-emerald-700 text-emerald-400'
                          : 'bg-emerald-50 border border-emerald-300 text-emerald-600'
                  : status === 'error'
                  ? dark ? 'bg-red-900/40 border border-red-700 text-red-400'
                          : 'bg-red-50 border border-red-300 text-red-600'
                  : dark ? 'text-gray-600' : 'text-gray-400'
              }`}
            >
              {status === 'active'
                ? <div className="w-2.5 h-2.5 rounded-full bg-violet-500 animate-pulse" />
                : status === 'done'
                ? <CheckCircle2 size={11} />
                : <Icon size={11} />
              }
              <span className="font-medium hidden sm:inline">{step.label}</span>
              <span className="font-medium sm:hidden">{step.emoji}</span>
            </div>
            {idx < AGENT_STEPS.length - 1 && (
              <ChevronRight size={10} className={dark ? 'text-gray-700' : 'text-gray-300'} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ─── Source Citations ─────────────────────────────────────────────────────────
function SourceCitations({ sources, confidence, dark }) {
  const [expanded, setExpanded] = useState(false);
  if (!sources || sources.length === 0) return null;

  const confidenceColor =
    confidence >= 4 ? (dark ? 'text-emerald-400' : 'text-emerald-600') :
    confidence >= 3 ? (dark ? 'text-amber-400'   : 'text-amber-600')   :
                      (dark ? 'text-red-400'      : 'text-red-600');

  return (
    <div className={`mt-2 rounded-xl border overflow-hidden ${
      dark ? 'border-gray-700 bg-gray-800/60' : 'border-gray-200 bg-gray-50/80'
    }`}>
      <button
        onClick={() => setExpanded(v => !v)}
        className={`w-full flex items-center justify-between px-3 py-2 text-xs ${
          dark ? 'text-gray-400 hover:bg-gray-700/40' : 'text-gray-500 hover:bg-gray-100'
        }`}
      >
        <span className="flex items-center gap-1.5">
          <Shield size={11} />
          <span className="font-medium">{sources.length} data source{sources.length > 1 ? 's' : ''} used</span>
        </span>
        <span className="flex items-center gap-2">
          <span className={`font-semibold ${confidenceColor}`}>Confidence: {confidence}/5</span>
          <ChevronRight size={11} className={`transition-transform ${expanded ? 'rotate-90' : ''}`} />
        </span>
      </button>
      {expanded && (
        <div className={`px-3 pb-2 flex flex-wrap gap-1.5 border-t ${dark ? 'border-gray-700' : 'border-gray-200'}`}
          style={{ paddingTop: 8 }}>
          {sources.map((s, i) => (
            <span key={i} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${
              dark ? 'bg-gray-700 text-gray-300' : 'bg-white border border-gray-200 text-gray-600'
            }`}>
              {s.icon} {s.label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Message Bubble ───────────────────────────────────────────────────────────
function MessageBubble({ msg, dark }) {
  const [liked, setLiked]   = useState(null);
  const [copied, setCopied] = useState(false);
  const isBot = msg.role === 'assistant';

  const handleCopy = () => {
    navigator.clipboard.writeText(msg.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`flex gap-3 ${isBot ? 'items-start' : 'items-start flex-row-reverse'} mb-5 group`}>
      {/* Avatar */}
      <div className={`flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center shadow-md ${
        isBot ? 'bg-gradient-to-br from-violet-600 to-indigo-600' : dark ? 'bg-gray-700' : 'bg-gray-200'
      }`}>
        {isBot
          ? <Bot  size={15} className="text-white" />
          : <User size={15} className={dark ? 'text-gray-300' : 'text-gray-600'} />
        }
      </div>

      <div className={`flex flex-col gap-1.5 max-w-[72%] ${isBot ? 'items-start' : 'items-end'}`}>
        {/* Name + time */}
        <div className={`flex items-center gap-1.5 ${isBot ? '' : 'flex-row-reverse'}`}>
          <span className={`text-xs font-semibold ${dark ? 'text-gray-400' : 'text-gray-600'}`}>
            {isBot ? '✨ FinAdvisor AI' : 'You'}
          </span>
          <span className={`text-xs ${dark ? 'text-gray-600' : 'text-gray-400'}`}>
            {formatTime(msg.timestamp)}
          </span>
        </div>

        {/* Bubble */}
        <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-lg ${
          isBot
            ? dark
              ? 'bg-gray-800/80 border border-gray-700/50 text-gray-200'
              : 'bg-white/95 border border-gray-100 text-gray-800'
            : 'bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-violet-500/20'
        } ${isBot ? 'rounded-tl-sm' : 'rounded-tr-sm'}`}>
          {msg.isLoading ? (
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                {[0, 1, 2].map(i => (
                  <div key={i}
                    className={`w-2 h-2 rounded-full animate-bounce ${dark ? 'bg-gray-500' : 'bg-gray-400'}`}
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
              <span className="text-xs font-medium">{msg.agentLabel || 'Thinking...'}</span>
            </div>
          ) : isBot ? formatMessage(msg.content) : <p>{msg.content}</p>}
        </div>

        {/* Live agent progress bar */}
        {isBot && msg.agentStatus && Object.values(msg.agentStatus).some(s => s !== 'idle') && (
          <AgentProgressBar agentStatus={msg.agentStatus} dark={dark} />
        )}

        {/* Source citations after pipeline finishes */}
        {isBot && !msg.isLoading && msg.sources?.length > 0 && (
          <SourceCitations sources={msg.sources} confidence={msg.confidence || 0} dark={dark} />
        )}

        {/* Copy / like / dislike */}
        {isBot && !msg.isLoading && (
          <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={handleCopy}
              className={`flex items-center gap-1 text-xs px-2 py-1 rounded-lg transition ${
                dark ? 'bg-gray-800 text-gray-400 hover:bg-gray-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}>
              <Copy size={11} /> {copied ? 'Copied!' : 'Copy'}
            </button>
            <button onClick={() => setLiked(true)}
              className={`px-2 py-1 rounded-lg text-xs transition ${
                liked === true ? 'bg-emerald-100 text-emerald-600'
                : dark ? 'bg-gray-800 text-gray-400 hover:bg-gray-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}>
              <ThumbsUp size={11} />
            </button>
            <button onClick={() => setLiked(false)}
              className={`px-2 py-1 rounded-lg text-xs transition ${
                liked === false ? 'bg-red-100 text-red-600'
                : dark ? 'bg-gray-800 text-gray-400 hover:bg-gray-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}>
              <ThumbsDown size={11} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Empty / Welcome State ────────────────────────────────────────────────────
function EmptyState({ dark, onQuestionClick }) {
  return (
    <div className="h-full flex flex-col items-center justify-center px-8 py-12">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center mb-5 shadow-lg">
        <Sparkles size={30} className="text-white" />
      </div>
      <h2 className={`text-2xl font-bold mb-2 ${dark ? 'text-white' : 'text-gray-900'}`}>
        Welcome to FinAdvisor AI
      </h2>
      <p className={`text-sm mb-3 max-w-md text-center ${dark ? 'text-gray-400' : 'text-gray-600'}`}>
        Your intelligent financial companion. Powered by a 5-agent Python pipeline that researches, plans, writes, and verifies every answer.
      </p>

      {/* Pipeline preview */}
      <div className={`flex items-center gap-1 mb-8 px-3 py-2 rounded-xl border text-xs flex-wrap justify-center ${
        dark ? 'bg-gray-800/60 border-gray-700 text-gray-500' : 'bg-gray-50 border-gray-200 text-gray-400'
      }`}>
        {AGENT_STEPS.map((step, i) => (
          <React.Fragment key={step.id}>
            <span>{step.emoji} {step.label}</span>
            {i < AGENT_STEPS.length - 1 && <ChevronRight size={10} />}
          </React.Fragment>
        ))}
      </div>

      <div className="w-full max-w-2xl grid grid-cols-2 gap-3">
        {SUGGESTED_QUESTIONS.slice(0, 4).map((q, i) => (
          <button key={i} onClick={() => onQuestionClick(q.text)}
            className={`p-4 rounded-xl border transition hover:scale-[1.02] text-left ${
              dark ? 'border-gray-800 hover:bg-gray-800/50' : 'border-gray-200 hover:bg-gray-50'
            }`}>
            <div className="flex items-start gap-3">
              <div className={`p-1.5 rounded-lg bg-gradient-to-br ${CATEGORY_COLORS[q.category]} flex-shrink-0`}>
                <q.icon size={13} className="text-white" />
              </div>
              <p className={`text-sm font-medium leading-tight ${dark ? 'text-gray-300' : 'text-gray-700'}`}>
                {q.text}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Quick Action Menu ────────────────────────────────────────────────────────
function QuickActionMenu({ dark, onAction }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(v => !v)}
        className={`p-2 rounded-xl transition ${dark ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-600'}`}>
        <MoreVertical size={17} />
      </button>
      {open && (
        <div className={`absolute right-0 mt-2 w-44 rounded-xl border shadow-lg overflow-hidden z-50 ${
          dark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          {QUICK_ACTIONS.map((action, i) => (
            <button key={i} onClick={() => { onAction(action.action); setOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition ${
                dark ? 'text-gray-300 hover:bg-gray-700/50' : 'text-gray-700 hover:bg-gray-50'
              } ${i < QUICK_ACTIONS.length - 1 ? `border-b ${dark ? 'border-gray-700' : 'border-gray-100'}` : ''}`}>
              <action.icon size={15} /> {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function FinancialChatbot() {
  const [dark, setDark]             = useState(() => localStorage.getItem('finAdvisorDark') === 'true');
  const [messages, setMessages]     = useState([]);
  const [input, setInput]           = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [txLoading, setTxLoading]   = useState(false);

  const messagesEndRef = useRef(null);
  const navigate       = useNavigate();

  useEffect(() => { localStorage.setItem('finAdvisorDark', dark); }, [dark]);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  // ── Fetch transactions from existing backend ─────────────────────────────
  const fetchTransactions = useCallback(async () => {
    setTxLoading(true);
    try {
      const token      = localStorage.getItem('token');
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      if (!token || !storedUser.upiId) return;

      const res  = await fetch(HISTORY_API, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      const history = data.transactions || [];

      const formatted = history.map((t, i) => {
        const isIncome = t.toUpi === storedUser.upiId;
        return {
          id:       t.transactionId || i,
          name:     isIncome ? `Received from ${t.fromUpi}` : `Paid to ${t.toUpi}`,
          amount:   isIncome ? t.amount : -t.amount,
          type:     isIncome ? 'income' : 'expense',
          category: t.category || (isIncome ? 'Income' : 'Other'),
          date:     new Date(t.createdAt).toISOString().split('T')[0],
        };
      });
      setTransactions(formatted);
    } catch (e) {
      console.error('Failed to fetch transactions:', e);
    } finally {
      setTxLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTransactions();
    setMessages([{
      id: 0, role: 'assistant', timestamp: new Date(),
      content: `👋 **Hello!** I'm your **FinAdvisor AI** — powered by a **5-agent Python pipeline**.\n\nEvery answer goes through:\n- 🔍 **RAG Retriever** — finds the most relevant parts of your financial data\n- 🧠 **Researcher** — analyzes patterns and exact numbers\n- 📋 **Planner** — decides the best advice strategy\n- ✍️ **Writer** — drafts a clear, structured response\n- ✅ **Reviewer** — verifies accuracy before you see it\n\n**Ask me anything about your finances!**`,
    }]);
  }, [fetchTransactions]);

  // ── Send message → call Python backend SSE endpoint ─────────────────────
  const handleSend = useCallback(async (overrideText) => {
    const text = (overrideText || input).trim();
    if (!text || isStreaming) return;

    const botMsgId = Date.now() + 1;
    setInput('');
    setIsStreaming(true);

    // Seed the initial agent status
    const idleStatus = Object.fromEntries(AGENT_STEPS.map(s => [s.id, 'idle']));

    setMessages(prev => [
      ...prev,
      { id: Date.now(), role: 'user', content: text, timestamp: new Date() },
      {
        id: botMsgId, role: 'assistant',
        content: '', isLoading: true,
        agentLabel: '🔍 Finding relevant data...',
        agentStatus: { ...idleStatus, retriever: 'active' },
        timestamp: new Date(),
        sources: [], confidence: 0,
      },
    ]);

    try {
      const response = await fetch(`${AGENT_API}/chat/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: text, transactions }),
      });

      if (!response.ok) {
        throw new Error(`Backend returned ${response.status}`);
      }

      const reader  = response.body.getReader();
      const decoder = new TextDecoder();
      let   buffer  = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // SSE messages are separated by double newline
        const parts = buffer.split('\n\n');
        buffer = parts.pop(); // keep any incomplete trailing chunk

        for (const part of parts) {
          if (!part.trim()) continue;

          // Parse "event: <type>\ndata: <json>"
          const eventLine = part.match(/^event:\s*(.+)$/m);
          const dataLine  = part.match(/^data:\s*(.+)$/m);
          if (!eventLine || !dataLine) continue;

          const eventType = eventLine[1].trim();
          let   payload;
          try { payload = JSON.parse(dataLine[1]); } catch { continue; }

          if (eventType === 'progress') {
            setMessages(prev => prev.map(m => {
              if (m.id !== botMsgId) return m;
              const newStatus = { ...m.agentStatus, [payload.step]: payload.status };
              const label = payload.status === 'active' ? (payload.label || '') : m.agentLabel;
              return { ...m, agentStatus: newStatus, agentLabel: label };
            }));
          }

          else if (eventType === 'token') {
            setMessages(prev => prev.map(m =>
              m.id === botMsgId
                ? { ...m, content: m.content + payload.token, isLoading: false }
                : m
            ));
          }

          else if (eventType === 'complete') {
            setMessages(prev => prev.map(m =>
              m.id === botMsgId
                ? {
                    ...m,
                    content:     payload.final_response,
                    isLoading:   false,
                    agentLabel:  null,
                    sources:     payload.source_labels || [],
                    confidence:  payload.confidence    || 0,
                    verdict:     payload.verdict       || '',
                  }
                : m
            ));
          }

          else if (eventType === 'error') {
            setMessages(prev => prev.map(m =>
              m.id === botMsgId
                ? { ...m, content: `⚠️ ${payload.message}`, isLoading: false, agentLabel: null }
                : m
            ));
          }
        }
      }
    } catch (err) {
      console.error('Pipeline error:', err);
      setMessages(prev => prev.map(m =>
        m.id === botMsgId
          ? {
              ...m,
              content: `⚠️ Could not reach the agent backend.\n\nMake sure the Python server is running:\n\`\`\`\ncd backend\nuvicorn main:app --reload --port 8000\n\`\`\`\n\nError: ${err.message}`,
              isLoading: false, agentLabel: null,
            }
          : m
      ));
    } finally {
      setIsStreaming(false);
    }
  }, [input, isStreaming, transactions]);

  // ── Quick actions ─────────────────────────────────────────────────────────
  const handleQuickAction = (action) => {
    if (action === 'export') {
      const chatText = messages
        .map(m => `${m.role === 'user' ? 'You' : 'FinAdvisor AI'}: ${m.content}`)
        .join('\n\n---\n\n');
      const a = document.createElement('a');
      a.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(chatText);
      a.download = `fin-advisor-chat-${new Date().toISOString().split('T')[0]}.txt`;
      a.click();
    } else if (action === 'settings') {
      navigate('/settings');
    }
  };

  const bg        = dark ? 'bg-gray-900'                 : 'bg-gray-50';
  const sidebarBg = dark ? 'bg-gray-950 border-gray-800' : 'bg-white border-gray-200';
  const textMain  = dark ? 'text-white'                  : 'text-gray-900';
  const topbarBg  = dark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200';
  const hasMessages = messages.some(m => m.role === 'user');

  return (
    <div className={`min-h-screen flex ${bg} transition-colors duration-200`}
      style={{ fontFamily: "'DM Sans', -apple-system, sans-serif" }}>

      {/* ── Sidebar ──────────────────────────────────────────────────────── */}
      <aside className={`fixed left-0 top-0 h-full w-64 flex flex-col border-r ${sidebarBg} z-30 shadow-sm`}>
        {/* Logo */}
        <div className={`px-6 py-5 border-b ${dark ? 'border-gray-800' : 'border-gray-200'}`}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-md">
              <Wallet size={18} className="text-white" />
            </div>
            <div>
              <h1 className={`font-bold text-base tracking-tight ${textMain}`}>FinAdvisor</h1>
              <p className={`text-xs ${dark ? 'text-gray-500' : 'text-gray-400'}`}>Agentic AI · Python</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {[
            { id: 'dashboard', icon: Home,     label: 'Dashboard' },
            { id: 'reports',   icon: FileText,  label: 'Reports' },
            { id: 'analytics', icon: BarChart3, label: 'Analytics' },
            { id: 'planning',  icon: Calendar,  label: 'Planning' },
          ].map(({ id, icon: Icon, label }) => (
            <button key={id}
              onClick={() => navigate('/dashboard', { state: { activeSection: id } })}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                dark ? 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
                     : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
              }`}>
              <Icon size={16} /> {label}
            </button>
          ))}

          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md mt-1">
            <MessageCircle size={16} /> AI Assistant
          </button>
        </nav>

        {/* Pipeline legend */}
        <div className={`px-4 py-4 border-t ${dark ? 'border-gray-800' : 'border-gray-200'}`}>
          <p className={`text-xs font-semibold uppercase mb-2 ${dark ? 'text-gray-500' : 'text-gray-400'}`}>
            Pipeline
          </p>
          <div className="space-y-1.5">
            {AGENT_STEPS.map(step => {
              const Icon = AGENT_ICONS[step.id];
              return (
                <div key={step.id} className={`flex items-center gap-2 text-xs ${dark ? 'text-gray-500' : 'text-gray-400'}`}>
                  <Icon size={12} /> <span>{step.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dark mode */}
        <div className={`px-3 py-3 border-t ${dark ? 'border-gray-800' : 'border-gray-200'}`}>
          <button onClick={() => setDark(v => !v)}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition ${
              dark ? 'text-gray-400 hover:bg-gray-800' : 'text-gray-500 hover:bg-gray-100'
            }`}>
            {dark ? <Sun size={16} /> : <Moon size={16} />}
            {dark ? 'Light Mode' : 'Dark Mode'}
          </button>
        </div>
      </aside>

      {/* ── Main area ────────────────────────────────────────────────────── */}
      <main className="ml-64 flex-1 min-h-screen flex flex-col">

        {/* Topbar */}
        <div className={`sticky top-0 z-20 px-6 py-3 border-b flex items-center justify-between ${topbarBg}`}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-md">
              <Sparkles size={17} className="text-white" />
            </div>
            <div>
              <h1 className={`text-sm font-bold ${textMain}`}>AI Financial Assistant</h1>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <p className={`text-xs ${dark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Python FastAPI · Qwen 3.8-27B · 5-Agent RAG
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={fetchTransactions}
              className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl border transition ${
                dark ? 'border-gray-700 text-gray-400 hover:bg-gray-800' : 'border-gray-200 text-gray-600 hover:bg-gray-100'
              }`}>
              <RefreshCw size={13} className={txLoading ? 'animate-spin' : ''} />
              Sync Data
            </button>
            <QuickActionMenu dark={dark} onAction={handleQuickAction} />
          </div>
        </div>

        {/* Transaction data bar */}
        {transactions.length > 0 && (
          <div className={`px-6 py-2 border-b flex items-center gap-4 text-xs ${
            dark ? 'bg-gray-800/40 border-gray-800' : 'bg-indigo-50/60 border-indigo-100'
          }`}>
            <span className={`flex items-center gap-1 font-semibold ${dark ? 'text-emerald-400' : 'text-emerald-600'}`}>
              <Zap size={11} /> {transactions.length} transactions loaded
            </span>
            <span className={dark ? 'text-gray-500' : 'text-gray-400'}>·</span>
            <span className={dark ? 'text-gray-400' : 'text-gray-500'}>RAG knowledge base ready</span>
          </div>
        )}

        {/* Messages + quick questions */}
        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 overflow-y-auto px-6 py-6">
            {!hasMessages
              ? <EmptyState dark={dark} onQuestionClick={handleSend} />
              : messages.map(msg => <MessageBubble key={msg.id} msg={msg} dark={dark} />)
            }
            <div ref={messagesEndRef} />
          </div>

          {/* Quick questions panel */}
          <div className={`w-60 border-l p-4 overflow-y-auto flex-shrink-0 ${
            dark ? 'border-gray-800 bg-gray-900/50' : 'border-gray-100 bg-gray-50/60'
          }`}>
            <p className={`text-xs font-bold uppercase mb-3 ${dark ? 'text-gray-500' : 'text-gray-400'}`}>
              💡 Quick Questions
            </p>
            <div className="space-y-2">
              {SUGGESTED_QUESTIONS.map((q, i) => (
                <button key={i} onClick={() => handleSend(q.text)}
                  disabled={isStreaming}
                  className={`w-full text-left p-2.5 rounded-xl border text-xs transition flex gap-2 items-start disabled:opacity-40 disabled:cursor-not-allowed ${
                    dark ? 'border-gray-800 hover:bg-gray-800 text-gray-400'
                         : 'border-gray-200 hover:bg-white text-gray-600'
                  }`}>
                  <div className={`p-1 rounded-lg bg-gradient-to-br ${CATEGORY_COLORS[q.category]} flex-shrink-0`}>
                    <q.icon size={9} className="text-white" />
                  </div>
                  {q.text}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Input bar */}
        <div className={`p-4 border-t ${dark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
          <div className={`flex items-end gap-3 px-4 py-3 rounded-2xl border transition ${
            dark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
          }`}>
            <textarea
              className={`flex-1 bg-transparent outline-none text-sm resize-none placeholder-gray-400 ${
                dark ? 'text-gray-100' : 'text-gray-900'
              }`}
              rows={1}
              placeholder={isStreaming ? 'Agents are working...' : 'Ask about your finances...'}
              value={input}
              disabled={isStreaming}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              style={{ maxHeight: '120px', overflowY: 'auto' }}
            />
            <button onClick={() => handleSend()}
              disabled={isStreaming || !input.trim()}
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition ${
                isStreaming || !input.trim()
                  ? 'bg-gray-300 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-md hover:shadow-lg hover:scale-105'
              }`}>
              {isStreaming
                ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                : <Send size={15} />
              }
            </button>
          </div>
          <p className={`text-center text-xs mt-2 ${dark ? 'text-gray-600' : 'text-gray-400'}`}>
            Powered by 5 specialized Python agents · RAG over your real transaction data
          </p>
        </div>
      </main>
    </div>
  );
}
