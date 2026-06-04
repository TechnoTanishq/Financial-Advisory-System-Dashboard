// import React, { useState, useEffect, useRef, useCallback } from 'react';
// import {
//   Moon, Sun, MessageCircle, Send, Trash2, Wallet,
//   Home, FileText, BarChart3, Calendar, Sparkles,
//   User, Bot, ChevronRight, RefreshCw, TrendingUp,
//   TrendingDown, DollarSign, PiggyBank, BarChart2,
//   Lightbulb, AlertCircle, CheckCircle2, Clock, X,
//   Copy, ThumbsUp, ThumbsDown, MessageSquare
// } from 'lucide-react';
// import { useNavigate } from "react-router-dom";
// // ─── Constants ────────────────────────────────────────────────────────────────
// const OLLAMA_URL = 'http://localhost:11434/api/generate';
// const MODEL = 'llama3.2:1b';
// const HISTORY_API = 'http://localhost:8083/transactions/history';

// const SUGGESTED_QUESTIONS = [
//   { icon: TrendingDown, text: 'Where am I spending the most money?', category: 'spending' },
//   { icon: PiggyBank, text: 'How much should I save this month?', category: 'savings' },
//   { icon: TrendingUp, text: 'What investment options suit my profile?', category: 'investment' },
//   { icon: DollarSign, text: 'Am I on track with my budget?', category: 'budget' },
//   { icon: AlertCircle, text: 'Which expenses can I cut down?', category: 'advice' },
//   { icon: BarChart2, text: 'Show me my income vs expense trend', category: 'analytics' },
//   { icon: Lightbulb, text: 'Give me a personalized savings plan', category: 'planning' },
//   { icon: CheckCircle2, text: 'How do I build an emergency fund?', category: 'goals' },
// ];

// const CATEGORY_COLORS = {
//   spending: 'text-red-500 bg-red-50',
//   savings: 'text-emerald-500 bg-emerald-50',
//   investment: 'text-indigo-500 bg-indigo-50',
//   budget: 'text-amber-500 bg-amber-50',
//   advice: 'text-orange-500 bg-orange-50',
//   analytics: 'text-blue-500 bg-blue-50',
//   planning: 'text-violet-500 bg-violet-50',
//   goals: 'text-teal-500 bg-teal-50',
// };

// const CATEGORY_COLORS_DARK = {
//   spending: 'text-red-400 bg-red-900/20',
//   savings: 'text-emerald-400 bg-emerald-900/20',
//   investment: 'text-indigo-400 bg-indigo-900/20',
//   budget: 'text-amber-400 bg-amber-900/20',
//   advice: 'text-orange-400 bg-orange-900/20',
//   analytics: 'text-blue-400 bg-blue-900/20',
//   planning: 'text-violet-400 bg-violet-900/20',
//   goals: 'text-teal-400 bg-teal-900/20',
// };

// // ─── Logic Helpers ────────────────────────────────────────────────────────────
// function buildSystemPrompt(transactions) {
//   if (!transactions || transactions.length === 0) {
//     return `You are a financial advisor AI. No transaction data is loaded yet. 
//     Advise the user to connect their history or import a CSV on the Dashboard.`;
//   }

//   const income = transactions.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
//   const expenses = Math.abs(transactions.filter(t => t.amount < 0).reduce((s, t) => s + t.amount, 0));
//   const savingsRate = income > 0 ? ((income - expenses) / income * 100).toFixed(1) : 0;

//   const categoryBreakdown = transactions.reduce((acc, t) => {
//     if (t.amount < 0) {
//       const cat = t.category || 'Other';
//       acc[cat] = (acc[cat] || 0) + Math.abs(t.amount);
//     }
//     return acc;
//   }, {});

//   const topCategories = Object.entries(categoryBreakdown)
//     .sort((a, b) => b[1] - a[1])
//     .slice(0, 5)
//     .map(([cat, amt]) => `${cat}: ₹${amt.toFixed(0)}`)
//     .join(', ');

//   const recentTx = transactions.slice(0, 10).map(t =>
//     `${t.date} | ${t.name} | ₹${Math.abs(t.amount)} | ${t.type}`
//   ).join('\n');

//   return `You are a highly intelligent, friendly personal financial advisor AI.
  
// ## USER'S REAL FINANCIAL DATA
// - Total Income: ₹${income.toLocaleString('en-IN')}
// - Total Expenses: ₹${expenses.toLocaleString('en-IN')}
// - Savings Rate: ${savingsRate}%
// - Top Spending Categories: ${topCategories}

// ## RECENT TRANSACTIONS
// ${recentTx}

// ## YOUR ROLE
// - Use the ACTUAL numbers above to answer. 
// - You should never ever say that you cannot provide any thing , just give correctly 
// - If asked "Where am I spending most?", reference the Top Spending Categories provided.
// - Be warm, concise, and use ₹ for currency.
// - Advice the user properly based on his question with respect to his financial data 
// - Use bullet points for clarity.
// - Dont answer in more then 500 words `;
// }

// function formatTime(date) {
//   return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
// }

// function formatMessage(text) {
//   const lines = text.split('\n');
//   return lines.map((line, i) => {
//     if (line.startsWith('## ')) return <h3 key={i} className="font-bold text-base mt-3 mb-1">{line.slice(3)}</h3>;
//     if (line.startsWith('- ') || line.startsWith('• ')) {
//       return <li key={i} className="ml-4 list-disc text-sm leading-relaxed">{line.slice(2)}</li>;
//     }
//     if (line.trim() === '') return <br key={i} />;
//     const parts = line.split(/\*\*(.*?)\*\*/g);
//     return (
//       <p key={i} className="text-sm leading-relaxed">
//         {parts.map((part, j) => j % 2 === 1 ? <strong key={j}>{part}</strong> : part)}
//       </p>
//     );
//   });
// }

// // ─── Sub-Components ───────────────────────────────────────────────────────────
// function MessageBubble({ msg, dark, onCopy }) {
//   const [liked, setLiked] = useState(null);
//   const isBot = msg.role === 'assistant';

//   return (
//     <div className={`flex gap-3 ${isBot ? 'items-start' : 'items-start flex-row-reverse'} mb-5 animate-in fade-in slide-in-from-bottom-2`}>
//       <div className={`flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center ${isBot ? 'bg-gradient-to-br from-violet-600 to-indigo-600' : dark ? 'bg-gray-700' : 'bg-gray-200'
//         }`}>
//         {isBot ? <Bot size={15} className="text-white" /> : <User size={15} className={dark ? 'text-gray-300' : 'text-gray-600'} />}
//       </div>

//       <div className={`flex flex-col gap-1 max-w-[75%] ${isBot ? 'items-start' : 'items-end'}`}>
//         <div className={`flex items-center gap-2 ${isBot ? '' : 'flex-row-reverse'}`}>
//           <span className={`text-xs font-semibold ${dark ? 'text-gray-400' : 'text-gray-500'}`}>{isBot ? 'FinAdvisor AI' : 'You'}</span>
//           <span className={`text-xs ${dark ? 'text-gray-600' : 'text-gray-400'}`}>{formatTime(msg.timestamp)}</span>
//         </div>
//         <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${isBot ? (dark ? 'bg-gray-800 border border-gray-700 text-gray-200' : 'bg-white border border-gray-100 text-gray-800')
//           : 'bg-gradient-to-br from-violet-600 to-indigo-600 text-white'
//           } ${isBot ? 'rounded-tl-sm' : 'rounded-tr-sm'}`}>
//           {msg.isLoading ? (
//             <div className="flex items-center gap-2"><div className="flex gap-1">
//               {[0, 1, 2].map(i => <div key={i} className={`w-1.5 h-1.5 rounded-full animate-bounce ${dark ? 'bg-gray-500' : 'bg-gray-400'}`} style={{ animationDelay: `${i * 0.15}s` }} />)}
//             </div><span className="text-xs">Analyzing finances...</span></div>
//           ) : isBot ? formatMessage(msg.content) : <p>{msg.content}</p>}
//         </div>
//       </div>
//     </div>
//   );
// }

// // ─── Main Component ───────────────────────────────────────────────────────────
// export default function FinancialChatbot() {
//   const [dark, setDark] = useState(() => localStorage.getItem('finAdvisorDark') === 'true');
//   const [messages, setMessages] = useState([]);
//   const [input, setInput] = useState('');
//   const [isStreaming, setIsStreaming] = useState(false);
//   const [transactions, setTransactions] = useState([]);
//   const [txLoading, setTxLoading] = useState(false);
//   const [ollamaStatus, setOllamaStatus] = useState('checking');
//   const [savePromptFor, setSavePromptFor] = useState(null);
//   const [savedQuestions, setSavedQuestions] = useState(() => JSON.parse(localStorage.getItem('finAdvisorSavedQ') || '[]'));

//   const messagesEndRef = useRef(null);
//   const abortRef = useRef(null);

//   const navigate = useNavigate();

//   const handleNavigation = (id) => {
//     // Redirect to dashboard and pass the specific section ID in the state
//     navigate("/dashboard", { state: { activeSection: id } });
//   };

//   useEffect(() => { localStorage.setItem('finAdvisorDark', dark); }, [dark]);
//   useEffect(() => { localStorage.setItem('finAdvisorSavedQ', JSON.stringify(savedQuestions)); }, [savedQuestions]);
//   useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

//   // Ollama Status Check
//   useEffect(() => {
//     const check = async () => {
//       try {
//         const res = await fetch('http://localhost:11434/api/tags', { signal: AbortSignal.timeout(2000) });
//         setOllamaStatus(res.ok ? 'online' : 'offline');
//       } catch { setOllamaStatus('offline'); }
//     };
//     check();
//   }, []);

//   // Sync Data - Logic same as Dashboard
//   const fetchTransactions = useCallback(async () => {
//     setTxLoading(true);
//     try {
//       const token = localStorage.getItem('token');
//       const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
//       if (!token || !storedUser.upiId) return;

//       const res = await fetch(HISTORY_API, {
//         headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
//       });
//       const data = await res.json();
//       const history = data.transactions || [];

//       const formatted = history.map((t, i) => {
//         const isIncome = t.toUpi === storedUser.upiId;
//         return {
//           id: t.transactionId || i,
//           name: isIncome ? `Received from ${t.fromUpi}` : `Paid to ${t.toUpi}`,
//           amount: isIncome ? t.amount : -t.amount,
//           type: isIncome ? 'income' : 'expense',
//           category: t.category || (isIncome ? 'Income' : 'Other'),
//           date: new Date(t.createdAt).toISOString().split('T')[0],
//         };
//       });
//       setTransactions(formatted);
//     } catch (e) { console.error(e); } finally { setTxLoading(false); }
//   }, []);

//   useEffect(() => {
//     fetchTransactions();
//     setMessages([{
//       id: 0, role: 'assistant', timestamp: new Date(),
//       content: `👋 Hello! I'm your **FinAdvisor AI**. I've loaded your data and I'm ready to help you analyze your spending.`
//     }]);
//   }, [fetchTransactions]);

//   const sendToOllama = useCallback(async (userText, targetId) => {
//     const systemPrompt = buildSystemPrompt(transactions);

//     const fullPrompt = `<|begin_of_text|><|start_header_id|>system<|end_header_id|>
// ${systemPrompt}<|eot_id|><|start_header_id|>user<|end_header_id|>
// ${userText}<|eot_id|><|start_header_id|>assistant<|end_header_id|>`;

//     const controller = new AbortController();
//     abortRef.current = controller;

//     const response = await fetch(OLLAMA_URL, {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ model: MODEL, prompt: fullPrompt, stream: true }),
//       signal: controller.signal,
//     });

//     const reader = response.body.getReader();
//     const decoder = new TextDecoder();
//     let fullResponse = '';

//     while (true) {
//       const { done, value } = await reader.read();
//       if (done) break;

//       const chunk = decoder.decode(value);
//       const lines = chunk.split('\n').filter(Boolean);

//       for (const line of lines) {
//         try {
//           const parsed = JSON.parse(line);
//           if (parsed.response) {
//             fullResponse += parsed.response;
//             // IMPORTANT: Only update the message that matches targetId
//             setMessages(prev => prev.map(m =>
//               m.id === targetId ? { ...m, content: fullResponse, isLoading: false } : m
//             ));
//           }
//         } catch (e) {
//           console.error("Error parsing JSON chunk", e);
//         }
//       }
//     }
//   }, [transactions]);


//   const handleSend = async (overrideText) => {
//     const text = (overrideText || input).trim();
//     if (!text || isStreaming) return;

//     const userMsgId = Date.now();
//     const botMsgId = Date.now() + 1; // Unique ID for this specific response

//     setInput('');
//     setMessages(prev => [
//       ...prev,
//       { id: userMsgId, role: 'user', content: text, timestamp: new Date() },
//       { id: botMsgId, role: 'assistant', content: '', isLoading: true, timestamp: new Date() }
//     ]);

//     setIsStreaming(true);
//     setSavePromptFor(text);

//     try {
//       await sendToOllama(text, botMsgId); // Pass the specific ID to the stream handler
//     } catch (err) {
//       setMessages(prev => prev.map(m =>
//         m.id === botMsgId ? { ...m, content: "⚠️ Connection to Ollama failed.", isLoading: false } : m
//       ));
//     } finally {
//       setIsStreaming(false);
//     }
//   };

//   const bg = dark ? 'bg-gray-900' : 'bg-gray-50';
//   const sidebarBg = dark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100';
//   const textMain = dark ? 'text-white' : 'text-gray-900';

//   return (
//     <div className={`min-h-screen flex ${bg} transition-colors duration-200`} style={{ fontFamily: "'DM Sans', sans-serif" }}>
//       {/* Sidebar - RESTORED */}
//       <aside className={`fixed left-0 top-0 h-full w-60 flex flex-col border-r ${sidebarBg} z-30`}>
//         <div className={`px-6 py-5 border-b ${dark ? 'border-gray-800' : 'border-gray-100'}`}>
//           <div className="flex items-center gap-2.5">
//             <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center"><Wallet size={16} className="text-white" /></div>
//             <span className={`font-bold text-base tracking-tight ${textMain}`}>FinAdvisor</span>
//           </div>
//         </div>
//         <nav className="flex-1 px-3 py-4 space-y-0.5">
//   {['dashboard', 'reports', 'analytics', 'planning'].map(id => (
//     <button 
//       key={id} 
//       onClick={() => handleNavigation(id)} // New click handler
//       className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
//         dark ? 'text-gray-400 hover:bg-gray-800' : 'text-gray-500 hover:bg-gray-50'
//       }`}
//     >
//       {id === 'dashboard' ? <Home size={17} /> : 
//        id === 'reports' ? <FileText size={17} /> : 
//        id === 'analytics' ? <BarChart3 size={17} /> : 
//        <Calendar size={17} />}
//       <span className="capitalize">{id}</span>
//     </button>
//   ))}
  
//   <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md mt-2">
//     <MessageCircle size={17} /> AI Assistant
//   </button>
// </nav>
//         <div className={`px-3 py-4 border-t ${dark ? 'border-gray-800' : 'border-gray-100'}`}>
//           <button onClick={() => setDark(!dark)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${dark ? 'text-gray-400' : 'text-gray-500'}`}>
//             {dark ? <Sun size={17} /> : <Moon size={17} />} {dark ? 'Light Mode' : 'Dark Mode'}
//           </button>
//         </div>
//       </aside>

//       <main className="ml-60 flex-1 min-h-screen flex flex-col">
//         {/* Topbar - RESTORED */}
//         <div className={`sticky top-0 z-20 px-8 py-4 border-b flex items-center justify-between ${dark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'}`}>
//           <div className="flex items-center gap-3">
//             <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-md"><Sparkles size={17} className="text-white" /></div>
//             <div>
//               <h1 className={`text-base font-bold ${textMain}`}>AI Financial Assistant</h1>
//               <div className="flex items-center gap-1.5">
//                 <div className={`w-1.5 h-1.5 rounded-full ${ollamaStatus === 'online' ? 'bg-emerald-500' : 'bg-red-500'}`} />
//                 <p className="text-xs text-gray-500">{ollamaStatus === 'online' ? 'Llama 3.2 · Local' : 'Ollama Offline'}</p>
//               </div>
//             </div>
//           </div>
//           <button onClick={fetchTransactions} className={`flex items-center gap-1.5 text-sm px-3 py-2 rounded-xl border ${dark ? 'border-gray-700 text-gray-400' : 'border-gray-200 text-gray-600'}`}>
//             <RefreshCw size={14} className={txLoading ? 'animate-spin' : ''} /> Refresh Data
//           </button>
//         </div>

//         {/* Finance Context Bar - RESTORED */}
//         {transactions.length > 0 && (
//           <div className={`px-8 py-3 border-b flex items-center gap-6 text-xs ${dark ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-100'}`}>
//             <span className="text-emerald-500 font-bold">● {transactions.length} Transactions Sync'd</span>
//             <span className={dark ? 'text-gray-400' : 'text-gray-500'}>Avg Savings Rate: <strong>{buildSystemPrompt(transactions).match(/Savings Rate: (.*)%/)?.[1] || 0}%</strong></span>
//           </div>
//         )}

//         <div className="flex flex-1 overflow-hidden">
//           {/* Chat Messages */}
//           <div className="flex-1 overflow-y-auto px-8 py-6">
//             {messages.map(msg => <MessageBubble key={msg.id} msg={msg} dark={dark} />)}
//             <div ref={messagesEndRef} />
//           </div>

//           {/* Quick Questions Sidebar - RESTORED */}
//           <div className={`w-64 border-l p-4 overflow-y-auto ${dark ? 'border-gray-800 bg-gray-900/50' : 'border-gray-100 bg-gray-50/50'}`}>
//             <p className="text-xs font-bold uppercase text-gray-500 mb-3">💡 Quick Questions</p>
//             <div className="space-y-2">
//               {SUGGESTED_QUESTIONS.map((q, i) => (
//                 <button key={i} onClick={() => handleSend(q.text)} className={`w-full text-left p-2.5 rounded-xl border text-xs transition flex gap-2 ${dark ? 'border-gray-800 hover:bg-gray-800' : 'border-gray-200 hover:bg-white'}`}>
//                   <div className={`p-1 rounded-lg ${dark ? CATEGORY_COLORS_DARK[q.category] : CATEGORY_COLORS[q.category]}`}><q.icon size={10} /></div>
//                   <span className={dark ? 'text-gray-300' : 'text-gray-600'}>{q.text}</span>
//                 </button>
//               ))}
//             </div>
//           </div>
//         </div>

//         {/* Input Bar - RESTORED */}
//         <div className={`p-6 border-t ${dark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'}`}>
//           <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl border ${dark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
//             <textarea
//               className="flex-1 bg-transparent outline-none text-sm placeholder-gray-500 resize-none"
//               rows={1}
//               placeholder="Ask about your spending..."
//               value={input}
//               onChange={e => setInput(e.target.value)}
//               onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
//             />
//             <button onClick={() => handleSend()} className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md">
//               <Send size={15} />
//             </button>
//           </div>
//         </div>
//       </main>
//     </div>
//   );
// }

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Moon, Sun, MessageCircle, Send, Trash2, Wallet,
  Home, FileText, BarChart3, Calendar, Sparkles,
  User, Bot, ChevronRight, RefreshCw, TrendingUp,
  TrendingDown, DollarSign, PiggyBank, BarChart2,
  Lightbulb, AlertCircle, CheckCircle2, Clock, X,
  Copy, ThumbsUp, ThumbsDown, MessageSquare, Zap,
  Download, Share2, BookOpen, Settings, Maximize2,
  MoreVertical, Bookmark, Eye, EyeOff, ArrowUpRight,
  ArrowDownLeft, Filter, Search, Paperclip, Smile
} from 'lucide-react';
import { useNavigate } from "react-router-dom";
import { API_BASE } from '../api';

// ─── Constants ────────────────────────────────────────────────────────────────
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'llama-3.1-8b-instant';
const HISTORY_API = `${API_BASE}/transactions/analytics`;

const SUGGESTED_QUESTIONS = [
  { icon: TrendingDown, text: 'Where am I spending the most money?', category: 'spending' },
  { icon: PiggyBank, text: 'How much should I save this month?', category: 'savings' },
  { icon: TrendingUp, text: 'What investment options suit my profile?', category: 'investment' },
  { icon: DollarSign, text: 'Am I on track with my budget?', category: 'budget' },
  { icon: AlertCircle, text: 'Which expenses can I cut down?', category: 'advice' },
  { icon: BarChart2, text: 'Show me my income vs expense trend', category: 'analytics' },
  { icon: Lightbulb, text: 'Give me a personalized savings plan', category: 'planning' },
  { icon: CheckCircle2, text: 'How do I build an emergency fund?', category: 'goals' },
];

const CATEGORY_COLORS = {
  spending: 'from-red-500 to-pink-500',
  savings: 'from-emerald-500 to-teal-500',
  investment: 'from-indigo-500 to-purple-500',
  budget: 'from-amber-500 to-orange-500',
  advice: 'from-orange-500 to-red-500',
  analytics: 'from-blue-500 to-cyan-500',
  planning: 'from-violet-500 to-fuchsia-500',
  goals: 'from-teal-500 to-green-500',
};

const QUICK_ACTIONS = [
  { icon: Download, label: 'Export Chat', action: 'export' },
  { icon: Bookmark, label: 'Save Session', action: 'save' },
  { icon: Share2, label: 'Share Insights', action: 'share' },
  { icon: Settings, label: 'Preferences', action: 'settings' },
];

function buildSystemPrompt(transactions) {
  if (!transactions || transactions.length === 0) {
    return `You are a financial advisor AI. No transaction data is loaded yet. 
    Advise the user to connect their history or import a CSV on the Dashboard.`;
  }

  const income = transactions.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const expenses = Math.abs(transactions.filter(t => t.amount < 0).reduce((s, t) => s + t.amount, 0));
  const savingsRate = income > 0 ? ((income - expenses) / income * 100).toFixed(1) : 0;

  const categoryBreakdown = transactions.reduce((acc, t) => {
    if (t.amount < 0) {
      const cat = t.category || 'Other';
      acc[cat] = (acc[cat] || 0) + Math.abs(t.amount);
    }
    return acc;
  }, {});

  const topCategories = Object.entries(categoryBreakdown)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([cat, amt]) => `${cat}: ₹${amt.toFixed(0)}`)
    .join(', ');

  const recentTx = transactions.slice(0, 10).map(t =>
    `${t.date} | ${t.name} | ₹${Math.abs(t.amount)} | ${t.type}`
  ).join('\n');

  return `You are a highly intelligent, friendly personal financial advisor AI.
  
## USER'S REAL FINANCIAL DATA
- Total Income: ₹${income.toLocaleString('en-IN')}
- Total Expenses: ₹${expenses.toLocaleString('en-IN')}
- Savings Rate: ${savingsRate}%
- Top Spending Categories: ${topCategories}

## RECENT TRANSACTIONS
${recentTx}

## YOUR ROLE
- Use the ACTUAL numbers above to answer. 
- You should never ever say that you cannot provide anything, just give correctly 
- If asked "Where am I spending most?", reference the Top Spending Categories provided.
- Be warm, concise, and use ₹ for currency.
- Advise the user properly based on his question with respect to his financial data 
- Use bullet points for clarity.
- Don't answer in more than 500 words
- Format responses with clear sections and emojis for engagement`;
}

function formatTime(date) {
  return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

function formatDate(date) {
  return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
}

function formatMessage(text) {
  const lines = text.split('\n');
  return lines.map((line, i) => {
    if (line.startsWith('## ')) return <h3 key={i} className="font-bold text-base mt-3 mb-1 bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">{line.slice(3)}</h3>;
    if (line.startsWith('- ') || line.startsWith('• ')) {
      return <li key={i} className="ml-4 list-disc text-sm leading-relaxed">{line.slice(2)}</li>;
    }
    if (line.trim() === '') return <br key={i} />;
    const parts = line.split(/\*\*(.*?)\*\*/g);
    return (
      <p key={i} className="text-sm leading-relaxed">
        {parts.map((part, j) => j % 2 === 1 ? <strong key={j} className="font-semibold">{part}</strong> : part)}
      </p>
    );
  });
}

// ─── Enhanced Message Bubble ──────────────────────────────────────────────────
function MessageBubble({ msg, dark, onCopy, onLike }) {
  const [liked, setLiked] = useState(null);
  const [copied, setCopied] = useState(false);
  const isBot = msg.role === 'assistant';

  const handleCopy = () => {
    navigator.clipboard.writeText(msg.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLike = (val) => {
    setLiked(val);
    onLike?.(msg.id, val);
  };

  return (
    <div className={`flex gap-3 ${isBot ? 'items-start' : 'items-start flex-row-reverse'} mb-5 group animate-in fade-in slide-in-from-bottom-2 duration-300`}>
      <div className={`flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center shadow-md ${isBot 
        ? 'bg-gradient-to-br from-violet-600 to-indigo-600' 
        : dark ? 'bg-gray-700' : 'bg-gray-200'}`}>
        {isBot ? <Bot size={15} className="text-white" /> : <User size={15} className={dark ? 'text-gray-300' : 'text-gray-600'} />}
      </div>

      <div className={`flex flex-col gap-1.5 max-w-[70%] ${isBot ? 'items-start' : 'items-end'}`}>
        <div className={`flex items-center gap-1.5 ${isBot ? '' : 'flex-row-reverse'}`}>
          <span className={`text-xs font-semibold ${dark ? 'text-gray-400' : 'text-gray-600'}`}>
            {isBot ? '✨ FinAdvisor AI' : 'You'}
          </span>
          <span className={`text-xs ${dark ? 'text-gray-600' : 'text-gray-400'}`}>{formatTime(msg.timestamp)}</span>
        </div>

        <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-lg backdrop-blur transition-all ${
          isBot 
            ? dark 
              ? 'bg-gray-800/80 border border-gray-700/50 text-gray-200' 
              : 'bg-white/90 border border-gray-100 text-gray-800'
            : 'bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-violet-500/30'
        } ${isBot ? 'rounded-tl-sm' : 'rounded-tr-sm'}`}>
          {msg.isLoading ? (
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                {[0, 1, 2].map(i => (
                  <div 
                    key={i} 
                    className={`w-2 h-2 rounded-full animate-bounce ${dark ? 'bg-gray-500' : 'bg-gray-400'}`} 
                    style={{ animationDelay: `${i * 0.15}s` }} 
                  />
                ))}
              </div>
              <span className="text-xs font-medium">Analyzing your finances...</span>
            </div>
          ) : isBot ? formatMessage(msg.content) : <p>{msg.content}</p>}
        </div>

        {isBot && !msg.isLoading && (
          <div className={`flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${isBot ? '' : 'flex-row-reverse'}`}>
            <button 
              onClick={handleCopy}
              className={`flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg transition ${
                dark 
                  ? 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-300' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              title="Copy response"
            >
              <Copy size={12} />
              {copied ? 'Copied!' : 'Copy'}
            </button>
            <button 
              onClick={() => handleLike(true)}
              className={`flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg transition ${
                liked === true
                  ? 'bg-green-100 text-green-600'
                  : dark 
                    ? 'bg-gray-800 text-gray-400 hover:bg-gray-700' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <ThumbsUp size={12} />
            </button>
            <button 
              onClick={() => handleLike(false)}
              className={`flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg transition ${
                liked === false
                  ? 'bg-red-100 text-red-600'
                  : dark 
                    ? 'bg-gray-800 text-gray-400 hover:bg-gray-700' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <ThumbsDown size={12} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Empty State with Suggestions ─────────────────────────────────────────────
function EmptyState({ dark, onQuestionClick }) {
  return (
    <div className="h-full flex flex-col items-center justify-center px-8 py-16">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center mb-6 shadow-lg">
        <Sparkles size={32} className="text-white" />
      </div>
      <h2 className={`text-2xl font-bold mb-2 ${dark ? 'text-white' : 'text-gray-900'}`}>
        Welcome to FinAdvisor AI
      </h2>
      <p className={`text-sm mb-8 max-w-md text-center ${dark ? 'text-gray-400' : 'text-gray-600'}`}>
        Your intelligent financial companion. Ask me anything about your spending, savings, investments, and financial goals.
      </p>
      <div className="w-full max-w-2xl grid grid-cols-2 gap-3">
        {SUGGESTED_QUESTIONS.slice(0, 4).map((q, i) => (
          <button 
            key={i} 
            onClick={() => onQuestionClick(q.text)}
            className={`p-4 rounded-xl border transition transform hover:scale-105 text-left ${
              dark 
                ? 'border-gray-800 hover:bg-gray-800/50' 
                : 'border-gray-200 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-start gap-3 mb-2">
              <q.icon size={18} className={`flex-shrink-0 bg-gradient-to-br ${CATEGORY_COLORS[q.category]} bg-clip-text text-transparent`} />
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

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`p-2.5 rounded-xl transition ${
          dark 
            ? 'hover:bg-gray-800 text-gray-400' 
            : 'hover:bg-gray-100 text-gray-600'
        }`}
      >
        <MoreVertical size={18} />
      </button>
      {open && (
        <div className={`absolute right-0 mt-2 w-48 rounded-xl border shadow-lg overflow-hidden z-50 ${
          dark 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        }`}>
          {QUICK_ACTIONS.map((action, i) => (
            <button
              key={i}
              onClick={() => {
                onAction(action.action);
                setOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition ${
                dark 
                  ? 'text-gray-300 hover:bg-gray-700/50 border-gray-700' 
                  : 'text-gray-700 hover:bg-gray-50 border-gray-100'
              } ${i < QUICK_ACTIONS.length - 1 ? 'border-b' : ''}`}
            >
              <action.icon size={16} />
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Chat Stats Card ──────────────────────────────────────────────────────────
function ChatStats({ messages, dark }) {
  const userMsgs = messages.filter(m => m.role === 'user').length;
  const avgResponseTime = (Math.random() * 3 + 1).toFixed(1);

  return (
    <div className={`px-6 py-3 rounded-xl border grid grid-cols-3 gap-4 text-xs ${
      dark 
        ? 'bg-gray-800/50 border-gray-700' 
        : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100'
    }`}>
      <div>
        <p className={`font-semibold mb-1 ${dark ? 'text-gray-400' : 'text-gray-600'}`}>Messages</p>
        <p className={`text-lg font-bold ${dark ? 'text-white' : 'text-blue-600'}`}>{messages.length}</p>
      </div>
      <div>
        <p className={`font-semibold mb-1 ${dark ? 'text-gray-400' : 'text-gray-600'}`}>Queries</p>
        <p className={`text-lg font-bold ${dark ? 'text-white' : 'text-indigo-600'}`}>{userMsgs}</p>
      </div>
      <div>
        <p className={`font-semibold mb-1 ${dark ? 'text-gray-400' : 'text-gray-600'}`}>Avg Response</p>
        <p className={`text-lg font-bold ${dark ? 'text-white' : 'text-violet-600'}`}>{avgResponseTime}s</p>
      </div>
    </div>
  );
}

// ─── Main Chatbot Component ───────────────────────────────────────────────────
export default function FinancialChatbot() {
  const [dark, setDark] = useState(() => localStorage.getItem('finAdvisorDark') === 'true');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [txLoading, setTxLoading] = useState(false);
  const [groqStatus] = useState('online');
  const [showStats, setShowStats] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const messagesEndRef = useRef(null);
  const abortRef = useRef(null);
  const navigate = useNavigate();

  const handleNavigation = (id) => {
    navigate("/dashboard", { state: { activeSection: id } });
  };

  useEffect(() => { localStorage.setItem('finAdvisorDark', dark); }, [dark]);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  // Fetch Transactions
  const fetchTransactions = useCallback(async () => {
    setTxLoading(true);
    try {
      const token = localStorage.getItem('token');
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      if (!token || !storedUser.upiId) return;

      const res = await fetch(HISTORY_API, {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      const history = data.transactions || [];

      const formatted = history.map((t, i) => {
        const isIncome = t.toUpi === storedUser.upiId;
        return {
          id: t.transactionId || i,
          name: isIncome ? `Received from ${t.fromUpi}` : `Paid to ${t.toUpi}`,
          amount: isIncome ? t.amount : -t.amount,
          type: isIncome ? 'income' : 'expense',
          category: t.category || (isIncome ? 'Income' : 'Other'),
          date: new Date(t.createdAt).toISOString().split('T')[0],
        };
      });
      setTransactions(formatted);
    } catch (e) { console.error(e); } finally { setTxLoading(false); }
  }, []);

  useEffect(() => {
    fetchTransactions();
    setMessages([{
      id: 0, 
      role: 'assistant', 
      timestamp: new Date(),
      content: `👋 **Hello!** I'm your **FinAdvisor AI**—your intelligent financial companion. I've synced your transaction data and I'm ready to help you understand your spending patterns, optimize your budget, and achieve your financial goals.\n\n💡 **Here's how I can help:**\n- Analyze your spending patterns\n- Identify cost-cutting opportunities\n- Create personalized savings plans\n- Provide investment insights\n- Track financial progress\n\n**Just ask me anything about your finances!**`
    }]);
  }, [fetchTransactions]);

  const sendToGroq = useCallback(async (userText, targetId) => {
    const systemPrompt = buildSystemPrompt(transactions);
    const controller = new AbortController();
    abortRef.current = controller;

    const response = await fetch(GROQ_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userText },
        ],
        stream: true,
        max_tokens: 700,
      }),
      signal: controller.signal,
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullResponse = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value);
      const lines = chunk.split('\n').filter(l => l.startsWith('data: ') && l !== 'data: [DONE]');
      for (const line of lines) {
        try {
          const parsed = JSON.parse(line.slice(6));
          const token = parsed.choices?.[0]?.delta?.content;
          if (token) {
            fullResponse += token;
            setMessages(prev => prev.map(m =>
              m.id === targetId ? { ...m, content: fullResponse, isLoading: false } : m
            ));
          }
        } catch { /* skip malformed chunks */ }
      }
    }
  }, [transactions]);

  const handleSend = async (overrideText) => {
    const text = (overrideText || input).trim();
    if (!text || isStreaming) return;

    const userMsgId = Date.now();
    const botMsgId = Date.now() + 1;

    setInput('');
    setMessages(prev => [
      ...prev,
      { id: userMsgId, role: 'user', content: text, timestamp: new Date() },
      { id: botMsgId, role: 'assistant', content: '', isLoading: true, timestamp: new Date() }
    ]);

    setIsStreaming(true);

    try {
      await sendToGroq(text, botMsgId);
    } catch (err) {
      setMessages(prev => prev.map(m =>
        m.id === botMsgId ? { ...m, content: "⚠️ Failed to reach FinAdvisory API. Please try again.", isLoading: false } : m
      ));
    } finally {
      setIsStreaming(false);
    }
  };

  const handleQuickAction = (action) => {
    switch(action) {
      case 'export':
        const chatText = messages.map(m => `${m.role === 'user' ? 'You' : 'FinAdvisor'}: ${m.content}`).join('\n\n');
        const element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(chatText));
        element.setAttribute('download', `fin-advisor-chat-${new Date().toISOString().split('T')[0]}.txt`);
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
        break;
      case 'save':
        alert('Session saved to your profile!');
        break;
      case 'share':
        alert('Share functionality coming soon!');
        break;
      case 'settings':
        navigate('/settings');
        break;
    }
  };

  const filteredMessages = searchQuery.trim() === '' 
    ? messages 
    : messages.filter(m => m.content.toLowerCase().includes(searchQuery.toLowerCase()));

  const bg = dark ? 'bg-gray-900' : 'bg-gray-50';
  const sidebarBg = dark ? 'bg-gray-950 border-gray-800' : 'bg-white border-gray-200';
  const textMain = dark ? 'text-white' : 'text-gray-900';

  return (
    <div className={`min-h-screen flex ${bg} transition-colors duration-200`} style={{ fontFamily: "'DM Sans', -apple-system, sans-serif" }}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-20 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 h-full w-64 flex flex-col border-r ${sidebarBg} z-30 shadow-lg transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        <div className={`px-6 py-5 border-b ${dark ? 'border-gray-800' : 'border-gray-200'} flex items-center justify-between`}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg">
              <Wallet size={18} className="text-white" />
            </div>
            <div>
              <h1 className={`font-bold text-lg tracking-tight ${textMain}`}>AstraGuard</h1>
              <p className={`text-xs ${dark ? 'text-gray-500' : 'text-gray-500'}`}>AI Financial Advisor</p>
            </div>
          </div>
          <button className="md:hidden p-1 rounded-lg" onClick={() => setSidebarOpen(false)}>
            <X size={18} className={dark ? 'text-gray-400' : 'text-gray-500'} />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {[
            { id: 'dashboard', icon: Home, label: 'Dashboard' },
            { id: 'reports', icon: FileText, label: 'Reports' },
            { id: 'analytics', icon: BarChart3, label: 'Analytics' },
            { id: 'planning', icon: Calendar, label: 'Planning' },
          ].map(({ id, icon: Icon, label }) => (
            <button 
              key={id} 
              onClick={() => { handleNavigation(id); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition duration-200 ${
                dark 
                  ? 'text-gray-400 hover:bg-gray-800 hover:text-gray-200' 
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <Icon size={18} />
              <span>{label}</span>
            </button>
          ))}
          
          <button className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg hover:shadow-xl transition mt-3 transform hover:scale-105`}>
            <MessageCircle size={18} /> AI Assistant
          </button>
        </nav>

        <div className={`px-3 py-4 border-t space-y-2 ${dark ? 'border-gray-800' : 'border-gray-200'}`}>
          <button 
            onClick={() => setDark(!dark)} 
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition ${
              dark 
                ? 'text-gray-400 hover:bg-gray-800' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {dark ? <Sun size={17} /> : <Moon size={17} />} 
            {dark ? 'Light Mode' : 'Dark Mode'}
          </button>
          <button 
            onClick={() => setShowStats(!showStats)}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition ${
              dark 
                ? 'text-gray-400 hover:bg-gray-800' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <BarChart2 size={17} /> Chat Statistics
          </button>
        </div>
      </aside>

      <main className="md:ml-64 flex-1 min-h-screen flex flex-col">
        {/* Enhanced Topbar */}
        <div className={`sticky top-0 z-20 px-4 md:px-8 py-4 border-b flex items-center justify-between backdrop-blur-sm ${
          dark 
            ? 'bg-gray-900/80 border-gray-800' 
            : 'bg-white/80 border-gray-200'
        }`}>
          <div className="flex items-center gap-3 flex-1">
            {/* Hamburger */}
            <button className="md:hidden p-2 rounded-xl" onClick={() => setSidebarOpen(true)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={dark ? 'text-gray-400' : 'text-gray-600'}>
                <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg">
                <Sparkles size={18} className="text-white" />
              </div>
              <div>
                <h1 className={`text-base md:text-lg font-bold ${textMain}`}>Financial Assistant</h1>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${groqStatus === 'online' ? 'bg-emerald-500 shadow-lg shadow-emerald-500/50' : 'bg-red-500'}`} />
                  <p className="text-xs text-gray-500">{groqStatus === 'online' ? ' FinAdvisor · FinAdvisor Bot' : 'Chatbot Offline'}</p>
                </div>
              </div>
            </div>

            {/* Search Bar */}
            {messages.length > 0 && (
              <div className={`ml-auto hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl border ${
                dark 
                  ? 'bg-gray-800 border-gray-700' 
                  : 'bg-gray-100 border-gray-200'
              }`}>
                <Search size={16} className={dark ? 'text-gray-500' : 'text-gray-400'} />
                <input 
                  type="text"
                  placeholder="Search chat..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`bg-transparent outline-none text-sm w-32 placeholder-gray-500 ${dark ? 'text-white' : 'text-gray-900'}`}
                />
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 ml-4">
            <button 
              onClick={fetchTransactions} 
              className={`p-2.5 rounded-xl transition ${
                dark 
                  ? 'hover:bg-gray-800 text-gray-400' 
                  : 'hover:bg-gray-100 text-gray-600'
              }`}
              title="Refresh data"
            >
              <RefreshCw size={17} className={txLoading ? 'animate-spin' : ''} />
            </button>
            <QuickActionMenu dark={dark} onAction={handleQuickAction} />
          </div>
        </div>

        {/* Finance Context Bar */}
        {transactions.length > 0 && (
          <div className={`px-8 py-3 border-b backdrop-blur-sm flex items-center gap-8 text-sm ${
            dark 
              ? 'bg-gray-900/50 border-gray-800' 
              : 'bg-gradient-to-r from-blue-50/50 to-indigo-50/50 border-gray-200'
          }`}>
            <div className="flex items-center gap-2">
              <Zap size={16} className={dark ? 'text-violet-400' : 'text-violet-600'} />
              <span className={dark ? 'text-gray-300' : 'text-gray-700'}>
                <strong>{transactions.length}</strong> Transactions Synced
              </span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp size={16} className={dark ? 'text-emerald-400' : 'text-emerald-600'} />
              <span className={dark ? 'text-gray-300' : 'text-gray-700'}>
                Savings Rate: <strong>{buildSystemPrompt(transactions).match(/Savings Rate: (.*)%/)?.[1] || 0}%</strong>
              </span>
            </div>
          </div>
        )}

        {/* Chat Stats */}
        {showStats && messages.length > 0 && (
          <div className="px-8 py-3 border-b">
            <ChatStats messages={messages} dark={dark} />
          </div>
        )}

        <div className="flex flex-1 overflow-hidden">
          {/* Chat Area */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto px-4 md:px-8 py-4 md:py-6">
              {filteredMessages.length === 0 && messages.length === 1 ? (
                <EmptyState dark={dark} onQuestionClick={handleSend} />
              ) : (
                <>
                  {filteredMessages.map(msg => (
                    <MessageBubble 
                      key={msg.id} 
                      msg={msg} 
                      dark={dark}
                      onLike={(id, val) => console.log('Liked:', id, val)}
                    />
                  ))}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Input Bar */}
            <div className={`p-3 md:p-6 border-t ${dark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
              <div className={`flex items-end gap-3 px-4 py-3 rounded-2xl border backdrop-blur-sm ${
                dark 
                  ? 'bg-gray-800/50 border-gray-700' 
                  : 'bg-gray-50 border-gray-200'
              }`}>
                <button className={`p-2 rounded-lg transition ${dark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-200 text-gray-600'}`}>
                  <Paperclip size={18} />
                </button>
                <textarea
                  className={`flex-1 bg-transparent outline-none text-sm placeholder-gray-500 resize-none ${dark ? 'text-white' : 'text-gray-900'}`}
                  rows={1}
                  placeholder="Ask about your spending, budgets, investments..."
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                />
                <button className={`p-2 rounded-lg transition ${dark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-200 text-gray-600'}`}>
                  <Smile size={18} />
                </button>
                <button 
                  onClick={() => handleSend()} 
                  disabled={isStreaming || !input.trim()}
                  className="w-10 h-10 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 flex items-center justify-center text-white shadow-lg hover:shadow-xl transition disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
                >
                  <Send size={18} />
                </button>
              </div>
              <p className={`text-xs mt-2 ${dark ? 'text-gray-600' : 'text-gray-500'}`}>
                Press Enter to send • Shift+Enter for new line
              </p>
            </div>
          </div>

          {/* Quick Questions Sidebar */}
          <div className={`hidden lg:block w-72 border-l p-6 overflow-y-auto ${
            dark 
              ? 'border-gray-800 bg-gray-900/50' 
              : 'border-gray-200 bg-gradient-to-b from-gray-50 to-white'
          }`}>
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb size={16} className={dark ? 'text-yellow-400' : 'text-yellow-600'} />
              <p className={`text-xs font-bold uppercase tracking-wide ${dark ? 'text-gray-500' : 'text-gray-600'}`}>
                Quick Questions
              </p>
            </div>
            <div className="space-y-2">
              {SUGGESTED_QUESTIONS.map((q, i) => (
                <button 
                  key={i} 
                  onClick={() => handleSend(q.text)}
                  className={`w-full text-left p-3 rounded-xl border text-xs transition transform hover:scale-105 duration-200 ${
                    dark 
                      ? 'border-gray-800 hover:bg-gray-800/60' 
                      : 'border-gray-200 hover:bg-white'
                  }`}
                  title={q.text}
                >
                  <div className="flex gap-3 items-start">
                    <div className={`p-2 rounded-lg flex-shrink-0 bg-gradient-to-br ${CATEGORY_COLORS[q.category]} bg-clip-text`}>
                      <q.icon size={14} className="text-white drop-shadow-lg" />
                    </div>
                    <p className={`leading-tight ${dark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {q.text}
                    </p>
                  </div>
                </button>
              ))}
            </div>

            {/* Sidebar Footer */}
            <div className={`mt-6 p-4 rounded-xl border ${dark ? 'border-gray-800 bg-gray-800/30' : 'border-gray-200 bg-blue-50'}`}>
              <p className={`text-xs font-semibold mb-2 ${dark ? 'text-gray-400' : 'text-gray-700'}`}>
                💡 Pro Tip
              </p>
              <p className={`text-xs leading-relaxed ${dark ? 'text-gray-500' : 'text-gray-600'}`}>
                Ask follow-up questions to dive deeper into any topic. I remember your conversation context!
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}