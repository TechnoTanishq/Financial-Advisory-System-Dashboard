// import React, { useState, useEffect, useCallback, useRef } from 'react';
// import {
//   Plus, X, Target, AlertTriangle, CheckCircle, TrendingUp, TrendingDown,
//   DollarSign, PiggyBank, CreditCard, RefreshCw, Zap, ChevronDown,
//   ChevronUp, Edit3, Trash2, Calendar, BarChart2, Lightbulb, AlertCircle,
//   ArrowUpRight, Repeat, Clock, Shield
// } from 'lucide-react';
// import {
//   AreaChart, Area, BarChart, Bar, XAxis, YAxis,
//   CartesianGrid, Tooltip, ResponsiveContainer, Legend
// } from 'recharts';

// // ─── Constants ────────────────────────────────────────────────────────────────
// const LS_PLANNING = 'fin_planning_v2';
// const LS_GROQ_KEY  = 'fin_groq_key';
// const LS_GROQ_MODEL = 'fin_groq_model';

// const GROQ_MODELS = [
//   { value: 'llama-3.3-70b-versatile', label: 'llama-3.3-70b (best)' },
//   { value: 'mixtral-8x7b-32768',      label: 'mixtral-8x7b (fast)' },
//   { value: 'llama3-70b-8192',         label: 'llama3-70b (legacy)' },
// ];

// const BUDGET_DEFAULTS = {
//   'Food & Dining': 5000, 'Shopping': 8000, 'Transport': 3000,
//   'Entertainment': 2000, 'Utilities': 2500, 'Healthcare': 2000,
//   'Groceries': 4000, 'Other': 3000,
// };

// const GROQ_PROMPTS = {
//   full:    'Analyze my complete financial picture. Give me a prioritized action plan with specific, actionable steps. Be direct about what I should stop, start, and continue doing.',
//   savings: 'Based on my income and expenses, create a specific monthly savings plan. Tell me exactly how much to save, which accounts to use (SIPs, FDs, RDs, etc.) and what to cut.',
//   budget:  'Review my budget vs actual spending. Tell me which categories to cut, by how much, and give practical tips for each. Be specific with ₹ numbers.',
//   invest:  'Based on my savings rate and surplus, recommend specific investment options for an Indian investor (SIPs, PPF, NPS, FDs, ELSS, etc.) with exact amounts.',
//   goals:   'Look at my financial goals and savings rate. Give me a month-by-month action plan to reach each goal faster.',
// };

// const TAB_LIST = [
//   { id: 'budget',    label: 'Budget',      icon: Target },
//   { id: 'goals',     label: 'Goals',       icon: PiggyBank },
//   { id: 'forecast',  label: 'Forecast',    icon: BarChart2 },
//   { id: 'recurring', label: 'Recurring',   icon: Repeat },
//   { id: 'debt',      label: 'Debt Payoff', icon: CreditCard },
//   { id: 'whatif',    label: 'What-If',     icon: Zap },
//   { id: 'insights',  label: 'AI Insights', icon: Lightbulb },
// ];

// // ─── Helpers ──────────────────────────────────────────────────────────────────
// const fmt  = (n) => '₹' + Math.round(n).toLocaleString('en-IN');
// const pct  = (v, t) => (t > 0 ? Math.min(100, (v / t) * 100) : 0);
// const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

// function loadState() {
//   try {
//     const raw = localStorage.getItem(LS_PLANNING);
//     return raw ? JSON.parse(raw) : null;
//   } catch { return null; }
// }

// function usePersist(key, initial) {
//   const [val, setVal] = useState(() => {
//     const saved = loadState();
//     return saved && saved[key] !== undefined ? saved[key] : initial;
//   });
//   const setAndSave = useCallback((next) => {
//     setVal(prev => {
//       const resolved = typeof next === 'function' ? next(prev) : next;
//       const all = loadState() || {};
//       localStorage.setItem(LS_PLANNING, JSON.stringify({ ...all, [key]: resolved }));
//       return resolved;
//     });
//   }, [key]);
//   return [val, setAndSave];
// }

// // ─── Sub-components ───────────────────────────────────────────────────────────

// function SectionCard({ title, children, dark, action }) {
//   return (
//     <div className={`rounded-2xl border ${dark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} mb-5`}>
//       {(title || action) && (
//         <div className={`flex items-center justify-between px-6 py-4 border-b ${dark ? 'border-gray-700' : 'border-gray-100'}`}>
//           {title && <h3 className={`font-semibold text-sm ${dark ? 'text-white' : 'text-gray-800'}`}>{title}</h3>}
//           {action}
//         </div>
//       )}
//       <div className="px-6 py-5">{children}</div>
//     </div>
//   );
// }

// function ProgressBar({ value, max, dark, variant = 'default' }) {
//   const p = pct(value, max);
//   const color = p >= 100 ? 'bg-red-500' : p >= 80 ? 'bg-amber-500' : variant === 'blue' ? 'bg-blue-500' : 'bg-indigo-500';
//   return (
//     <div className={`h-2 rounded-full ${dark ? 'bg-gray-700' : 'bg-gray-100'}`}>
//       <div className={`h-2 rounded-full transition-all duration-500 ${color}`} style={{ width: `${clamp(p, 0, 100)}%` }} />
//     </div>
//   );
// }

// function Tag({ type, children }) {
//   const styles = {
//     over:  'bg-red-100 text-red-700',
//     warn:  'bg-amber-100 text-amber-700',
//     ok:    'bg-emerald-100 text-emerald-700',
//     info:  'bg-blue-100 text-blue-700',
//     purple:'bg-indigo-100 text-indigo-700',
//   };
//   return (
//     <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${styles[type] || styles.info}`}>{children}</span>
//   );
// }

// function InsightItem({ type, text, dark }) {
//   const styles = {
//     warn: { bg: dark ? 'bg-amber-900/20 border-amber-800' : 'bg-amber-50 border-amber-200', icon: <AlertTriangle size={14} className="text-amber-500 flex-shrink-0 mt-0.5" /> },
//     ok:   { bg: dark ? 'bg-emerald-900/20 border-emerald-800' : 'bg-emerald-50 border-emerald-200', icon: <CheckCircle size={14} className="text-emerald-500 flex-shrink-0 mt-0.5" /> },
//     info: { bg: dark ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200', icon: <Lightbulb size={14} className="text-blue-500 flex-shrink-0 mt-0.5" /> },
//   };
//   const s = styles[type] || styles.info;
//   return (
//     <div className={`flex items-start gap-3 px-3 py-3 rounded-xl border text-sm mb-2 ${s.bg} ${dark ? 'text-gray-300' : 'text-gray-700'}`}>
//       {s.icon}<span className="leading-relaxed">{text}</span>
//     </div>
//   );
// }

// // ─── Tab: Budget ──────────────────────────────────────────────────────────────
// function BudgetTab({ dark, analytics, budgets, setBudgets, addToast }) {
//   const [newCat, setNewCat] = useState('');
//   const [newAmt, setNewAmt] = useState('');
//   const [editing, setEditing] = useState(null);
//   const [editVal, setEditVal] = useState('');
//   const spending = analytics?.categoryBreakdown || {};

//   const handleAdd = () => {
//     if (!newCat.trim() || !newAmt) return;
//     setBudgets(b => ({ ...b, [newCat.trim()]: parseFloat(newAmt) }));
//     setNewCat(''); setNewAmt('');
//     addToast('Budget added', 'success');
//   };

//   const handleEditSave = (cat) => {
//     setBudgets(b => ({ ...b, [cat]: parseFloat(editVal) || 0 }));
//     setEditing(null);
//     addToast('Budget updated', 'success');
//   };

//   const insights = [];
//   Object.entries(budgets).forEach(([cat, budget]) => {
//     const spent = spending[cat] || 0;
//     const p = pct(spent, budget);
//     if (p >= 100) insights.push({ type: 'warn', text: `${cat} exceeded by ${fmt(spent - budget)}. Consider reallocating or reducing spend.` });
//     else if (p >= 80) insights.push({ type: 'warn', text: `${cat} at ${p.toFixed(0)}% — only ${fmt(budget - spent)} remaining this period.` });
//     else if (p < 40 && spent > 0) insights.push({ type: 'ok', text: `${cat} is well within budget (${p.toFixed(0)}% used). You have ${fmt(budget - spent)} headroom.` });
//   });
//   if (!insights.length) insights.push({ type: 'ok', text: 'All budgets are healthy! Great discipline this period.' });
//   if (analytics && parseFloat(analytics.savingsRate) < 10) {
//     insights.push({ type: 'info', text: `Savings rate is only ${analytics.savingsRate}%. Financial advisors recommend 20%+. Review your top 2 spending categories.` });
//   }

//   return (
//     <div>
//       <SectionCard title="Budget vs actual" dark={dark}>
//         {Object.entries(budgets).map(([cat, budget]) => {
//           const spent = spending[cat] || 0;
//           const p = pct(spent, budget);
//           const tagType = p >= 100 ? 'over' : p >= 80 ? 'warn' : 'ok';
//           return (
//             <div key={cat} className="mb-5 last:mb-0">
//               <div className="flex items-center justify-between mb-1.5">
//                 <span className={`text-sm font-medium ${dark ? 'text-gray-200' : 'text-gray-800'}`}>{cat}</span>
//                 <div className="flex items-center gap-2">
//                   <Tag type={tagType}>{tagType === 'over' ? 'Over' : tagType === 'warn' ? 'Near limit' : 'On track'}</Tag>
//                   <span className={`text-xs font-mono ${dark ? 'text-gray-400' : 'text-gray-500'}`}>{fmt(spent)} / {fmt(budget)}</span>
//                   {editing === cat ? (
//                     <div className="flex items-center gap-1">
//                       <input value={editVal} onChange={e => setEditVal(e.target.value)}
//                         className={`w-20 text-xs px-2 py-1 rounded-lg border outline-none ${dark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-200'}`} />
//                       <button onClick={() => handleEditSave(cat)} className="text-xs px-2 py-1 bg-indigo-600 text-white rounded-lg">✓</button>
//                       <button onClick={() => setEditing(null)} className={`text-xs px-2 py-1 rounded-lg ${dark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100'}`}>✕</button>
//                     </div>
//                   ) : (
//                     <button onClick={() => { setEditing(cat); setEditVal(budget); }}
//                       className={`text-xs px-2 py-0.5 rounded ${dark ? 'text-gray-400 hover:text-white' : 'text-gray-400 hover:text-gray-600'}`}>
//                       <Edit3 size={12} />
//                     </button>
//                   )}
//                   <button onClick={() => { setBudgets(b => { const n = { ...b }; delete n[cat]; return n; }); addToast('Budget removed', 'info'); }}
//                     className="text-xs text-red-400 hover:text-red-500"><X size={12} /></button>
//                 </div>
//               </div>
//               <ProgressBar value={spent} max={budget} dark={dark} />
//             </div>
//           );
//         })}
//         <div className={`flex gap-2 mt-5 pt-4 border-t ${dark ? 'border-gray-700' : 'border-gray-100'}`}>
//           <input value={newCat} onChange={e => setNewCat(e.target.value)} placeholder="Category name"
//             className={`flex-1 text-sm px-3 py-2 rounded-xl border outline-none ${dark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500' : 'bg-gray-50 border-gray-200'}`} />
//           <input value={newAmt} onChange={e => setNewAmt(e.target.value)} type="number" placeholder="Budget ₹"
//             className={`w-28 text-sm px-3 py-2 rounded-xl border outline-none ${dark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500' : 'bg-gray-50 border-gray-200'}`} />
//           <button onClick={handleAdd} className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-xl hover:bg-indigo-700 transition flex items-center gap-1">
//             <Plus size={14} /> Add
//           </button>
//         </div>
//       </SectionCard>
//       <SectionCard title="Budget health insights" dark={dark}>
//         {insights.map((ins, i) => <InsightItem key={i} {...ins} dark={dark} />)}
//       </SectionCard>
//     </div>
//   );
// }

// // ─── Tab: Goals ───────────────────────────────────────────────────────────────
// function GoalsTab({ dark, analytics, addToast }) {
//   const [goals, setGoals] = usePersist('goals', [{ id: 1, name: 'Emergency Fund', target: 100000, saved: 0, monthly: 2000 }]);
//   const [showForm, setShowForm] = useState(false);
//   const [form, setForm] = useState({ name: '', target: '', saved: '', monthly: '' });

//   const surplus = analytics ? analytics.totalIncome - analytics.totalExpenses : 0;

//   const addGoal = () => {
//     if (!form.name || !form.target) return;
//     setGoals(g => [...g, { id: Date.now(), name: form.name, target: +form.target, saved: +form.saved || 0, monthly: +form.monthly || 0 }]);
//     setForm({ name: '', target: '', saved: '', monthly: '' });
//     setShowForm(false);
//     addToast('Goal added!', 'success');
//   };

//   return (
//     <div>
//       <SectionCard title="Financial goals" dark={dark}
//         action={
//           <button onClick={() => setShowForm(f => !f)}
//             className="flex items-center gap-1.5 text-sm px-3 py-1.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition">
//             {showForm ? <X size={13} /> : <Plus size={13} />} {showForm ? 'Cancel' : 'Add goal'}
//           </button>
//         }>
//         {showForm && (
//           <div className={`mb-5 p-4 rounded-xl border space-y-3 ${dark ? 'bg-gray-750 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
//             {[
//               { key: 'name', placeholder: 'Goal name (e.g. Emergency Fund)', type: 'text' },
//               { key: 'target', placeholder: 'Target amount (₹)', type: 'number' },
//               { key: 'saved', placeholder: 'Already saved (₹)', type: 'number' },
//               { key: 'monthly', placeholder: 'Monthly contribution (₹)', type: 'number' },
//             ].map(({ key, placeholder, type }) => (
//               <input key={key} type={type} placeholder={placeholder} value={form[key]}
//                 onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
//                 className={`w-full text-sm px-3 py-2 rounded-xl border outline-none ${dark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500' : 'bg-white border-gray-300'}`} />
//             ))}
//             <button onClick={addGoal} className="w-full py-2 bg-indigo-600 text-white text-sm rounded-xl hover:bg-indigo-700 transition">Save goal</button>
//           </div>
//         )}

//         {goals.length === 0 && <p className={`text-sm text-center py-6 ${dark ? 'text-gray-500' : 'text-gray-400'}`}>No goals yet. Add one above.</p>}

//         {goals.map(g => {
//           const remaining = g.target - g.saved;
//           const monthly = g.monthly || Math.max(500, surplus * 0.3);
//           const months = monthly > 0 ? Math.ceil(remaining / monthly) : null;
//           const p = pct(g.saved, g.target);
//           return (
//             <div key={g.id} className={`mb-4 p-4 rounded-xl ${dark ? 'bg-gray-750' : 'bg-indigo-50'}`}>
//               <div className="flex justify-between items-start mb-2">
//                 <div>
//                   <p className={`font-semibold text-sm ${dark ? 'text-white' : 'text-indigo-900'}`}>{g.name}</p>
//                   <p className={`text-xs mt-0.5 ${dark ? 'text-gray-400' : 'text-indigo-600'}`}>{fmt(g.saved)} of {fmt(g.target)}</p>
//                 </div>
//                 <div className="flex items-center gap-2">
//                   <span className={`text-lg font-bold font-mono ${dark ? 'text-indigo-400' : 'text-indigo-600'}`}>{p.toFixed(0)}%</span>
//                   <button onClick={() => { setGoals(gs => gs.filter(x => x.id !== g.id)); addToast('Goal removed', 'info'); }}
//                     className="text-red-400 hover:text-red-500"><X size={14} /></button>
//                 </div>
//               </div>
//               <ProgressBar value={g.saved} max={g.target} dark={dark} variant="blue" />
//               <div className={`flex gap-4 mt-2 text-xs ${dark ? 'text-gray-400' : 'text-indigo-700'} flex-wrap`}>
//                 <span>Remaining: <strong>{fmt(remaining)}</strong></span>
//                 {g.monthly > 0 && <span>Contribution: <strong>{fmt(g.monthly)}/mo</strong></span>}
//                 {months && <span>Timeline: <strong>{months} months ({(months / 12).toFixed(1)} yrs)</strong></span>}
//                 {surplus > 0 && !g.monthly && <span>At current surplus: <strong>~{Math.ceil(remaining / (surplus * 0.3))} months</strong></span>}
//               </div>
//             </div>
//           );
//         })}
//       </SectionCard>
//     </div>
//   );
// }

// // ─── Tab: Forecast ────────────────────────────────────────────────────────────
// function ForecastTab({ dark, analytics }) {
//   const income = analytics?.totalIncome || 50000;
//   const expenses = analytics?.totalExpenses || 40000;
//   const surplus = income - expenses;

//   const months = ['Month 1', 'Month 2', 'Month 3', 'Month 4', 'Month 5', 'Month 6'];
//   const forecastData = months.map((label, i) => ({
//     month: label,
//     income: Math.round(income * Math.pow(1.01, i)),
//     expenses: Math.round(expenses * Math.pow(1.005, i)),
//     surplus: Math.round((income * Math.pow(1.01, i)) - (expenses * Math.pow(1.005, i))),
//   }));

//   const milestones = [50000, 100000, 200000, 500000, 1000000];

//   return (
//     <div>
//       <SectionCard title="6-month cash flow forecast" dark={dark}>
//         <p className={`text-xs mb-4 ${dark ? 'text-gray-500' : 'text-gray-400'}`}>
//           Projected based on your average income/expense trend. Assumes ~1% monthly income growth, 0.5% expense creep.
//         </p>
//         <ResponsiveContainer width="100%" height={240}>
//           <BarChart data={forecastData} barGap={4}>
//             <CartesianGrid strokeDasharray="3 3" stroke={dark ? '#374151' : '#f3f4f6'} />
//             <XAxis dataKey="month" fontSize={11} stroke={dark ? '#9ca3af' : '#6b7280'} />
//             <YAxis fontSize={11} stroke={dark ? '#9ca3af' : '#6b7280'} tickFormatter={v => '₹' + (v / 1000).toFixed(0) + 'k'} />
//             <Tooltip formatter={v => fmt(v)} contentStyle={{ background: dark ? '#1f2937' : '#fff', border: 'none', borderRadius: 12, fontSize: 12 }} />
//             <Legend />
//             <Bar dataKey="income" fill="#10b981" name="Income" radius={[4, 4, 0, 0]} />
//             <Bar dataKey="expenses" fill="#ef4444" name="Expenses" radius={[4, 4, 0, 0]} />
//             <Bar dataKey="surplus" fill="#6366f1" name="Surplus" radius={[4, 4, 0, 0]} />
//           </BarChart>
//         </ResponsiveContainer>
//       </SectionCard>

//       <SectionCard title="Savings milestones" dark={dark}>
//         <div className="space-y-3">
//           {milestones.map(target => {
//             const months = surplus > 0 ? Math.ceil(target / surplus) : null;
//             const years = months ? (months / 12).toFixed(1) : null;
//             const feasible = months && months <= 120;
//             return (
//               <div key={target} className={`flex items-center justify-between py-2.5 border-b last:border-0 ${dark ? 'border-gray-700' : 'border-gray-100'}`}>
//                 <span className={`text-sm font-medium ${dark ? 'text-gray-300' : 'text-gray-700'}`}>{fmt(target)} saved</span>
//                 <span className={`text-sm font-semibold ${feasible ? 'text-blue-500' : dark ? 'text-gray-500' : 'text-gray-400'}`}>
//                   {surplus <= 0 ? 'Increase surplus first' : feasible ? `~${months} months (${years} yrs)` : 'Long-term goal'}
//                 </span>
//               </div>
//             );
//           })}
//         </div>
//         {!analytics && <p className={`text-xs mt-3 ${dark ? 'text-gray-500' : 'text-gray-400'}`}>Load transaction data for accurate projections.</p>}
//       </SectionCard>
//     </div>
//   );
// }

// // ─── Tab: Recurring ───────────────────────────────────────────────────────────
// function RecurringTab({ dark, transactions, addToast }) {
//   const [subs, setSubs] = usePersist('subscriptions', []);
//   const [form, setForm] = useState({ name: '', amount: '', freq: 'Monthly' });

//   const detected = useCallback(() => {
//     if (!transactions?.length) return [];
//     const map = {};
//     transactions.filter(t => t.amount < 0).forEach(t => {
//       const key = t.name.toLowerCase().trim().slice(0, 25);
//       if (!map[key]) map[key] = { name: t.name, amounts: [], category: t.category };
//       map[key].amounts.push(Math.abs(t.amount));
//     });
//     return Object.values(map)
//       .filter(r => r.amounts.length >= 2)
//       .map(r => ({ name: r.name, avg: r.amounts.reduce((a, b) => a + b) / r.amounts.length, count: r.amounts.length, category: r.category, auto: true }))
//       .sort((a, b) => b.avg - a.avg).slice(0, 10);
//   }, [transactions]);

//   const allRecurring = [...detected(), ...subs.map(s => ({ ...s, auto: false }))];
//   const totalMonthly = allRecurring.reduce((sum, r) => sum + (r.avg || r.amount || 0), 0);

//   const catIcon = { 'Food & Dining': '🍕', 'Shopping': '🛍', 'Entertainment': '🎬', 'Utilities': '⚡', 'Healthcare': '💊', 'Transport': '🚗', 'Other': '📋' };

//   const addSub = () => {
//     if (!form.name || !form.amount) return;
//     setSubs(s => [...s, { id: Date.now(), name: form.name, amount: +form.amount, freq: form.freq }]);
//     setForm({ name: '', amount: '', freq: 'Monthly' });
//     addToast('Subscription added', 'success');
//   };

//   return (
//     <div>
//       <SectionCard title="Recurring expenses" dark={dark}
//         action={<Tag type="info">Total: {fmt(totalMonthly)}/mo</Tag>}>
//         {!allRecurring.length && (
//           <p className={`text-sm text-center py-6 ${dark ? 'text-gray-500' : 'text-gray-400'}`}>
//             No recurring expenses detected. Import more transaction history, or add subscriptions manually below.
//           </p>
//         )}
//         {allRecurring.map((r, i) => (
//           <div key={i} className={`flex items-center gap-3 py-3 border-b last:border-0 ${dark ? 'border-gray-700' : 'border-gray-100'}`}>
//             <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm ${dark ? 'bg-gray-700' : 'bg-gray-100'}`}>
//               {catIcon[r.category] || '📋'}
//             </div>
//             <div className="flex-1 min-w-0">
//               <p className={`text-sm font-medium truncate ${dark ? 'text-gray-200' : 'text-gray-800'}`}>{r.name}</p>
//               <p className={`text-xs ${dark ? 'text-gray-500' : 'text-gray-400'}`}>
//                 {r.auto ? `Auto-detected · ${r.count} times` : (r.freq || 'Monthly')}
//               </p>
//             </div>
//             <div className="text-right">
//               <p className="text-sm font-semibold text-red-500">{fmt(r.avg || r.amount)}</p>
//               <p className={`text-xs ${dark ? 'text-gray-500' : 'text-gray-400'}`}>/mo</p>
//             </div>
//             {!r.auto && (
//               <button onClick={() => { setSubs(s => s.filter(x => x.id !== r.id)); addToast('Removed', 'info'); }}
//                 className="text-red-400 hover:text-red-500"><X size={14} /></button>
//             )}
//           </div>
//         ))}
//       </SectionCard>

//       <SectionCard title="Add subscription manually" dark={dark}>
//         <div className="grid grid-cols-3 gap-3 mb-3">
//           <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Netflix, Spotify..."
//             className={`text-sm px-3 py-2 rounded-xl border outline-none col-span-1 ${dark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500' : 'bg-gray-50 border-gray-200'}`} />
//           <input value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} type="number" placeholder="Amount ₹"
//             className={`text-sm px-3 py-2 rounded-xl border outline-none ${dark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500' : 'bg-gray-50 border-gray-200'}`} />
//           <select value={form.freq} onChange={e => setForm(f => ({ ...f, freq: e.target.value }))}
//             className={`text-sm px-3 py-2 rounded-xl border outline-none ${dark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-800'}`}>
//             <option>Monthly</option><option>Quarterly</option><option>Yearly</option>
//           </select>
//         </div>
//         <button onClick={addSub} className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white text-sm rounded-xl hover:bg-indigo-700 transition">
//           <Plus size={14} /> Add
//         </button>
//       </SectionCard>
//     </div>
//   );
// }

// // ─── Tab: Debt Payoff ─────────────────────────────────────────────────────────
// function DebtTab({ dark, analytics, addToast }) {
//   const [debts, setDebts] = usePersist('debts', []);
//   const [strategy, setStrategy] = usePersist('debtStrategy', 'snowball');
//   const [form, setForm] = useState({ name: '', balance: '', rate: '', min: '' });

//   const surplus = analytics ? Math.max(0, analytics.totalIncome - analytics.totalExpenses) : 5000;
//   const extra = surplus * 0.3;

//   const addDebt = () => {
//     if (!form.name || !form.balance) return;
//     setDebts(d => [...d, { id: Date.now(), name: form.name, balance: +form.balance, rate: +form.rate || 0, min: +form.min || 1000 }]);
//     setForm({ name: '', balance: '', rate: '', min: '' });
//     addToast('Debt added', 'success');
//   };

//   const sorted = [...debts].sort((a, b) =>
//     strategy === 'snowball' ? a.balance - b.balance : b.rate - a.rate
//   );

//   const calcMonths = (debt, extraPayment = 0) => {
//     const pay = debt.min + extraPayment;
//     if (debt.rate === 0) return Math.ceil(debt.balance / pay);
//     const r = debt.rate / 1200;
//     return Math.max(1, Math.ceil(Math.log(pay / (pay - debt.balance * r)) / Math.log(1 + r)));
//   };

//   const totalDebt = debts.reduce((s, d) => s + d.balance, 0);

//   return (
//     <div>
//       <SectionCard title="Debt overview" dark={dark}>
//         {!debts.length ? (
//           <p className={`text-sm text-center py-6 ${dark ? 'text-gray-500' : 'text-gray-400'}`}>No debts added. Add loans, credit cards, or EMIs below.</p>
//         ) : (
//           <>
//             <div className={`flex items-center justify-between mb-4 p-3 rounded-xl ${dark ? 'bg-gray-700' : 'bg-gray-50'}`}>
//               <span className={`text-sm font-medium ${dark ? 'text-gray-300' : 'text-gray-700'}`}>Total outstanding</span>
//               <span className="text-lg font-bold font-mono text-red-500">{fmt(totalDebt)}</span>
//             </div>
//             {debts.map(d => (
//               <div key={d.id} className={`flex items-center gap-3 py-3 border-b last:border-0 ${dark ? 'border-gray-700' : 'border-gray-100'}`}>
//                 <div className="flex-1">
//                   <p className={`text-sm font-semibold ${dark ? 'text-gray-200' : 'text-gray-800'}`}>{d.name}</p>
//                   <p className={`text-xs ${dark ? 'text-gray-500' : 'text-gray-400'}`}>
//                     {fmt(d.balance)} · {d.rate}% p.a. · Min: {fmt(d.min)}/mo
//                   </p>
//                 </div>
//                 <Tag type="over">{calcMonths(d)} mo</Tag>
//                 <button onClick={() => { setDebts(ds => ds.filter(x => x.id !== d.id)); addToast('Removed', 'info'); }}
//                   className="text-red-400 hover:text-red-500"><X size={14} /></button>
//               </div>
//             ))}
//           </>
//         )}
//       </SectionCard>

//       {debts.length > 0 && (
//         <SectionCard title="Payoff strategy" dark={dark}
//           action={
//             <div className={`flex gap-1 p-1 rounded-xl ${dark ? 'bg-gray-700' : 'bg-gray-100'}`}>
//               {['snowball', 'avalanche'].map(s => (
//                 <button key={s} onClick={() => setStrategy(s)}
//                   className={`text-xs px-3 py-1.5 rounded-lg transition capitalize ${strategy === s ? 'bg-indigo-600 text-white' : dark ? 'text-gray-400' : 'text-gray-500'}`}>
//                   {s}
//                 </button>
//               ))}
//             </div>
//           }>
//           <p className={`text-xs mb-4 ${dark ? 'text-gray-400' : 'text-gray-500'}`}>
//             {strategy === 'snowball'
//               ? '⚡ Snowball: Pay smallest balance first for quick psychological wins.'
//               : '💰 Avalanche: Pay highest interest first — mathematically saves the most money.'}
//           </p>
//           {sorted.map((d, i) => {
//             const extraForThis = i === 0 ? extra : 0;
//             const months = calcMonths(d, extraForThis);
//             return (
//               <div key={d.id} className={`flex items-center justify-between py-3 border-b last:border-0 ${dark ? 'border-gray-700' : 'border-gray-100'}`}>
//                 <div className="flex items-center gap-2">
//                   <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white`}
//                     style={{ background: i === 0 ? '#6366f1' : '#9ca3af' }}>{i + 1}</span>
//                   <div>
//                     <p className={`text-sm font-medium ${dark ? 'text-gray-200' : 'text-gray-800'}`}>{d.name}</p>
//                     {i === 0 && <p className="text-xs text-indigo-500">← Put extra {fmt(extra)}/mo here</p>}
//                   </div>
//                 </div>
//                 <Tag type={i === 0 ? 'purple' : 'info'}>{months} months</Tag>
//               </div>
//             );
//           })}
//           <div className={`mt-4 pt-4 border-t flex items-center justify-between ${dark ? 'border-gray-700' : 'border-gray-100'}`}>
//             <span className={`text-sm font-medium ${dark ? 'text-gray-300' : 'text-gray-700'}`}>All debts cleared in</span>
//             <span className="text-sm font-bold text-emerald-500">
//               ~{Math.max(...sorted.map((d, i) => calcMonths(d, i === 0 ? extra : 0)))} months
//             </span>
//           </div>
//         </SectionCard>
//       )}

//       <SectionCard title="Add debt" dark={dark}>
//         <div className="grid grid-cols-2 gap-3 mb-3">
//           {[
//             { key: 'name', placeholder: 'Debt name (e.g. HDFC Credit Card)', type: 'text', span: 2 },
//             { key: 'balance', placeholder: 'Outstanding balance (₹)', type: 'number' },
//             { key: 'rate', placeholder: 'Interest rate (% p.a.)', type: 'number' },
//             { key: 'min', placeholder: 'Min monthly payment (₹)', type: 'number' },
//           ].map(({ key, placeholder, type, span }) => (
//             <input key={key} type={type} placeholder={placeholder} value={form[key]}
//               onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
//               className={`text-sm px-3 py-2 rounded-xl border outline-none ${span === 2 ? 'col-span-2' : ''} ${dark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500' : 'bg-gray-50 border-gray-200'}`} />
//           ))}
//         </div>
//         <button onClick={addDebt} className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white text-sm rounded-xl hover:bg-indigo-700 transition">
//           <Plus size={14} /> Add debt
//         </button>
//       </SectionCard>
//     </div>
//   );
// }

// // ─── Tab: What-If ─────────────────────────────────────────────────────────────
// function WhatIfTab({ dark, analytics, budgets }) {
//   const [goals] = usePersist('goals', []);
//   const spending = analytics?.categoryBreakdown || {};
//   const income = analytics?.totalIncome || 50000;
//   const expenses = analytics?.totalExpenses || 40000;
//   const surplus = income - expenses;

//   const topCats = Object.entries(budgets).slice(0, 5);
//   const [adjustments, setAdjustments] = useState(() => Object.fromEntries(topCats.map(([c]) => [c, 0])));

//   const totalAdj = Object.values(adjustments).reduce((s, v) => s + v, 0);
//   const newExpenses = expenses + totalAdj;
//   const newSurplus = income - newExpenses;
//   const diff = newSurplus - surplus;
//   const newRate = income > 0 ? (newSurplus / income * 100).toFixed(1) : '0';

//   return (
//     <div>
//       <SectionCard title="What-if simulator" dark={dark}>
//         <p className={`text-xs mb-5 ${dark ? 'text-gray-500' : 'text-gray-400'}`}>
//           Drag sliders to see how cutting or increasing each category changes your financial outcomes.
//         </p>
//         {topCats.map(([cat, budget]) => {
//           const spent = spending[cat] || 0;
//           const max = Math.max(spent, budget, 2000);
//           const val = adjustments[cat] || 0;
//           return (
//             <div key={cat} className="mb-5">
//               <div className="flex items-center justify-between mb-2">
//                 <span className={`text-sm font-medium ${dark ? 'text-gray-200' : 'text-gray-700'}`}>{cat}</span>
//                 <span className={`text-sm font-semibold font-mono ${val === 0 ? dark ? 'text-gray-500' : 'text-gray-400' : val < 0 ? 'text-emerald-500' : 'text-red-500'}`}>
//                   {val === 0 ? 'No change' : (val > 0 ? '+' : '') + fmt(val)}
//                 </span>
//               </div>
//               <input type="range" min={-max} max={max} step={100} value={val}
//                 onChange={e => setAdjustments(a => ({ ...a, [cat]: +e.target.value }))}
//                 className="w-full accent-indigo-600" />
//               <div className={`flex justify-between text-xs mt-1 ${dark ? 'text-gray-600' : 'text-gray-400'}`}>
//                 <span>-{fmt(max)}</span>
//                 <span>Current: {fmt(spent)}</span>
//                 <span>+{fmt(max)}</span>
//               </div>
//             </div>
//           );
//         })}
//         <button onClick={() => setAdjustments(Object.fromEntries(topCats.map(([c]) => [c, 0])))}
//           className={`text-xs px-3 py-1.5 rounded-lg border transition ${dark ? 'border-gray-600 text-gray-400 hover:bg-gray-700' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
//           Reset all
//         </button>
//       </SectionCard>

//       <SectionCard title="Projected outcome" dark={dark}>
//         <div className="grid grid-cols-3 gap-3 mb-5">
//           {[
//             { label: 'New monthly surplus', value: fmt(newSurplus), color: newSurplus >= 0 ? 'text-emerald-500' : 'text-red-500' },
//             { label: 'Monthly change', value: (diff >= 0 ? '+' : '') + fmt(diff), color: diff >= 0 ? 'text-emerald-500' : 'text-red-500' },
//             { label: 'New savings rate', value: newRate + '%', color: parseFloat(newRate) >= 20 ? 'text-emerald-500' : parseFloat(newRate) >= 10 ? 'text-amber-500' : 'text-red-500' },
//           ].map(({ label, value, color }) => (
//             <div key={label} className={`p-4 rounded-xl ${dark ? 'bg-gray-700' : 'bg-gray-50'}`}>
//               <p className={`text-xs ${dark ? 'text-gray-400' : 'text-gray-500'} mb-1`}>{label}</p>
//               <p className={`text-xl font-bold font-mono ${color}`}>{value}</p>
//             </div>
//           ))}
//         </div>
//         {diff !== 0 && (
//           <InsightItem type={diff > 0 ? 'ok' : 'warn'} dark={dark}
//             text={diff > 0
//               ? `This saves you an extra ${fmt(diff * 12)}/year. In 5 years, that's ${fmt(diff * 60)} more saved.`
//               : `This costs you ${fmt(Math.abs(diff) * 12)} more per year. Consider if it's worth the trade-off.`} />
//         )}
//         {goals.length > 0 && (
//           <>
//             <h4 className={`text-sm font-semibold mt-4 mb-3 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>Impact on your goals</h4>
//             {goals.map(g => {
//               const rem = g.target - g.saved;
//               const oldMo = surplus > 0 ? Math.ceil(rem / (g.monthly || surplus * 0.3)) : null;
//               const newMo = newSurplus > 0 ? Math.ceil(rem / (g.monthly ? g.monthly + diff * 0.5 : newSurplus * 0.3)) : null;
//               const faster = oldMo && newMo ? oldMo - newMo : 0;
//               return (
//                 <div key={g.id} className={`flex items-center justify-between py-2.5 border-b last:border-0 ${dark ? 'border-gray-700' : 'border-gray-100'}`}>
//                   <span className={`text-sm ${dark ? 'text-gray-300' : 'text-gray-700'}`}>{g.name}</span>
//                   <div className="flex items-center gap-2">
//                     {oldMo && <span className={`text-xs ${dark ? 'text-gray-500' : 'text-gray-400'}`}>{oldMo} mo →</span>}
//                     {newMo && <span className="text-sm font-semibold text-blue-500">{newMo} mo</span>}
//                     {faster > 0 && <Tag type="ok">{faster} mo faster</Tag>}
//                     {faster < 0 && <Tag type="over">{Math.abs(faster)} mo slower</Tag>}
//                   </div>
//                 </div>
//               );
//             })}
//           </>
//         )}
//       </SectionCard>
//     </div>
//   );
// }

// // ─── Tab: AI Insights ─────────────────────────────────────────────────────────
// function AIInsightsTab({ dark, analytics, budgets, transactions, addToast }) {
//   const [goals]  = usePersist('goals', []);
//   const [debts]  = usePersist('debts', []);
//   const [subs]   = usePersist('subscriptions', []);
//   const [groqKey, setGroqKey]     = useState(() => localStorage.getItem(LS_GROQ_KEY) || '');
//   const [groqModel, setGroqModel] = useState(() => localStorage.getItem(LS_GROQ_MODEL) || 'llama-3.3-70b-versatile');
//   const [response, setResponse]   = useState('');
//   const [loading, setLoading]     = useState(false);
//   const [status, setStatus]       = useState('idle'); // idle | ok | err
//   const [customQ, setCustomQ]     = useState('');

//   const saveKey = () => {
//     localStorage.setItem(LS_GROQ_KEY, groqKey);
//     localStorage.setItem(LS_GROQ_MODEL, groqModel);
//     setStatus('ok');
//     addToast('Groq key saved', 'success');
//   };

//   const buildContext = () => {
//     if (!analytics) return 'No transaction data loaded.';
//     const spending = analytics.categoryBreakdown || {};
//     const topCats = Object.entries(spending).sort((a,b) => b[1]-a[1]).slice(0,6).map(([c,v]) => `${c}: ${fmt(v)}`).join(', ');
//     const budgetStatus = Object.entries(budgets).map(([cat, b]) => {
//       const s = spending[cat] || 0;
//       return `${cat}: ${fmt(s)}/${fmt(b)} (${pct(s,b).toFixed(0)}%)`;
//     }).join('; ');
//     const recurTotal = subs.reduce((s, r) => s + r.amount, 0);
//     return [
//       `Monthly income: ${fmt(analytics.totalIncome)}`,
//       `Monthly expenses: ${fmt(analytics.totalExpenses)}`,
//       `Savings rate: ${analytics.savingsRate}%`,
//       `Net surplus: ${fmt(analytics.totalIncome - analytics.totalExpenses)}`,
//       `Top spending: ${topCats}`,
//       `Budget status: ${budgetStatus}`,
//       `Goals: ${goals.map(g => `${g.name} (${pct(g.saved, g.target).toFixed(0)}%)`).join(', ') || 'None'}`,
//       `Debts: ${debts.map(d => `${d.name}: ${fmt(d.balance)} @ ${d.rate}%`).join(', ') || 'None'}`,
//       `Monthly subscriptions: ${fmt(recurTotal)}`,
//     ].join('\n');
//   };

//   const callGroq = async (userPrompt) => {
//     const key = localStorage.getItem(LS_GROQ_KEY);
//     if (!key) { setResponse('Please save your Groq API key first.'); return; }
//     setLoading(true);
//     setResponse('');
//     try {
//       const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
//         method: 'POST',
//         headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           model: groqModel,
//           messages: [
//             {
//               role: 'system',
//               content: `You are a senior personal finance advisor specializing in Indian personal finance (SIPs, PPF, NPS, FDs, ELSS, tax-saving instruments).
// Be specific, actionable, and always reference real numbers from the data.
// Keep responses under 400 words. Use bullet points for clarity. Use ₹ for currency.

// USER FINANCIAL DATA:
// ${buildContext()}`
//             },
//             { role: 'user', content: userPrompt }
//           ],
//           max_tokens: 700,
//           temperature: 0.7,
//         })
//       });
//       const data = await res.json();
//       if (data.choices?.[0]?.message?.content) {
//         setResponse(data.choices[0].message.content);
//         setStatus('ok');
//       } else {
//         throw new Error(data.error?.message || JSON.stringify(data));
//       }
//     } catch (e) {
//       setResponse('Error: ' + e.message);
//       setStatus('err');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const smartInsights = [];
//   if (!analytics) {
//     smartInsights.push({ type: 'info', text: 'Load transaction data from the dashboard for personalized insights.' });
//   } else {
//     const rate = parseFloat(analytics.savingsRate);
//     if (rate < 10) smartInsights.push({ type: 'warn', text: `Savings rate of ${rate}% is critically low. Target 20%+. Start by cutting your biggest non-essential category.` });
//     else if (rate >= 20) smartInsights.push({ type: 'ok', text: `Excellent! ${rate}% savings rate puts you in the top tier of financial health.` });
//     else smartInsights.push({ type: 'info', text: `${rate}% savings rate is decent. Try to push toward 20% by trimming one category.` });

//     const spending = analytics.categoryBreakdown || {};
//     const topCat = Object.entries(spending).sort((x,y) => y[1]-x[1])[0];
//     if (topCat) smartInsights.push({ type: 'info', text: `Biggest spend: ${topCat[0]} at ${fmt(topCat[1])}. Can you reduce this by 10–15%?` });
//     if (analytics.totalExpenses > analytics.totalIncome) smartInsights.push({ type: 'warn', text: `You're spending more than you earn by ${fmt(analytics.totalExpenses - analytics.totalIncome)}. This is urgent — cut expenses immediately.` });
//     if (!goals.some(g => g.name.toLowerCase().includes('emergency'))) {
//       smartInsights.push({ type: 'info', text: `No emergency fund goal detected. Aim for 6 months of expenses = ${fmt(analytics.totalExpenses * 6)}.` });
//     }
//     if (debts.length > 0) smartInsights.push({ type: 'warn', text: `You have ${debts.length} active debt(s) totalling ${fmt(debts.reduce((s,d) => s+d.balance, 0))}. Prioritize paying these off before investing.` });
//   }

//   return (
//     <div>
//       {/* Groq Config */}
//       <SectionCard title="Groq AI configuration" dark={dark}>
//         <div className={`flex items-center gap-2 mb-3`}>
//           <div className={`w-2 h-2 rounded-full flex-shrink-0 ${status === 'ok' ? 'bg-emerald-500' : status === 'err' ? 'bg-red-500' : dark ? 'bg-gray-600' : 'bg-gray-400'}`} />
//           <span className={`text-xs ${dark ? 'text-gray-400' : 'text-gray-500'}`}>
//             {status === 'ok' ? 'Connected' : status === 'err' ? 'Connection failed' : 'Not configured'}
//           </span>
//         </div>
//         <div className="space-y-3">
//           <div>
//             <label className={`block text-xs font-medium mb-1.5 ${dark ? 'text-gray-400' : 'text-gray-600'}`}>API Key</label>
//             <input type="password" value={groqKey} onChange={e => setGroqKey(e.target.value)}
//               placeholder="gsk_..."
//               className={`w-full text-sm font-mono px-3 py-2 rounded-xl border outline-none ${dark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500' : 'bg-gray-50 border-gray-200'}`} />
//           </div>
//           <div>
//             <label className={`block text-xs font-medium mb-1.5 ${dark ? 'text-gray-400' : 'text-gray-600'}`}>Model</label>
//             <select value={groqModel} onChange={e => setGroqModel(e.target.value)}
//               className={`w-full text-sm px-3 py-2 rounded-xl border outline-none ${dark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-800'}`}>
//               {GROQ_MODELS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
//             </select>
//           </div>
//           <div className="flex gap-2">
//             <button onClick={saveKey} className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-xl hover:bg-indigo-700 transition">Save key</button>
//             <button onClick={() => callGroq('Reply with exactly: Groq connected successfully.')}
//               className={`px-4 py-2 text-sm rounded-xl border transition ${dark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
//               Test
//             </button>
//           </div>
//           <p className={`text-xs ${dark ? 'text-gray-500' : 'text-gray-400'}`}>
//             Get a free key at{' '}
//             <a href="https://console.groq.com" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">console.groq.com</a>
//             {' '}— 100k free tokens/day.
//           </p>
//         </div>
//       </SectionCard>

//       {/* AI Query Buttons */}
//       <SectionCard title="AI-powered financial analysis" dark={dark}>
//         <div className="flex flex-wrap gap-2 mb-4">
//           {Object.entries(GROQ_PROMPTS).map(([key, prompt]) => (
//             <button key={key} onClick={() => callGroq(prompt)} disabled={loading}
//               className={`px-3 py-1.5 text-sm rounded-xl border transition capitalize disabled:opacity-50 ${dark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-200 text-gray-700 hover:bg-gray-50'}`}>
//               {key === 'full' ? 'Full analysis' : key === 'savings' ? 'Savings plan' : key === 'budget' ? 'Budget advice' : key === 'invest' ? 'Investment tips' : 'Goal strategy'}
//             </button>
//           ))}
//         </div>

//         {/* Custom prompt */}
//         <div className="flex gap-2 mb-4">
//           <input value={customQ} onChange={e => setCustomQ(e.target.value)}
//             onKeyDown={e => e.key === 'Enter' && customQ.trim() && callGroq(customQ)}
//             placeholder="Ask anything about your finances..."
//             className={`flex-1 text-sm px-3 py-2 rounded-xl border outline-none ${dark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500' : 'bg-gray-50 border-gray-200'}`} />
//           <button onClick={() => { if (customQ.trim()) { callGroq(customQ); setCustomQ(''); } }} disabled={loading || !customQ.trim()}
//             className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-xl hover:bg-indigo-700 transition disabled:opacity-50 flex items-center gap-1">
//             <ArrowUpRight size={14} /> Ask
//           </button>
//         </div>

//         {/* Response */}
//         <div className={`min-h-16 rounded-xl p-4 text-sm leading-relaxed whitespace-pre-wrap ${dark ? 'bg-gray-700 text-gray-200' : 'bg-gray-50 text-gray-700'}`}>
//           {loading ? (
//             <div className="flex items-center gap-2 text-gray-400">
//               <RefreshCw size={14} className="animate-spin" />
//               <span>Analyzing with {groqModel}...</span>
//             </div>
//           ) : response || <span className={dark ? 'text-gray-500' : 'text-gray-400'}>Save your Groq API key and click an analysis button above.</span>}
//         </div>
//       </SectionCard>

//       {/* Rule-based insights */}
//       <SectionCard title="Smart insights (rule-based)" dark={dark}>
//         {smartInsights.map((ins, i) => <InsightItem key={i} {...ins} dark={dark} />)}
//       </SectionCard>
//     </div>
//   );
// }

// // ─── Main PlanningSection ─────────────────────────────────────────────────────
// export default function PlanningSection({ analytics, dark, addToast, budgets, setBudgets, transactions }) {
//   const [activeTab, setActiveTab] = useState('budget');

//   return (
//     <div>
//       {/* Summary metrics */}
//       {analytics && (
//         <div className="grid grid-cols-4 gap-4 mb-6">
//           {[
//             { label: 'Monthly income',   value: fmt(analytics.totalIncome),   color: 'text-emerald-500' },
//             { label: 'Monthly expenses', value: fmt(analytics.totalExpenses),  color: 'text-red-500' },
//             { label: 'Savings rate',     value: analytics.savingsRate + '%',   color: 'text-blue-500' },
//             {
//               label: 'Net surplus',
//               value: (analytics.totalIncome - analytics.totalExpenses >= 0 ? '+' : '') + fmt(analytics.totalIncome - analytics.totalExpenses),
//               color: analytics.totalIncome - analytics.totalExpenses >= 0 ? 'text-emerald-500' : 'text-red-500'
//             },
//           ].map(({ label, value, color }) => (
//             <div key={label} className={`rounded-2xl p-5 border ${dark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
//               <p className={`text-xs uppercase tracking-wider font-semibold mb-2 ${dark ? 'text-gray-400' : 'text-gray-500'}`}>{label}</p>
//               <p className={`text-2xl font-bold font-mono ${color}`}>{value}</p>
//             </div>
//           ))}
//         </div>
//       )}

//       {/* Tab bar */}
//       <div className={`flex gap-1 mb-6 p-1 rounded-2xl w-fit ${dark ? 'bg-gray-800' : 'bg-gray-100'}`}>
//         {TAB_LIST.map(({ id, label, icon: Icon }) => (
//           <button key={id} onClick={() => setActiveTab(id)}
//             className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition ${
//               activeTab === id
//                 ? 'bg-indigo-600 text-white shadow-md'
//                 : dark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-800'
//             }`}>
//             <Icon size={14} />{label}
//           </button>
//         ))}
//       </div>

//       {/* Tab content */}
//       {activeTab === 'budget'    && <BudgetTab    dark={dark} analytics={analytics} budgets={budgets} setBudgets={setBudgets} addToast={addToast} />}
//       {activeTab === 'goals'     && <GoalsTab     dark={dark} analytics={analytics} addToast={addToast} />}
//       {activeTab === 'forecast'  && <ForecastTab  dark={dark} analytics={analytics} />}
//       {activeTab === 'recurring' && <RecurringTab dark={dark} transactions={transactions || []} addToast={addToast} />}
//       {activeTab === 'debt'      && <DebtTab      dark={dark} analytics={analytics} addToast={addToast} />}
//       {activeTab === 'whatif'    && <WhatIfTab    dark={dark} analytics={analytics} budgets={budgets} />}
//       {activeTab === 'insights'  && <AIInsightsTab dark={dark} analytics={analytics} budgets={budgets} transactions={transactions || []} addToast={addToast} />}
//     </div>
//   );
// }

// import React, { useState, useCallback, useEffect } from 'react';
// import {
//   Plus, X, Target, CheckCircle, TrendingUp,
//   PiggyBank, CreditCard, Zap, Edit3,
//   BarChart2, Lightbulb, AlertCircle,
//   ArrowUpRight, Repeat, RefreshCw, ChevronRight,
//   Flame, Shield, Sparkles, Send
// } from 'lucide-react';
// import {
//   AreaChart, Area, BarChart, Bar, XAxis, YAxis,
//   CartesianGrid, Tooltip, ResponsiveContainer
// } from 'recharts';

// // ─── Constants ────────────────────────────────────────────────────────────────
// const LS_KEY = 'fin_planning_v3';

// const BUDGET_DEFAULTS = {
//   'Food & Dining': 5000,
//   'Shopping': 8000,
//   'Transport': 3000,
//   'Entertainment': 2000,
//   'Utilities': 2500,
//   'Healthcare': 2000,
//   'Groceries': 4000,
//   'Other': 3000,
// };

// const TAB_LIST = [
//   { id: 'budget',    label: 'Budget',     icon: Target },
//   { id: 'goals',     label: 'Goals',      icon: PiggyBank },
//   { id: 'forecast',  label: 'Forecast',   icon: BarChart2 },
//   { id: 'recurring', label: 'Recurring',  icon: Repeat },
//   { id: 'debt',      label: 'Debt',       icon: CreditCard },
//   { id: 'whatif',    label: 'What-If',    icon: Zap },
//   { id: 'insights',  label: 'AI Chat',    icon: Sparkles },
// ];

// const CATEGORY_COLORS = {
//   'Food & Dining': '#f97316',
//   'Shopping': '#8b5cf6',
//   'Transport': '#3b82f6',
//   'Entertainment': '#ec4899',
//   'Utilities': '#14b8a6',
//   'Healthcare': '#10b981',
//   'Groceries': '#f59e0b',
//   'Other': '#6b7280',
// };

// // ─── Helpers ──────────────────────────────────────────────────────────────────
// const fmt = (n) => '₹' + Math.round(n).toLocaleString('en-IN');
// const pct = (v, t) => (t > 0 ? Math.min(100, (v / t) * 100) : 0);
// const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

// // Normalize a category string for fuzzy matching: lowercase, strip spaces/punctuation
// const norm = (s) => (s || '').toLowerCase().replace(/[^a-z0-9]/g, '');

// // Look up actual spending for a budget category, tolerating name mismatches.
// // e.g. budget key "Food & Dining" will match breakdown key "food&dining", "Food and Dining", "food", etc.
// function getSpent(spending, budgetCat) {
//   // 1. Exact match first
//   if (spending[budgetCat] !== undefined) return spending[budgetCat];
//   const nBudget = norm(budgetCat);
//   // 2. Normalized exact match
//   for (const [k, v] of Object.entries(spending)) {
//     if (norm(k) === nBudget) return v;
//   }
//   // 3. One contains the other (e.g. "Food" matches "Food & Dining")
//   for (const [k, v] of Object.entries(spending)) {
//     const nK = norm(k);
//     if (nK.includes(nBudget) || nBudget.includes(nK)) return v;
//   }
//   return 0;
// }

// function loadState() {
//   try { const r = localStorage.getItem(LS_KEY); return r ? JSON.parse(r) : {}; } catch { return {}; }
// }
// function saveState(patch) {
//   try { localStorage.setItem(LS_KEY, JSON.stringify({ ...loadState(), ...patch })); } catch {}
// }
// function usePersist(key, initial) {
//   const [val, setVal] = useState(() => { const s = loadState(); return s[key] !== undefined ? s[key] : initial; });
//   const set = useCallback((next) => {
//     setVal(prev => {
//       const v = typeof next === 'function' ? next(prev) : next;
//       saveState({ [key]: v });
//       return v;
//     });
//   }, [key]);
//   return [val, set];
// }

// // ─── Design Primitives ────────────────────────────────────────────────────────

// function Card({ children, className = '', glass = false }) {
//   return (
//     <div className={`rounded-2xl border border-white/10 ${glass ? 'bg-white/5 backdrop-blur-sm' : 'bg-gray-900/60'} ${className}`}>
//       {children}
//     </div>
//   );
// }

// function GlowBar({ value, max, color = '#6366f1' }) {
//   const p = clamp(pct(value, max), 0, 100);
//   const isOver = value > max;
//   const barColor = isOver ? '#ef4444' : p > 80 ? '#f59e0b' : color;
//   return (
//     <div className="relative h-2 rounded-full bg-white/10 overflow-hidden">
//       <div
//         className="h-full rounded-full transition-all duration-700 ease-out"
//         style={{
//           width: `${p}%`,
//           background: `linear-gradient(90deg, ${barColor}88, ${barColor})`,
//           boxShadow: `0 0 8px ${barColor}60`,
//         }}
//       />
//     </div>
//   );
// }

// function Badge({ children, type = 'default' }) {
//   const styles = {
//     over:    'bg-red-500/20 text-red-300 border-red-500/30',
//     warn:    'bg-amber-500/20 text-amber-300 border-amber-500/30',
//     ok:      'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
//     info:    'bg-blue-500/20 text-blue-300 border-blue-500/30',
//     purple:  'bg-purple-500/20 text-purple-300 border-purple-500/30',
//     default: 'bg-white/10 text-gray-300 border-white/20',
//   };
//   return (
//     <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${styles[type]}`}>
//       {children}
//     </span>
//   );
// }

// function AlertBox({ type, text }) {
//   const cfg = {
//     warn:  { border: 'border-amber-500/30',  bg: 'bg-amber-500/10',  icon: <AlertCircle size={14} className="text-amber-400 shrink-0 mt-0.5" /> },
//     ok:    { border: 'border-emerald-500/30', bg: 'bg-emerald-500/10',icon: <CheckCircle size={14} className="text-emerald-400 shrink-0 mt-0.5" /> },
//     info:  { border: 'border-blue-500/30',    bg: 'bg-blue-500/10',   icon: <Lightbulb size={14} className="text-blue-400 shrink-0 mt-0.5" /> },
//   };
//   const s = cfg[type] || cfg.info;
//   return (
//     <div className={`flex gap-3 p-3 rounded-xl border ${s.border} ${s.bg} mb-2`}>
//       {s.icon}
//       <span className="text-sm text-gray-300 leading-relaxed">{text}</span>
//     </div>
//   );
// }

// function Input({ value, onChange, placeholder, type = 'text', className = '' }) {
//   return (
//     <input
//       type={type}
//       value={value}
//       onChange={onChange}
//       placeholder={placeholder}
//       className={`bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-indigo-500/60 focus:bg-white/8 transition ${className}`}
//     />
//   );
// }

// function Btn({ onClick, children, variant = 'primary', className = '', disabled = false }) {
//   const styles = {
//     primary: 'bg-indigo-600 hover:bg-indigo-500 text-white',
//     ghost:   'bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10',
//     danger:  'bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/20',
//   };
//   return (
//     <button
//       onClick={onClick}
//       disabled={disabled}
//       className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition disabled:opacity-40 ${styles[variant]} ${className}`}
//     >
//       {children}
//     </button>
//   );
// }

// // ─── Summary Metrics Bar ──────────────────────────────────────────────────────
// function MetricsBar({ analytics }) {
//   if (!analytics) return null;
//   const surplus = analytics.totalIncome - analytics.totalExpenses;
//   const metrics = [
//     { label: 'Monthly Income',   val: fmt(analytics.totalIncome),   color: 'text-emerald-400', glow: '#10b981' },
//     { label: 'Total Expenses',   val: fmt(analytics.totalExpenses), color: 'text-red-400',     glow: '#ef4444' },
//     { label: 'Savings Rate',     val: analytics.savingsRate + '%',  color: 'text-blue-400',    glow: '#3b82f6' },
//     { label: 'Net Surplus',      val: (surplus >= 0 ? '+' : '') + fmt(surplus), color: surplus >= 0 ? 'text-emerald-400' : 'text-red-400', glow: surplus >= 0 ? '#10b981' : '#ef4444' },
//   ];
//   return (
//     <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
//       {metrics.map(m => (
//         <div key={m.label} className="relative rounded-2xl p-4 border border-white/8 bg-gray-900/40 overflow-hidden group hover:border-white/15 transition">
//           <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition" style={{ background: `radial-gradient(circle at 50% 0%, ${m.glow}15 0%, transparent 70%)` }} />
//           <p className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-1.5">{m.label}</p>
//           <p className={`text-2xl font-bold font-mono ${m.color}`}>{m.val}</p>
//         </div>
//       ))}
//     </div>
//   );
// }

// // ─── Budget Tab ───────────────────────────────────────────────────────────────
// function BudgetTab({ analytics, budgets, setBudgets, addToast }) {
//   const [newCat, setNewCat] = useState('');
//   const [newAmt, setNewAmt] = useState('');
//   const [editing, setEditing] = useState(null);
//   const [editVal, setEditVal] = useState('');

//   // AUTO-SYNC: pull actual spending from analytics
//   const spending = analytics?.categoryBreakdown || {};

//   // Auto-seed: if analytics has categories not yet in budgets, add them with a sensible default
//   useEffect(() => {
//     if (!analytics?.categoryBreakdown) return;
//     const newEntries = {};
//     Object.entries(analytics.categoryBreakdown).forEach(([cat, spent]) => {
//       // Check if this category (or a fuzzy match) already exists in budgets
//       const alreadyExists = Object.keys(budgets).some(
//         b => norm(b) === norm(cat) || norm(b).includes(norm(cat)) || norm(cat).includes(norm(b))
//       );
//       if (!alreadyExists) {
//         // Default budget = 120% of actual spend, rounded to nearest 500
//         newEntries[cat] = Math.ceil((spent * 1.2) / 500) * 500;
//       }
//     });
//     if (Object.keys(newEntries).length > 0) {
//       setBudgets(b => ({ ...newEntries, ...b }));
//     }
//   }, [analytics?.categoryBreakdown]);

//   const handleAdd = () => {
//     if (!newCat.trim() || !newAmt) return;
//     setBudgets(b => ({ ...b, [newCat.trim()]: parseFloat(newAmt) }));
//     setNewCat(''); setNewAmt('');
//     addToast('Budget added', 'success');
//   };

//   const entries = Object.entries(budgets);
//   const totalBudget = entries.reduce((s, [, b]) => s + b, 0);
//   const totalSpent = entries.reduce((s, [c]) => s + getSpent(spending, c), 0);
//   const overCount = entries.filter(([c, b]) => getSpent(spending, c) > b).length;

//   return (
//     <div className="space-y-4">
//       {/* Overview ring summary */}
//       <div className="grid grid-cols-3 gap-3">
//         {[
//           { label: 'Total Budget', val: fmt(totalBudget), color: 'text-indigo-400' },
//           { label: 'Total Spent',  val: fmt(totalSpent),  color: totalSpent > totalBudget ? 'text-red-400' : 'text-white' },
//           { label: 'Over Budget',  val: `${overCount} cats`, color: overCount > 0 ? 'text-amber-400' : 'text-emerald-400' },
//         ].map(m => (
//           <Card key={m.label} className="p-4 text-center">
//             <p className="text-xs text-gray-500 mb-1">{m.label}</p>
//             <p className={`text-lg font-bold font-mono ${m.color}`}>{m.val}</p>
//           </Card>
//         ))}
//       </div>

//       {/* Budget rows */}
//       <Card>
//         <div className="p-5 space-y-5">
//           {entries.map(([cat, budget]) => {
//             const spent = getSpent(spending, cat);
//             const p = pct(spent, budget);
//             const color = CATEGORY_COLORS[cat] || '#6366f1';
//             const tagType = spent > budget ? 'over' : p >= 80 ? 'warn' : 'ok';
//             return (
//               <div key={cat}>
//                 <div className="flex items-center justify-between mb-2">
//                   <div className="flex items-center gap-2">
//                     <div className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
//                     <span className="text-sm font-medium text-gray-200">{cat}</span>
//                     <Badge type={tagType}>{spent > budget ? 'Over' : p >= 80 ? 'Near limit' : 'On track'}</Badge>
//                   </div>
//                   <div className="flex items-center gap-3">
//                     <span className="text-xs font-mono text-gray-400">
//                       {fmt(spent)} <span className="text-gray-600">/</span> {fmt(budget)}
//                     </span>
//                     {editing === cat ? (
//                       <div className="flex items-center gap-1">
//                         <Input value={editVal} onChange={e => setEditVal(e.target.value)} className="w-24 py-1" />
//                         <button onClick={() => { setBudgets(b => ({ ...b, [cat]: parseFloat(editVal) || 0 })); setEditing(null); addToast('Updated', 'success'); }}
//                           className="text-xs px-2 py-1 bg-indigo-600 text-white rounded-lg">✓</button>
//                         <button onClick={() => setEditing(null)} className="text-xs px-2 py-1 bg-white/10 text-gray-300 rounded-lg">✕</button>
//                       </div>
//                     ) : (
//                       <button onClick={() => { setEditing(cat); setEditVal(budget); }} className="text-gray-500 hover:text-gray-300 transition"><Edit3 size={13} /></button>
//                     )}
//                     <button onClick={() => { setBudgets(b => { const n = { ...b }; delete n[cat]; return n; }); addToast('Removed', 'info'); }}
//                       className="text-gray-600 hover:text-red-400 transition"><X size={13} /></button>
//                   </div>
//                 </div>
//                 <div className="flex items-center gap-3">
//                   <GlowBar value={spent} max={budget} color={color} />
//                   <span className="text-xs font-mono text-gray-500 w-10 text-right">{p.toFixed(0)}%</span>
//                 </div>
//               </div>
//             );
//           })}
//         </div>
//         <div className="border-t border-white/5 p-4 flex gap-2">
//           <Input value={newCat} onChange={e => setNewCat(e.target.value)} placeholder="Category name" className="flex-1" />
//           <Input value={newAmt} onChange={e => setNewAmt(e.target.value)} type="number" placeholder="Budget ₹" className="w-32" />
//           <Btn onClick={handleAdd}><Plus size={14} /> Add</Btn>
//         </div>
//       </Card>

//       {/* Spending breakdown chart */}
//       {Object.keys(spending).length > 0 && (
//         <Card className="p-5">
//           <p className="text-xs text-gray-500 uppercase tracking-wider mb-4">Spending breakdown</p>
//           <div className="space-y-3">
//             {Object.entries(spending).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([cat, amt]) => {
//               const maxAmt = Math.max(...Object.values(spending));
//               const color = CATEGORY_COLORS[cat] || '#6366f1';
//               return (
//                 <div key={cat} className="flex items-center gap-3">
//                   <span className="text-xs text-gray-400 w-28 truncate">{cat}</span>
//                   <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
//                     <div className="h-full rounded-full transition-all duration-700"
//                       style={{ width: `${pct(amt, maxAmt)}%`, background: color }} />
//                   </div>
//                   <span className="text-xs font-mono text-gray-300 w-20 text-right">{fmt(amt)}</span>
//                 </div>
//               );
//             })}
//           </div>
//         </Card>
//       )}
//     </div>
//   );
// }

// // ─── Goals Tab ────────────────────────────────────────────────────────────────
// function GoalsTab({ analytics, addToast }) {
//   const [goals, setGoals] = usePersist('goals', [
//     { id: 1, name: 'Emergency Fund', target: 100000, saved: 0, monthly: 2000, emoji: '🛡️' }
//   ]);
//   const [showForm, setShowForm] = useState(false);
//   const [form, setForm] = useState({ name: '', target: '', saved: '', monthly: '', emoji: '🎯' });
//   const surplus = analytics ? analytics.totalIncome - analytics.totalExpenses : 0;

//   const addGoal = () => {
//     if (!form.name || !form.target) return;
//     setGoals(g => [...g, { id: Date.now(), name: form.name, target: +form.target, saved: +form.saved || 0, monthly: +form.monthly || 0, emoji: form.emoji }]);
//     setForm({ name: '', target: '', saved: '', monthly: '', emoji: '🎯' });
//     setShowForm(false);
//     addToast('Goal added!', 'success');
//   };

//   const EMOJIS = ['🎯', '🏠', '🚗', '✈️', '📚', '💍', '🏋️', '🌴', '💻', '🎓'];

//   return (
//     <div className="space-y-4">
//       <div className="flex items-center justify-between">
//         <p className="text-xs text-gray-500 uppercase tracking-wider">Your financial goals</p>
//         <Btn onClick={() => setShowForm(f => !f)} variant={showForm ? 'ghost' : 'primary'}>
//           {showForm ? <X size={13} /> : <Plus size={13} />}
//           {showForm ? 'Cancel' : 'Add goal'}
//         </Btn>
//       </div>

//       {showForm && (
//         <Card className="p-5 space-y-3">
//           <div className="flex flex-wrap gap-2 mb-1">
//             {EMOJIS.map(e => (
//               <button key={e} onClick={() => setForm(f => ({ ...f, emoji: e }))}
//                 className={`w-9 h-9 rounded-xl text-xl transition ${form.emoji === e ? 'bg-indigo-500/30 border border-indigo-500/60' : 'bg-white/5 hover:bg-white/10'}`}>
//                 {e}
//               </button>
//             ))}
//           </div>
//           <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Goal name (e.g. House Down Payment)" className="w-full" />
//           <div className="grid grid-cols-3 gap-2">
//             <Input value={form.target} onChange={e => setForm(f => ({ ...f, target: e.target.value }))} type="number" placeholder="Target ₹" />
//             <Input value={form.saved} onChange={e => setForm(f => ({ ...f, saved: e.target.value }))} type="number" placeholder="Saved so far ₹" />
//             <Input value={form.monthly} onChange={e => setForm(f => ({ ...f, monthly: e.target.value }))} type="number" placeholder="Monthly ₹" />
//           </div>
//           <Btn onClick={addGoal}><CheckCircle size={14} /> Save goal</Btn>
//         </Card>
//       )}

//       {goals.length === 0 && (
//         <Card className="p-10 text-center">
//           <p className="text-4xl mb-3">🎯</p>
//           <p className="text-gray-400 text-sm">No goals yet. Add one to start tracking your dreams.</p>
//         </Card>
//       )}

//       <div className="grid gap-4">
//         {goals.map(g => {
//           const remaining = g.target - g.saved;
//           const monthly = g.monthly || Math.max(500, surplus * 0.3);
//           const months = monthly > 0 && remaining > 0 ? Math.ceil(remaining / monthly) : 0;
//           const p = pct(g.saved, g.target);
//           const circumference = 2 * Math.PI * 28;
//           const dash = circumference * (p / 100);

//           return (
//             <Card key={g.id} className="p-5 hover:border-white/20 transition">
//               <div className="flex items-start gap-4">
//                 <div className="relative w-20 h-20 shrink-0">
//                   <svg className="w-20 h-20 -rotate-90" viewBox="0 0 70 70">
//                     <circle cx="35" cy="35" r="28" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
//                     <circle cx="35" cy="35" r="28" fill="none" stroke="#6366f1" strokeWidth="6"
//                       strokeDasharray={`${dash} ${circumference}`} strokeLinecap="round"
//                       style={{ filter: 'drop-shadow(0 0 6px #6366f180)' }} />
//                   </svg>
//                   <div className="absolute inset-0 flex flex-col items-center justify-center">
//                     <span className="text-xl">{g.emoji}</span>
//                     <span className="text-xs font-bold text-indigo-400">{p.toFixed(0)}%</span>
//                   </div>
//                 </div>
//                 <div className="flex-1 min-w-0">
//                   <div className="flex items-start justify-between mb-1">
//                     <p className="font-semibold text-white">{g.name}</p>
//                     <button onClick={() => { setGoals(gs => gs.filter(x => x.id !== g.id)); addToast('Removed', 'info'); }}
//                       className="text-gray-600 hover:text-red-400 transition ml-2 shrink-0"><X size={14} /></button>
//                   </div>
//                   <p className="text-xs text-gray-500 mb-3">{fmt(g.saved)} saved · {fmt(remaining)} to go</p>
//                   <div className="flex flex-wrap gap-2">
//                     {g.monthly > 0 && <Badge type="info">₹{g.monthly.toLocaleString('en-IN')}/mo</Badge>}
//                     {months > 0 && <Badge type="purple">{months} months · {(months / 12).toFixed(1)} yrs</Badge>}
//                     {months > 0 && months <= 12 && <Badge type="ok">🔥 Almost there!</Badge>}
//                   </div>
//                 </div>
//               </div>
//               <div className="mt-4">
//                 <GlowBar value={g.saved} max={g.target} color="#6366f1" />
//               </div>
//             </Card>
//           );
//         })}
//       </div>
//     </div>
//   );
// }

// // ─── Forecast Tab ─────────────────────────────────────────────────────────────
// function ForecastTab({ analytics }) {
//   const income = analytics?.totalIncome || 50000;
//   const expenses = analytics?.totalExpenses || 40000;
//   const surplus = income - expenses;

//   const data = Array.from({ length: 6 }, (_, i) => ({
//     month: ['M1', 'M2', 'M3', 'M4', 'M5', 'M6'][i],
//     income: Math.round(income * Math.pow(1.01, i)),
//     expenses: Math.round(expenses * Math.pow(1.005, i)),
//     surplus: Math.round((income * Math.pow(1.01, i)) - (expenses * Math.pow(1.005, i))),
//   }));

//   const milestones = [50000, 100000, 200000, 500000, 1000000];

//   const CustomTooltip = ({ active, payload, label }) => {
//     if (!active || !payload?.length) return null;
//     return (
//       <div className="bg-gray-900 border border-white/10 rounded-xl p-3 text-xs">
//         <p className="text-gray-400 mb-2 font-medium">{label}</p>
//         {payload.map(p => (
//           <p key={p.name} style={{ color: p.color }}>{p.name}: {fmt(p.value)}</p>
//         ))}
//       </div>
//     );
//   };

//   return (
//     <div className="space-y-4">
//       <Card className="p-5">
//         <p className="text-xs text-gray-500 uppercase tracking-wider mb-4">6-month cash flow projection</p>
//         <ResponsiveContainer width="100%" height={220}>
//           <AreaChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
//             <defs>
//               <linearGradient id="incG" x1="0" y1="0" x2="0" y2="1">
//                 <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
//                 <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
//               </linearGradient>
//               <linearGradient id="expG" x1="0" y1="0" x2="0" y2="1">
//                 <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
//                 <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
//               </linearGradient>
//             </defs>
//             <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
//             <XAxis dataKey="month" stroke="#4b5563" fontSize={11} />
//             <YAxis stroke="#4b5563" fontSize={11} tickFormatter={v => '₹' + (v / 1000).toFixed(0) + 'k'} />
//             <Tooltip content={<CustomTooltip />} />
//             <Area type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2} fill="url(#incG)" name="Income" />
//             <Area type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} fill="url(#expG)" name="Expenses" />
//           </AreaChart>
//         </ResponsiveContainer>
//         <div className="flex gap-4 mt-3 text-xs text-gray-500">
//           <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-emerald-500 inline-block rounded" /> Income</span>
//           <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-red-500 inline-block rounded" /> Expenses</span>
//         </div>
//       </Card>

//       <Card className="p-5">
//         <p className="text-xs text-gray-500 uppercase tracking-wider mb-4">Savings milestones</p>
//         <div className="space-y-3">
//           {milestones.map(target => {
//             const months = surplus > 0 ? Math.ceil(target / surplus) : null;
//             const done = months !== null && months <= 120;
//             return (
//               <div key={target} className="flex items-center gap-3">
//                 <div className={`w-2 h-2 rounded-full shrink-0 ${done ? 'bg-indigo-400' : 'bg-gray-700'}`} style={done ? { boxShadow: '0 0 6px #6366f180' } : {}} />
//                 <span className="text-sm text-gray-300 flex-1">{fmt(target)}</span>
//                 <span className={`text-sm font-mono font-semibold ${done ? 'text-indigo-400' : 'text-gray-600'}`}>
//                   {surplus <= 0 ? '—' : done ? `~${months} mo` : 'Long-term'}
//                 </span>
//                 {done && months <= 6 && <Badge type="ok">🎯 Soon</Badge>}
//               </div>
//             );
//           })}
//         </div>
//       </Card>
//     </div>
//   );
// }

// // ─── Recurring Tab ────────────────────────────────────────────────────────────
// function RecurringTab({ transactions, addToast }) {
//   const [subs, setSubs] = usePersist('subscriptions', []);
//   const [form, setForm] = useState({ name: '', amount: '', freq: 'Monthly' });

//   const detected = (() => {
//     if (!transactions?.length) return [];
//     const map = {};
//     transactions.filter(t => t.amount < 0).forEach(t => {
//       const key = t.name.toLowerCase().trim().slice(0, 25);
//       if (!map[key]) map[key] = { name: t.name, amounts: [], category: t.category };
//       map[key].amounts.push(Math.abs(t.amount));
//     });
//     return Object.values(map)
//       .filter(r => r.amounts.length >= 2)
//       .map(r => ({ name: r.name, avg: r.amounts.reduce((a, b) => a + b) / r.amounts.length, count: r.amounts.length, auto: true }))
//       .sort((a, b) => b.avg - a.avg).slice(0, 10);
//   })();

//   const all = [...detected, ...subs.map(s => ({ ...s, avg: s.amount, auto: false }))];
//   const total = all.reduce((s, r) => s + r.avg, 0);

//   const addSub = () => {
//     if (!form.name || !form.amount) return;
//     setSubs(s => [...s, { id: Date.now(), name: form.name, amount: +form.amount, freq: form.freq }]);
//     setForm({ name: '', amount: '', freq: 'Monthly' });
//     addToast('Added', 'success');
//   };

//   return (
//     <div className="space-y-4">
//       <div className="flex items-center justify-between">
//         <p className="text-xs text-gray-500 uppercase tracking-wider">Recurring expenses</p>
//         <Badge type="info">Total: {fmt(total)}/mo</Badge>
//       </div>

//       <Card>
//         {!all.length ? (
//           <div className="p-10 text-center">
//             <p className="text-3xl mb-2">📋</p>
//             <p className="text-sm text-gray-500">No recurring expenses detected. Add subscriptions below.</p>
//           </div>
//         ) : (
//           <div className="divide-y divide-white/5">
//             {all.map((r, i) => (
//               <div key={i} className="flex items-center gap-3 px-5 py-3.5 hover:bg-white/3 transition">
//                 <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-base flex-shrink-0">
//                   {r.auto ? '🔁' : '📌'}
//                 </div>
//                 <div className="flex-1 min-w-0">
//                   <p className="text-sm text-gray-200 font-medium truncate">{r.name}</p>
//                   <p className="text-xs text-gray-500">{r.auto ? `Detected · ${r.count}×` : (r.freq || 'Monthly')}</p>
//                 </div>
//                 <p className="text-sm font-mono font-semibold text-red-400">{fmt(r.avg)}</p>
//                 {!r.auto && (
//                   <button onClick={() => { setSubs(s => s.filter(x => x.id !== r.id)); addToast('Removed', 'info'); }}
//                     className="text-gray-600 hover:text-red-400 transition"><X size={14} /></button>
//                 )}
//               </div>
//             ))}
//           </div>
//         )}
//         <div className="border-t border-white/5 p-4">
//           <div className="grid grid-cols-3 gap-2 mb-2">
//             <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Name (Netflix...)" />
//             <Input value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} type="number" placeholder="Amount ₹" />
//             <select value={form.freq} onChange={e => setForm(f => ({ ...f, freq: e.target.value }))}
//               className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-indigo-500/60">
//               <option>Monthly</option><option>Quarterly</option><option>Yearly</option>
//             </select>
//           </div>
//           <Btn onClick={addSub}><Plus size={14} /> Add subscription</Btn>
//         </div>
//       </Card>
//     </div>
//   );
// }

// // ─── Debt Tab ─────────────────────────────────────────────────────────────────
// function DebtTab({ analytics, addToast }) {
//   const [debts, setDebts] = usePersist('debts', []);
//   const [strategy, setStrategy] = usePersist('debtStrategy', 'snowball');
//   const [form, setForm] = useState({ name: '', balance: '', rate: '', min: '' });
//   const surplus = analytics ? Math.max(0, analytics.totalIncome - analytics.totalExpenses) : 5000;
//   const extra = surplus * 0.3;

//   const addDebt = () => {
//     if (!form.name || !form.balance) return;
//     setDebts(d => [...d, { id: Date.now(), name: form.name, balance: +form.balance, rate: +form.rate || 0, min: +form.min || 1000 }]);
//     setForm({ name: '', balance: '', rate: '', min: '' });
//     addToast('Debt added', 'success');
//   };

//   const sorted = [...debts].sort((a, b) =>
//     strategy === 'snowball' ? a.balance - b.balance : b.rate - a.rate
//   );

//   const calcMonths = (debt, extra = 0) => {
//     const pay = debt.min + extra;
//     if (debt.rate === 0) return Math.ceil(debt.balance / pay);
//     const r = debt.rate / 1200;
//     return Math.max(1, Math.ceil(Math.log(pay / (pay - debt.balance * r)) / Math.log(1 + r)));
//   };

//   return (
//     <div className="space-y-4">
//       {debts.length > 0 && (
//         <>
//           <div className="flex items-center justify-between">
//             <p className="text-xs text-gray-500 uppercase tracking-wider">Outstanding debts</p>
//             <div className="flex gap-1 bg-white/5 p-1 rounded-xl border border-white/8">
//               {['snowball', 'avalanche'].map(s => (
//                 <button key={s} onClick={() => setStrategy(s)}
//                   className={`text-xs px-3 py-1.5 rounded-lg transition capitalize ${strategy === s ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'}`}>
//                   {s === 'snowball' ? '⚡ Snowball' : '💰 Avalanche'}
//                 </button>
//               ))}
//             </div>
//           </div>

//           <Card>
//             <div className="p-4 flex items-center justify-between border-b border-white/5">
//               <span className="text-sm text-gray-400">Total outstanding</span>
//               <span className="text-xl font-bold font-mono text-red-400">{fmt(debts.reduce((s, d) => s + d.balance, 0))}</span>
//             </div>
//             <div className="divide-y divide-white/5">
//               {sorted.map((d, i) => {
//                 const months = calcMonths(d, i === 0 ? extra : 0);
//                 return (
//                   <div key={d.id} className="flex items-center gap-3 px-5 py-4">
//                     <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 ${i === 0 ? 'bg-indigo-600' : 'bg-white/10'}`}>{i + 1}</div>
//                     <div className="flex-1 min-w-0">
//                       <p className="text-sm font-medium text-gray-200">{d.name}</p>
//                       <p className="text-xs text-gray-500">{fmt(d.balance)} · {d.rate}% p.a. · min {fmt(d.min)}/mo</p>
//                       {i === 0 && <p className="text-xs text-indigo-400 mt-0.5">← Focus extra {fmt(extra)}/mo here</p>}
//                     </div>
//                     <Badge type={i === 0 ? 'purple' : 'default'}>{months} mo</Badge>
//                     <button onClick={() => { setDebts(ds => ds.filter(x => x.id !== d.id)); addToast('Removed', 'info'); }}
//                       className="text-gray-600 hover:text-red-400 transition"><X size={14} /></button>
//                   </div>
//                 );
//               })}
//             </div>
//           </Card>
//         </>
//       )}

//       <Card className="p-5">
//         <p className="text-sm font-medium text-gray-300 mb-4">Add a debt</p>
//         <div className="grid grid-cols-2 gap-3 mb-3">
//           <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Debt name" className="col-span-2" />
//           <Input value={form.balance} onChange={e => setForm(f => ({ ...f, balance: e.target.value }))} type="number" placeholder="Balance ₹" />
//           <Input value={form.rate} onChange={e => setForm(f => ({ ...f, rate: e.target.value }))} type="number" placeholder="Interest % p.a." />
//           <Input value={form.min} onChange={e => setForm(f => ({ ...f, min: e.target.value }))} type="number" placeholder="Min payment ₹" />
//         </div>
//         <Btn onClick={addDebt}><Plus size={14} /> Add debt</Btn>
//       </Card>
//     </div>
//   );
// }

// // ─── What-If Tab ──────────────────────────────────────────────────────────────
// function WhatIfTab({ analytics, budgets }) {
//   const [goals] = usePersist('goals', []);
//   const spending = analytics?.categoryBreakdown || {};
//   const income = analytics?.totalIncome || 50000;
//   const expenses = analytics?.totalExpenses || 40000;
//   const surplus = income - expenses;

//   const topCats = Object.entries(budgets).slice(0, 5);
//   const [adjustments, setAdjustments] = useState(() => Object.fromEntries(topCats.map(([c]) => [c, 0])));

//   const totalAdj = Object.values(adjustments).reduce((s, v) => s + v, 0);
//   const newExpenses = expenses + totalAdj;
//   const newSurplus = income - newExpenses;
//   const diff = newSurplus - surplus;
//   const newRate = income > 0 ? (newSurplus / income * 100).toFixed(1) : '0';

//   return (
//     <div className="space-y-4">
//       <Card className="p-5">
//         <div className="flex items-center justify-between mb-5">
//           <p className="text-xs text-gray-500 uppercase tracking-wider">Adjust spending to see impact</p>
//           <button onClick={() => setAdjustments(Object.fromEntries(topCats.map(([c]) => [c, 0])))}
//             className="text-xs text-gray-500 hover:text-gray-300 transition flex items-center gap-1">
//             <RefreshCw size={11} /> Reset
//           </button>
//         </div>
//         {topCats.map(([cat, budget]) => {
//           const spent = getSpent(spending, cat);
//           const max = Math.max(spent, budget, 2000);
//           const val = adjustments[cat] || 0;
//           const color = CATEGORY_COLORS[cat] || '#6366f1';
//           return (
//             <div key={cat} className="mb-5">
//               <div className="flex items-center justify-between mb-2">
//                 <div className="flex items-center gap-2">
//                   <div className="w-2 h-2 rounded-full" style={{ background: color }} />
//                   <span className="text-sm text-gray-300">{cat}</span>
//                 </div>
//                 <span className={`text-sm font-mono font-semibold ${val === 0 ? 'text-gray-500' : val < 0 ? 'text-emerald-400' : 'text-red-400'}`}>
//                   {val === 0 ? 'unchanged' : (val > 0 ? '+' : '') + fmt(val)}
//                 </span>
//               </div>
//               <input type="range" min={-max} max={max} step={100} value={val}
//                 onChange={e => setAdjustments(a => ({ ...a, [cat]: +e.target.value }))}
//                 className="w-full h-1.5 rounded-full appearance-none bg-white/10 accent-indigo-500" />
//             </div>
//           );
//         })}
//       </Card>

//       <div className="grid grid-cols-3 gap-3">
//         {[
//           { label: 'New surplus', val: fmt(newSurplus), color: newSurplus >= 0 ? 'text-emerald-400' : 'text-red-400' },
//           { label: 'Monthly change', val: (diff >= 0 ? '+' : '') + fmt(diff), color: diff >= 0 ? 'text-emerald-400' : 'text-red-400' },
//           { label: 'New savings rate', val: newRate + '%', color: parseFloat(newRate) >= 20 ? 'text-emerald-400' : parseFloat(newRate) >= 10 ? 'text-amber-400' : 'text-red-400' },
//         ].map(m => (
//           <Card key={m.label} className="p-4 text-center">
//             <p className="text-xs text-gray-500 mb-1">{m.label}</p>
//             <p className={`text-xl font-bold font-mono ${m.color}`}>{m.val}</p>
//           </Card>
//         ))}
//       </div>

//       {diff !== 0 && (
//         <AlertBox
//           type={diff > 0 ? 'ok' : 'warn'}
//           text={diff > 0
//             ? `This change saves you an extra ${fmt(diff * 12)}/year. In 5 years: ${fmt(diff * 60)} more saved.`
//             : `This costs ${fmt(Math.abs(diff) * 12)} more per year. Confirm it's worth the trade-off.`}
//         />
//       )}
//     </div>
//   );
// }

// // ─── AI Chat Tab ──────────────────────────────────────────────────────────────
// function AIChatTab({ analytics, budgets, transactions, addToast }) {
//   const [goals] = usePersist('goals', []);
//   const [debts] = usePersist('debts', []);
//   const [subs] = usePersist('subscriptions', []);
//   const [messages, setMessages] = useState([
//     { role: 'assistant', content: "Hi! I'm your AI financial advisor. Ask me anything about your finances — from saving strategies to investment tips tailored for India." }
//   ]);
//   const [input, setInput] = useState('');
//   const [loading, setLoading] = useState(false);
//   const endRef = React.useRef(null);

//   useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

//   const buildContext = () => {
//     if (!analytics) return 'No transaction data loaded yet.';
//     const spending = analytics.categoryBreakdown || {};
//     const topCats = Object.entries(spending).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([c, v]) => `${c}: ₹${Math.round(v).toLocaleString('en-IN')}`).join(', ');
//     const budgetStatus = Object.entries(budgets).map(([cat, b]) => {
//       const s = spending[cat] || 0;
//       return `${cat}: ₹${Math.round(s).toLocaleString('en-IN')}/₹${Math.round(b).toLocaleString('en-IN')} (${pct(s, b).toFixed(0)}%)`;
//     }).join('; ');
//     return [
//       `Monthly income: ₹${Math.round(analytics.totalIncome).toLocaleString('en-IN')}`,
//       `Monthly expenses: ₹${Math.round(analytics.totalExpenses).toLocaleString('en-IN')}`,
//       `Savings rate: ${analytics.savingsRate}%`,
//       `Net surplus: ₹${Math.round(analytics.totalIncome - analytics.totalExpenses).toLocaleString('en-IN')}`,
//       `Top spending: ${topCats}`,
//       `Budget status: ${budgetStatus}`,
//       `Goals: ${goals.map(g => `${g.name} (${pct(g.saved, g.target).toFixed(0)}%)`).join(', ') || 'None set'}`,
//       `Debts: ${debts.map(d => `${d.name}: ₹${d.balance.toLocaleString('en-IN')} @ ${d.rate}%`).join(', ') || 'None'}`,
//       `Monthly subscriptions: ₹${subs.reduce((s, r) => s + r.amount, 0).toLocaleString('en-IN')}`,
//     ].join('\n');
//   };

//   const QUICK = [
//     { label: '📊 Full analysis',     prompt: 'Analyze my complete financial picture. Give me a prioritized action plan with specific steps in ₹.' },
//     { label: '💰 Savings plan',      prompt: 'Create a specific monthly savings plan for me. Tell me exactly how much to save and in which instruments (SIPs, FDs, PPF, NPS, ELSS).' },
//     { label: '✂️ Cut expenses',      prompt: 'Which categories should I cut and by how much? Give practical tips with specific ₹ targets.' },
//     { label: '📈 Investment advice', prompt: 'Based on my surplus, recommend specific investment options for an Indian investor with exact allocation amounts.' },
//   ];

//   const ask = async (userMsg) => {
//     if (!userMsg.trim()) return;
//     const newMessages = [...messages, { role: 'user', content: userMsg }];
//     setMessages(newMessages);
//     setInput('');
//     setLoading(true);

//     const conversationHistory = newMessages.map(m => ({
//       role: m.role === 'assistant' ? 'assistant' : 'user',
//       content: m.content
//     }));

//     try {
//       const res = await fetch('https://api.anthropic.com/v1/messages', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           model: 'claude-sonnet-4-20250514',
//           max_tokens: 1000,
//           system: `You are a senior personal finance advisor specializing in Indian personal finance (SIPs, PPF, NPS, FDs, ELSS, tax-saving under 80C, etc.).
// Be specific, actionable, and always reference real numbers from the user's data. Use ₹ for currency. 
// Keep responses concise (under 350 words). Use bullet points for action items. Be encouraging but realistic.

// USER'S FINANCIAL DATA:
// ${buildContext()}`,
//           messages: conversationHistory
//         })
//       });
//       const data = await res.json();
//       const reply = data.content?.[0]?.text || 'Sorry, I could not process that. Please try again.';
//       setMessages(m => [...m, { role: 'assistant', content: reply }]);
//     } catch (e) {
//       setMessages(m => [...m, { role: 'assistant', content: 'Connection error. Please check your network and try again.' }]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="space-y-3">
//       {/* Quick prompts */}
//       <div className="flex flex-wrap gap-2">
//         {QUICK.map(q => (
//           <button key={q.label} onClick={() => ask(q.prompt)} disabled={loading}
//             className="text-xs px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 transition disabled:opacity-40">
//             {q.label}
//           </button>
//         ))}
//       </div>

//       {/* Chat window */}
//       <Card className="flex flex-col" style={{ height: '420px' }}>
//         <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
//           {messages.map((m, i) => (
//             <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
//               <div className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs shrink-0 font-bold ${m.role === 'assistant' ? 'bg-indigo-600 text-white' : 'bg-white/10 text-gray-300'}`}>
//                 {m.role === 'assistant' ? 'AI' : 'Me'}
//               </div>
//               <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
//                 m.role === 'assistant'
//                   ? 'bg-white/5 text-gray-200 rounded-tl-sm'
//                   : 'bg-indigo-600/80 text-white rounded-tr-sm'
//               }`}>
//                 {m.content}
//               </div>
//             </div>
//           ))}
//           {loading && (
//             <div className="flex gap-3">
//               <div className="w-7 h-7 rounded-xl bg-indigo-600 flex items-center justify-center text-xs font-bold text-white shrink-0">AI</div>
//               <div className="bg-white/5 px-4 py-3 rounded-2xl rounded-tl-sm">
//                 <div className="flex gap-1.5 items-center h-5">
//                   {[0, 1, 2].map(i => (
//                     <div key={i} className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce"
//                       style={{ animationDelay: `${i * 0.15}s` }} />
//                   ))}
//                 </div>
//               </div>
//             </div>
//           )}
//           <div ref={endRef} />
//         </div>
//         <div className="border-t border-white/5 p-3 flex gap-2">
//           <Input
//             value={input}
//             onChange={e => setInput(e.target.value)}
//             placeholder="Ask anything about your finances..."
//             className="flex-1"
//           />
//           <button
//             onClick={() => { if (input.trim() && !loading) ask(input); }}
//             disabled={loading || !input.trim()}
//             className="w-9 h-9 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 flex items-center justify-center transition shrink-0"
//           >
//             <Send size={14} className="text-white" />
//           </button>
//         </div>
//       </Card>

//       {/* Rule-based smart insights */}
//       {analytics && (
//         <Card className="p-5">
//           <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">Auto insights</p>
//           {(() => {
//             const ins = [];
//             const rate = parseFloat(analytics.savingsRate);
//             if (rate < 10) ins.push({ type: 'warn', text: `Savings rate is ${rate}% — critically low. Target 20%+. Cut your top non-essential category first.` });
//             else if (rate >= 20) ins.push({ type: 'ok', text: `${rate}% savings rate — excellent! You're in the top tier of financial health.` });
//             else ins.push({ type: 'info', text: `${rate}% savings rate is decent. A small push to 20% will compound significantly over time.` });
//             const topCat = Object.entries(analytics.categoryBreakdown || {}).sort((a, b) => b[1] - a[1])[0];
//             if (topCat) ins.push({ type: 'info', text: `Biggest spend: ${topCat[0]} at ${fmt(topCat[1])}. A 10% cut here saves ${fmt(topCat[1] * 0.1 * 12)}/year.` });
//             if (analytics.totalExpenses > analytics.totalIncome) ins.push({ type: 'warn', text: `Spending ${fmt(analytics.totalExpenses - analytics.totalIncome)} more than you earn. This is urgent — review immediately.` });
//             if (!ins.length) ins.push({ type: 'ok', text: 'Your finances look healthy! Keep up the discipline.' });
//             return ins.map((i, idx) => <AlertBox key={idx} {...i} />);
//           })()}
//         </Card>
//       )}
//     </div>
//   );
// }

// // ─── Main Component ───────────────────────────────────────────────────────────
// export default function PlanningSection({ analytics, dark, addToast, budgets, setBudgets, transactions }) {
//   const [activeTab, setActiveTab] = useState('budget');

//   return (
//     <div className="min-h-screen bg-gray-950 text-white font-sans" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
//       {/* Ambient glow background */}
//       <div className="fixed inset-0 pointer-events-none overflow-hidden">
//         <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/5 rounded-full blur-3xl" />
//         <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/5 rounded-full blur-3xl" />
//       </div>

//       <div className="relative">
//         {/* Metrics */}
//         <MetricsBar analytics={analytics} />

//         {/* Tab bar */}
//         <div className="flex gap-1 mb-6 p-1 rounded-2xl bg-gray-900/60 border border-white/5 w-fit overflow-x-auto">
//           {TAB_LIST.map(({ id, label, icon: Icon }) => (
//             <button key={id} onClick={() => setActiveTab(id)}
//               className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition whitespace-nowrap ${
//                 activeTab === id
//                   ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
//                   : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
//               }`}>
//               <Icon size={14} />{label}
//             </button>
//           ))}
//         </div>

//         {/* Tab content */}
//         <div className="tab-content">
//           {activeTab === 'budget'    && <BudgetTab    analytics={analytics} budgets={budgets} setBudgets={setBudgets} addToast={addToast} />}
//           {activeTab === 'goals'     && <GoalsTab     analytics={analytics} addToast={addToast} />}
//           {activeTab === 'forecast'  && <ForecastTab  analytics={analytics} />}
//           {activeTab === 'recurring' && <RecurringTab transactions={transactions || []} addToast={addToast} />}
//           {activeTab === 'debt'      && <DebtTab      analytics={analytics} addToast={addToast} />}
//           {activeTab === 'whatif'    && <WhatIfTab    analytics={analytics} budgets={budgets} />}
//           {activeTab === 'insights'  && <AIChatTab    analytics={analytics} budgets={budgets} transactions={transactions || []} addToast={addToast} />}
//         </div>
//       </div>
//     </div>
//   );
// }



//------------------------------------------------------------------------------------------------------
// import React, { useState, useCallback, useEffect } from 'react';
// import {
//   Plus, X, Target, CheckCircle, TrendingUp,
//   PiggyBank, CreditCard, Zap, Edit3,
//   BarChart2, Lightbulb, AlertCircle,
//   ArrowUpRight, Repeat, RefreshCw, ChevronRight,
//   Flame, Shield, Sparkles, Send
// } from 'lucide-react';
// import {
//   AreaChart, Area, BarChart, Bar, XAxis, YAxis,
//   CartesianGrid, Tooltip, ResponsiveContainer
// } from 'recharts';

// // ─── Constants ────────────────────────────────────────────────────────────────
// const LS_KEY = 'fin_planning_v3';

// const BUDGET_DEFAULTS = {
//   'Food & Dining': 5000,
//   'Shopping': 8000,
//   'Transport': 3000,
//   'Entertainment': 2000,
//   'Utilities': 2500,
//   'Healthcare': 2000,
//   'Groceries': 4000,
//   'Other': 3000,
// };

// const TAB_LIST = [
//   { id: 'budget',    label: 'Budget',     icon: Target },
//   { id: 'goals',     label: 'Goals',      icon: PiggyBank },
//   { id: 'forecast',  label: 'Forecast',   icon: BarChart2 },
//   { id: 'recurring', label: 'Recurring',  icon: Repeat },
//   { id: 'debt',      label: 'Debt',       icon: CreditCard },
//   { id: 'whatif',    label: 'What-If',    icon: Zap },
//   { id: 'insights',  label: 'AI Chat',    icon: Sparkles },
// ];

// const CATEGORY_COLORS = {
//   'Food & Dining': '#f97316',
//   'Shopping': '#8b5cf6',
//   'Transport': '#3b82f6',
//   'Entertainment': '#ec4899',
//   'Utilities': '#14b8a6',
//   'Healthcare': '#10b981',
//   'Groceries': '#f59e0b',
//   'Other': '#6b7280',
// };

// // ─── Helpers ──────────────────────────────────────────────────────────────────
// const fmt = (n) => '₹' + Math.round(n).toLocaleString('en-IN');
// const pct = (v, t) => (t > 0 ? Math.min(100, (v / t) * 100) : 0);
// const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

// // Normalize a category string for fuzzy matching: lowercase, strip spaces/punctuation
// const norm = (s) => (s || '').toLowerCase().replace(/[^a-z0-9]/g, '');

// // Look up actual spending for a budget category, tolerating name mismatches.
// // e.g. budget key "Food & Dining" will match breakdown key "food&dining", "Food and Dining", "food", etc.
// function getSpent(spending, budgetCat) {
//   // 1. Exact match first
//   if (spending[budgetCat] !== undefined) return spending[budgetCat];
//   const nBudget = norm(budgetCat);
//   // 2. Normalized exact match
//   for (const [k, v] of Object.entries(spending)) {
//     if (norm(k) === nBudget) return v;
//   }
//   // 3. One contains the other (e.g. "Food" matches "Food & Dining")
//   for (const [k, v] of Object.entries(spending)) {
//     const nK = norm(k);
//     if (nK.includes(nBudget) || nBudget.includes(nK)) return v;
//   }
//   return 0;
// }

// function loadState() {
//   try { const r = localStorage.getItem(LS_KEY); return r ? JSON.parse(r) : {}; } catch { return {}; }
// }
// function saveState(patch) {
//   try { localStorage.setItem(LS_KEY, JSON.stringify({ ...loadState(), ...patch })); } catch {}
// }
// function usePersist(key, initial) {
//   const [val, setVal] = useState(() => { const s = loadState(); return s[key] !== undefined ? s[key] : initial; });
//   const set = useCallback((next) => {
//     setVal(prev => {
//       const v = typeof next === 'function' ? next(prev) : next;
//       saveState({ [key]: v });
//       return v;
//     });
//   }, [key]);
//   return [val, set];
// }

// // ─── Design Primitives ────────────────────────────────────────────────────────

// function Card({ children, className = '', glass = false }) {
//   return (
//     <div className={`rounded-2xl border border-white/10 ${glass ? 'bg-white/5 backdrop-blur-sm' : 'bg-gray-900/60'} ${className}`}>
//       {children}
//     </div>
//   );
// }

// function GlowBar({ value, max, color = '#6366f1' }) {
//   const p = clamp(pct(value, max), 0, 100);
//   const isOver = value > max;
//   const barColor = isOver ? '#ef4444' : p > 80 ? '#f59e0b' : color;
//   return (
//     <div className="relative h-2 rounded-full bg-white/10 overflow-hidden">
//       <div
//         className="h-full rounded-full transition-all duration-700 ease-out"
//         style={{
//           width: `${p}%`,
//           background: `linear-gradient(90deg, ${barColor}88, ${barColor})`,
//           boxShadow: `0 0 8px ${barColor}60`,
//         }}
//       />
//     </div>
//   );
// }

// function Badge({ children, type = 'default' }) {
//   const styles = {
//     over:    'bg-red-500/20 text-red-300 border-red-500/30',
//     warn:    'bg-amber-500/20 text-amber-300 border-amber-500/30',
//     ok:      'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
//     info:    'bg-blue-500/20 text-blue-300 border-blue-500/30',
//     purple:  'bg-purple-500/20 text-purple-300 border-purple-500/30',
//     default: 'bg-white/10 text-gray-300 border-white/20',
//   };
//   return (
//     <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${styles[type]}`}>
//       {children}
//     </span>
//   );
// }

// function AlertBox({ type, text }) {
//   const cfg = {
//     warn:  { border: 'border-amber-500/30',  bg: 'bg-amber-500/10',  icon: <AlertCircle size={14} className="text-amber-400 shrink-0 mt-0.5" /> },
//     ok:    { border: 'border-emerald-500/30', bg: 'bg-emerald-500/10',icon: <CheckCircle size={14} className="text-emerald-400 shrink-0 mt-0.5" /> },
//     info:  { border: 'border-blue-500/30',    bg: 'bg-blue-500/10',   icon: <Lightbulb size={14} className="text-blue-400 shrink-0 mt-0.5" /> },
//   };
//   const s = cfg[type] || cfg.info;
//   return (
//     <div className={`flex gap-3 p-3 rounded-xl border ${s.border} ${s.bg} mb-2`}>
//       {s.icon}
//       <span className="text-sm text-gray-300 leading-relaxed">{text}</span>
//     </div>
//   );
// }

// function Input({ value, onChange, placeholder, type = 'text', className = '' }) {
//   return (
//     <input
//       type={type}
//       value={value}
//       onChange={onChange}
//       placeholder={placeholder}
//       className={`bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-indigo-500/60 focus:bg-white/8 transition ${className}`}
//     />
//   );
// }

// function Btn({ onClick, children, variant = 'primary', className = '', disabled = false }) {
//   const styles = {
//     primary: 'bg-indigo-600 hover:bg-indigo-500 text-white',
//     ghost:   'bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10',
//     danger:  'bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/20',
//   };
//   return (
//     <button
//       onClick={onClick}
//       disabled={disabled}
//       className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition disabled:opacity-40 ${styles[variant]} ${className}`}
//     >
//       {children}
//     </button>
//   );
// }

// // ─── Summary Metrics Bar ──────────────────────────────────────────────────────
// function MetricsBar({ analytics }) {
//   if (!analytics) return null;
//   const surplus = analytics.totalIncome - analytics.totalExpenses;
//   const metrics = [
//     { label: 'Monthly Income',   val: fmt(analytics.totalIncome),   color: 'text-emerald-400', glow: '#10b981' },
//     { label: 'Total Expenses',   val: fmt(analytics.totalExpenses), color: 'text-red-400',     glow: '#ef4444' },
//     { label: 'Savings Rate',     val: analytics.savingsRate + '%',  color: 'text-blue-400',    glow: '#3b82f6' },
//     { label: 'Net Surplus',      val: (surplus >= 0 ? '+' : '') + fmt(surplus), color: surplus >= 0 ? 'text-emerald-400' : 'text-red-400', glow: surplus >= 0 ? '#10b981' : '#ef4444' },
//   ];
//   return (
//     <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
//       {metrics.map(m => (
//         <div key={m.label} className="relative rounded-2xl p-4 border border-white/8 bg-gray-900/40 overflow-hidden group hover:border-white/15 transition">
//           <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition" style={{ background: `radial-gradient(circle at 50% 0%, ${m.glow}15 0%, transparent 70%)` }} />
//           <p className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-1.5">{m.label}</p>
//           <p className={`text-2xl font-bold font-mono ${m.color}`}>{m.val}</p>
//         </div>
//       ))}
//     </div>
//   );
// }

// // ─── Budget Tab ───────────────────────────────────────────────────────────────
// function BudgetTab({ analytics, budgets, setBudgets, addToast }) {
//   const [newCat, setNewCat] = useState('');
//   const [newAmt, setNewAmt] = useState('');
//   const [editing, setEditing] = useState(null);
//   const [editVal, setEditVal] = useState('');

//   // AUTO-SYNC: pull actual spending from analytics
//   const spending = analytics?.categoryBreakdown || {};

//   // Auto-seed: if analytics has categories not yet in budgets, add them with a sensible default
//   useEffect(() => {
//     if (!analytics?.categoryBreakdown) return;
//     const newEntries = {};
//     Object.entries(analytics.categoryBreakdown).forEach(([cat, spent]) => {
//       // Check if this category (or a fuzzy match) already exists in budgets
//       const alreadyExists = Object.keys(budgets).some(
//         b => norm(b) === norm(cat) || norm(b).includes(norm(cat)) || norm(cat).includes(norm(b))
//       );
//       if (!alreadyExists) {
//         // Default budget = 120% of actual spend, rounded to nearest 500
//         newEntries[cat] = Math.ceil((spent * 1.2) / 500) * 500;
//       }
//     });
//     if (Object.keys(newEntries).length > 0) {
//       setBudgets(b => ({ ...newEntries, ...b }));
//     }
//   }, [analytics?.categoryBreakdown]);

//   const handleAdd = () => {
//     if (!newCat.trim() || !newAmt) return;
//     setBudgets(b => ({ ...b, [newCat.trim()]: parseFloat(newAmt) }));
//     setNewCat(''); setNewAmt('');
//     addToast('Budget added', 'success');
//   };

//   const entries = Object.entries(budgets);
//   const totalBudget = entries.reduce((s, [, b]) => s + b, 0);
//   const totalSpent = entries.reduce((s, [c]) => s + getSpent(spending, c), 0);
//   const overCount = entries.filter(([c, b]) => getSpent(spending, c) > b).length;

//   return (
//     <div className="space-y-4">
//       {/* Overview ring summary */}
//       <div className="grid grid-cols-3 gap-3">
//         {[
//           { label: 'Total Budget', val: fmt(totalBudget), color: 'text-indigo-400' },
//           { label: 'Total Spent',  val: fmt(totalSpent),  color: totalSpent > totalBudget ? 'text-red-400' : 'text-white' },
//           { label: 'Over Budget',  val: `${overCount} cats`, color: overCount > 0 ? 'text-amber-400' : 'text-emerald-400' },
//         ].map(m => (
//           <Card key={m.label} className="p-4 text-center">
//             <p className="text-xs text-gray-500 mb-1">{m.label}</p>
//             <p className={`text-lg font-bold font-mono ${m.color}`}>{m.val}</p>
//           </Card>
//         ))}
//       </div>

//       {/* Budget rows */}
//       <Card>
//         <div className="p-5 space-y-5">
//           {entries.map(([cat, budget]) => {
//             const spent = getSpent(spending, cat);
//             const p = pct(spent, budget);
//             const color = CATEGORY_COLORS[cat] || '#6366f1';
//             const tagType = spent > budget ? 'over' : p >= 80 ? 'warn' : 'ok';
//             return (
//               <div key={cat}>
//                 <div className="flex items-center justify-between mb-2">
//                   <div className="flex items-center gap-2">
//                     <div className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
//                     <span className="text-sm font-medium text-gray-200">{cat}</span>
//                     <Badge type={tagType}>{spent > budget ? 'Over' : p >= 80 ? 'Near limit' : 'On track'}</Badge>
//                   </div>
//                   <div className="flex items-center gap-3">
//                     <span className="text-xs font-mono text-gray-400">
//                       {fmt(spent)} <span className="text-gray-600">/</span> {fmt(budget)}
//                     </span>
//                     {editing === cat ? (
//                       <div className="flex items-center gap-1">
//                         <Input value={editVal} onChange={e => setEditVal(e.target.value)} className="w-24 py-1" />
//                         <button onClick={() => { setBudgets(b => ({ ...b, [cat]: parseFloat(editVal) || 0 })); setEditing(null); addToast('Updated', 'success'); }}
//                           className="text-xs px-2 py-1 bg-indigo-600 text-white rounded-lg">✓</button>
//                         <button onClick={() => setEditing(null)} className="text-xs px-2 py-1 bg-white/10 text-gray-300 rounded-lg">✕</button>
//                       </div>
//                     ) : (
//                       <button onClick={() => { setEditing(cat); setEditVal(budget); }} className="text-gray-500 hover:text-gray-300 transition"><Edit3 size={13} /></button>
//                     )}
//                     <button onClick={() => { setBudgets(b => { const n = { ...b }; delete n[cat]; return n; }); addToast('Removed', 'info'); }}
//                       className="text-gray-600 hover:text-red-400 transition"><X size={13} /></button>
//                   </div>
//                 </div>
//                 <div className="flex items-center gap-3">
//                   <GlowBar value={spent} max={budget} color={color} />
//                   <span className="text-xs font-mono text-gray-500 w-10 text-right">{p.toFixed(0)}%</span>
//                 </div>
//               </div>
//             );
//           })}
//         </div>
//         <div className="border-t border-white/5 p-4 flex gap-2">
//           <Input value={newCat} onChange={e => setNewCat(e.target.value)} placeholder="Category name" className="flex-1" />
//           <Input value={newAmt} onChange={e => setNewAmt(e.target.value)} type="number" placeholder="Budget ₹" className="w-32" />
//           <Btn onClick={handleAdd}><Plus size={14} /> Add</Btn>
//         </div>
//       </Card>

//       {/* Spending breakdown chart */}
//       {Object.keys(spending).length > 0 && (
//         <Card className="p-5">
//           <p className="text-xs text-gray-500 uppercase tracking-wider mb-4">Spending breakdown</p>
//           <div className="space-y-3">
//             {Object.entries(spending).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([cat, amt]) => {
//               const maxAmt = Math.max(...Object.values(spending));
//               const color = CATEGORY_COLORS[cat] || '#6366f1';
//               return (
//                 <div key={cat} className="flex items-center gap-3">
//                   <span className="text-xs text-gray-400 w-28 truncate">{cat}</span>
//                   <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
//                     <div className="h-full rounded-full transition-all duration-700"
//                       style={{ width: `${pct(amt, maxAmt)}%`, background: color }} />
//                   </div>
//                   <span className="text-xs font-mono text-gray-300 w-20 text-right">{fmt(amt)}</span>
//                 </div>
//               );
//             })}
//           </div>
//         </Card>
//       )}
//     </div>
//   );
// }

// // ─── Goals Tab ────────────────────────────────────────────────────────────────
// function GoalsTab({ analytics, addToast }) {
//   const [goals, setGoals] = usePersist('goals', [
//     { id: 1, name: 'Emergency Fund', target: 100000, saved: 0, monthly: 2000, emoji: '🛡️' }
//   ]);
//   const [showForm, setShowForm] = useState(false);
//   const [form, setForm] = useState({ name: '', target: '', saved: '', monthly: '', emoji: '🎯' });
//   const surplus = analytics ? analytics.totalIncome - analytics.totalExpenses : 0;

//   const addGoal = () => {
//     if (!form.name || !form.target) return;
//     setGoals(g => [...g, { id: Date.now(), name: form.name, target: +form.target, saved: +form.saved || 0, monthly: +form.monthly || 0, emoji: form.emoji }]);
//     setForm({ name: '', target: '', saved: '', monthly: '', emoji: '🎯' });
//     setShowForm(false);
//     addToast('Goal added!', 'success');
//   };

//   const EMOJIS = ['🎯', '🏠', '🚗', '✈️', '📚', '💍', '🏋️', '🌴', '💻', '🎓'];

//   return (
//     <div className="space-y-4">
//       <div className="flex items-center justify-between">
//         <p className="text-xs text-gray-500 uppercase tracking-wider">Your financial goals</p>
//         <Btn onClick={() => setShowForm(f => !f)} variant={showForm ? 'ghost' : 'primary'}>
//           {showForm ? <X size={13} /> : <Plus size={13} />}
//           {showForm ? 'Cancel' : 'Add goal'}
//         </Btn>
//       </div>

//       {showForm && (
//         <Card className="p-5 space-y-3">
//           <div className="flex flex-wrap gap-2 mb-1">
//             {EMOJIS.map(e => (
//               <button key={e} onClick={() => setForm(f => ({ ...f, emoji: e }))}
//                 className={`w-9 h-9 rounded-xl text-xl transition ${form.emoji === e ? 'bg-indigo-500/30 border border-indigo-500/60' : 'bg-white/5 hover:bg-white/10'}`}>
//                 {e}
//               </button>
//             ))}
//           </div>
//           <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Goal name (e.g. House Down Payment)" className="w-full" />
//           <div className="grid grid-cols-3 gap-2">
//             <Input value={form.target} onChange={e => setForm(f => ({ ...f, target: e.target.value }))} type="number" placeholder="Target ₹" />
//             <Input value={form.saved} onChange={e => setForm(f => ({ ...f, saved: e.target.value }))} type="number" placeholder="Saved so far ₹" />
//             <Input value={form.monthly} onChange={e => setForm(f => ({ ...f, monthly: e.target.value }))} type="number" placeholder="Monthly ₹" />
//           </div>
//           <Btn onClick={addGoal}><CheckCircle size={14} /> Save goal</Btn>
//         </Card>
//       )}

//       {goals.length === 0 && (
//         <Card className="p-10 text-center">
//           <p className="text-4xl mb-3">🎯</p>
//           <p className="text-gray-400 text-sm">No goals yet. Add one to start tracking your dreams.</p>
//         </Card>
//       )}

//       <div className="grid gap-4">
//         {goals.map(g => {
//           const remaining = g.target - g.saved;
//           const monthly = g.monthly || Math.max(500, surplus * 0.3);
//           const months = monthly > 0 && remaining > 0 ? Math.ceil(remaining / monthly) : 0;
//           const p = pct(g.saved, g.target);
//           const circumference = 2 * Math.PI * 28;
//           const dash = circumference * (p / 100);

//           return (
//             <Card key={g.id} className="p-5 hover:border-white/20 transition">
//               <div className="flex items-start gap-4">
//                 <div className="relative w-20 h-20 shrink-0">
//                   <svg className="w-20 h-20 -rotate-90" viewBox="0 0 70 70">
//                     <circle cx="35" cy="35" r="28" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
//                     <circle cx="35" cy="35" r="28" fill="none" stroke="#6366f1" strokeWidth="6"
//                       strokeDasharray={`${dash} ${circumference}`} strokeLinecap="round"
//                       style={{ filter: 'drop-shadow(0 0 6px #6366f180)' }} />
//                   </svg>
//                   <div className="absolute inset-0 flex flex-col items-center justify-center">
//                     <span className="text-xl">{g.emoji}</span>
//                     <span className="text-xs font-bold text-indigo-400">{p.toFixed(0)}%</span>
//                   </div>
//                 </div>
//                 <div className="flex-1 min-w-0">
//                   <div className="flex items-start justify-between mb-1">
//                     <p className="font-semibold text-white">{g.name}</p>
//                     <button onClick={() => { setGoals(gs => gs.filter(x => x.id !== g.id)); addToast('Removed', 'info'); }}
//                       className="text-gray-600 hover:text-red-400 transition ml-2 shrink-0"><X size={14} /></button>
//                   </div>
//                   <p className="text-xs text-gray-500 mb-3">{fmt(g.saved)} saved · {fmt(remaining)} to go</p>
//                   <div className="flex flex-wrap gap-2">
//                     {g.monthly > 0 && <Badge type="info">₹{g.monthly.toLocaleString('en-IN')}/mo</Badge>}
//                     {months > 0 && <Badge type="purple">{months} months · {(months / 12).toFixed(1)} yrs</Badge>}
//                     {months > 0 && months <= 12 && <Badge type="ok">🔥 Almost there!</Badge>}
//                   </div>
//                 </div>
//               </div>
//               <div className="mt-4">
//                 <GlowBar value={g.saved} max={g.target} color="#6366f1" />
//               </div>
//             </Card>
//           );
//         })}
//       </div>
//     </div>
//   );
// }

// // ─── Forecast Tab ─────────────────────────────────────────────────────────────
// function ForecastTab({ analytics }) {
//   const income = analytics?.totalIncome || 50000;
//   const expenses = analytics?.totalExpenses || 40000;
//   const surplus = income - expenses;

//   const data = Array.from({ length: 6 }, (_, i) => ({
//     month: ['M1', 'M2', 'M3', 'M4', 'M5', 'M6'][i],
//     income: Math.round(income * Math.pow(1.01, i)),
//     expenses: Math.round(expenses * Math.pow(1.005, i)),
//     surplus: Math.round((income * Math.pow(1.01, i)) - (expenses * Math.pow(1.005, i))),
//   }));

//   const milestones = [50000, 100000, 200000, 500000, 1000000];

//   const CustomTooltip = ({ active, payload, label }) => {
//     if (!active || !payload?.length) return null;
//     return (
//       <div className="bg-gray-900 border border-white/10 rounded-xl p-3 text-xs">
//         <p className="text-gray-400 mb-2 font-medium">{label}</p>
//         {payload.map(p => (
//           <p key={p.name} style={{ color: p.color }}>{p.name}: {fmt(p.value)}</p>
//         ))}
//       </div>
//     );
//   };

//   return (
//     <div className="space-y-4">
//       <Card className="p-5">
//         <p className="text-xs text-gray-500 uppercase tracking-wider mb-4">6-month cash flow projection</p>
//         <ResponsiveContainer width="100%" height={220}>
//           <AreaChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
//             <defs>
//               <linearGradient id="incG" x1="0" y1="0" x2="0" y2="1">
//                 <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
//                 <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
//               </linearGradient>
//               <linearGradient id="expG" x1="0" y1="0" x2="0" y2="1">
//                 <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
//                 <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
//               </linearGradient>
//             </defs>
//             <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
//             <XAxis dataKey="month" stroke="#4b5563" fontSize={11} />
//             <YAxis stroke="#4b5563" fontSize={11} tickFormatter={v => '₹' + (v / 1000).toFixed(0) + 'k'} />
//             <Tooltip content={<CustomTooltip />} />
//             <Area type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2} fill="url(#incG)" name="Income" />
//             <Area type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} fill="url(#expG)" name="Expenses" />
//           </AreaChart>
//         </ResponsiveContainer>
//         <div className="flex gap-4 mt-3 text-xs text-gray-500">
//           <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-emerald-500 inline-block rounded" /> Income</span>
//           <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-red-500 inline-block rounded" /> Expenses</span>
//         </div>
//       </Card>

//       <Card className="p-5">
//         <p className="text-xs text-gray-500 uppercase tracking-wider mb-4">Savings milestones</p>
//         <div className="space-y-3">
//           {milestones.map(target => {
//             const months = surplus > 0 ? Math.ceil(target / surplus) : null;
//             const done = months !== null && months <= 120;
//             return (
//               <div key={target} className="flex items-center gap-3">
//                 <div className={`w-2 h-2 rounded-full shrink-0 ${done ? 'bg-indigo-400' : 'bg-gray-700'}`} style={done ? { boxShadow: '0 0 6px #6366f180' } : {}} />
//                 <span className="text-sm text-gray-300 flex-1">{fmt(target)}</span>
//                 <span className={`text-sm font-mono font-semibold ${done ? 'text-indigo-400' : 'text-gray-600'}`}>
//                   {surplus <= 0 ? '—' : done ? `~${months} mo` : 'Long-term'}
//                 </span>
//                 {done && months <= 6 && <Badge type="ok">🎯 Soon</Badge>}
//               </div>
//             );
//           })}
//         </div>
//       </Card>
//     </div>
//   );
// }

// // ─── Recurring Tab ────────────────────────────────────────────────────────────
// function RecurringTab({ transactions, addToast }) {
//   const [subs, setSubs] = usePersist('subscriptions', []);
//   const [form, setForm] = useState({ name: '', amount: '', freq: 'Monthly' });

//   const detected = (() => {
//     if (!transactions?.length) return [];
//     const map = {};
//     transactions.filter(t => t.amount < 0).forEach(t => {
//       const key = t.name.toLowerCase().trim().slice(0, 25);
//       if (!map[key]) map[key] = { name: t.name, amounts: [], category: t.category };
//       map[key].amounts.push(Math.abs(t.amount));
//     });
//     return Object.values(map)
//       .filter(r => r.amounts.length >= 2)
//       .map(r => ({ name: r.name, avg: r.amounts.reduce((a, b) => a + b) / r.amounts.length, count: r.amounts.length, auto: true }))
//       .sort((a, b) => b.avg - a.avg).slice(0, 10);
//   })();

//   const all = [...detected, ...subs.map(s => ({ ...s, avg: s.amount, auto: false }))];
//   const total = all.reduce((s, r) => s + r.avg, 0);

//   const addSub = () => {
//     if (!form.name || !form.amount) return;
//     setSubs(s => [...s, { id: Date.now(), name: form.name, amount: +form.amount, freq: form.freq }]);
//     setForm({ name: '', amount: '', freq: 'Monthly' });
//     addToast('Added', 'success');
//   };

//   return (
//     <div className="space-y-4">
//       <div className="flex items-center justify-between">
//         <p className="text-xs text-gray-500 uppercase tracking-wider">Recurring expenses</p>
//         <Badge type="info">Total: {fmt(total)}/mo</Badge>
//       </div>

//       <Card>
//         {!all.length ? (
//           <div className="p-10 text-center">
//             <p className="text-3xl mb-2">📋</p>
//             <p className="text-sm text-gray-500">No recurring expenses detected. Add subscriptions below.</p>
//           </div>
//         ) : (
//           <div className="divide-y divide-white/5">
//             {all.map((r, i) => (
//               <div key={i} className="flex items-center gap-3 px-5 py-3.5 hover:bg-white/3 transition">
//                 <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-base flex-shrink-0">
//                   {r.auto ? '🔁' : '📌'}
//                 </div>
//                 <div className="flex-1 min-w-0">
//                   <p className="text-sm text-gray-200 font-medium truncate">{r.name}</p>
//                   <p className="text-xs text-gray-500">{r.auto ? `Detected · ${r.count}×` : (r.freq || 'Monthly')}</p>
//                 </div>
//                 <p className="text-sm font-mono font-semibold text-red-400">{fmt(r.avg)}</p>
//                 {!r.auto && (
//                   <button onClick={() => { setSubs(s => s.filter(x => x.id !== r.id)); addToast('Removed', 'info'); }}
//                     className="text-gray-600 hover:text-red-400 transition"><X size={14} /></button>
//                 )}
//               </div>
//             ))}
//           </div>
//         )}
//         <div className="border-t border-white/5 p-4">
//           <div className="grid grid-cols-3 gap-2 mb-2">
//             <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Name (Netflix...)" />
//             <Input value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} type="number" placeholder="Amount ₹" />
//             <select value={form.freq} onChange={e => setForm(f => ({ ...f, freq: e.target.value }))}
//               className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-indigo-500/60">
//               <option>Monthly</option><option>Quarterly</option><option>Yearly</option>
//             </select>
//           </div>
//           <Btn onClick={addSub}><Plus size={14} /> Add subscription</Btn>
//         </div>
//       </Card>
//     </div>
//   );
// }

// // ─── Debt Tab ─────────────────────────────────────────────────────────────────
// function DebtTab({ analytics, addToast }) {
//   const [debts, setDebts] = usePersist('debts', []);
//   const [strategy, setStrategy] = usePersist('debtStrategy', 'snowball');
//   const [form, setForm] = useState({ name: '', balance: '', rate: '', min: '' });
//   const surplus = analytics ? Math.max(0, analytics.totalIncome - analytics.totalExpenses) : 5000;
//   const extra = surplus * 0.3;

//   const addDebt = () => {
//     if (!form.name || !form.balance) return;
//     setDebts(d => [...d, { id: Date.now(), name: form.name, balance: +form.balance, rate: +form.rate || 0, min: +form.min || 1000 }]);
//     setForm({ name: '', balance: '', rate: '', min: '' });
//     addToast('Debt added', 'success');
//   };

//   const sorted = [...debts].sort((a, b) =>
//     strategy === 'snowball' ? a.balance - b.balance : b.rate - a.rate
//   );

//   const calcMonths = (debt, extra = 0) => {
//     const pay = debt.min + extra;
//     if (debt.rate === 0) return Math.ceil(debt.balance / pay);
//     const r = debt.rate / 1200;
//     return Math.max(1, Math.ceil(Math.log(pay / (pay - debt.balance * r)) / Math.log(1 + r)));
//   };

//   return (
//     <div className="space-y-4">
//       {debts.length > 0 && (
//         <>
//           <div className="flex items-center justify-between">
//             <p className="text-xs text-gray-500 uppercase tracking-wider">Outstanding debts</p>
//             <div className="flex gap-1 bg-white/5 p-1 rounded-xl border border-white/8">
//               {['snowball', 'avalanche'].map(s => (
//                 <button key={s} onClick={() => setStrategy(s)}
//                   className={`text-xs px-3 py-1.5 rounded-lg transition capitalize ${strategy === s ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'}`}>
//                   {s === 'snowball' ? '⚡ Snowball' : '💰 Avalanche'}
//                 </button>
//               ))}
//             </div>
//           </div>

//           <Card>
//             <div className="p-4 flex items-center justify-between border-b border-white/5">
//               <span className="text-sm text-gray-400">Total outstanding</span>
//               <span className="text-xl font-bold font-mono text-red-400">{fmt(debts.reduce((s, d) => s + d.balance, 0))}</span>
//             </div>
//             <div className="divide-y divide-white/5">
//               {sorted.map((d, i) => {
//                 const months = calcMonths(d, i === 0 ? extra : 0);
//                 return (
//                   <div key={d.id} className="flex items-center gap-3 px-5 py-4">
//                     <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 ${i === 0 ? 'bg-indigo-600' : 'bg-white/10'}`}>{i + 1}</div>
//                     <div className="flex-1 min-w-0">
//                       <p className="text-sm font-medium text-gray-200">{d.name}</p>
//                       <p className="text-xs text-gray-500">{fmt(d.balance)} · {d.rate}% p.a. · min {fmt(d.min)}/mo</p>
//                       {i === 0 && <p className="text-xs text-indigo-400 mt-0.5">← Focus extra {fmt(extra)}/mo here</p>}
//                     </div>
//                     <Badge type={i === 0 ? 'purple' : 'default'}>{months} mo</Badge>
//                     <button onClick={() => { setDebts(ds => ds.filter(x => x.id !== d.id)); addToast('Removed', 'info'); }}
//                       className="text-gray-600 hover:text-red-400 transition"><X size={14} /></button>
//                   </div>
//                 );
//               })}
//             </div>
//           </Card>
//         </>
//       )}

//       <Card className="p-5">
//         <p className="text-sm font-medium text-gray-300 mb-4">Add a debt</p>
//         <div className="grid grid-cols-2 gap-3 mb-3">
//           <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Debt name" className="col-span-2" />
//           <Input value={form.balance} onChange={e => setForm(f => ({ ...f, balance: e.target.value }))} type="number" placeholder="Balance ₹" />
//           <Input value={form.rate} onChange={e => setForm(f => ({ ...f, rate: e.target.value }))} type="number" placeholder="Interest % p.a." />
//           <Input value={form.min} onChange={e => setForm(f => ({ ...f, min: e.target.value }))} type="number" placeholder="Min payment ₹" />
//         </div>
//         <Btn onClick={addDebt}><Plus size={14} /> Add debt</Btn>
//       </Card>
//     </div>
//   );
// }

// // ─── What-If Tab ──────────────────────────────────────────────────────────────
// function WhatIfTab({ analytics, budgets }) {
//   const [goals] = usePersist('goals', []);
//   const spending = analytics?.categoryBreakdown || {};
//   const income = analytics?.totalIncome || 50000;
//   const expenses = analytics?.totalExpenses || 40000;
//   const surplus = income - expenses;

//   const topCats = Object.entries(budgets).slice(0, 5);
//   const [adjustments, setAdjustments] = useState(() => Object.fromEntries(topCats.map(([c]) => [c, 0])));

//   const totalAdj = Object.values(adjustments).reduce((s, v) => s + v, 0);
//   const newExpenses = expenses + totalAdj;
//   const newSurplus = income - newExpenses;
//   const diff = newSurplus - surplus;
//   const newRate = income > 0 ? (newSurplus / income * 100).toFixed(1) : '0';

//   return (
//     <div className="space-y-4">
//       <Card className="p-5">
//         <div className="flex items-center justify-between mb-5">
//           <p className="text-xs text-gray-500 uppercase tracking-wider">Adjust spending to see impact</p>
//           <button onClick={() => setAdjustments(Object.fromEntries(topCats.map(([c]) => [c, 0])))}
//             className="text-xs text-gray-500 hover:text-gray-300 transition flex items-center gap-1">
//             <RefreshCw size={11} /> Reset
//           </button>
//         </div>
//         {topCats.map(([cat, budget]) => {
//           const spent = getSpent(spending, cat);
//           const max = Math.max(spent, budget, 2000);
//           const val = adjustments[cat] || 0;
//           const color = CATEGORY_COLORS[cat] || '#6366f1';
//           return (
//             <div key={cat} className="mb-5">
//               <div className="flex items-center justify-between mb-2">
//                 <div className="flex items-center gap-2">
//                   <div className="w-2 h-2 rounded-full" style={{ background: color }} />
//                   <span className="text-sm text-gray-300">{cat}</span>
//                 </div>
//                 <span className={`text-sm font-mono font-semibold ${val === 0 ? 'text-gray-500' : val < 0 ? 'text-emerald-400' : 'text-red-400'}`}>
//                   {val === 0 ? 'unchanged' : (val > 0 ? '+' : '') + fmt(val)}
//                 </span>
//               </div>
//               <input type="range" min={-max} max={max} step={100} value={val}
//                 onChange={e => setAdjustments(a => ({ ...a, [cat]: +e.target.value }))}
//                 className="w-full h-1.5 rounded-full appearance-none bg-white/10 accent-indigo-500" />
//             </div>
//           );
//         })}
//       </Card>

//       <div className="grid grid-cols-3 gap-3">
//         {[
//           { label: 'New surplus', val: fmt(newSurplus), color: newSurplus >= 0 ? 'text-emerald-400' : 'text-red-400' },
//           { label: 'Monthly change', val: (diff >= 0 ? '+' : '') + fmt(diff), color: diff >= 0 ? 'text-emerald-400' : 'text-red-400' },
//           { label: 'New savings rate', val: newRate + '%', color: parseFloat(newRate) >= 20 ? 'text-emerald-400' : parseFloat(newRate) >= 10 ? 'text-amber-400' : 'text-red-400' },
//         ].map(m => (
//           <Card key={m.label} className="p-4 text-center">
//             <p className="text-xs text-gray-500 mb-1">{m.label}</p>
//             <p className={`text-xl font-bold font-mono ${m.color}`}>{m.val}</p>
//           </Card>
//         ))}
//       </div>

//       {diff !== 0 && (
//         <AlertBox
//           type={diff > 0 ? 'ok' : 'warn'}
//           text={diff > 0
//             ? `This change saves you an extra ${fmt(diff * 12)}/year. In 5 years: ${fmt(diff * 60)} more saved.`
//             : `This costs ${fmt(Math.abs(diff) * 12)} more per year. Confirm it's worth the trade-off.`}
//         />
//       )}
//     </div>
//   );
// }

// // ─── AI Chat Tab ──────────────────────────────────────────────────────────────
// function AIChatTab({ analytics, budgets, transactions, addToast }) {
//   const [goals] = usePersist('goals', []);
//   const [debts] = usePersist('debts', []);
//   const [subs] = usePersist('subscriptions', []);
//   const [messages, setMessages] = useState([
//     { role: 'assistant', content: "Hi! I'm your AI financial advisor. Ask me anything about your finances — from saving strategies to investment tips tailored for India." }
//   ]);
//   const [input, setInput] = useState('');
//   const [loading, setLoading] = useState(false);
//   const endRef = React.useRef(null);

//   useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

//   const buildContext = () => {
//     if (!analytics) return 'No transaction data loaded yet.';
//     const spending = analytics.categoryBreakdown || {};
//     const topCats = Object.entries(spending).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([c, v]) => `${c}: ₹${Math.round(v).toLocaleString('en-IN')}`).join(', ');
//     const budgetStatus = Object.entries(budgets).map(([cat, b]) => {
//       const s = spending[cat] || 0;
//       return `${cat}: ₹${Math.round(s).toLocaleString('en-IN')}/₹${Math.round(b).toLocaleString('en-IN')} (${pct(s, b).toFixed(0)}%)`;
//     }).join('; ');
//     return [
//       `Monthly income: ₹${Math.round(analytics.totalIncome).toLocaleString('en-IN')}`,
//       `Monthly expenses: ₹${Math.round(analytics.totalExpenses).toLocaleString('en-IN')}`,
//       `Savings rate: ${analytics.savingsRate}%`,
//       `Net surplus: ₹${Math.round(analytics.totalIncome - analytics.totalExpenses).toLocaleString('en-IN')}`,
//       `Top spending: ${topCats}`,
//       `Budget status: ${budgetStatus}`,
//       `Goals: ${goals.map(g => `${g.name} (${pct(g.saved, g.target).toFixed(0)}%)`).join(', ') || 'None set'}`,
//       `Debts: ${debts.map(d => `${d.name}: ₹${d.balance.toLocaleString('en-IN')} @ ${d.rate}%`).join(', ') || 'None'}`,
//       `Monthly subscriptions: ₹${subs.reduce((s, r) => s + r.amount, 0).toLocaleString('en-IN')}`,
//     ].join('\n');
//   };

//   const QUICK = [
//     { label: '📊 Full analysis',     prompt: 'Analyze my complete financial picture. Give me a prioritized action plan with specific steps in ₹.' },
//     { label: '💰 Savings plan',      prompt: 'Create a specific monthly savings plan for me. Tell me exactly how much to save and in which instruments (SIPs, FDs, PPF, NPS, ELSS).' },
//     { label: '✂️ Cut expenses',      prompt: 'Which categories should I cut and by how much? Give practical tips with specific ₹ targets.' },
//     { label: '📈 Investment advice', prompt: 'Based on my surplus, recommend specific investment options for an Indian investor with exact allocation amounts.' },
//   ];

//   // ── Paste your Groq key here ──────────────────────────────────────────────
//   const GROQ_API_KEY = 'gsk_pwlfo2RQI8RU4JPv02AoWGdyb3FYUAEXnZle1rNJlu0b2RGDyyqpRE';
//   const GROQ_MODEL   = 'llama-3.3-70b-versatile';
//   // ─────────────────────────────────────────────────────────────────────────

//   const ask = async (userMsg) => {
//     if (!userMsg.trim()) return;
//     const newMessages = [...messages, { role: 'user', content: userMsg }];
//     setMessages(newMessages);
//     setInput('');
//     setLoading(true);

//     const conversationHistory = newMessages.map(m => ({
//       role: m.role === 'assistant' ? 'assistant' : 'user',
//       content: m.content
//     }));

//     try {
//       const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
//         method: 'POST',
//         headers: {
//           'Authorization': `Bearer ${GROQ_API_KEY}`,
//           'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({
//           model: GROQ_MODEL,
//           max_tokens: 1000,
//           temperature: 0.7,
//           messages: [
//             {
//               role: 'system',
//               content: `You are a senior personal finance advisor specializing in Indian personal finance (SIPs, PPF, NPS, FDs, ELSS, tax-saving under 80C, etc.).
// Be specific, actionable, and always reference real numbers from the user's data. Use ₹ for currency.
// Keep responses concise (under 350 words). Use bullet points for action items. Be encouraging but realistic.

// USER'S FINANCIAL DATA:
// ${buildContext()}`
//             },
//             ...conversationHistory
//           ]
//         })
//       });
//       const data = await res.json();
//       if (data.error) throw new Error(data.error.message);
//       const reply = data.choices?.[0]?.message?.content || 'No response received. Please try again.';
//       setMessages(m => [...m, { role: 'assistant', content: reply }]);
//     } catch (e) {
//       setMessages(m => [...m, { role: 'assistant', content: `Error: ${e.message}` }]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="space-y-3">
//       {/* Quick prompts */}
//       <div className="flex flex-wrap gap-2">
//         {QUICK.map(q => (
//           <button key={q.label} onClick={() => ask(q.prompt)} disabled={loading}
//             className="text-xs px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 transition disabled:opacity-40">
//             {q.label}
//           </button>
//         ))}
//       </div>

//       {/* Chat window */}
//       <Card className="flex flex-col" style={{ height: '420px' }}>
//         <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
//           {messages.map((m, i) => (
//             <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
//               <div className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs shrink-0 font-bold ${m.role === 'assistant' ? 'bg-indigo-600 text-white' : 'bg-white/10 text-gray-300'}`}>
//                 {m.role === 'assistant' ? 'AI' : 'Me'}
//               </div>
//               <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
//                 m.role === 'assistant'
//                   ? 'bg-white/5 text-gray-200 rounded-tl-sm'
//                   : 'bg-indigo-600/80 text-white rounded-tr-sm'
//               }`}>
//                 {m.content}
//               </div>
//             </div>
//           ))}
//           {loading && (
//             <div className="flex gap-3">
//               <div className="w-7 h-7 rounded-xl bg-indigo-600 flex items-center justify-center text-xs font-bold text-white shrink-0">AI</div>
//               <div className="bg-white/5 px-4 py-3 rounded-2xl rounded-tl-sm">
//                 <div className="flex gap-1.5 items-center h-5">
//                   {[0, 1, 2].map(i => (
//                     <div key={i} className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce"
//                       style={{ animationDelay: `${i * 0.15}s` }} />
//                   ))}
//                 </div>
//               </div>
//             </div>
//           )}
//           <div ref={endRef} />
//         </div>
//         <div className="border-t border-white/5 p-3 flex gap-2">
//           <Input
//             value={input}
//             onChange={e => setInput(e.target.value)}
//             placeholder="Ask anything about your finances..."
//             className="flex-1"
//           />
//           <button
//             onClick={() => { if (input.trim() && !loading) ask(input); }}
//             disabled={loading || !input.trim()}
//             className="w-9 h-9 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 flex items-center justify-center transition shrink-0"
//           >
//             <Send size={14} className="text-white" />
//           </button>
//         </div>
//       </Card>

//       {/* Rule-based smart insights */}
//       {analytics && (
//         <Card className="p-5">
//           <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">Auto insights</p>
//           {(() => {
//             const ins = [];
//             const rate = parseFloat(analytics.savingsRate);
//             if (rate < 10) ins.push({ type: 'warn', text: `Savings rate is ${rate}% — critically low. Target 20%+. Cut your top non-essential category first.` });
//             else if (rate >= 20) ins.push({ type: 'ok', text: `${rate}% savings rate — excellent! You're in the top tier of financial health.` });
//             else ins.push({ type: 'info', text: `${rate}% savings rate is decent. A small push to 20% will compound significantly over time.` });
//             const topCat = Object.entries(analytics.categoryBreakdown || {}).sort((a, b) => b[1] - a[1])[0];
//             if (topCat) ins.push({ type: 'info', text: `Biggest spend: ${topCat[0]} at ${fmt(topCat[1])}. A 10% cut here saves ${fmt(topCat[1] * 0.1 * 12)}/year.` });
//             if (analytics.totalExpenses > analytics.totalIncome) ins.push({ type: 'warn', text: `Spending ${fmt(analytics.totalExpenses - analytics.totalIncome)} more than you earn. This is urgent — review immediately.` });
//             if (!ins.length) ins.push({ type: 'ok', text: 'Your finances look healthy! Keep up the discipline.' });
//             return ins.map((i, idx) => <AlertBox key={idx} {...i} />);
//           })()}
//         </Card>
//       )}
//     </div>
//   );
// }

// // ─── Main Component ───────────────────────────────────────────────────────────
// export default function PlanningSection({ analytics, dark, addToast, budgets, setBudgets, transactions }) {
//   const [activeTab, setActiveTab] = useState('budget');

//   return (
//     <div className="min-h-screen bg-gray-950 text-white font-sans" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
//       {/* Ambient glow background */}
//       <div className="fixed inset-0 pointer-events-none overflow-hidden">
//         <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/5 rounded-full blur-3xl" />
//         <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/5 rounded-full blur-3xl" />
//       </div>

//       <div className="relative">
//         {/* Metrics */}
//         <MetricsBar analytics={analytics} />

//         {/* Tab bar */}
//         <div className="flex gap-1 mb-6 p-1 rounded-2xl bg-gray-900/60 border border-white/5 w-fit overflow-x-auto">
//           {TAB_LIST.map(({ id, label, icon: Icon }) => (
//             <button key={id} onClick={() => setActiveTab(id)}
//               className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition whitespace-nowrap ${
//                 activeTab === id
//                   ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
//                   : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
//               }`}>
//               <Icon size={14} />{label}
//             </button>
//           ))}
//         </div>

//         {/* Tab content */}
//         <div className="tab-content">
//           {activeTab === 'budget'    && <BudgetTab    analytics={analytics} budgets={budgets} setBudgets={setBudgets} addToast={addToast} />}
//           {activeTab === 'goals'     && <GoalsTab     analytics={analytics} addToast={addToast} />}
//           {activeTab === 'forecast'  && <ForecastTab  analytics={analytics} />}
//           {activeTab === 'recurring' && <RecurringTab transactions={transactions || []} addToast={addToast} />}
//           {activeTab === 'debt'      && <DebtTab      analytics={analytics} addToast={addToast} />}
//           {activeTab === 'whatif'    && <WhatIfTab    analytics={analytics} budgets={budgets} />}
//           {activeTab === 'insights'  && <AIChatTab    analytics={analytics} budgets={budgets} transactions={transactions || []} addToast={addToast} />}
//         </div>
//       </div>
//     </div>
//   );
// }









import React, { useState, useCallback, useEffect } from 'react';
import {
  Plus, X, Target, CheckCircle, PiggyBank, CreditCard,
  Zap, Edit3, BarChart2, AlertCircle, Repeat, RefreshCw,
  Sun, Moon
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

// ─── Constants ────────────────────────────────────────────────────────────────
const LS_KEY = 'fin_planning_v4';

const TAB_LIST = [
  { id: 'budget',    label: 'Budget',    icon: Target },
  { id: 'goals',     label: 'Goals',     icon: PiggyBank },
  { id: 'forecast',  label: 'Forecast',  icon: BarChart2 },
  { id: 'recurring', label: 'Recurring', icon: Repeat },
  { id: 'debt',      label: 'Debt',      icon: CreditCard },
  { id: 'whatif',    label: 'What-If',   icon: Zap },
];

const CATEGORY_COLORS = {
  'Food & Dining': '#f97316',
  'Shopping':      '#8b5cf6',
  'Transport':     '#3b82f6',
  'Entertainment': '#ec4899',
  'Utilities':     '#14b8a6',
  'Healthcare':    '#10b981',
  'Groceries':     '#f59e0b',
  'Other':         '#6b7280',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt   = (n) => '₹' + Math.round(n).toLocaleString('en-IN');
const pct   = (v, t) => (t > 0 ? Math.min(100, (v / t) * 100) : 0);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const norm  = (s) => (s || '').toLowerCase().replace(/[^a-z0-9]/g, '');

function getSpent(spending, budgetCat) {
  if (spending[budgetCat] !== undefined) return spending[budgetCat];
  const nB = norm(budgetCat);
  for (const [k, v] of Object.entries(spending)) if (norm(k) === nB) return v;
  for (const [k, v] of Object.entries(spending)) {
    const nK = norm(k);
    if (nK.includes(nB) || nB.includes(nK)) return v;
  }
  return 0;
}

function loadState() {
  try { const r = localStorage.getItem(LS_KEY); return r ? JSON.parse(r) : {}; } catch { return {}; }
}
function saveState(patch) {
  try { localStorage.setItem(LS_KEY, JSON.stringify({ ...loadState(), ...patch })); } catch {}
}
function usePersist(key, initial) {
  const [val, setVal] = useState(() => { const s = loadState(); return s[key] !== undefined ? s[key] : initial; });
  const set = useCallback((next) => {
    setVal(prev => { const v = typeof next === 'function' ? next(prev) : next; saveState({ [key]: v }); return v; });
  }, [key]);
  return [val, set];
}

// ─── Theme tokens ─────────────────────────────────────────────────────────────
function th(dark) {
  return {
    page:        dark ? 'bg-gray-950 text-white'                                          : 'bg-gray-50 text-gray-900',
    card:        dark ? 'bg-gray-900 border-white/8'                                      : 'bg-white border-gray-200',
    cardHover:   dark ? 'hover:border-white/20'                                           : 'hover:border-gray-300',
    input:       dark ? 'bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-indigo-400/60'
                      : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400 focus:border-indigo-500',
    label:       dark ? 'text-gray-400'   : 'text-gray-500',
    muted:       dark ? 'text-gray-500'   : 'text-gray-400',
    divider:     dark ? 'border-white/5'  : 'border-gray-100',
    tabBar:      dark ? 'bg-gray-900 border-white/5'  : 'bg-white border-gray-200',
    tabActive:   'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20',
    tabInactive: dark ? 'text-gray-500 hover:text-gray-200 hover:bg-white/5'
                      : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100',
    metricCard:  dark ? 'bg-gray-900 border-white/8 hover:border-white/15'
                      : 'bg-white border-gray-200 hover:border-gray-300',
    barTrack:    dark ? 'bg-white/10' : 'bg-gray-100',
    sectionLbl:  dark ? 'text-gray-500' : 'text-gray-400',
    rowHover:    dark ? 'hover:bg-white/3' : 'hover:bg-gray-50',
    select:      dark ? 'bg-white/5 border-white/10 text-white' : 'bg-gray-50 border-gray-300 text-gray-900',
    toggleBtn:   dark ? 'bg-gray-800 border-white/10 text-yellow-400 hover:bg-gray-700'
                      : 'bg-white border-gray-200 text-indigo-600 hover:bg-gray-50',
    alertWarn:   dark ? 'bg-amber-500/10 border-amber-500/25 text-amber-200'       : 'bg-amber-50 border-amber-200 text-amber-800',
    alertOk:     dark ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-200' : 'bg-emerald-50 border-emerald-200 text-emerald-800',
    alertInfo:   dark ? 'bg-blue-500/10 border-blue-500/25 text-blue-200'          : 'bg-blue-50 border-blue-200 text-blue-800',
  };
}

// ─── Primitives ───────────────────────────────────────────────────────────────
function Card({ children, className = '', dark }) {
  const t = th(dark);
  return (
    <div className={`rounded-2xl border transition ${t.card} ${t.cardHover} ${className}`}>
      {children}
    </div>
  );
}

function GlowBar({ value, max, color = '#6366f1', dark }) {
  const p = clamp(pct(value, max), 0, 100);
  const barColor = value > max ? '#ef4444' : p > 80 ? '#f59e0b' : color;
  const t = th(dark);
  return (
    <div className={`relative h-2 rounded-full overflow-hidden ${t.barTrack}`}>
      <div className="h-full rounded-full transition-all duration-700 ease-out"
        style={{ width: `${p}%`, background: barColor, boxShadow: dark ? `0 0 6px ${barColor}50` : 'none' }} />
    </div>
  );
}

function Badge({ children, type = 'default', dark }) {
  const styles = {
    over:    dark ? 'bg-red-500/20 text-red-300 border-red-500/30'             : 'bg-red-100 text-red-700 border-red-200',
    warn:    dark ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'       : 'bg-amber-100 text-amber-700 border-amber-200',
    ok:      dark ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-emerald-100 text-emerald-700 border-emerald-200',
    info:    dark ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'          : 'bg-blue-100 text-blue-700 border-blue-200',
    purple:  dark ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'   : 'bg-purple-100 text-purple-700 border-purple-200',
    default: dark ? 'bg-white/10 text-gray-300 border-white/15'               : 'bg-gray-100 text-gray-600 border-gray-200',
  };
  return (
    <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${styles[type] || styles.default}`}>
      {children}
    </span>
  );
}

function AlertBox({ type, text, dark }) {
  const t = th(dark);
  const cfg = {
    warn: { cls: t.alertWarn, icon: <AlertCircle size={14} className="shrink-0 mt-0.5" /> },
    ok:   { cls: t.alertOk,   icon: <CheckCircle size={14} className="shrink-0 mt-0.5" /> },
    info: { cls: t.alertInfo, icon: <AlertCircle size={14} className="shrink-0 mt-0.5" /> },
  };
  const s = cfg[type] || cfg.info;
  return (
    <div className={`flex gap-3 p-3 rounded-xl border mb-2 text-sm ${s.cls}`}>
      {s.icon}<span className="leading-relaxed">{text}</span>
    </div>
  );
}

function Input({ value, onChange, placeholder, type = 'text', className = '', dark, onKeyDown }) {
  const t = th(dark);
  return (
    <input type={type} value={value} onChange={onChange} onKeyDown={onKeyDown} placeholder={placeholder}
      className={`border rounded-xl px-3 py-2 text-sm outline-none transition ${t.input} ${className}`} />
  );
}

function Btn({ onClick, children, variant = 'primary', className = '', disabled = false, dark }) {
  const styles = {
    primary: 'bg-indigo-600 hover:bg-indigo-500 text-white',
    ghost:   dark ? 'bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200',
    danger:  dark ? 'bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/20'
                  : 'bg-red-50 hover:bg-red-100 text-red-600 border border-red-200',
  };
  return (
    <button onClick={onClick} disabled={disabled}
      className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition disabled:opacity-40 ${styles[variant]} ${className}`}>
      {children}
    </button>
  );
}

// ─── Metrics bar ──────────────────────────────────────────────────────────────
function MetricsBar({ analytics, dark }) {
  if (!analytics) return null;
  const surplus = analytics.totalIncome - analytics.totalExpenses;
  const t = th(dark);
  const metrics = [
    { label: 'Monthly Income',   val: fmt(analytics.totalIncome),   color: 'text-emerald-500' },
    { label: 'Total Expenses',   val: fmt(analytics.totalExpenses), color: 'text-red-500' },
    { label: 'Savings Rate',     val: analytics.savingsRate + '%',  color: 'text-indigo-500' },
    { label: 'Net Surplus',      val: (surplus >= 0 ? '+' : '') + fmt(surplus), color: surplus >= 0 ? 'text-emerald-500' : 'text-red-500' },
  ];
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
      {metrics.map(m => (
        <div key={m.label} className={`rounded-2xl p-4 border transition ${t.metricCard}`}>
          <p className={`text-xs uppercase tracking-wider font-medium mb-1.5 ${t.label}`}>{m.label}</p>
          <p className={`text-2xl font-bold font-mono ${m.color}`}>{m.val}</p>
        </div>
      ))}
    </div>
  );
}

// ─── Budget Tab ───────────────────────────────────────────────────────────────
function BudgetTab({ analytics, budgets, setBudgets, addToast, dark }) {
  const [newCat, setNewCat] = useState('');
  const [newAmt, setNewAmt] = useState('');
  const [editing, setEditing] = useState(null);
  const [editVal, setEditVal] = useState('');
  const t = th(dark);
  const spending = analytics?.categoryBreakdown || {};

  // Auto-seed budgets from analytics categories
  useEffect(() => {
    if (!analytics?.categoryBreakdown) return;
    const newEntries = {};
    Object.entries(analytics.categoryBreakdown).forEach(([cat, spent]) => {
      const exists = Object.keys(budgets).some(b =>
        norm(b) === norm(cat) || norm(b).includes(norm(cat)) || norm(cat).includes(norm(b))
      );
      if (!exists) newEntries[cat] = Math.ceil((spent * 1.2) / 500) * 500;
    });
    if (Object.keys(newEntries).length > 0) setBudgets(b => ({ ...newEntries, ...b }));
  }, [analytics?.categoryBreakdown]);

  const entries     = Object.entries(budgets);
  const totalBudget = entries.reduce((s, [, b]) => s + b, 0);
  const totalSpent  = entries.reduce((s, [c]) => s + getSpent(spending, c), 0);
  const overCount   = entries.filter(([c, b]) => getSpent(spending, c) > b).length;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total Budget', val: fmt(totalBudget), color: 'text-indigo-500' },
          { label: 'Total Spent',  val: fmt(totalSpent),  color: totalSpent > totalBudget ? 'text-red-500' : dark ? 'text-white' : 'text-gray-900' },
          { label: 'Over Budget',  val: `${overCount} cats`, color: overCount > 0 ? 'text-amber-500' : 'text-emerald-500' },
        ].map(m => (
          <Card key={m.label} dark={dark} className="p-4 text-center">
            <p className={`text-xs mb-1 ${t.muted}`}>{m.label}</p>
            <p className={`text-lg font-bold font-mono ${m.color}`}>{m.val}</p>
          </Card>
        ))}
      </div>

      <Card dark={dark}>
        <div className="p-5 space-y-5">
          {entries.length === 0 && (
            <p className={`text-sm text-center py-6 ${t.muted}`}>No budgets yet. Add one below.</p>
          )}
          {entries.map(([cat, budget]) => {
            const spent  = getSpent(spending, cat);
            const p      = pct(spent, budget);
            const color  = CATEGORY_COLORS[cat] || '#6366f1';
            const tagType = spent > budget ? 'over' : p >= 80 ? 'warn' : 'ok';
            return (
              <div key={cat}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: color }} />
                    <span className="text-sm font-medium truncate">{cat}</span>
                    <Badge type={tagType} dark={dark}>{spent > budget ? 'Over' : p >= 80 ? 'Near limit' : 'On track'}</Badge>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    <span className={`text-xs font-mono ${t.muted}`}>{fmt(spent)} / {fmt(budget)}</span>
                    {editing === cat ? (
                      <div className="flex items-center gap-1">
                        <Input dark={dark} value={editVal} onChange={e => setEditVal(e.target.value)} className="w-20 py-1" />
                        <button onClick={() => { setBudgets(b => ({ ...b, [cat]: parseFloat(editVal) || 0 })); setEditing(null); addToast('Updated', 'success'); }}
                          className="text-xs px-2 py-1 bg-indigo-600 text-white rounded-lg">✓</button>
                        <button onClick={() => setEditing(null)}
                          className={`text-xs px-2 py-1 rounded-lg ${dark ? 'bg-white/10 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>✕</button>
                      </div>
                    ) : (
                      <button onClick={() => { setEditing(cat); setEditVal(budget); }}
                        className={`transition ${t.muted} hover:text-indigo-500`}><Edit3 size={13} /></button>
                    )}
                    <button onClick={() => { setBudgets(b => { const n = { ...b }; delete n[cat]; return n; }); addToast('Removed', 'info'); }}
                      className={`transition ${t.muted} hover:text-red-500`}><X size={13} /></button>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <GlowBar value={spent} max={budget} color={color} dark={dark} />
                  <span className={`text-xs font-mono w-10 text-right ${t.muted}`}>{p.toFixed(0)}%</span>
                </div>
              </div>
            );
          })}
        </div>
        <div className={`border-t ${t.divider} p-4 flex gap-2`}>
          <Input dark={dark} value={newCat} onChange={e => setNewCat(e.target.value)} placeholder="Category name" className="flex-1" />
          <Input dark={dark} value={newAmt} onChange={e => setNewAmt(e.target.value)} type="number" placeholder="Budget ₹" className="w-32" />
          <Btn dark={dark} onClick={() => {
            if (!newCat.trim() || !newAmt) return;
            setBudgets(b => ({ ...b, [newCat.trim()]: parseFloat(newAmt) }));
            setNewCat(''); setNewAmt('');
            addToast('Budget added', 'success');
          }}><Plus size={14} /> Add</Btn>
        </div>
      </Card>

      {Object.keys(spending).length > 0 && (
        <Card dark={dark} className="p-5">
          <p className={`text-xs uppercase tracking-wider mb-4 ${t.sectionLbl}`}>Actual spending breakdown</p>
          <div className="space-y-3">
            {Object.entries(spending).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([cat, amt]) => {
              const maxAmt = Math.max(...Object.values(spending));
              const color  = CATEGORY_COLORS[cat] || '#6366f1';
              return (
                <div key={cat} className="flex items-center gap-3">
                  <span className={`text-xs w-28 truncate ${t.label}`}>{cat}</span>
                  <div className={`flex-1 h-1.5 rounded-full overflow-hidden ${t.barTrack}`}>
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct(amt, maxAmt)}%`, background: color }} />
                  </div>
                  <span className={`text-xs font-mono w-20 text-right ${dark ? 'text-gray-300' : 'text-gray-700'}`}>{fmt(amt)}</span>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}

// ─── Goals Tab ────────────────────────────────────────────────────────────────
function GoalsTab({ analytics, addToast, dark }) {
  const [goals, setGoals] = usePersist('goals', [
    { id: 1, name: 'Emergency Fund', target: 100000, saved: 0, monthly: 2000, emoji: '🛡️' }
  ]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', target: '', saved: '', monthly: '', emoji: '🎯' });
  const surplus = analytics ? analytics.totalIncome - analytics.totalExpenses : 0;
  const t = th(dark);
  const EMOJIS = ['🎯', '🏠', '🚗', '✈️', '📚', '💍', '🏋️', '🌴', '💻', '🎓'];

  const addGoal = () => {
    if (!form.name || !form.target) return;
    setGoals(g => [...g, { id: Date.now(), name: form.name, target: +form.target, saved: +form.saved || 0, monthly: +form.monthly || 0, emoji: form.emoji }]);
    setForm({ name: '', target: '', saved: '', monthly: '', emoji: '🎯' });
    setShowForm(false);
    addToast('Goal added!', 'success');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className={`text-xs uppercase tracking-wider ${t.sectionLbl}`}>Financial goals</p>
        <Btn dark={dark} onClick={() => setShowForm(f => !f)} variant={showForm ? 'ghost' : 'primary'}>
          {showForm ? <X size={13} /> : <Plus size={13} />} {showForm ? 'Cancel' : 'Add goal'}
        </Btn>
      </div>

      {showForm && (
        <Card dark={dark} className="p-5 space-y-3">
          <div className="flex flex-wrap gap-2">
            {EMOJIS.map(e => (
              <button key={e} onClick={() => setForm(f => ({ ...f, emoji: e }))}
                className={`w-9 h-9 rounded-xl text-xl transition ${
                  form.emoji === e
                    ? 'bg-indigo-500/30 border-2 border-indigo-500'
                    : dark ? 'bg-white/5 hover:bg-white/10' : 'bg-gray-100 hover:bg-gray-200'
                }`}>{e}</button>
            ))}
          </div>
          <Input dark={dark} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Goal name" className="w-full" />
          <div className="grid grid-cols-3 gap-2">
            <Input dark={dark} value={form.target}  onChange={e => setForm(f => ({ ...f, target: e.target.value }))}  type="number" placeholder="Target ₹" />
            <Input dark={dark} value={form.saved}   onChange={e => setForm(f => ({ ...f, saved: e.target.value }))}   type="number" placeholder="Saved ₹" />
            <Input dark={dark} value={form.monthly} onChange={e => setForm(f => ({ ...f, monthly: e.target.value }))} type="number" placeholder="Monthly ₹" />
          </div>
          <Btn dark={dark} onClick={addGoal}><CheckCircle size={14} /> Save goal</Btn>
        </Card>
      )}

      {goals.length === 0 && (
        <Card dark={dark} className="p-10 text-center">
          <p className="text-4xl mb-3">🎯</p>
          <p className={`text-sm ${t.muted}`}>No goals yet. Add one to start tracking.</p>
        </Card>
      )}

      {goals.map(g => {
        const remaining = g.target - g.saved;
        const monthly   = g.monthly || Math.max(500, surplus * 0.3);
        const months    = monthly > 0 && remaining > 0 ? Math.ceil(remaining / monthly) : 0;
        const p         = pct(g.saved, g.target);
        const C         = 2 * Math.PI * 28;
        return (
          <Card key={g.id} dark={dark} className="p-5">
            <div className="flex items-start gap-4">
              <div className="relative w-20 h-20 shrink-0">
                <svg className="w-20 h-20 -rotate-90" viewBox="0 0 70 70">
                  <circle cx="35" cy="35" r="28" fill="none" stroke={dark ? 'rgba(255,255,255,0.08)' : '#e5e7eb'} strokeWidth="6" />
                  <circle cx="35" cy="35" r="28" fill="none" stroke="#6366f1" strokeWidth="6"
                    strokeDasharray={`${C * p / 100} ${C}`} strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl">{g.emoji}</span>
                  <span className="text-xs font-bold text-indigo-500">{p.toFixed(0)}%</span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-1">
                  <p className="font-semibold">{g.name}</p>
                  <button onClick={() => { setGoals(gs => gs.filter(x => x.id !== g.id)); addToast('Removed', 'info'); }}
                    className={`transition ml-2 shrink-0 ${t.muted} hover:text-red-500`}><X size={14} /></button>
                </div>
                <p className={`text-xs mb-3 ${t.muted}`}>{fmt(g.saved)} saved · {fmt(remaining)} to go</p>
                <div className="flex flex-wrap gap-2">
                  {g.monthly > 0 && <Badge type="info" dark={dark}>₹{g.monthly.toLocaleString('en-IN')}/mo</Badge>}
                  {months > 0    && <Badge type="purple" dark={dark}>{months} months</Badge>}
                  {months > 0 && months <= 12 && <Badge type="ok" dark={dark}>🔥 Almost there!</Badge>}
                </div>
              </div>
            </div>
            <div className="mt-4">
              <GlowBar value={g.saved} max={g.target} color="#6366f1" dark={dark} />
            </div>
          </Card>
        );
      })}
    </div>
  );
}

// ─── Forecast Tab ─────────────────────────────────────────────────────────────
function ForecastTab({ analytics, dark }) {
  const income   = analytics?.totalIncome   || 50000;
  const expenses = analytics?.totalExpenses || 40000;
  const surplus  = income - expenses;
  const t = th(dark);

  const data = Array.from({ length: 6 }, (_, i) => ({
    month:    ['M1','M2','M3','M4','M5','M6'][i],
    income:   Math.round(income   * Math.pow(1.01,  i)),
    expenses: Math.round(expenses * Math.pow(1.005, i)),
  }));

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className={`rounded-xl p-3 text-xs border ${dark ? 'bg-gray-900 border-white/10 text-gray-200' : 'bg-white border-gray-200 text-gray-700'}`}>
        <p className={`mb-2 font-medium ${t.muted}`}>{label}</p>
        {payload.map(p => <p key={p.name} style={{ color: p.stroke }}>{p.name}: {fmt(p.value)}</p>)}
      </div>
    );
  };

  const milestones = [50000, 100000, 200000, 500000, 1000000];

  return (
    <div className="space-y-4">
      <Card dark={dark} className="p-5">
        <p className={`text-xs uppercase tracking-wider mb-4 ${t.sectionLbl}`}>6-month cash flow projection</p>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="incG" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#10b981" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="expG" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#ef4444" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={dark ? 'rgba(255,255,255,0.05)' : '#f3f4f6'} />
            <XAxis dataKey="month" stroke={dark ? '#6b7280' : '#9ca3af'} fontSize={11} />
            <YAxis stroke={dark ? '#6b7280' : '#9ca3af'} fontSize={11} tickFormatter={v => '₹' + (v/1000).toFixed(0) + 'k'} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="income"   stroke="#10b981" strokeWidth={2} fill="url(#incG)" name="Income" />
            <Area type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} fill="url(#expG)" name="Expenses" />
          </AreaChart>
        </ResponsiveContainer>
        <div className={`flex gap-4 mt-3 text-xs ${t.muted}`}>
          <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-emerald-500 inline-block rounded" /> Income</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-red-500 inline-block rounded" /> Expenses</span>
        </div>
      </Card>

      <Card dark={dark} className="p-5">
        <p className={`text-xs uppercase tracking-wider mb-4 ${t.sectionLbl}`}>Savings milestones</p>
        <div className="space-y-1">
          {milestones.map(target => {
            const months = surplus > 0 ? Math.ceil(target / surplus) : null;
            const done   = months !== null && months <= 120;
            return (
              <div key={target} className={`flex items-center gap-3 py-2.5 border-b last:border-0 ${t.divider}`}>
                <div className={`w-2 h-2 rounded-full shrink-0 ${done ? 'bg-indigo-500' : dark ? 'bg-gray-700' : 'bg-gray-300'}`} />
                <span className="text-sm flex-1">{fmt(target)}</span>
                <span className={`text-sm font-mono font-semibold ${done ? 'text-indigo-500' : t.muted}`}>
                  {surplus <= 0 ? '—' : done ? `~${months} mo` : 'Long-term'}
                </span>
                {done && months <= 6 && <Badge type="ok" dark={dark}>Soon!</Badge>}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

// ─── Recurring Tab ────────────────────────────────────────────────────────────
function RecurringTab({ transactions, addToast, dark }) {
  const [subs, setSubs] = usePersist('subscriptions', []);
  const [form, setForm] = useState({ name: '', amount: '', freq: 'Monthly' });
  const t = th(dark);

  const detected = (() => {
    if (!transactions?.length) return [];
    const map = {};
    transactions.filter(tr => tr.amount < 0).forEach(tr => {
      const key = tr.name.toLowerCase().trim().slice(0, 25);
      if (!map[key]) map[key] = { name: tr.name, amounts: [] };
      map[key].amounts.push(Math.abs(tr.amount));
    });
    return Object.values(map).filter(r => r.amounts.length >= 2)
      .map(r => ({ name: r.name, avg: r.amounts.reduce((a, b) => a + b) / r.amounts.length, count: r.amounts.length, auto: true }))
      .sort((a, b) => b.avg - a.avg).slice(0, 10);
  })();

  const all   = [...detected, ...subs.map(s => ({ ...s, avg: s.amount, auto: false }))];
  const total = all.reduce((s, r) => s + r.avg, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className={`text-xs uppercase tracking-wider ${t.sectionLbl}`}>Recurring expenses</p>
        <Badge type="info" dark={dark}>Total: {fmt(total)}/mo</Badge>
      </div>

      <Card dark={dark}>
        {!all.length ? (
          <div className="p-10 text-center">
            <p className="text-3xl mb-2">📋</p>
            <p className={`text-sm ${t.muted}`}>No recurring expenses detected. Add subscriptions below.</p>
          </div>
        ) : (
          <div className={`divide-y ${t.divider}`}>
            {all.map((r, i) => (
              <div key={i} className={`flex items-center gap-3 px-5 py-3.5 transition ${t.rowHover}`}>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-base shrink-0 ${dark ? 'bg-white/5' : 'bg-gray-100'}`}>
                  {r.auto ? '🔁' : '📌'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{r.name}</p>
                  <p className={`text-xs ${t.muted}`}>{r.auto ? `Detected · ${r.count}×` : (r.freq || 'Monthly')}</p>
                </div>
                <p className="text-sm font-mono font-semibold text-red-500">{fmt(r.avg)}</p>
                {!r.auto && (
                  <button onClick={() => { setSubs(s => s.filter(x => x.id !== r.id)); addToast('Removed', 'info'); }}
                    className={`transition ${t.muted} hover:text-red-500`}><X size={14} /></button>
                )}
              </div>
            ))}
          </div>
        )}
        <div className={`border-t ${t.divider} p-4`}>
          <div className="grid grid-cols-3 gap-2 mb-2">
            <Input dark={dark} value={form.name}   onChange={e => setForm(f => ({ ...f, name: e.target.value }))}   placeholder="Name (Netflix...)" />
            <Input dark={dark} value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} type="number" placeholder="Amount ₹" />
            <select value={form.freq} onChange={e => setForm(f => ({ ...f, freq: e.target.value }))}
              className={`border rounded-xl px-3 py-2 text-sm outline-none transition ${t.select}`}>
              <option>Monthly</option><option>Quarterly</option><option>Yearly</option>
            </select>
          </div>
          <Btn dark={dark} onClick={() => {
            if (!form.name || !form.amount) return;
            setSubs(s => [...s, { id: Date.now(), name: form.name, amount: +form.amount, freq: form.freq }]);
            setForm({ name: '', amount: '', freq: 'Monthly' });
            addToast('Added', 'success');
          }}><Plus size={14} /> Add subscription</Btn>
        </div>
      </Card>
    </div>
  );
}

// ─── Debt Tab ─────────────────────────────────────────────────────────────────
function DebtTab({ analytics, addToast, dark }) {
  const [debts, setDebts]       = usePersist('debts', []);
  const [strategy, setStrategy] = usePersist('debtStrategy', 'snowball');
  const [form, setForm]         = useState({ name: '', balance: '', rate: '', min: '' });
  const surplus = analytics ? Math.max(0, analytics.totalIncome - analytics.totalExpenses) : 5000;
  const extra   = surplus * 0.3;
  const t = th(dark);

  const addDebt = () => {
    if (!form.name || !form.balance) return;
    setDebts(d => [...d, { id: Date.now(), name: form.name, balance: +form.balance, rate: +form.rate || 0, min: +form.min || 1000 }]);
    setForm({ name: '', balance: '', rate: '', min: '' });
    addToast('Debt added', 'success');
  };

  const sorted = [...debts].sort((a, b) => strategy === 'snowball' ? a.balance - b.balance : b.rate - a.rate);

  const calcMonths = (debt, xtra = 0) => {
    const pay = debt.min + xtra;
    if (debt.rate === 0) return Math.ceil(debt.balance / pay);
    const r = debt.rate / 1200;
    return Math.max(1, Math.ceil(Math.log(pay / (pay - debt.balance * r)) / Math.log(1 + r)));
  };

  return (
    <div className="space-y-4">
      {debts.length > 0 && (
        <>
          <div className="flex items-center justify-between">
            <p className={`text-xs uppercase tracking-wider ${t.sectionLbl}`}>Debt payoff planner</p>
            <div className={`flex gap-1 p-1 rounded-xl border ${dark ? 'bg-gray-800 border-white/8' : 'bg-gray-100 border-gray-200'}`}>
              {['snowball', 'avalanche'].map(s => (
                <button key={s} onClick={() => setStrategy(s)}
                  className={`text-xs px-3 py-1.5 rounded-lg transition capitalize ${strategy === s ? 'bg-indigo-600 text-white' : t.tabInactive}`}>
                  {s === 'snowball' ? '⚡ Snowball' : '💰 Avalanche'}
                </button>
              ))}
            </div>
          </div>

          <Card dark={dark}>
            <div className={`p-4 flex items-center justify-between border-b ${t.divider}`}>
              <span className={`text-sm ${t.label}`}>Total outstanding</span>
              <span className="text-xl font-bold font-mono text-red-500">{fmt(debts.reduce((s, d) => s + d.balance, 0))}</span>
            </div>
            <div className={`divide-y ${t.divider}`}>
              {sorted.map((d, i) => {
                const months = calcMonths(d, i === 0 ? extra : 0);
                return (
                  <div key={d.id} className={`flex items-center gap-3 px-5 py-4 transition ${t.rowHover}`}>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${i === 0 ? 'bg-indigo-600 text-white' : dark ? 'bg-white/10 text-gray-400' : 'bg-gray-200 text-gray-600'}`}>{i + 1}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{d.name}</p>
                      <p className={`text-xs ${t.muted}`}>{fmt(d.balance)} · {d.rate}% p.a. · min {fmt(d.min)}/mo</p>
                      {i === 0 && <p className="text-xs text-indigo-500 mt-0.5">← Put extra {fmt(extra)}/mo here</p>}
                    </div>
                    <Badge type={i === 0 ? 'purple' : 'default'} dark={dark}>{months} mo</Badge>
                    <button onClick={() => { setDebts(ds => ds.filter(x => x.id !== d.id)); addToast('Removed', 'info'); }}
                      className={`transition ${t.muted} hover:text-red-500`}><X size={14} /></button>
                  </div>
                );
              })}
            </div>
          </Card>
        </>
      )}

      <Card dark={dark} className="p-5">
        <p className={`text-sm font-medium mb-4 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>Add a debt</p>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <Input dark={dark} value={form.name}    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}    placeholder="Debt name" className="col-span-2" />
          <Input dark={dark} value={form.balance} onChange={e => setForm(f => ({ ...f, balance: e.target.value }))} type="number" placeholder="Balance ₹" />
          <Input dark={dark} value={form.rate}    onChange={e => setForm(f => ({ ...f, rate: e.target.value }))}    type="number" placeholder="Interest % p.a." />
          <Input dark={dark} value={form.min}     onChange={e => setForm(f => ({ ...f, min: e.target.value }))}     type="number" placeholder="Min payment ₹" />
        </div>
        <Btn dark={dark} onClick={addDebt}><Plus size={14} /> Add debt</Btn>
      </Card>
    </div>
  );
}

// ─── What-If Tab ──────────────────────────────────────────────────────────────
function WhatIfTab({ analytics, budgets, dark }) {
  const [goals] = usePersist('goals', []);
  const spending  = analytics?.categoryBreakdown || {};
  const income    = analytics?.totalIncome   || 50000;
  const expenses  = analytics?.totalExpenses || 40000;
  const surplus   = income - expenses;
  const t = th(dark);

  const topCats = Object.entries(budgets).slice(0, 5);
  const [adjustments, setAdjustments] = useState(() => Object.fromEntries(topCats.map(([c]) => [c, 0])));

  const newSurplus = income - (expenses + Object.values(adjustments).reduce((s, v) => s + v, 0));
  const diff       = newSurplus - surplus;
  const newRate    = income > 0 ? (newSurplus / income * 100).toFixed(1) : '0';

  return (
    <div className="space-y-4">
      <Card dark={dark} className="p-5">
        <div className="flex items-center justify-between mb-5">
          <p className={`text-xs uppercase tracking-wider ${t.sectionLbl}`}>Adjust spending to see impact</p>
          <button onClick={() => setAdjustments(Object.fromEntries(topCats.map(([c]) => [c, 0])))}
            className={`text-xs transition flex items-center gap-1 ${t.muted} hover:text-indigo-500`}>
            <RefreshCw size={11} /> Reset
          </button>
        </div>
        {topCats.map(([cat, budget]) => {
          const spent = getSpent(spending, cat);
          const max   = Math.max(spent, budget, 2000);
          const val   = adjustments[cat] || 0;
          const color = CATEGORY_COLORS[cat] || '#6366f1';
          return (
            <div key={cat} className="mb-5">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: color }} />
                  <span className="text-sm">{cat}</span>
                </div>
                <span className={`text-sm font-mono font-semibold ${val === 0 ? t.muted : val < 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                  {val === 0 ? 'unchanged' : (val > 0 ? '+' : '') + fmt(val)}
                </span>
              </div>
              <input type="range" min={-max} max={max} step={100} value={val}
                onChange={e => setAdjustments(a => ({ ...a, [cat]: +e.target.value }))}
                className="w-full accent-indigo-600" />
            </div>
          );
        })}
      </Card>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'New surplus',      val: fmt(newSurplus), color: newSurplus >= 0 ? 'text-emerald-500' : 'text-red-500' },
          { label: 'Monthly change',   val: (diff >= 0 ? '+' : '') + fmt(diff), color: diff >= 0 ? 'text-emerald-500' : 'text-red-500' },
          { label: 'New savings rate', val: newRate + '%', color: parseFloat(newRate) >= 20 ? 'text-emerald-500' : parseFloat(newRate) >= 10 ? 'text-amber-500' : 'text-red-500' },
        ].map(m => (
          <Card key={m.label} dark={dark} className="p-4 text-center">
            <p className={`text-xs mb-1 ${t.muted}`}>{m.label}</p>
            <p className={`text-xl font-bold font-mono ${m.color}`}>{m.val}</p>
          </Card>
        ))}
      </div>

      {diff !== 0 && (
        <AlertBox dark={dark}
          type={diff > 0 ? 'ok' : 'warn'}
          text={diff > 0
            ? `This saves you an extra ${fmt(diff * 12)}/year. In 5 years: ${fmt(diff * 60)} more saved.`
            : `This costs ${fmt(Math.abs(diff) * 12)} more per year. Confirm it's worth the trade-off.`}
        />
      )}

      {goals.length > 0 && (
        <Card dark={dark} className="p-5">
          <p className={`text-xs uppercase tracking-wider mb-3 ${t.sectionLbl}`}>Impact on goals</p>
          {goals.map(g => {
            const rem    = g.target - g.saved;
            const oldMo  = surplus    > 0 ? Math.ceil(rem / (g.monthly || surplus    * 0.3)) : null;
            const newMo  = newSurplus > 0 ? Math.ceil(rem / (g.monthly || newSurplus * 0.3)) : null;
            const faster = oldMo && newMo ? oldMo - newMo : 0;
            return (
              <div key={g.id} className={`flex items-center justify-between py-2.5 border-b last:border-0 ${t.divider}`}>
                <span className="text-sm">{g.name}</span>
                <div className="flex items-center gap-2">
                  {oldMo && <span className={`text-xs ${t.muted}`}>{oldMo} mo →</span>}
                  {newMo && <span className="text-sm font-semibold text-indigo-500">{newMo} mo</span>}
                  {faster > 0 && <Badge type="ok"    dark={dark}>{faster} mo faster</Badge>}
                  {faster < 0 && <Badge type="over"  dark={dark}>{Math.abs(faster)} mo slower</Badge>}
                </div>
              </div>
            );
          })}
        </Card>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function PlanningSection({ analytics, addToast, budgets, setBudgets, transactions }) {
  const [activeTab, setActiveTab] = useState('budget');
  const [dark, setDark] = usePersist('planningDark', true);
  const t = th(dark);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${t.page}`}
      style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>

      {dark && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-600/4 rounded-full blur-3xl" />
        </div>
      )}

      <div className="relative">
        {/* Dark/Light toggle */}
        <div className="flex items-center justify-end mb-4">
          <button
            onClick={() => setDark(d => !d)}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium transition ${t.toggleBtn}`}
          >
            {dark ? <><Sun size={15} /> Light mode</> : <><Moon size={15} /> Dark mode</>}
          </button>
        </div>

        <MetricsBar analytics={analytics} dark={dark} />

        {/* Tab bar */}
        <div className={`flex gap-1 mb-6 p-1 rounded-2xl border w-fit overflow-x-auto ${t.tabBar}`}>
          {TAB_LIST.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setActiveTab(id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition whitespace-nowrap ${activeTab === id ? t.tabActive : t.tabInactive}`}>
              <Icon size={14} />{label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === 'budget'    && <BudgetTab    analytics={analytics} budgets={budgets} setBudgets={setBudgets} addToast={addToast} dark={dark} />}
        {activeTab === 'goals'     && <GoalsTab     analytics={analytics} addToast={addToast} dark={dark} />}
        {activeTab === 'forecast'  && <ForecastTab  analytics={analytics} dark={dark} />}
        {activeTab === 'recurring' && <RecurringTab transactions={transactions || []} addToast={addToast} dark={dark} />}
        {activeTab === 'debt'      && <DebtTab      analytics={analytics} addToast={addToast} dark={dark} />}
        {activeTab === 'whatif'    && <WhatIfTab    analytics={analytics} budgets={budgets} dark={dark} />}
      </div>
    </div>
  );
}