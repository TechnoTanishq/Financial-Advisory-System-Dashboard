// import React, { useState, useEffect, useCallback } from 'react';
// import {
//   Upload, TrendingUp, TrendingDown, DollarSign, PieChart as PieIcon,
//   BarChart3, Calendar, ArrowRight, FileText, Coffee, ShoppingBag,
//   Zap, Car, Film, Heart, Wifi, CreditCard, Moon, Sun, MessageCircle,
//   RefreshCw, Target, AlertTriangle, CheckCircle, ChevronDown, ChevronUp,
//   Wallet, Activity, Download, Filter, Home, X
// } from 'lucide-react';
// import {
//   BarChart, Bar,
//   PieChart as RePieChart, Pie, Cell,
//   LineChart, Line,
//   AreaChart, Area,
//   XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
// } from 'recharts';
// import { useNavigate } from "react-router-dom";
// import { useLocation } from "react-router-dom";
// // ─── Constants ───────────────────────────────────────────────────────────────
// const COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ec4899', '#3b82f6', '#f97316', '#8b5cf6', '#14b8a6'];

// const CATEGORY_ICONS = {
//   'Food & Dining': Coffee,
//   'Shopping': ShoppingBag,
//   'Transport': Car,
//   'Entertainment': Film,
//   'Utilities': Wifi,
//   'Healthcare': Heart,
//   'Insurance': CreditCard,
//   'Income': DollarSign,
//   'Travel': Zap,
//   'Groceries': ShoppingBag,
// };

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

// // ─── Helpers ─────────────────────────────────────────────────────────────────
// function categorizeTransaction(description = '') {
//   const d = description.toLowerCase();
//   if (d.includes('salary') || d.includes('credit')) return 'Income';
//   if (['zomato', 'swiggy', 'dominos', 'starbucks', 'restaurant', 'café', 'cafe'].some(k => d.includes(k))) return 'Food & Dining';
//   if (['amazon', 'flipkart', 'ajio', 'decathlon', 'myntra', 'meesho'].some(k => d.includes(k))) return 'Shopping';
//   if (['ola', 'uber', 'petrol', 'metro', 'bus', 'cab', 'rapido', 'namma'].some(k => d.includes(k))) return 'Transport';
//   if (['netflix', 'apple music', 'google play', 'bookmyshow', 'hotstar', 'prime', 'spotify'].some(k => d.includes(k))) return 'Entertainment';
//   if (['electricity', 'broadband', 'phonepe', 'bsnl', 'airtel', 'jio', 'water', 'gas'].some(k => d.includes(k))) return 'Utilities';
//   if (['pharmacy', 'apollo', 'medplus', 'hospital', 'clinic', 'health'].some(k => d.includes(k))) return 'Healthcare';
//   if (['irctc', 'ticket', 'makemytrip', 'yatra'].some(k => d.includes(k))) return 'Travel';
//   if (['lic', 'insurance', 'policy'].some(k => d.includes(k))) return 'Insurance';
//   if (['kirana', 'metro cash', 'grocery', 'bigbasket', 'blinkit', 'zepto'].some(k => d.includes(k))) return 'Groceries';
//   return 'Other';
// }

// function getCategoryIcon(category) {
//   return CATEGORY_ICONS[category] || FileText;
// }

// function parseCSV(text) {
//   const lines = text.split('\n').filter(l => l.trim());
//   const headers = lines[0].split(',').map(h => h.trim());
//   return lines.slice(1).map((line, idx) => {
//     const values = line.split(',').map(v => v.trim());
//     const row = {};
//     headers.forEach((h, i) => { row[h] = values[i] || ''; });
//     const debit = parseFloat(row.Debit) || 0;
//     const credit = parseFloat(row.Credit) || 0;
//     const amount = credit > 0 ? credit : -debit;
//     return {
//       id: idx + 1,
//       name: row.Description || row.description || `Transaction ${idx + 1}`,
//       amount,
//       type: amount >= 0 ? 'income' : 'expense',
//       category: categorizeTransaction(row.Description || row.description || ''),
//       date: row.Date || row.date || '',
//       balance: parseFloat(row.Balance) || 0,
//       time: row.Time || '',
//       transactionId: row.Transaction_ID || row.transaction_id || '',
//     };
//   });
// }

// function calculateAnalytics(data) {
//   const income = data.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
//   const expenses = Math.abs(data.filter(t => t.amount < 0).reduce((s, t) => s + t.amount, 0));

//   const categoryBreakdown = data.reduce((acc, t) => {
//     if (t.amount < 0) {
//       const cat = t.category;
//       acc[cat] = (acc[cat] || 0) + Math.abs(t.amount);
//     }
//     return acc;
//   }, {});

//   const dailyMap = data.reduce((acc, t) => {
//     const date = t.date;
//     if (!acc[date]) acc[date] = { date, income: 0, expense: 0, netFlow: 0 };
//     if (t.amount > 0) { acc[date].income += t.amount; acc[date].netFlow += t.amount; }
//     else { acc[date].expense += Math.abs(t.amount); acc[date].netFlow += t.amount; }
//     return acc;
//   }, {});

//   const dailySpending = Object.values(dailyMap)
//     .sort((a, b) => new Date(a.date) - new Date(b.date))
//     .reduce((acc, day, i) => {
//       const prev = i > 0 ? acc[i - 1].balance : 0;
//       acc.push({ ...day, balance: prev + day.netFlow });
//       return acc;
//     }, []);

//   const topExpenses = data.filter(t => t.amount < 0)
//     .sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount))
//     .slice(0, 5);

//   const categoryPieData = Object.entries(categoryBreakdown).map(([name, value]) => ({ name, value }));

//   // Monthly data
//   const monthlyMap = data.reduce((acc, t) => {
//     const d = new Date(t.date);
//     const key = isNaN(d) ? 'Unknown' : `${d.toLocaleString('default', { month: 'short' })} ${d.getFullYear()}`;
//     if (!acc[key]) acc[key] = { month: key, income: 0, expense: 0 };
//     if (t.amount > 0) acc[key].income += t.amount;
//     else acc[key].expense += Math.abs(t.amount);
//     return acc;
//   }, {});
//   const monthlyData = Object.values(monthlyMap);

//   return {
//     totalIncome: income,
//     totalExpenses: expenses,
//     categoryBreakdown,
//     dailySpending,
//     topExpenses,
//     categoryPieData,
//     monthlyData,
//     savingsRate: income > 0 ? ((income - expenses) / income * 100).toFixed(1) : 0,
//     transactionCount: data.length,
//     avgDailySpend: dailySpending.length > 0 ? (expenses / dailySpending.length).toFixed(0) : 0,
//   };
// }

// // ─── Sub-components ───────────────────────────────────────────────────────────
// function StatCard({ icon: Icon, label, value, sub, color, dark }) {
//   return (
//     <div className={`rounded-2xl p-6 shadow-sm border transition-all hover:shadow-md ${dark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
//       }`}>
//       <div className="flex items-start justify-between mb-4">
//         <div>
//           <p className={`text-xs font-semibold uppercase tracking-wider mb-1 ${dark ? 'text-gray-400' : 'text-gray-500'}`}>{label}</p>
//           <h3 className={`text-2xl font-bold font-mono ${color}`}>{value}</h3>
//         </div>
//         <div className={`p-2.5 rounded-xl ${dark ? 'bg-gray-700' : 'bg-gray-50'}`}>
//           <Icon size={20} className={color} />
//         </div>
//       </div>
//       <p className={`text-xs ${dark ? 'text-gray-500' : 'text-gray-400'}`}>{sub}</p>
//     </div>
//   );
// }

// function SectionTitle({ title, subtitle, dark }) {
//   return (
//     <div className="mb-6">
//       <h2 className={`text-xl font-bold ${dark ? 'text-white' : 'text-gray-900'}`}>{title}</h2>
//       {subtitle && <p className={`text-sm mt-1 ${dark ? 'text-gray-400' : 'text-gray-500'}`}>{subtitle}</p>}
//     </div>
//   );
// }

// const CustomTooltip = ({ active, payload, label, dark }) => {
//   if (active && payload && payload.length) {
//     return (
//       <div className={`p-3 rounded-xl shadow-xl border text-sm ${dark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-800'}`}>
//         <p className="font-semibold mb-1">{label || payload[0]?.payload?.date}</p>
//         {payload.map((p, i) => (
//           <p key={i} style={{ color: p.color }}>
//             {p.name}: ₹{Number(p.value).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
//           </p>
//         ))}
//       </div>
//     );
//   }
//   return null;
// };

// // ─── REPORTS Section ─────────────────────────────────────────────────────────
// function ReportsSection({ analytics, transactions, dark }) {
//   const [exportFormat, setExportFormat] = useState('csv');
//   const [filterCat, setFilterCat] = useState('All');

//   const categories = ['All', ...Object.keys(analytics?.categoryBreakdown || {})];
//   const filtered = filterCat === 'All' ? transactions : transactions.filter(t => t.category === filterCat);

//   const exportCSV = () => {
//     const headers = 'Date,Name,Category,Type,Amount\n';
//     const rows = filtered.map(t =>
//       `${t.date},"${t.name}",${t.category},${t.type},${t.amount}`
//     ).join('\n');
//     const blob = new Blob([headers + rows], { type: 'text/csv' });
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement('a'); a.href = url; a.download = 'transactions.csv'; a.click();
//   };

//   return (
//     <div className="space-y-6">
//       <SectionTitle title="Reports" subtitle="Detailed transaction history and export options" dark={dark} />

//       {/* Summary Cards */}
//       <div className="grid grid-cols-3 gap-4">
//         {[
//           { label: 'Total Transactions', value: analytics?.transactionCount || 0, color: 'text-indigo-500' },
//           { label: 'Avg Daily Spend', value: `₹${Number(analytics?.avgDailySpend || 0).toLocaleString('en-IN')}`, color: 'text-amber-500' },
//           { label: 'Savings Rate', value: `${analytics?.savingsRate || 0}%`, color: 'text-emerald-500' },
//         ].map((s, i) => (
//           <div key={i} className={`rounded-2xl p-5 border ${dark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
//             <p className={`text-xs uppercase tracking-wider font-semibold mb-2 ${dark ? 'text-gray-400' : 'text-gray-500'}`}>{s.label}</p>
//             <p className={`text-2xl font-bold font-mono ${s.color}`}>{s.value}</p>
//           </div>
//         ))}
//       </div>

//       {/* Monthly Bar Chart */}
//       <div className={`rounded-2xl p-6 border ${dark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
//         <h3 className={`text-base font-semibold mb-4 ${dark ? 'text-white' : 'text-gray-800'}`}>Monthly Income vs Expenses</h3>
//         <ResponsiveContainer width="100%" height={260}>
//           <BarChart data={analytics?.monthlyData || []}>
//             <CartesianGrid strokeDasharray="3 3" stroke={dark ? '#374151' : '#f3f4f6'} />
//             <XAxis dataKey="month" fontSize={11} stroke={dark ? '#9ca3af' : '#6b7280'} />
//             <YAxis fontSize={11} stroke={dark ? '#9ca3af' : '#6b7280'} />
//             <Tooltip content={<CustomTooltip dark={dark} />} />
//             <Legend />
//             <Bar dataKey="income" fill="#10b981" name="Income" radius={[6, 6, 0, 0]} />
//             <Bar dataKey="expense" fill="#ef4444" name="Expenses" radius={[6, 6, 0, 0]} />
//           </BarChart>
//         </ResponsiveContainer>
//       </div>

//       {/* Transaction Table */}
//       <div className={`rounded-2xl border ${dark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
//         <div className={`flex items-center justify-between p-5 border-b ${dark ? 'border-gray-700' : 'border-gray-100'}`}>
//           <h3 className={`font-semibold ${dark ? 'text-white' : 'text-gray-800'}`}>Transaction History</h3>
//           <div className="flex items-center gap-2">
//             <select
//               value={filterCat}
//               onChange={e => setFilterCat(e.target.value)}
//               className={`text-sm px-3 py-1.5 rounded-lg border outline-none ${dark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-700'}`}
//             >
//               {categories.map(c => <option key={c}>{c}</option>)}
//             </select>
//             <button onClick={exportCSV} className="flex items-center gap-1.5 text-sm px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
//               <Download size={14} /> Export
//             </button>
//           </div>
//         </div>
//         <div className="overflow-auto max-h-80">
//           <table className="w-full text-sm">
//             <thead>
//               <tr className={`text-xs uppercase tracking-wider ${dark ? 'text-gray-400 bg-gray-750' : 'text-gray-500 bg-gray-50'}`}>
//                 {['Date', 'Description', 'Category', 'Type', 'Amount'].map(h => (
//                   <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
//                 ))}
//               </tr>
//             </thead>
//             <tbody>
//               {filtered.map((t, i) => (
//                 <tr key={i} className={`border-t transition ${dark ? 'border-gray-700 hover:bg-gray-750' : 'border-gray-50 hover:bg-gray-50'}`}>
//                   <td className={`px-4 py-3 font-mono text-xs ${dark ? 'text-gray-400' : 'text-gray-500'}`}>{t.date}</td>
//                   <td className={`px-4 py-3 font-medium max-w-xs truncate ${dark ? 'text-gray-200' : 'text-gray-800'}`}>{t.name}</td>
//                   <td className="px-4 py-3">
//                     <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${dark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>{t.category}</span>
//                   </td>
//                   <td className="px-4 py-3">
//                     <span className={`text-xs font-semibold ${t.type === 'income' ? 'text-emerald-500' : 'text-red-500'}`}>{t.type}</span>
//                   </td>
//                   <td className={`px-4 py-3 font-mono font-semibold ${t.amount >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
//                     {t.amount >= 0 ? '+' : ''}₹{Math.abs(t.amount).toLocaleString('en-IN')}
//                   </td>
//                 </tr>
//               ))}
//               {filtered.length === 0 && (
//                 <tr><td colSpan={5} className={`px-4 py-8 text-center text-sm ${dark ? 'text-gray-500' : 'text-gray-400'}`}>No transactions found.</td></tr>
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// }

// // ─── ANALYTICS Section ────────────────────────────────────────────────────────
// function AnalyticsSection({ analytics, dark }) {
//   if (!analytics) return (
//     <div className={`rounded-2xl p-12 text-center border ${dark ? 'bg-gray-800 border-gray-700 text-gray-400' : 'bg-white border-gray-100 text-gray-400'}`}>
//       Upload a CSV file to see analytics.
//     </div>
//   );

//   const pieLabel = ({ name, percent }) => `${(percent * 100).toFixed(0)}%`;

//   return (
//     <div className="space-y-6">
//       <SectionTitle title="Analytics" subtitle="Deep dive into your spending patterns" dark={dark} />

//       {/* Pie + Bar row */}
//       <div className="grid grid-cols-2 gap-6">
//         <div className={`rounded-2xl p-6 border ${dark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
//           <h3 className={`font-semibold mb-4 ${dark ? 'text-white' : 'text-gray-800'}`}>Expense Distribution</h3>
//           <ResponsiveContainer width="100%" height={260}>
//             <RePieChart>
//               <Pie data={analytics.categoryPieData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={pieLabel} labelLine={false}>
//                 {analytics.categoryPieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
//               </Pie>
//               <Tooltip formatter={(v) => `₹${Number(v).toLocaleString('en-IN')}`} />
//               <Legend />
//             </RePieChart>
//           </ResponsiveContainer>
//         </div>

//         <div className={`rounded-2xl p-6 border ${dark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
//           <h3 className={`font-semibold mb-4 ${dark ? 'text-white' : 'text-gray-800'}`}>Category-wise Spend</h3>
//           <ResponsiveContainer width="100%" height={260}>
//             <BarChart data={analytics.categoryPieData} layout="vertical">
//               <CartesianGrid strokeDasharray="3 3" stroke={dark ? '#374151' : '#f3f4f6'} horizontal={false} />
//               <XAxis type="number" fontSize={11} stroke={dark ? '#9ca3af' : '#6b7280'} />
//               <YAxis type="category" dataKey="name" fontSize={10} width={90} stroke={dark ? '#9ca3af' : '#6b7280'} />
//               <Tooltip formatter={(v) => `₹${Number(v).toLocaleString('en-IN')}`} />
//               <Bar dataKey="value" radius={[0, 6, 6, 0]}>
//                 {analytics.categoryPieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
//               </Bar>
//             </BarChart>
//           </ResponsiveContainer>
//         </div>
//       </div>

//       {/* Area chart */}
//       <div className={`rounded-2xl p-6 border ${dark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
//         <h3 className={`font-semibold mb-4 ${dark ? 'text-white' : 'text-gray-800'}`}>Daily Cash Flow</h3>
//         <ResponsiveContainer width="100%" height={240}>
//           <AreaChart data={analytics.dailySpending}>
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
//             <CartesianGrid strokeDasharray="3 3" stroke={dark ? '#374151' : '#f3f4f6'} />
//             <XAxis dataKey="date" fontSize={11} stroke={dark ? '#9ca3af' : '#6b7280'}
//               tickFormatter={v => { const d = new Date(v); return isNaN(d) ? v : `${d.getDate()}/${d.getMonth() + 1}`; }} />
//             <YAxis fontSize={11} stroke={dark ? '#9ca3af' : '#6b7280'} />
//             <Tooltip content={<CustomTooltip dark={dark} />} />
//             <Legend />
//             <Area type="monotone" dataKey="income" stroke="#10b981" fill="url(#incG)" name="Income" strokeWidth={2} />
//             <Area type="monotone" dataKey="expense" stroke="#ef4444" fill="url(#expG)" name="Expenses" strokeWidth={2} />
//           </AreaChart>
//         </ResponsiveContainer>
//       </div>

//       {/* Top expenses */}
//       <div className={`rounded-2xl p-6 border ${dark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
//         <h3 className={`font-semibold mb-4 ${dark ? 'text-white' : 'text-gray-800'}`}>Top 5 Expenses</h3>
//         <div className="space-y-3">
//           {analytics.topExpenses.map((t, i) => {
//             const pct = ((Math.abs(t.amount) / analytics.totalExpenses) * 100).toFixed(1);
//             return (
//               <div key={i} className={`flex items-center gap-4 p-3 rounded-xl ${dark ? 'bg-gray-750 hover:bg-gray-700' : 'bg-gray-50 hover:bg-gray-100'} transition`}>
//                 <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white`}
//                   style={{ background: COLORS[i % COLORS.length] }}>{i + 1}</span>
//                 <div className="flex-1 min-w-0">
//                   <p className={`font-medium truncate text-sm ${dark ? 'text-gray-200' : 'text-gray-800'}`}>{t.name}</p>
//                   <div className="mt-1 h-1.5 rounded-full bg-gray-200 dark:bg-gray-700">
//                     <div className="h-1.5 rounded-full" style={{ width: `${pct}%`, background: COLORS[i % COLORS.length] }} />
//                   </div>
//                 </div>
//                 <span className={`font-mono font-bold text-red-500 text-sm whitespace-nowrap`}>
//                   ₹{Math.abs(t.amount).toLocaleString('en-IN')}
//                 </span>
//                 <span className={`text-xs ${dark ? 'text-gray-500' : 'text-gray-400'}`}>{pct}%</span>
//               </div>
//             );
//           })}
//           {analytics.topExpenses.length === 0 && (
//             <p className={`text-center text-sm py-4 ${dark ? 'text-gray-500' : 'text-gray-400'}`}>No expenses data.</p>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

// // ─── PLANNING Section ─────────────────────────────────────────────────────────
// function PlanningSection({ analytics, dark }) {
//   const [budgets, setBudgets] = useState(BUDGET_DEFAULTS);
//   const [editingCat, setEditingCat] = useState(null);
//   const [editVal, setEditVal] = useState('');
//   const [goal, setGoal] = useState({ label: 'Emergency Fund', target: 100000, saved: 0 });
//   const [goalInput, setGoalInput] = useState({ label: '', target: '', saved: '' });
//   const [showGoalForm, setShowGoalForm] = useState(false);

//   const spending = analytics?.categoryBreakdown || {};
//   const savingsRate = parseFloat(analytics?.savingsRate || 0);

//   const startEdit = (cat) => { setEditingCat(cat); setEditVal(budgets[cat] || ''); };
//   const saveEdit = () => { setBudgets(b => ({ ...b, [editingCat]: parseFloat(editVal) || 0 })); setEditingCat(null); };

//   const addGoal = () => {
//     if (goalInput.label && goalInput.target) {
//       setGoal({ label: goalInput.label, target: parseFloat(goalInput.target), saved: parseFloat(goalInput.saved || 0) });
//       setGoalInput({ label: '', target: '', saved: '' });
//       setShowGoalForm(false);
//     }
//   };

//   const goalPct = Math.min(100, ((goal.saved / goal.target) * 100)).toFixed(1);
//   const months = analytics?.totalIncome > 0 && savingsRate > 0
//     ? Math.ceil((goal.target - goal.saved) / (analytics.totalIncome * savingsRate / 100))
//     : null;

//   // Advice generation
//   const tips = [];
//   if (savingsRate < 20) tips.push({ type: 'warn', text: `Your savings rate is ${savingsRate}%. Aim for at least 20% to build a healthy financial cushion.` });
//   if (savingsRate >= 20) tips.push({ type: 'good', text: `Great job! Your savings rate of ${savingsRate}% is healthy.` });
//   Object.entries(spending).forEach(([cat, spent]) => {
//     const budget = budgets[cat];
//     if (budget && spent > budget) tips.push({ type: 'warn', text: `You've exceeded your ${cat} budget by ₹${(spent - budget).toFixed(0)}.` });
//   });
//   if (analytics?.totalExpenses > 0 && (analytics.categoryBreakdown['Food & Dining'] || 0) / analytics.totalExpenses > 0.3)
//     tips.push({ type: 'tip', text: 'Food & Dining takes up over 30% of your expenses. Consider meal prepping or cooking at home more.' });

//   return (
//     <div className="space-y-6">
//       <SectionTitle title="Planning" subtitle="Budget tracking, financial goals, and personalized advice" dark={dark} />

//       {/* Budget vs Actual */}
//       <div className={`rounded-2xl p-6 border ${dark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
//         <h3 className={`font-semibold mb-5 ${dark ? 'text-white' : 'text-gray-800'}`}>Budget vs Actual Spending</h3>
//         <div className="space-y-4">
//           {Object.entries(budgets).map(([cat, budget]) => {
//             const spent = spending[cat] || 0;
//             const pct = budget > 0 ? Math.min(100, (spent / budget) * 100) : 0;
//             const over = spent > budget;
//             const Icon = getCategoryIcon(cat);
//             return (
//               <div key={cat}>
//                 <div className="flex items-center justify-between mb-1.5">
//                   <div className="flex items-center gap-2">
//                     <Icon size={14} className={dark ? 'text-gray-400' : 'text-gray-500'} />
//                     <span className={`text-sm font-medium ${dark ? 'text-gray-300' : 'text-gray-700'}`}>{cat}</span>
//                   </div>
//                   <div className="flex items-center gap-3">
//                     <span className={`text-xs font-mono ${over ? 'text-red-500' : dark ? 'text-gray-400' : 'text-gray-500'}`}>
//                       ₹{spent.toFixed(0)} / ₹{budget.toFixed(0)}
//                     </span>
//                     {editingCat === cat ? (
//                       <div className="flex items-center gap-1">
//                         <input value={editVal} onChange={e => setEditVal(e.target.value)}
//                           className={`w-20 text-xs px-2 py-1 rounded border outline-none ${dark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`} />
//                         <button onClick={saveEdit} className="text-xs px-2 py-1 bg-indigo-600 text-white rounded">✓</button>
//                         <button onClick={() => setEditingCat(null)} className={`text-xs px-2 py-1 rounded ${dark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>✕</button>
//                       </div>
//                     ) : (
//                       <button onClick={() => startEdit(cat)} className={`text-xs px-2 py-0.5 rounded ${dark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-400 hover:text-gray-600'}`}>Edit</button>
//                     )}
//                   </div>
//                 </div>
//                 <div className={`h-2 rounded-full ${dark ? 'bg-gray-700' : 'bg-gray-100'}`}>
//                   <div className={`h-2 rounded-full transition-all ${over ? 'bg-red-500' : 'bg-indigo-500'}`}
//                     style={{ width: `${pct}%` }} />
//                 </div>
//               </div>
//             );
//           })}
//         </div>
//       </div>

//       {/* Financial Goals */}
//       <div className={`rounded-2xl p-6 border ${dark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
//         <div className="flex items-center justify-between mb-5">
//           <h3 className={`font-semibold ${dark ? 'text-white' : 'text-gray-800'}`}>Financial Goal</h3>
//           <button onClick={() => setShowGoalForm(f => !f)}
//             className="text-sm px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
//             {showGoalForm ? 'Cancel' : '+ Set Goal'}
//           </button>
//         </div>
//         {showGoalForm && (
//           <div className={`mb-5 p-4 rounded-xl border space-y-3 ${dark ? 'bg-gray-750 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
//             <input placeholder="Goal name (e.g. Emergency Fund)"
//               value={goalInput.label} onChange={e => setGoalInput(g => ({ ...g, label: e.target.value }))}
//               className={`w-full text-sm px-3 py-2 rounded-lg border outline-none ${dark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500' : 'bg-white border-gray-300'}`} />
//             <div className="grid grid-cols-2 gap-2">
//               <input type="number" placeholder="Target amount (₹)"
//                 value={goalInput.target} onChange={e => setGoalInput(g => ({ ...g, target: e.target.value }))}
//                 className={`text-sm px-3 py-2 rounded-lg border outline-none ${dark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500' : 'bg-white border-gray-300'}`} />
//               <input type="number" placeholder="Amount saved so far (₹)"
//                 value={goalInput.saved} onChange={e => setGoalInput(g => ({ ...g, saved: e.target.value }))}
//                 className={`text-sm px-3 py-2 rounded-lg border outline-none ${dark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500' : 'bg-white border-gray-300'}`} />
//             </div>
//             <button onClick={addGoal} className="w-full py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition">Save Goal</button>
//           </div>
//         )}
//         <div className={`p-5 rounded-xl ${dark ? 'bg-gray-750' : 'bg-indigo-50'}`}>
//           <div className="flex items-center justify-between mb-3">
//             <div>
//               <p className={`font-semibold ${dark ? 'text-white' : 'text-indigo-900'}`}>{goal.label}</p>
//               <p className={`text-xs mt-0.5 ${dark ? 'text-gray-400' : 'text-indigo-600'}`}>
//                 ₹{goal.saved.toLocaleString('en-IN')} of ₹{goal.target.toLocaleString('en-IN')} saved
//               </p>
//             </div>
//             <span className={`text-2xl font-bold font-mono ${dark ? 'text-indigo-400' : 'text-indigo-600'}`}>{goalPct}%</span>
//           </div>
//           <div className={`h-3 rounded-full ${dark ? 'bg-gray-700' : 'bg-indigo-200'}`}>
//             <div className="h-3 rounded-full bg-indigo-500 transition-all" style={{ width: `${goalPct}%` }} />
//           </div>
//           {months && (
//             <p className={`text-xs mt-3 ${dark ? 'text-gray-400' : 'text-indigo-700'}`}>
//               At your current savings rate, you'll reach this goal in ~<strong>{months} month{months !== 1 ? 's' : ''}</strong>.
//             </p>
//           )}
//         </div>
//       </div>

//       {/* AI Tips */}
//       <div className={`rounded-2xl p-6 border ${dark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
//         <h3 className={`font-semibold mb-4 ${dark ? 'text-white' : 'text-gray-800'}`}>Personalized Insights</h3>
//         {tips.length === 0 && <p className={`text-sm ${dark ? 'text-gray-500' : 'text-gray-400'}`}>Upload transactions to get personalized advice.</p>}
//         <div className="space-y-3">
//           {tips.map((tip, i) => {
//             const Icon = tip.type === 'good' ? CheckCircle : tip.type === 'warn' ? AlertTriangle : Target;
//             const color = tip.type === 'good' ? 'text-emerald-500' : tip.type === 'warn' ? 'text-amber-500' : 'text-blue-500';
//             const bg = tip.type === 'good'
//               ? dark ? 'bg-emerald-900/20 border-emerald-800' : 'bg-emerald-50 border-emerald-100'
//               : tip.type === 'warn'
//                 ? dark ? 'bg-amber-900/20 border-amber-800' : 'bg-amber-50 border-amber-100'
//                 : dark ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-100';
//             return (
//               <div key={i} className={`flex items-start gap-3 p-3 rounded-xl border ${bg}`}>
//                 <Icon size={16} className={`mt-0.5 flex-shrink-0 ${color}`} />
//                 <p className={`text-sm ${dark ? 'text-gray-300' : 'text-gray-700'}`}>{tip.text}</p>
//               </div>
//             );
//           })}
//         </div>
//       </div>
//     </div>
//   );
// }

// // ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
// export default function FinancialAdvisoryDashboard() {
//   const [transactions, setTransactions] = useState([]);
//   const [analytics, setAnalytics] = useState(null);
//   const [uploadedFile, setUploadedFile] = useState(null);
//   const [activeTab, setActiveTab] = useState('all');
//   const [section, setSection] = useState('dashboard');
//   const [dark, setDark] = useState(false);
//   const [walletBalance, setWalletBalance] = useState(null);
//   const [balanceLoading, setBalanceLoading] = useState(false);

//   const navigate = useNavigate();

//   const handleChatOpen = () => {
//     navigate("/chatbot");
//   };


//   const location = useLocation();

// useEffect(() => {
//   // If we arrived here from the chatbot with a specific section in state
//   if (location.state && location.state.activeSection) {
//     setSection(location.state.activeSection);
//   }
// }, [location]);

//   useEffect(() => { fetchWalletBalance(); fetchTransactionHistory(); }, []);

//   const fetchWalletBalance = async () => {
//     setBalanceLoading(true);
//     try {
//       const token = localStorage.getItem('token');
//       if (!token) return;
//       const res = await fetch('http://localhost:8083/wallet/balance', {
//         headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
//       });
//       if (!res.ok) throw new Error('Balance fetch failed');
//       const data = await res.json();
//       setWalletBalance(data.balance ?? data.amount ?? data.walletBalance ?? null);
//     } catch (e) {
//       console.error('Wallet balance error:', e);
//     } finally {
//       setBalanceLoading(false);
//     }
//   };

//   const fetchTransactionHistory = async () => {
//     try {
//       const token = localStorage.getItem('token');
//       const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
//       if (!token) return;
//       const res = await fetch('http://localhost:8083/transactions/history', {
//         headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
//       });
//       if (!res.ok) throw new Error('Failed to fetch transactions');
//       const data = await res.json();
//       const history = data.transactions || [];
//       const formatted = history.slice(0, 50).map((t, i) => {
//         const isIncome = t.toUpi === storedUser.upiId;
//         return {
//           id: t.transactionId || i + 1,
//           name: isIncome ? `Received from ${t.fromUpi}` : `Paid to ${t.toUpi}`,
//           amount: isIncome ? t.amount : -t.amount,
//           type: isIncome ? 'income' : 'expense',
//           category: t.category || (isIncome ? 'Income' : 'Other'),
//           date: new Date(t.createdAt).toISOString().split('T')[0],
//           status: t.status,
//         };
//       });
//       setTransactions(formatted);
//       setAnalytics(calculateAnalytics(formatted));
//     } catch (e) {
//       console.error('Transaction history error:', e);
//     }
//   };

//   const handleFileUpload = (e) => {
//     const file = e.target.files[0];
//     if (!file) return;
//     const reader = new FileReader();
//     reader.onload = (ev) => {
//       const parsed = parseCSV(ev.target.result);
//       setTransactions(parsed);
//       setAnalytics(calculateAnalytics(parsed));
//       setUploadedFile(file.name);
//     };
//     reader.readAsText(file);
//   };

//   const filteredTx = activeTab === 'all' ? transactions : transactions.filter(t => t.type === activeTab);

//   const navItems = [
//     { id: 'dashboard', label: 'Dashboard', icon: Home },
//     { id: 'reports', label: 'Reports', icon: FileText },
//     { id: 'analytics', label: 'Analytics', icon: BarChart3 },
//     { id: 'planning', label: 'Planning', icon: Calendar },
//   ];

//   const bg = dark ? 'bg-gray-900' : 'bg-gray-50';
//   const sidebarBg = dark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100';
//   const textMain = dark ? 'text-white' : 'text-gray-900';
//   const textMuted = dark ? 'text-gray-400' : 'text-gray-500';

//   return (
//     <div className={`min-h-screen flex ${bg} transition-colors duration-200`} style={{ fontFamily: "'DM Sans', 'Inter', sans-serif" }}>

//       {/* Sidebar */}
//       <aside className={`fixed left-0 top-0 h-full w-60 flex flex-col border-r ${sidebarBg} z-30`}>
//         {/* Logo */}
//         <div className={`px-6 py-5 border-b ${dark ? 'border-gray-800' : 'border-gray-100'}`}>
//           <div className="flex items-center gap-2.5">
//             <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center">
//               <Wallet size={16} className="text-white" />
//             </div>
//             <span className={`font-bold text-base tracking-tight ${textMain}`}>FinAdvisor</span>
//           </div>
//         </div>

//         {/* Nav */}
//         <nav className="flex-1 px-3 py-4 space-y-0.5">
//           {navItems.map(({ id, label, icon: Icon }) => {
//             const active = section === id;
//             return (
//               <button key={id} onClick={() => setSection(id)}
//                 className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${active
//                     ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
//                     : dark ? 'text-gray-400 hover:bg-gray-800 hover:text-white' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
//                   }`}>
//                 <Icon size={17} />
//                 {label}
//               </button>
//             );
//           })}
//         </nav>

//         {/* Bottom */}
//         <div className={`px-3 py-4 border-t ${dark ? 'border-gray-800' : 'border-gray-100'} space-y-1`}>
//           {/* Chatbot Button */}
//           <button
//             onClick={handleChatOpen}
//             className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium bg-gradient-to-r from-violet-600 to-indigo-600 text-white"
//           >
//             <MessageCircle size={17} />
//             AI Assistant
//           </button>
//           {/* Dark mode */}
//           <button onClick={() => setDark(d => !d)}
//             className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${dark ? 'text-gray-400 hover:bg-gray-800 hover:text-white' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'}`}>
//             {dark ? <Sun size={17} /> : <Moon size={17} />}
//             {dark ? 'Light Mode' : 'Dark Mode'}
//           </button>
//         </div>
//       </aside>

//       {/* Main */}
//       <main className="ml-60 flex-1 min-h-screen">
//         {/* Topbar */}
//         <div className={`sticky top-0 z-20 px-8 py-4 border-b flex items-center justify-between ${dark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'}`}>
//           <div>
//             <h1 className={`text-lg font-bold ${textMain}`}>
//               {navItems.find(n => n.id === section)?.label}
//             </h1>
//             <p className={`text-xs ${textMuted}`}>{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
//           </div>
//           <div className="flex items-center gap-3">
//             <label className="flex items-center gap-2 text-sm px-4 py-2 bg-indigo-600 text-white rounded-xl cursor-pointer hover:bg-indigo-700 transition font-medium">
//               <Upload size={15} />
//               Import CSV
//               <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
//             </label>
//           </div>
//         </div>

//         <div className="px-8 py-6">
//           {uploadedFile && (
//             <div className={`mb-5 flex items-center justify-between p-3 px-4 rounded-xl border text-sm ${dark ? 'bg-emerald-900/20 border-emerald-800 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-700'}`}>
//               <span>✓ Loaded: <strong>{uploadedFile}</strong> — {analytics?.transactionCount} transactions</span>
//               <button onClick={() => { setUploadedFile(null); setTransactions([]); setAnalytics(null); }}
//                 className="hover:opacity-70 transition"><X size={14} /></button>
//             </div>
//           )}

//           {/* ── DASHBOARD ── */}
//           {section === 'dashboard' && (
//             <div className="space-y-6">
//               {/* Stats Row */}
//               <div className="grid grid-cols-4 gap-4">
//                 {/* Wallet Balance from API */}
//                 <div className={`rounded-2xl p-6 border col-span-1 ${dark ? 'bg-indigo-900/40 border-indigo-800' : 'bg-indigo-600'}`}>
//                   <div className="flex items-start justify-between mb-3">
//                     <div>
//                       <p className="text-indigo-200 text-xs font-semibold uppercase tracking-wider mb-1">Wallet Balance</p>
//                       {balanceLoading ? (
//                         <div className="h-8 w-24 bg-indigo-500/40 rounded animate-pulse" />
//                       ) : (
//                         <h3 className="text-2xl font-bold font-mono text-white">
//                           {walletBalance !== null ? `₹${Number(walletBalance).toLocaleString('en-IN')}` : '—'}
//                         </h3>
//                       )}
//                     </div>
//                     <button onClick={fetchWalletBalance} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition">
//                       <RefreshCw size={15} className="text-white" />
//                     </button>
//                   </div>
//                   <p className="text-indigo-200 text-xs">Live from wallet</p>
//                 </div>

//                 <StatCard icon={TrendingUp} label="Total Income" value={`₹${(analytics?.totalIncome || 0).toLocaleString('en-IN')}`} sub={`${analytics?.savingsRate || 0}% savings rate`} color="text-emerald-500" dark={dark} />
//                 <StatCard icon={TrendingDown} label="Total Expenses" value={`₹${(analytics?.totalExpenses || 0).toLocaleString('en-IN')}`} sub={`Across ${Object.keys(analytics?.categoryBreakdown || {}).length} categories`} color="text-red-500" dark={dark} />
//                 <StatCard icon={Activity} label="Avg Daily Spend" value={`₹${analytics?.avgDailySpend || 0}`} sub={`${analytics?.transactionCount || 0} total transactions`} color="text-amber-500" dark={dark} />
//               </div>

//               {/* Recent Transactions + Line Chart */}
//               <div className="grid grid-cols-2 gap-6">
//                 {/* Transactions */}
//                 <div className={`rounded-2xl border ${dark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
//                   <div className={`flex items-center justify-between px-5 py-4 border-b ${dark ? 'border-gray-700' : 'border-gray-100'}`}>
//                     <h3 className={`font-semibold text-sm ${textMain}`}>Recent Transactions</h3>
//                     <div className="flex gap-1">
//                       {['all', 'income', 'expense'].map(tab => (
//                         <button key={tab} onClick={() => setActiveTab(tab)}
//                           className={`px-3 py-1 rounded-lg text-xs font-medium capitalize transition ${activeTab === tab
//                               ? tab === 'income' ? 'bg-emerald-100 text-emerald-700' : tab === 'expense' ? 'bg-red-100 text-red-700' : 'bg-indigo-100 text-indigo-700'
//                               : dark ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-500 hover:bg-gray-100'
//                             }`}>{tab}</button>
//                       ))}
//                     </div>
//                   </div>
//                   <div className="overflow-auto max-h-80">
//                     {filteredTx.slice(0, 12).map(t => {
//                       const Icon = getCategoryIcon(t.category);
//                       return (
//                         <div key={t.id} className={`flex items-center gap-3 px-5 py-3 border-b last:border-0 transition ${dark ? 'border-gray-700/50 hover:bg-gray-750' : 'border-gray-50 hover:bg-gray-50'}`}>
//                           <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${t.type === 'income' ? 'bg-emerald-100' : dark ? 'bg-red-900/30' : 'bg-red-50'}`}>
//                             <Icon size={15} className={t.type === 'income' ? 'text-emerald-600' : 'text-red-500'} />
//                           </div>
//                           <div className="flex-1 min-w-0">
//                             <p className={`text-sm font-medium truncate ${textMain}`}>{t.name}</p>
//                             <p className={`text-xs ${textMuted}`}>{t.date} · {t.category}</p>
//                           </div>
//                           <span className={`font-mono text-sm font-semibold ${t.type === 'income' ? 'text-emerald-500' : 'text-red-500'}`}>
//                             {t.type === 'income' ? '+' : '-'}₹{Math.abs(t.amount).toLocaleString('en-IN')}
//                           </span>
//                         </div>
//                       );
//                     })}
//                     {filteredTx.length === 0 && (
//                       <p className={`text-center text-sm py-10 ${textMuted}`}>No transactions. Upload a CSV to get started.</p>
//                     )}
//                   </div>
//                 </div>

//                 {/* Balance Trend */}
//                 <div className={`rounded-2xl p-6 border ${dark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
//                   <h3 className={`font-semibold text-sm mb-4 ${textMain}`}>Balance Trend</h3>
//                   <ResponsiveContainer width="100%" height={300}>
//                     <AreaChart data={analytics?.dailySpending || []}>
//                       <defs>
//                         <linearGradient id="balG" x1="0" y1="0" x2="0" y2="1">
//                           <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
//                           <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
//                         </linearGradient>
//                       </defs>
//                       <CartesianGrid strokeDasharray="3 3" stroke={dark ? '#374151' : '#f3f4f6'} />
//                       <XAxis dataKey="date" fontSize={10} stroke={dark ? '#9ca3af' : '#6b7280'}
//                         tickFormatter={v => { const d = new Date(v); return isNaN(d) ? v : `${d.getDate()}/${d.getMonth() + 1}`; }} />
//                       <YAxis fontSize={10} stroke={dark ? '#9ca3af' : '#6b7280'} />
//                       <Tooltip content={<CustomTooltip dark={dark} />} />
//                       <Area type="monotone" dataKey="balance" stroke="#6366f1" fill="url(#balG)" strokeWidth={2.5} name="Balance"
//                         dot={false} activeDot={{ r: 4, fill: '#6366f1' }} />
//                     </AreaChart>
//                   </ResponsiveContainer>
//                 </div>
//               </div>

//               {/* Category cards */}
//               {analytics?.categoryBreakdown && Object.keys(analytics.categoryBreakdown).length > 0 && (
//                 <div className={`rounded-2xl p-6 border ${dark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
//                   <h3 className={`font-semibold text-sm mb-5 ${textMain}`}>Spending by Category</h3>
//                   <div className="grid grid-cols-4 gap-3">
//                     {Object.entries(analytics.categoryBreakdown).sort((a, b) => b[1] - a[1]).map(([cat, amt], i) => {
//                       const Icon = getCategoryIcon(cat);
//                       const pct = ((amt / analytics.totalExpenses) * 100).toFixed(0);
//                       return (
//                         <div key={cat} className={`p-4 rounded-xl border transition hover:shadow-sm ${dark ? 'bg-gray-750 border-gray-700' : 'bg-gray-50 border-gray-100'}`}>
//                           <div className="flex items-center gap-2 mb-3">
//                             <div className="p-1.5 rounded-lg" style={{ background: COLORS[i % COLORS.length] + '22' }}>
//                               <Icon size={14} style={{ color: COLORS[i % COLORS.length] }} />
//                             </div>
//                             <span className={`text-xs font-medium ${textMuted}`}>{cat}</span>
//                           </div>
//                           <p className={`text-lg font-bold font-mono ${textMain}`}>₹{amt.toFixed(0)}</p>
//                           <p className={`text-xs mt-1 ${textMuted}`}>{pct}% of spend</p>
//                         </div>
//                       );
//                     })}
//                   </div>
//                 </div>
//               )}
//             </div>
//           )}

//           {section === 'reports' && <ReportsSection analytics={analytics} transactions={transactions} dark={dark} />}
//           {section === 'analytics' && <AnalyticsSection analytics={analytics} dark={dark} />}
//           {section === 'planning' && <PlanningSection analytics={analytics} dark={dark} />}
//         </div>
//       </main>
//     </div>
//   );
// }
