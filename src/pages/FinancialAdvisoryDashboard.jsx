
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Upload, TrendingUp, TrendingDown, DollarSign, PieChart as PieIcon,
  BarChart3, Calendar, ArrowRight, FileText, Coffee, ShoppingBag,
  Zap, Car, Film, Heart, Wifi, CreditCard, Moon, Sun, MessageCircle,
  RefreshCw, Target, AlertTriangle, CheckCircle, ChevronDown, ChevronUp,
  Wallet, Activity, Download, Filter, Home, X, Bell, Settings, User,
  LogOut, ChevronRight, Search, Command, Shield, Globe, Palette,
  Database, Lock, Eye, EyeOff, Sliders, HelpCircle, ExternalLink,
  Copy, Check, Smartphone, Mail, MapPin, Edit3, Camera, Star,
  TrendingUp as Trend, Repeat, AlertCircle, Info, Plus, Minus,
  ArrowUpRight, ArrowDownLeft, Clock, Bookmark, Hash, BarChart2,
  PieChart, Layers, Zap as ZapIcon, Award, Gift, Percent
} from 'lucide-react';
import {
  BarChart, Bar,
  PieChart as RePieChart, Pie, Cell,
  LineChart, Line,
  AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { useNavigate, useLocation } from "react-router-dom";

// ─── Constants ────────────────────────────────────────────────────────────────
const COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ec4899', '#3b82f6', '#f97316', '#8b5cf6', '#14b8a6'];

const CATEGORY_ICONS = {
  'Food & Dining': Coffee, 'Shopping': ShoppingBag, 'Transport': Car,
  'Entertainment': Film, 'Utilities': Wifi, 'Healthcare': Heart,
  'Insurance': CreditCard, 'Income': DollarSign, 'Travel': ZapIcon, 'Groceries': ShoppingBag,
};

const BUDGET_DEFAULTS = {
  'Food & Dining': 5000, 'Shopping': 8000, 'Transport': 3000,
  'Entertainment': 2000, 'Utilities': 2500, 'Healthcare': 2000,
  'Groceries': 4000, 'Other': 3000,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function categorizeTransaction(description = '') {
  const d = description.toLowerCase();
  if (d.includes('salary') || d.includes('credit')) return 'Income';
  if (['zomato','swiggy','dominos','starbucks','restaurant','café','cafe'].some(k=>d.includes(k))) return 'Food & Dining';
  if (['amazon','flipkart','ajio','decathlon','myntra','meesho'].some(k=>d.includes(k))) return 'Shopping';
  if (['ola','uber','petrol','metro','bus','cab','rapido','namma'].some(k=>d.includes(k))) return 'Transport';
  if (['netflix','apple music','google play','bookmyshow','hotstar','prime','spotify'].some(k=>d.includes(k))) return 'Entertainment';
  if (['electricity','broadband','phonepe','bsnl','airtel','jio','water','gas'].some(k=>d.includes(k))) return 'Utilities';
  if (['pharmacy','apollo','medplus','hospital','clinic','health'].some(k=>d.includes(k))) return 'Healthcare';
  if (['irctc','ticket','makemytrip','yatra'].some(k=>d.includes(k))) return 'Travel';
  if (['lic','insurance','policy'].some(k=>d.includes(k))) return 'Insurance';
  if (['kirana','metro cash','grocery','bigbasket','blinkit','zepto'].some(k=>d.includes(k))) return 'Groceries';
  return 'Other';
}
function getCategoryIcon(cat) { return CATEGORY_ICONS[cat] || FileText; }

function parseCSV(text) {
  const lines = text.split('\n').filter(l => l.trim());
  const headers = lines[0].split(',').map(h => h.trim());
  return lines.slice(1).map((line, idx) => {
    const values = line.split(',').map(v => v.trim());
    const row = {}; headers.forEach((h, i) => { row[h] = values[i] || ''; });
    const debit = parseFloat(row.Debit) || 0;
    const credit = parseFloat(row.Credit) || 0;
    const amount = credit > 0 ? credit : -debit;
    return {
      id: idx+1, name: row.Description||row.description||`Transaction ${idx+1}`,
      amount, type: amount >= 0 ? 'income' : 'expense',
      category: categorizeTransaction(row.Description||row.description||''),
      date: row.Date||row.date||'', balance: parseFloat(row.Balance)||0,
    };
  });
}

function calculateAnalytics(data) {
  const income = data.filter(t=>t.amount>0).reduce((s,t)=>s+t.amount,0);
  const expenses = Math.abs(data.filter(t=>t.amount<0).reduce((s,t)=>s+t.amount,0));
  const categoryBreakdown = data.reduce((acc,t) => {
    if (t.amount<0) { const cat=t.category; acc[cat]=(acc[cat]||0)+Math.abs(t.amount); }
    return acc;
  }, {});
  const dailyMap = data.reduce((acc,t) => {
    const date=t.date;
    if (!acc[date]) acc[date]={date,income:0,expense:0,netFlow:0};
    if (t.amount>0) { acc[date].income+=t.amount; acc[date].netFlow+=t.amount; }
    else { acc[date].expense+=Math.abs(t.amount); acc[date].netFlow+=t.amount; }
    return acc;
  }, {});
  const dailySpending = Object.values(dailyMap).sort((a,b)=>new Date(a.date)-new Date(b.date))
    .reduce((acc,day,i)=>{ const prev=i>0?acc[i-1].balance:0; acc.push({...day,balance:prev+day.netFlow}); return acc; },[]);
  const topExpenses = data.filter(t=>t.amount<0).sort((a,b)=>Math.abs(b.amount)-Math.abs(a.amount)).slice(0,5);
  const categoryPieData = Object.entries(categoryBreakdown).map(([name,value])=>({name,value}));
  const monthlyMap = data.reduce((acc,t) => {
    const d=new Date(t.date);
    const key=isNaN(d)?'Unknown':`${d.toLocaleString('default',{month:'short'})} ${d.getFullYear()}`;
    if (!acc[key]) acc[key]={month:key,income:0,expense:0};
    if (t.amount>0) acc[key].income+=t.amount; else acc[key].expense+=Math.abs(t.amount);
    return acc;
  }, {});
  return {
    totalIncome:income, totalExpenses:expenses, categoryBreakdown,
    dailySpending, topExpenses, categoryPieData,
    monthlyData:Object.values(monthlyMap),
    savingsRate: income>0?((income-expenses)/income*100).toFixed(1):0,
    transactionCount:data.length,
    avgDailySpend: dailySpending.length>0?(expenses/dailySpending.length).toFixed(0):0,
  };
}

// ─── Toast System ─────────────────────────────────────────────────────────────
function Toast({ toasts, removeToast }) {
  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => (
        <div key={t.id} className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl border text-sm font-medium transition-all duration-300 animate-in slide-in-from-right-4 ${
          t.type==='success' ? 'bg-emerald-600 text-white border-emerald-500'
          : t.type==='error' ? 'bg-red-600 text-white border-red-500'
          : t.type==='warning' ? 'bg-amber-500 text-white border-amber-400'
          : 'bg-gray-900 text-white border-gray-700'
        }`}>
          {t.type==='success' && <CheckCircle size={16} />}
          {t.type==='error' && <AlertCircle size={16} />}
          {t.type==='warning' && <AlertTriangle size={16} />}
          {t.type==='info' && <Info size={16} />}
          {t.message}
          <button onClick={()=>removeToast(t.id)} className="ml-2 opacity-70 hover:opacity-100"><X size={14}/></button>
        </div>
      ))}
    </div>
  );
}

function useToast() {
  const [toasts, setToasts] = useState([]);
  const addToast = useCallback((message, type='info', duration=3500) => {
    const id = Date.now();
    setToasts(t=>[...t,{id,message,type}]);
    setTimeout(()=>setToasts(t=>t.filter(x=>x.id!==id)), duration);
  }, []);
  const removeToast = useCallback(id=>setToasts(t=>t.filter(x=>x.id!==id)),[]);
  return { toasts, addToast, removeToast };
}

// ─── Notification Panel ───────────────────────────────────────────────────────
const MOCK_NOTIFS = [
  { id:1, title:'Budget Alert', message:'You\'ve used 85% of your Food & Dining budget', time:'2m ago', type:'warning', read:false },
  { id:2, title:'Transaction Synced', message:'25 new transactions loaded from your account', time:'1h ago', type:'success', read:false },
  { id:3, title:'Savings Milestone', message:'You\'ve saved ₹10,000 this month! 🎉', time:'3h ago', type:'success', read:true },
  { id:4, title:'Unusual Spend', message:'Large transaction of ₹4,500 on Shopping detected', time:'1d ago', type:'info', read:true },
  { id:5, title:'Goal Progress', message:'Emergency Fund is 45% complete', time:'2d ago', type:'info', read:true },
];

function NotificationPanel({ dark, onClose, notifs, setNotifs }) {
  const markAll = () => setNotifs(n=>n.map(x=>({...x,read:true})));
  return (
    <div className={`absolute right-0 top-full mt-2 w-96 rounded-2xl border shadow-2xl z-50 overflow-hidden ${dark?'bg-gray-900 border-gray-700':'bg-white border-gray-200'}`}>
      <div className={`flex items-center justify-between px-5 py-4 border-b ${dark?'border-gray-800':'border-gray-100'}`}>
        <div>
          <h3 className={`font-bold text-sm ${dark?'text-white':'text-gray-900'}`}>Notifications</h3>
          <p className="text-xs text-gray-500">{notifs.filter(n=>!n.read).length} unread</p>
        </div>
        <div className="flex gap-2">
          <button onClick={markAll} className="text-xs text-indigo-500 hover:text-indigo-400 font-medium">Mark all read</button>
          <button onClick={onClose} className={`p-1 rounded-lg ${dark?'hover:bg-gray-800':'hover:bg-gray-100'}`}><X size={14} className={dark?'text-gray-400':'text-gray-500'}/></button>
        </div>
      </div>
      <div className="max-h-96 overflow-y-auto">
        {notifs.map(n=>(
          <div key={n.id} onClick={()=>setNotifs(prev=>prev.map(x=>x.id===n.id?{...x,read:true}:x))}
            className={`flex gap-3 px-5 py-4 border-b cursor-pointer transition ${dark?'border-gray-800 hover:bg-gray-800':'border-gray-50 hover:bg-gray-50'} ${!n.read ? dark?'bg-indigo-900/10':'bg-indigo-50/50':''}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
              n.type==='warning'?'bg-amber-100 text-amber-600':n.type==='success'?'bg-emerald-100 text-emerald-600':'bg-blue-100 text-blue-600'}`}>
              {n.type==='warning'?<AlertTriangle size={14}/>:n.type==='success'?<CheckCircle size={14}/>:<Info size={14}/>}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <p className={`text-sm font-semibold ${dark?'text-gray-200':'text-gray-800'}`}>{n.title}</p>
                {!n.read && <span className="w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0 mt-1"/>}
              </div>
              <p className={`text-xs mt-0.5 leading-relaxed ${dark?'text-gray-400':'text-gray-600'}`}>{n.message}</p>
              <p className="text-xs text-gray-400 mt-1">{n.time}</p>
            </div>
          </div>
        ))}
      </div>
      <div className={`px-5 py-3 border-t ${dark?'border-gray-800':'border-gray-100'}`}>
        <button className="text-xs text-indigo-500 hover:text-indigo-400 font-medium w-full text-center">View all notifications</button>
      </div>
    </div>
  );
}

// ─── Profile Menu ─────────────────────────────────────────────────────────────
function ProfileMenu({ dark, user, onClose, onLogout, onOpenSettings, onOpenProfile }) {
  const initials = (user?.name||'U').split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase();
  return (
    <div className={`absolute right-0 top-full mt-2 w-72 rounded-2xl border shadow-2xl z-50 overflow-hidden ${dark?'bg-gray-900 border-gray-700':'bg-white border-gray-200'}`}>
      {/* Header */}
      <div className={`px-5 py-4 border-b ${dark?'border-gray-800 bg-gradient-to-br from-indigo-900/40 to-violet-900/20':'border-gray-100 bg-gradient-to-br from-indigo-50 to-violet-50'}`}>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className={`font-bold text-sm ${dark?'text-white':'text-gray-900'}`}>{user?.name||'User'}</p>
            <p className={`text-xs ${dark?'text-gray-400':'text-gray-500'} truncate`}>{user?.email||user?.upiId||'user@example.com'}</p>
            <div className="flex items-center gap-1 mt-1">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"/>
              <span className="text-xs text-emerald-500 font-medium">Active</span>
            </div>
          </div>
        </div>
        {user?.upiId && (
          <div className={`mt-3 flex items-center gap-2 px-3 py-2 rounded-xl text-xs ${dark?'bg-gray-800 text-gray-300':'bg-white/80 text-gray-700'}`}>
            <Hash size={12} className="text-indigo-500"/>
            <span className="font-mono">{user.upiId}</span>
            <button className="ml-auto opacity-60 hover:opacity-100" title="Copy UPI ID"
              onClick={()=>navigator.clipboard.writeText(user.upiId)}>
              <Copy size={11}/>
            </button>
          </div>
        )}
      </div>
      {/* Menu Items */}
      <div className="py-2">
        {[
          { icon: User, label: 'View Profile', action: onOpenProfile },
          { icon: Settings, label: 'Settings', action: onOpenSettings },
          { icon: Shield, label: 'Privacy & Security', action: ()=>{} },
          { icon: HelpCircle, label: 'Help & Support', action: ()=>{} },
        ].map(({icon:Icon,label,action})=>(
          <button key={label} onClick={()=>{action();onClose();}}
            className={`w-full flex items-center gap-3 px-5 py-2.5 text-sm transition ${dark?'text-gray-300 hover:bg-gray-800':'text-gray-700 hover:bg-gray-50'}`}>
            <Icon size={16} className={dark?'text-gray-500':'text-gray-400'}/>
            {label}
            <ChevronRight size={14} className="ml-auto opacity-40"/>
          </button>
        ))}
      </div>
      <div className={`border-t py-2 ${dark?'border-gray-800':'border-gray-100'}`}>
        <button onClick={()=>{onLogout();onClose();}}
          className="w-full flex items-center gap-3 px-5 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition">
          <LogOut size={16}/> Sign Out
        </button>
      </div>
    </div>
  );
}

// ─── Settings Modal ───────────────────────────────────────────────────────────
function SettingsModal({ dark, onClose, settings, onSave, addToast }) {
  const [local, setLocal] = useState(settings);
  const [tab, setTab] = useState('general');
  const update = (key, val) => setLocal(s=>({...s,[key]:val}));

  const tabs = [
    { id:'general', label:'General', icon:Sliders },
    { id:'appearance', label:'Appearance', icon:Palette },
    { id:'notifications', label:'Alerts', icon:Bell },
    { id:'privacy', label:'Privacy', icon:Shield },
    { id:'data', label:'Data', icon:Database },
  ];

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}/>
      <div className={`relative w-full max-w-2xl rounded-2xl border shadow-2xl overflow-hidden ${dark?'bg-gray-900 border-gray-700':'bg-white border-gray-200'}`}>
        {/* Header */}
        <div className={`flex items-center justify-between px-6 py-5 border-b ${dark?'border-gray-800':'border-gray-100'}`}>
          <div>
            <h2 className={`text-lg font-bold ${dark?'text-white':'text-gray-900'}`}>Settings</h2>
            <p className={`text-xs mt-0.5 ${dark?'text-gray-500':'text-gray-500'}`}>Manage your preferences and account</p>
          </div>
          <button onClick={onClose} className={`p-2 rounded-xl transition ${dark?'hover:bg-gray-800 text-gray-400':'hover:bg-gray-100 text-gray-500'}`}><X size={18}/></button>
        </div>

        <div className="flex min-h-[420px]">
          {/* Sidebar */}
          <div className={`w-44 border-r flex-shrink-0 py-3 ${dark?'border-gray-800 bg-gray-900/50':'border-gray-100 bg-gray-50/50'}`}>
            {tabs.map(({id,label,icon:Icon})=>(
              <button key={id} onClick={()=>setTab(id)}
                className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium transition ${tab===id
                  ? dark?'bg-indigo-600/20 text-indigo-400 border-r-2 border-indigo-500':'bg-indigo-50 text-indigo-600 border-r-2 border-indigo-500'
                  : dark?'text-gray-400 hover:text-gray-200 hover:bg-gray-800':'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}>
                <Icon size={15}/>{label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            {tab==='general' && (
              <div className="space-y-5">
                <h3 className={`text-sm font-bold ${dark?'text-gray-300':'text-gray-700'}`}>General Preferences</h3>
                {[
                  { key:'currency', label:'Currency', type:'select', options:['INR (₹)','USD ($)','EUR (€)','GBP (£)'] },
                  { key:'dateFormat', label:'Date Format', type:'select', options:['DD/MM/YYYY','MM/DD/YYYY','YYYY-MM-DD'] },
                  { key:'language', label:'Language', type:'select', options:['English','Hindi','Tamil','Telugu'] },
                ].map(({key,label,type,options})=>(
                  <div key={key} className="flex items-center justify-between">
                    <label className={`text-sm ${dark?'text-gray-300':'text-gray-700'}`}>{label}</label>
                    <select value={local[key]||options[0]} onChange={e=>update(key,e.target.value)}
                      className={`text-sm px-3 py-2 rounded-xl border outline-none ${dark?'bg-gray-800 border-gray-600 text-white':'bg-gray-50 border-gray-200 text-gray-900'}`}>
                      {options.map(o=><option key={o}>{o}</option>)}
                    </select>
                  </div>
                ))}
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-medium ${dark?'text-gray-300':'text-gray-700'}`}>Compact View</p>
                    <p className="text-xs text-gray-500">Reduce spacing in transaction list</p>
                  </div>
                  <button onClick={()=>update('compactView',!local.compactView)}
                    className={`w-11 h-6 rounded-full transition-colors relative ${local.compactView?'bg-indigo-600':'bg-gray-300 dark:bg-gray-600'}`}>
                    <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${local.compactView?'left-5':'left-0.5'}`}/>
                  </button>
                </div>
              </div>
            )}
            {tab==='appearance' && (
              <div className="space-y-5">
                <h3 className={`text-sm font-bold ${dark?'text-gray-300':'text-gray-700'}`}>Appearance</h3>
                <div>
                  <p className={`text-sm mb-3 ${dark?'text-gray-300':'text-gray-700'}`}>Accent Color</p>
                  <div className="flex gap-2">
                    {['#6366f1','#10b981','#f59e0b','#ec4899','#3b82f6','#f97316'].map(c=>(
                      <button key={c} onClick={()=>update('accentColor',c)}
                        className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${local.accentColor===c?'border-white scale-110':'border-transparent'}`}
                        style={{background:c}}/>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-medium ${dark?'text-gray-300':'text-gray-700'}`}>Animations</p>
                    <p className="text-xs text-gray-500">Enable UI transitions</p>
                  </div>
                  <button onClick={()=>update('animations',!local.animations)}
                    className={`w-11 h-6 rounded-full transition-colors relative ${local.animations!==false?'bg-indigo-600':'bg-gray-300'}`}>
                    <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${local.animations!==false?'left-5':'left-0.5'}`}/>
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-medium ${dark?'text-gray-300':'text-gray-700'}`}>Show Balance</p>
                    <p className="text-xs text-gray-500">Show/hide wallet balance on dashboard</p>
                  </div>
                  <button onClick={()=>update('showBalance',!local.showBalance)}
                    className={`w-11 h-6 rounded-full transition-colors relative ${local.showBalance!==false?'bg-indigo-600':'bg-gray-300'}`}>
                    <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${local.showBalance!==false?'left-5':'left-0.5'}`}/>
                  </button>
                </div>
              </div>
            )}
            {tab==='notifications' && (
              <div className="space-y-4">
                <h3 className={`text-sm font-bold ${dark?'text-gray-300':'text-gray-700'}`}>Alert Preferences</h3>
                {[
                  { key:'budgetAlerts', label:'Budget Alerts', desc:'Notify when approaching budget limit' },
                  { key:'unusualSpend', label:'Unusual Spending', desc:'Flag transactions that seem anomalous' },
                  { key:'weeklyReport', label:'Weekly Report', desc:'Summary email every Sunday' },
                  { key:'goalUpdates', label:'Goal Updates', desc:'Progress notifications for your goals' },
                  { key:'transactionAlerts', label:'New Transactions', desc:'Alert on every new transaction' },
                ].map(({key,label,desc})=>(
                  <div key={key} className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm font-medium ${dark?'text-gray-300':'text-gray-700'}`}>{label}</p>
                      <p className="text-xs text-gray-500">{desc}</p>
                    </div>
                    <button onClick={()=>update(key,!local[key])}
                      className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0 ${local[key]!==false?'bg-indigo-600':'bg-gray-300 dark:bg-gray-600'}`}>
                      <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${local[key]!==false?'left-5':'left-0.5'}`}/>
                    </button>
                  </div>
                ))}
                <div>
                  <p className={`text-sm font-medium mb-2 ${dark?'text-gray-300':'text-gray-700'}`}>Budget Alert Threshold</p>
                  <div className="flex items-center gap-3">
                    <input type="range" min={50} max={100} step={5} value={local.alertThreshold||80}
                      onChange={e=>update('alertThreshold',+e.target.value)}
                      className="flex-1 accent-indigo-600"/>
                    <span className={`text-sm font-mono font-bold w-12 text-center ${dark?'text-white':'text-gray-900'}`}>{local.alertThreshold||80}%</span>
                  </div>
                </div>
              </div>
            )}
            {tab==='privacy' && (
              <div className="space-y-4">
                <h3 className={`text-sm font-bold ${dark?'text-gray-300':'text-gray-700'}`}>Privacy & Security</h3>
                {[
                  { key:'hideAmounts', label:'Hide Amounts', desc:'Blur financial values by default' },
                  { key:'twoFactor', label:'Two-Factor Auth', desc:'Add extra security to your account' },
                  { key:'sessionTimeout', label:'Auto Logout', desc:'Sign out after 30 minutes of inactivity' },
                ].map(({key,label,desc})=>(
                  <div key={key} className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm font-medium ${dark?'text-gray-300':'text-gray-700'}`}>{label}</p>
                      <p className="text-xs text-gray-500">{desc}</p>
                    </div>
                    <button onClick={()=>update(key,!local[key])}
                      className={`w-11 h-6 rounded-full transition-colors relative ${local[key]?'bg-indigo-600':'bg-gray-300 dark:bg-gray-600'}`}>
                      <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${local[key]?'left-5':'left-0.5'}`}/>
                    </button>
                  </div>
                ))}
                <button className="w-full py-2.5 rounded-xl border border-red-200 text-red-500 text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition mt-2">
                  Delete Account & Data
                </button>
              </div>
            )}
            {tab==='data' && (
              <div className="space-y-4">
                <h3 className={`text-sm font-bold ${dark?'text-gray-300':'text-gray-700'}`}>Data Management</h3>
                <div className={`p-4 rounded-xl border ${dark?'bg-gray-800 border-gray-700':'bg-gray-50 border-gray-200'}`}>
                  <p className={`text-sm font-medium mb-1 ${dark?'text-gray-200':'text-gray-700'}`}>Export Your Data</p>
                  <p className="text-xs text-gray-500 mb-3">Download all your transactions and analytics</p>
                  <div className="flex gap-2">
                    {['CSV','JSON','PDF'].map(fmt=>(
                      <button key={fmt} className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-medium hover:bg-indigo-700 transition">{fmt}</button>
                    ))}
                  </div>
                </div>
                <div className={`p-4 rounded-xl border ${dark?'bg-gray-800 border-gray-700':'bg-gray-50 border-gray-200'}`}>
                  <p className={`text-sm font-medium mb-1 ${dark?'text-gray-200':'text-gray-700'}`}>Data Retention</p>
                  <p className="text-xs text-gray-500 mb-3">How long to keep transaction history</p>
                  <select className={`text-sm px-3 py-2 rounded-xl border outline-none w-full ${dark?'bg-gray-700 border-gray-600 text-white':'bg-white border-gray-200'}`}>
                    {['3 months','6 months','1 year','Forever'].map(o=><option key={o}>{o}</option>)}
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className={`flex items-center justify-end gap-3 px-6 py-4 border-t ${dark?'border-gray-800':'border-gray-100'}`}>
          <button onClick={onClose} className={`px-4 py-2 rounded-xl text-sm font-medium border transition ${dark?'border-gray-700 text-gray-300 hover:bg-gray-800':'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>Cancel</button>
          <button onClick={()=>{onSave(local);addToast('Settings saved','success');onClose();}}
            className="px-4 py-2 rounded-xl text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition">Save Changes</button>
        </div>
      </div>
    </div>
  );
}

// ─── Profile View Modal ───────────────────────────────────────────────────────
function ProfileModal({ dark, user, onClose, addToast }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: user?.name||'', email: user?.email||'', phone: user?.phone||'', upiId: user?.upiId||'' });
  const initials = (form.name||'U').split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase();

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}/>
      <div className={`relative w-full max-w-md rounded-2xl border shadow-2xl overflow-hidden ${dark?'bg-gray-900 border-gray-700':'bg-white border-gray-200'}`}>
        {/* Cover */}
        <div className="h-28 bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 relative">
          <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white transition"><X size={16}/></button>
        </div>
        {/* Avatar */}
        <div className="px-6 pb-6">
          <div className="flex items-end justify-between -mt-10 mb-4">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-2xl shadow-xl border-4 border-white dark:border-gray-900">
              {initials}
            </div>
            <button onClick={()=>setEditing(e=>!e)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium border transition ${editing
                ? dark?'bg-indigo-600 text-white border-indigo-600':'bg-indigo-600 text-white border-indigo-600'
                : dark?'border-gray-700 text-gray-300 hover:bg-gray-800':'border-gray-200 text-gray-700 hover:bg-gray-50'}`}>
              <Edit3 size={14}/>{editing?'Cancel':'Edit'}
            </button>
          </div>
          {!editing ? (
            <div className="space-y-3">
              <div>
                <h2 className={`text-xl font-bold ${dark?'text-white':'text-gray-900'}`}>{form.name||'Your Name'}</h2>
                <p className="text-sm text-gray-500">{form.email||'email@example.com'}</p>
              </div>
              {[
                { icon: Smartphone, label: 'Phone', value: form.phone||'Not set' },
                { icon: Hash, label: 'UPI ID', value: form.upiId||'Not set' },
              ].map(({icon:Icon,label,value})=>(
                <div key={label} className={`flex items-center gap-3 p-3 rounded-xl ${dark?'bg-gray-800':'bg-gray-50'}`}>
                  <Icon size={15} className="text-indigo-500"/>
                  <div>
                    <p className="text-xs text-gray-500">{label}</p>
                    <p className={`text-sm font-medium ${dark?'text-gray-200':'text-gray-800'}`}>{value}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {[
                { key:'name', label:'Full Name', placeholder:'Your name' },
                { key:'email', label:'Email', placeholder:'email@example.com' },
                { key:'phone', label:'Phone', placeholder:'+91 XXXXX XXXXX' },
              ].map(({key,label,placeholder})=>(
                <div key={key}>
                  <label className={`block text-xs font-medium mb-1.5 ${dark?'text-gray-400':'text-gray-600'}`}>{label}</label>
                  <input value={form[key]} onChange={e=>setForm(f=>({...f,[key]:e.target.value}))}
                    placeholder={placeholder}
                    className={`w-full px-3 py-2.5 rounded-xl border text-sm outline-none transition ${dark?'bg-gray-800 border-gray-600 text-white placeholder-gray-500 focus:border-indigo-500':'bg-gray-50 border-gray-200 text-gray-900 focus:border-indigo-400'}`}/>
                </div>
              ))}
              <button onClick={()=>{setEditing(false);addToast('Profile updated!','success');}}
                className="w-full py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition">
                Save Profile
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Command Palette ──────────────────────────────────────────────────────────
function CommandPalette({ dark, onClose, onNavigate, onAction }) {
  const [query, setQuery] = useState('');
  const ref = useRef(null);
  useEffect(()=>{ ref.current?.focus(); },[]);

  const allCommands = [
    { group:'Navigate', items:[
      { icon:Home, label:'Dashboard', action:()=>onNavigate('dashboard') },
      { icon:FileText, label:'Reports', action:()=>onNavigate('reports') },
      { icon:BarChart3, label:'Analytics', action:()=>onNavigate('analytics') },
      { icon:Calendar, label:'Planning', action:()=>onNavigate('planning') },
      { icon:MessageCircle, label:'AI Assistant', action:()=>onAction('chatbot') },
    ]},
    { group:'Actions', items:[
      { icon:Upload, label:'Import CSV', action:()=>onAction('import') },
      { icon:Download, label:'Export Data', action:()=>onAction('export') },
      { icon:RefreshCw, label:'Refresh Transactions', action:()=>onAction('refresh') },
      { icon:Settings, label:'Open Settings', action:()=>onAction('settings') },
    ]},
  ];

  const filtered = query.trim()==='' ? allCommands : allCommands.map(g=>({
    ...g, items: g.items.filter(i=>i.label.toLowerCase().includes(query.toLowerCase()))
  })).filter(g=>g.items.length>0);

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-28 px-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}/>
      <div className={`relative w-full max-w-lg rounded-2xl border shadow-2xl overflow-hidden ${dark?'bg-gray-900 border-gray-700':'bg-white border-gray-200'}`}>
        <div className={`flex items-center gap-3 px-4 py-3 border-b ${dark?'border-gray-800':'border-gray-100'}`}>
          <Search size={18} className="text-gray-400"/>
          <input ref={ref} value={query} onChange={e=>setQuery(e.target.value)}
            placeholder="Search commands, pages, actions..."
            className={`flex-1 bg-transparent outline-none text-sm ${dark?'text-white placeholder-gray-500':'text-gray-900 placeholder-gray-400'}`}/>
          <kbd className={`text-xs px-2 py-1 rounded-lg ${dark?'bg-gray-800 text-gray-400':'bg-gray-100 text-gray-500'}`}>ESC</kbd>
        </div>
        <div className="max-h-72 overflow-y-auto py-2">
          {filtered.map(group=>(
            <div key={group.group}>
              <p className={`px-4 py-1.5 text-xs font-bold uppercase tracking-wider ${dark?'text-gray-600':'text-gray-400'}`}>{group.group}</p>
              {group.items.map(item=>(
                <button key={item.label} onClick={()=>{item.action();onClose();}}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition ${dark?'text-gray-300 hover:bg-gray-800':'text-gray-700 hover:bg-gray-50'}`}>
                  <item.icon size={16} className={dark?'text-gray-500':'text-gray-400'}/>
                  {item.label}
                  <ArrowRight size={14} className="ml-auto opacity-30"/>
                </button>
              ))}
            </div>
          ))}
          {filtered.length===0 && (
            <p className="px-4 py-8 text-center text-sm text-gray-500">No results for "{query}"</p>
          )}
        </div>
        <div className={`px-4 py-2.5 border-t text-xs text-gray-500 flex gap-4 ${dark?'border-gray-800':'border-gray-100'}`}>
          <span><kbd className={`px-1.5 py-0.5 rounded ${dark?'bg-gray-800':'bg-gray-100'}`}>↑↓</kbd> navigate</span>
          <span><kbd className={`px-1.5 py-0.5 rounded ${dark?'bg-gray-800':'bg-gray-100'}`}>↵</kbd> select</span>
          <span><kbd className={`px-1.5 py-0.5 rounded ${dark?'bg-gray-800':'bg-gray-100'}`}>ESC</kbd> close</span>
        </div>
      </div>
    </div>
  );
}

// ─── Smart Budget Alert Banner ────────────────────────────────────────────────
function BudgetAlertBanner({ analytics, budgets, dark, threshold=80 }) {
  const [dismissed, setDismissed] = useState([]);
  const alerts = Object.entries(budgets).map(([cat,budget])=>{
    const spent = analytics?.categoryBreakdown?.[cat]||0;
    const pct = budget>0?(spent/budget)*100:0;
    if (pct>=threshold && !dismissed.includes(cat)) return {cat,pct:pct.toFixed(0),over:pct>=100};
    return null;
  }).filter(Boolean);
  if (!alerts.length) return null;
  return (
    <div className="space-y-2 mb-5">
      {alerts.slice(0,3).map(a=>(
        <div key={a.cat} className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium ${
          a.over ? dark?'bg-red-900/20 border-red-800 text-red-400':'bg-red-50 border-red-200 text-red-700'
                 : dark?'bg-amber-900/20 border-amber-800 text-amber-400':'bg-amber-50 border-amber-200 text-amber-700'}`}>
          <AlertTriangle size={15} className="flex-shrink-0"/>
          <span>{a.over?`🚨 ${a.cat} budget exceeded (${a.pct}%)`:`⚠️ ${a.cat} at ${a.pct}% of budget`}</span>
          <button onClick={()=>setDismissed(d=>[...d,a.cat])} className="ml-auto opacity-60 hover:opacity-100 transition-opacity"><X size={14}/></button>
        </div>
      ))}
    </div>
  );
}

// ─── Sub-components (carried from original) ───────────────────────────────────
function StatCard({ icon:Icon, label, value, sub, color, dark }) {
  return (
    <div className={`rounded-2xl p-6 shadow-sm border transition-all hover:shadow-md ${dark?'bg-gray-800 border-gray-700':'bg-white border-gray-100'}`}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className={`text-xs font-semibold uppercase tracking-wider mb-1 ${dark?'text-gray-400':'text-gray-500'}`}>{label}</p>
          <h3 className={`text-2xl font-bold font-mono ${color}`}>{value}</h3>
        </div>
        <div className={`p-2.5 rounded-xl ${dark?'bg-gray-700':'bg-gray-50'}`}><Icon size={20} className={color}/></div>
      </div>
      <p className={`text-xs ${dark?'text-gray-500':'text-gray-400'}`}>{sub}</p>
    </div>
  );
}
function SectionTitle({ title, subtitle, dark }) {
  return (
    <div className="mb-6">
      <h2 className={`text-xl font-bold ${dark?'text-white':'text-gray-900'}`}>{title}</h2>
      {subtitle&&<p className={`text-sm mt-1 ${dark?'text-gray-400':'text-gray-500'}`}>{subtitle}</p>}
    </div>
  );
}
const CustomTooltip = ({ active, payload, label, dark }) => {
  if (!active||!payload?.length) return null;
  return (
    <div className={`p-3 rounded-xl shadow-xl border text-sm ${dark?'bg-gray-800 border-gray-700 text-white':'bg-white border-gray-200 text-gray-800'}`}>
      <p className="font-semibold mb-1">{label||payload[0]?.payload?.date}</p>
      {payload.map((p,i)=>(
        <p key={i} style={{color:p.color}}>{p.name}: ₹{Number(p.value).toLocaleString('en-IN',{maximumFractionDigits:0})}</p>
      ))}
    </div>
  );
};

// ─── Reports / Analytics / Planning (kept from original, condensed) ───────────
function ReportsSection({ analytics, transactions, dark, addToast }) {
  const [filterCat, setFilterCat] = useState('All');
  const categories = ['All',...Object.keys(analytics?.categoryBreakdown||{})];
  const filtered = filterCat==='All'?transactions:transactions.filter(t=>t.category===filterCat);
  const exportCSV = () => {
    const headers='Date,Name,Category,Type,Amount\n';
    const rows=filtered.map(t=>`${t.date},"${t.name}",${t.category},${t.type},${t.amount}`).join('\n');
    const blob=new Blob([headers+rows],{type:'text/csv'});
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a'); a.href=url; a.download='transactions.csv'; a.click();
    addToast('Transactions exported!','success');
  };
  return (
    <div className="space-y-6">
      <SectionTitle title="Reports" subtitle="Detailed transaction history and export options" dark={dark}/>
      <div className="grid grid-cols-3 gap-4">
        {[{label:'Total Transactions',value:analytics?.transactionCount||0,color:'text-indigo-500'},
          {label:'Avg Daily Spend',value:`₹${Number(analytics?.avgDailySpend||0).toLocaleString('en-IN')}`,color:'text-amber-500'},
          {label:'Savings Rate',value:`${analytics?.savingsRate||0}%`,color:'text-emerald-500'},
        ].map((s,i)=>(
          <div key={i} className={`rounded-2xl p-5 border ${dark?'bg-gray-800 border-gray-700':'bg-white border-gray-100'}`}>
            <p className={`text-xs uppercase tracking-wider font-semibold mb-2 ${dark?'text-gray-400':'text-gray-500'}`}>{s.label}</p>
            <p className={`text-2xl font-bold font-mono ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>
      <div className={`rounded-2xl p-6 border ${dark?'bg-gray-800 border-gray-700':'bg-white border-gray-100'}`}>
        <h3 className={`text-base font-semibold mb-4 ${dark?'text-white':'text-gray-800'}`}>Monthly Income vs Expenses</h3>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={analytics?.monthlyData||[]}>
            <CartesianGrid strokeDasharray="3 3" stroke={dark?'#374151':'#f3f4f6'}/>
            <XAxis dataKey="month" fontSize={11} stroke={dark?'#9ca3af':'#6b7280'}/>
            <YAxis fontSize={11} stroke={dark?'#9ca3af':'#6b7280'}/>
            <Tooltip content={<CustomTooltip dark={dark}/>}/>
            <Legend/>
            <Bar dataKey="income" fill="#10b981" name="Income" radius={[6,6,0,0]}/>
            <Bar dataKey="expense" fill="#ef4444" name="Expenses" radius={[6,6,0,0]}/>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className={`rounded-2xl border ${dark?'bg-gray-800 border-gray-700':'bg-white border-gray-100'}`}>
        <div className={`flex items-center justify-between p-5 border-b ${dark?'border-gray-700':'border-gray-100'}`}>
          <h3 className={`font-semibold ${dark?'text-white':'text-gray-800'}`}>Transaction History</h3>
          <div className="flex items-center gap-2">
            <select value={filterCat} onChange={e=>setFilterCat(e.target.value)}
              className={`text-sm px-3 py-1.5 rounded-lg border outline-none ${dark?'bg-gray-700 border-gray-600 text-white':'bg-gray-50 border-gray-200 text-gray-700'}`}>
              {categories.map(c=><option key={c}>{c}</option>)}
            </select>
            <button onClick={exportCSV} className="flex items-center gap-1.5 text-sm px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
              <Download size={14}/> Export
            </button>
          </div>
        </div>
        <div className="overflow-auto max-h-80">
          <table className="w-full text-sm">
            <thead>
              <tr className={`text-xs uppercase tracking-wider ${dark?'text-gray-400':'text-gray-500 bg-gray-50'}`}>
                {['Date','Description','Category','Type','Amount'].map(h=>(
                  <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((t,i)=>(
                <tr key={i} className={`border-t transition ${dark?'border-gray-700 hover:bg-gray-750':'border-gray-50 hover:bg-gray-50'}`}>
                  <td className={`px-4 py-3 font-mono text-xs ${dark?'text-gray-400':'text-gray-500'}`}>{t.date}</td>
                  <td className={`px-4 py-3 font-medium max-w-xs truncate ${dark?'text-gray-200':'text-gray-800'}`}>{t.name}</td>
                  <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${dark?'bg-gray-700 text-gray-300':'bg-gray-100 text-gray-600'}`}>{t.category}</span></td>
                  <td className="px-4 py-3"><span className={`text-xs font-semibold ${t.type==='income'?'text-emerald-500':'text-red-500'}`}>{t.type}</span></td>
                  <td className={`px-4 py-3 font-mono font-semibold ${t.amount>=0?'text-emerald-500':'text-red-500'}`}>
                    {t.amount>=0?'+':''} ₹{Math.abs(t.amount).toLocaleString('en-IN')}
                  </td>
                </tr>
              ))}
              {filtered.length===0 && <tr><td colSpan={5} className={`px-4 py-8 text-center text-sm ${dark?'text-gray-500':'text-gray-400'}`}>No transactions found.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function AnalyticsSection({ analytics, dark }) {
  if (!analytics) return (
    <div className={`rounded-2xl p-12 text-center border ${dark?'bg-gray-800 border-gray-700 text-gray-400':'bg-white border-gray-100 text-gray-400'}`}>
      Upload a CSV or sync transactions to see analytics.
    </div>
  );
  const pieLabel = ({name,percent})=>`${(percent*100).toFixed(0)}%`;
  return (
    <div className="space-y-6">
      <SectionTitle title="Analytics" subtitle="Deep dive into your spending patterns" dark={dark}/>
      <div className="grid grid-cols-2 gap-6">
        <div className={`rounded-2xl p-6 border ${dark?'bg-gray-800 border-gray-700':'bg-white border-gray-100'}`}>
          <h3 className={`font-semibold mb-4 ${dark?'text-white':'text-gray-800'}`}>Expense Distribution</h3>
          <ResponsiveContainer width="100%" height={260}>
            <RePieChart>
              <Pie data={analytics.categoryPieData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={pieLabel} labelLine={false}>
                {analytics.categoryPieData.map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]}/>)}
              </Pie>
              <Tooltip formatter={v=>`₹${Number(v).toLocaleString('en-IN')}`}/>
              <Legend/>
            </RePieChart>
          </ResponsiveContainer>
        </div>
        <div className={`rounded-2xl p-6 border ${dark?'bg-gray-800 border-gray-700':'bg-white border-gray-100'}`}>
          <h3 className={`font-semibold mb-4 ${dark?'text-white':'text-gray-800'}`}>Category-wise Spend</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={analytics.categoryPieData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke={dark?'#374151':'#f3f4f6'} horizontal={false}/>
              <XAxis type="number" fontSize={11} stroke={dark?'#9ca3af':'#6b7280'}/>
              <YAxis type="category" dataKey="name" fontSize={10} width={90} stroke={dark?'#9ca3af':'#6b7280'}/>
              <Tooltip formatter={v=>`₹${Number(v).toLocaleString('en-IN')}`}/>
              <Bar dataKey="value" radius={[0,6,6,0]}>
                {analytics.categoryPieData.map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]}/>)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className={`rounded-2xl p-6 border ${dark?'bg-gray-800 border-gray-700':'bg-white border-gray-100'}`}>
        <h3 className={`font-semibold mb-4 ${dark?'text-white':'text-gray-800'}`}>Daily Cash Flow</h3>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={analytics.dailySpending}>
            <defs>
              <linearGradient id="incG" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="expG" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/><stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={dark?'#374151':'#f3f4f6'}/>
            <XAxis dataKey="date" fontSize={11} stroke={dark?'#9ca3af':'#6b7280'} tickFormatter={v=>{const d=new Date(v);return isNaN(d)?v:`${d.getDate()}/${d.getMonth()+1}`;}}/>
            <YAxis fontSize={11} stroke={dark?'#9ca3af':'#6b7280'}/>
            <Tooltip content={<CustomTooltip dark={dark}/>}/>
            <Legend/>
            <Area type="monotone" dataKey="income" stroke="#10b981" fill="url(#incG)" name="Income" strokeWidth={2}/>
            <Area type="monotone" dataKey="expense" stroke="#ef4444" fill="url(#expG)" name="Expenses" strokeWidth={2}/>
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className={`rounded-2xl p-6 border ${dark?'bg-gray-800 border-gray-700':'bg-white border-gray-100'}`}>
        <h3 className={`font-semibold mb-4 ${dark?'text-white':'text-gray-800'}`}>Top 5 Expenses</h3>
        <div className="space-y-3">
          {analytics.topExpenses.map((t,i)=>{
            const pct=((Math.abs(t.amount)/analytics.totalExpenses)*100).toFixed(1);
            return (
              <div key={i} className={`flex items-center gap-4 p-3 rounded-xl ${dark?'bg-gray-750 hover:bg-gray-700':'bg-gray-50 hover:bg-gray-100'} transition`}>
                <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{background:COLORS[i%COLORS.length]}}>{i+1}</span>
                <div className="flex-1 min-w-0">
                  <p className={`font-medium truncate text-sm ${dark?'text-gray-200':'text-gray-800'}`}>{t.name}</p>
                  <div className="mt-1 h-1.5 rounded-full bg-gray-200 dark:bg-gray-700">
                    <div className="h-1.5 rounded-full" style={{width:`${pct}%`,background:COLORS[i%COLORS.length]}}/>
                  </div>
                </div>
                <span className="font-mono font-bold text-red-500 text-sm">₹{Math.abs(t.amount).toLocaleString('en-IN')}</span>
                <span className={`text-xs ${dark?'text-gray-500':'text-gray-400'}`}>{pct}%</span>
              </div>
            );
          })}
          {!analytics.topExpenses.length && <p className={`text-center text-sm py-4 ${dark?'text-gray-500':'text-gray-400'}`}>No expense data.</p>}
        </div>
      </div>
    </div>
  );
}

function PlanningSection({ analytics, dark, addToast, budgets, setBudgets }) {
  const [editingCat, setEditingCat] = useState(null);
  const [editVal, setEditVal] = useState('');
  const [goals, setGoals] = useState([{id:1,label:'Emergency Fund',target:100000,saved:0}]);
  const [goalInput, setGoalInput] = useState({label:'',target:'',saved:''});
  const [showGoalForm, setShowGoalForm] = useState(false);
  const spending = analytics?.categoryBreakdown||{};
  const savingsRate = parseFloat(analytics?.savingsRate||0);

  const addGoal = () => {
    if (goalInput.label&&goalInput.target) {
      setGoals(g=>[...g,{id:Date.now(),label:goalInput.label,target:parseFloat(goalInput.target),saved:parseFloat(goalInput.saved||0)}]);
      setGoalInput({label:'',target:'',saved:''});
      setShowGoalForm(false);
      addToast('Goal added!','success');
    }
  };
  const removeGoal = id=>setGoals(g=>g.filter(x=>x.id!==id));

  const tips = [];
  if (!analytics) {
    tips.push({type:'tip',text:'Upload a bank statement CSV or sync your account to get personalized financial insights.'});
  } else {
    if (savingsRate<10) tips.push({type:'warn',text:`Your savings rate is only ${savingsRate}%. Try to cut discretionary spending to build an emergency fund first.`});
    else if (savingsRate<20) tips.push({type:'warn',text:`Your savings rate is ${savingsRate}%. Aim for at least 20% to build a healthy financial cushion.`});
    else if (savingsRate>=20) tips.push({type:'good',text:`Great job! Your savings rate of ${savingsRate}% is healthy. Keep it up!`});

    Object.entries(spending).forEach(([cat,spent])=>{
      const budget=budgets[cat];
      if (budget&&spent>budget) tips.push({type:'warn',text:`You've exceeded your ${cat} budget by ₹${(spent-budget).toLocaleString('en-IN')}.`});
      else if (budget&&(spent/budget)>=0.8) tips.push({type:'warn',text:`${cat} spending is at ${((spent/budget)*100).toFixed(0)}% of your budget — watch out!`});
    });

    const foodPct = analytics.totalExpenses>0?(analytics.categoryBreakdown['Food & Dining']||0)/analytics.totalExpenses*100:0;
    if (foodPct>30) tips.push({type:'tip',text:`Food & Dining takes up ${foodPct.toFixed(0)}% of your expenses. Meal prepping or cooking at home more could save significantly.`});

    const shoppingPct = analytics.totalExpenses>0?(analytics.categoryBreakdown['Shopping']||0)/analytics.totalExpenses*100:0;
    if (shoppingPct>25) tips.push({type:'tip',text:`Shopping accounts for ${shoppingPct.toFixed(0)}% of spending. Consider a 24-hour rule before impulse purchases.`});

    if (analytics.totalIncome>0&&analytics.totalExpenses>analytics.totalIncome)
      tips.push({type:'warn',text:`You're spending more than you earn this period. Review your biggest expense categories urgently.`});
    
    if (goals.some(g=>g.saved<g.target)&&savingsRate>0)
      tips.push({type:'tip',text:`At your current savings rate, automate transfers on payday to hit your goals faster without willpower drain.`});
  }

  return (
    <div className="space-y-6">
      <SectionTitle title="Planning" subtitle="Budget tracking, financial goals, and insights" dark={dark}/>
      <div className={`rounded-2xl p-6 border ${dark?'bg-gray-800 border-gray-700':'bg-white border-gray-100'}`}>
        <h3 className={`font-semibold mb-5 ${dark?'text-white':'text-gray-800'}`}>Budget vs Actual</h3>
        <div className="space-y-4">
          {Object.entries(budgets).map(([cat,budget])=>{
            const spent=spending[cat]||0;
            const pct=budget>0?Math.min(100,(spent/budget)*100):0;
            const over=spent>budget;
            const Icon=getCategoryIcon(cat);
            return (
              <div key={cat}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2"><Icon size={14} className={dark?'text-gray-400':'text-gray-500'}/>
                    <span className={`text-sm font-medium ${dark?'text-gray-300':'text-gray-700'}`}>{cat}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-mono ${over?'text-red-500':dark?'text-gray-400':'text-gray-500'}`}>₹{spent.toFixed(0)} / ₹{budget.toFixed(0)}</span>
                    {editingCat===cat?(
                      <div className="flex items-center gap-1">
                        <input value={editVal} onChange={e=>setEditVal(e.target.value)}
                          className={`w-20 text-xs px-2 py-1 rounded border outline-none ${dark?'bg-gray-700 border-gray-600 text-white':'bg-white border-gray-300'}`}/>
                        <button onClick={()=>{setBudgets(b=>({...b,[editingCat]:parseFloat(editVal)||0}));setEditingCat(null);addToast('Budget updated','success');}} className="text-xs px-2 py-1 bg-indigo-600 text-white rounded">✓</button>
                        <button onClick={()=>setEditingCat(null)} className={`text-xs px-2 py-1 rounded ${dark?'bg-gray-700 text-gray-300':'bg-gray-100 text-gray-600'}`}>✕</button>
                      </div>
                    ):(
                      <button onClick={()=>{setEditingCat(cat);setEditVal(budget||'');}} className={`text-xs px-2 py-0.5 rounded ${dark?'text-gray-400 hover:text-gray-200':'text-gray-400 hover:text-gray-600'}`}>Edit</button>
                    )}
                  </div>
                </div>
                <div className={`h-2 rounded-full ${dark?'bg-gray-700':'bg-gray-100'}`}>
                  <div className={`h-2 rounded-full transition-all ${over?'bg-red-500':'bg-indigo-500'}`} style={{width:`${pct}%`}}/>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className={`rounded-2xl p-6 border ${dark?'bg-gray-800 border-gray-700':'bg-white border-gray-100'}`}>
        <div className="flex items-center justify-between mb-5">
          <h3 className={`font-semibold ${dark?'text-white':'text-gray-800'}`}>Financial Goals</h3>
          <button onClick={()=>setShowGoalForm(f=>!f)} className="flex items-center gap-1.5 text-sm px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
            <Plus size={14}/>{showGoalForm?'Cancel':'Add Goal'}
          </button>
        </div>
        {showGoalForm&&(
          <div className={`mb-5 p-4 rounded-xl border space-y-3 ${dark?'bg-gray-750 border-gray-700':'bg-gray-50 border-gray-200'}`}>
            <input placeholder="Goal name" value={goalInput.label} onChange={e=>setGoalInput(g=>({...g,label:e.target.value}))}
              className={`w-full text-sm px-3 py-2 rounded-lg border outline-none ${dark?'bg-gray-700 border-gray-600 text-white placeholder-gray-500':'bg-white border-gray-300'}`}/>
            <div className="grid grid-cols-2 gap-2">
              <input type="number" placeholder="Target (₹)" value={goalInput.target} onChange={e=>setGoalInput(g=>({...g,target:e.target.value}))}
                className={`text-sm px-3 py-2 rounded-lg border outline-none ${dark?'bg-gray-700 border-gray-600 text-white placeholder-gray-500':'bg-white border-gray-300'}`}/>
              <input type="number" placeholder="Saved so far (₹)" value={goalInput.saved} onChange={e=>setGoalInput(g=>({...g,saved:e.target.value}))}
                className={`text-sm px-3 py-2 rounded-lg border outline-none ${dark?'bg-gray-700 border-gray-600 text-white placeholder-gray-500':'bg-white border-gray-300'}`}/>
            </div>
            <button onClick={addGoal} className="w-full py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition">Save Goal</button>
          </div>
        )}
        <div className="space-y-3">
          {goals.map(goal=>{
            const pct=Math.min(100,((goal.saved/goal.target)*100)).toFixed(1);
            const months=analytics?.totalIncome>0&&savingsRate>0?Math.ceil((goal.target-goal.saved)/(analytics.totalIncome*savingsRate/100)):null;
            return (
              <div key={goal.id} className={`p-4 rounded-xl ${dark?'bg-gray-750':'bg-indigo-50'}`}>
                <div className="flex items-center justify-between mb-2">
                  <p className={`font-semibold text-sm ${dark?'text-white':'text-indigo-900'}`}>{goal.label}</p>
                  <div className="flex items-center gap-2">
                    <span className={`text-lg font-bold font-mono ${dark?'text-indigo-400':'text-indigo-600'}`}>{pct}%</span>
                    <button onClick={()=>removeGoal(goal.id)} className="opacity-40 hover:opacity-80 text-red-500"><X size={14}/></button>
                  </div>
                </div>
                <p className={`text-xs mb-2 ${dark?'text-gray-400':'text-indigo-600'}`}>₹{goal.saved.toLocaleString('en-IN')} of ₹{goal.target.toLocaleString('en-IN')}</p>
                <div className={`h-2.5 rounded-full ${dark?'bg-gray-700':'bg-indigo-200'}`}>
                  <div className="h-2.5 rounded-full bg-indigo-500 transition-all" style={{width:`${pct}%`}}/>
                </div>
                {months&&<p className={`text-xs mt-2 ${dark?'text-gray-400':'text-indigo-700'}`}>~<strong>{months} month{months!==1?'s':''}</strong> at current savings rate</p>}
              </div>
            );
          })}
        </div>
      </div>
      <div className={`rounded-2xl p-6 border ${dark?'bg-gray-800 border-gray-700':'bg-white border-gray-100'}`}>
        <h3 className={`font-semibold mb-4 ${dark?'text-white':'text-gray-800'}`}>Personalized Insights</h3>
        {!tips.length&&<p className={`text-sm ${dark?'text-gray-500':'text-gray-400'}`}>Upload transactions to get personalized advice.</p>}
        <div className="space-y-3">
          {tips.map((tip,i)=>{
            const Icon=tip.type==='good'?CheckCircle:tip.type==='warn'?AlertTriangle:Target;
            const color=tip.type==='good'?'text-emerald-500':tip.type==='warn'?'text-amber-500':'text-blue-500';
            const bg=tip.type==='good'?dark?'bg-emerald-900/20 border-emerald-800':'bg-emerald-50 border-emerald-100':tip.type==='warn'?dark?'bg-amber-900/20 border-amber-800':'bg-amber-50 border-amber-100':dark?'bg-blue-900/20 border-blue-800':'bg-blue-50 border-blue-100';
            return (
              <div key={i} className={`flex items-start gap-3 p-3 rounded-xl border ${bg}`}>
                <Icon size={16} className={`mt-0.5 flex-shrink-0 ${color}`}/>
                <p className={`text-sm ${dark?'text-gray-300':'text-gray-700'}`}>{tip.text}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function FinancialAdvisoryDashboard() {
  const [transactions, setTransactions] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [section, setSection] = useState('dashboard');
  const [dark, setDark] = useState(()=>localStorage.getItem('finDark')==='true');
  const [walletBalance, setWalletBalance] = useState(null);
  const [balanceLoading, setBalanceLoading] = useState(false);

  // New state
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  // Lifted budgets so BudgetAlertBanner can use live values
  const [budgets, setBudgets] = useState(BUDGET_DEFAULTS);
  // Lifted notifications so badge count stays in sync
  const [notifs, setNotifs] = useState(MOCK_NOTIFS);
  const [userSettings, setUserSettings] = useState({
    currency:'INR (₹)', dateFormat:'DD/MM/YYYY', language:'English',
    compactView:false, animations:true, showBalance:true, accentColor:'#6366f1',
    budgetAlerts:true, unusualSpend:true, weeklyReport:false,
    goalUpdates:true, transactionAlerts:false, alertThreshold:80,
    hideAmounts:false, twoFactor:false, sessionTimeout:true,
  });

  const unreadNotifs = notifs.filter(n=>!n.read).length;
  const { toasts, addToast, removeToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const user = JSON.parse(localStorage.getItem('user')||'{}');
  const initials = (user?.name||'U').split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase();

  // Keyboard shortcut for command palette
  useEffect(()=>{
    const handler = (e) => {
      if ((e.metaKey||e.ctrlKey)&&e.key==='k') { e.preventDefault(); setShowCommandPalette(c=>!c); }
      if (e.key==='Escape') { setShowCommandPalette(false); setShowNotifications(false); setShowProfileMenu(false); }
    };
    window.addEventListener('keydown',handler);
    return ()=>window.removeEventListener('keydown',handler);
  },[]);

  useEffect(()=>{ localStorage.setItem('finDark',dark); },[dark]);
  useEffect(()=>{
    if (location.state?.activeSection) setSection(location.state.activeSection);
  },[location]);
  useEffect(()=>{ fetchWalletBalance(); fetchTransactionHistory(); },[]);

  const fetchWalletBalance = async () => {
    setBalanceLoading(true);
    try {
      const token=localStorage.getItem('token');
      if (!token) return;
      const res=await fetch('http://localhost:8083/wallet/balance',{headers:{'Authorization':`Bearer ${token}`,'Content-Type':'application/json'}});
      if (!res.ok) throw new Error();
      const data=await res.json();
      setWalletBalance(data.balance??data.amount??data.walletBalance??null);
    } catch { console.error('Balance error'); } finally { setBalanceLoading(false); }
  };

  const fetchTransactionHistory = useCallback(async () => {
    try {
      const token=localStorage.getItem('token');
      const storedUser=JSON.parse(localStorage.getItem('user')||'{}');
      if (!token) return;
      const res=await fetch('http://localhost:8083/transactions/history',{headers:{'Authorization':`Bearer ${token}`,'Content-Type':'application/json'}});
      if (!res.ok) throw new Error();
      const data=await res.json();
      const history=data.transactions||[];
      const formatted=history.slice(0,50).map((t,i)=>{
        const isIncome=t.toUpi===storedUser.upiId;
        return {
          id:t.transactionId||i+1,
          name:isIncome?`Received from ${t.fromUpi}`:`Paid to ${t.toUpi}`,
          amount:isIncome?t.amount:-t.amount,
          type:isIncome?'income':'expense',
          category:t.category||(isIncome?'Income':'Other'),
          date:new Date(t.createdAt).toISOString().split('T')[0],
          status:t.status,
        };
      });
      setTransactions(formatted);
      setAnalytics(calculateAnalytics(formatted));
      addToast(`${formatted.length} transactions synced`,'success');
    } catch { console.error('Transactions error'); }
  },[]);

  const handleFileUpload = (e) => {
    const file=e.target.files[0];
    if (!file) return;
    const reader=new FileReader();
    reader.onload=(ev)=>{
      const parsed=parseCSV(ev.target.result);
      setTransactions(parsed); setAnalytics(calculateAnalytics(parsed)); setUploadedFile(file.name);
      addToast(`${parsed.length} transactions imported from ${file.name}`,'success');
    };
    reader.readAsText(file);
  };

  const filteredTx = activeTab==='all'?transactions:transactions.filter(t=>t.type===activeTab);
  const navItems = [
    {id:'dashboard',label:'Dashboard',icon:Home},
    {id:'reports',label:'Reports',icon:FileText},
    {id:'analytics',label:'Analytics',icon:BarChart3},
    {id:'planning',label:'Planning',icon:Calendar},
  ];

  const bg = dark?'bg-gray-900':'bg-gray-50';
  const sidebarBg = dark?'bg-gray-950 border-gray-800':'bg-white border-gray-200';
  const textMain = dark?'text-white':'text-gray-900';
  const textMuted = dark?'text-gray-400':'text-gray-500';

  return (
    <div className={`min-h-screen flex ${bg} transition-colors duration-200`} style={{fontFamily:"'DM Sans','Inter',sans-serif"}}>
      {/* Toast */}
      <Toast toasts={toasts} removeToast={removeToast}/>

      {/* Modals */}
      {showSettings && <SettingsModal dark={dark} onClose={()=>setShowSettings(false)} settings={userSettings} onSave={setUserSettings} addToast={addToast}/>}
      {showProfile && <ProfileModal dark={dark} user={user} onClose={()=>setShowProfile(false)} addToast={addToast}/>}
      {showCommandPalette && (
        <CommandPalette dark={dark} onClose={()=>setShowCommandPalette(false)}
          onNavigate={(s)=>{setSection(s);setShowCommandPalette(false);}}
          onAction={(a)=>{
            if (a==='chatbot') navigate('/chatbot');
            if (a==='settings') setShowSettings(true);
            if (a==='refresh') { fetchTransactionHistory(); addToast('Syncing transactions…','info'); }
            if (a==='export') {
              if (!transactions.length) { addToast('No transactions to export','warning'); }
              else {
                const headers='Date,Name,Category,Type,Amount\n';
                const rows=transactions.map(t=>`${t.date},"${t.name}",${t.category},${t.type},${t.amount}`).join('\n');
                const blob=new Blob([headers+rows],{type:'text/csv'});
                const url=URL.createObjectURL(blob);
                const a2=document.createElement('a'); a2.href=url; a2.download='transactions.csv'; a2.click();
                addToast('Data exported!','success');
              }
            }
            if (a==='import') document.getElementById('csv-upload-hidden')?.click();
            setShowCommandPalette(false);
          }}/>
      )}

      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 h-full w-60 flex flex-col border-r ${sidebarBg} z-30 shadow-sm`}>
        <div className={`px-6 py-5 border-b ${dark?'border-gray-800':'border-gray-100'}`}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shadow-md">
              <Wallet size={16} className="text-white"/>
            </div>
            <span className={`font-bold text-base tracking-tight ${textMain}`}>AstraGuard</span>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {navItems.map(({id,label,icon:Icon})=>{
            const active=section===id;
            return (
              <button key={id} onClick={()=>setSection(id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${active
                  ?'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                  :dark?'text-gray-400 hover:bg-gray-800 hover:text-white':'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}>
                <Icon size={17}/>{label}
                {active&&<ChevronRight size={14} className="ml-auto opacity-60"/>}
              </button>
            );
          })}
        </nav>
        <div className={`px-3 py-4 border-t ${dark?'border-gray-800':'border-gray-100'} space-y-1`}>
          <button onClick={()=>navigate('/chatbot')}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md hover:shadow-lg transition">
            <MessageCircle size={17}/> AI Assistant
          </button>
          <button onClick={()=>setDark(d=>!d)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${dark?'text-gray-400 hover:bg-gray-800 hover:text-white':'text-gray-500 hover:bg-gray-50 hover:text-gray-800'}`}>
            {dark?<Sun size={17}/>:<Moon size={17}/>} {dark?'Light Mode':'Dark Mode'}
          </button>
          {/* Settings shortcut in sidebar */}
          <button onClick={()=>setShowSettings(true)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${dark?'text-gray-400 hover:bg-gray-800 hover:text-white':'text-gray-500 hover:bg-gray-50 hover:text-gray-800'}`}>
            <Settings size={17}/> Settings
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="ml-60 flex-1 min-h-screen">
        {/* ── Topbar ── */}
        <div className={`sticky top-0 z-20 px-8 py-4 border-b flex items-center justify-between backdrop-blur-sm ${dark?'bg-gray-900/90 border-gray-800':'bg-white/90 border-gray-100'}`}>
          <div>
            <h1 className={`text-lg font-bold ${textMain}`}>{navItems.find(n=>n.id===section)?.label}</h1>
            <p className={`text-xs ${textMuted}`}>{new Date().toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}</p>
          </div>

          <div className="flex items-center gap-2">
            {/* Command Palette trigger */}
            <button onClick={()=>setShowCommandPalette(true)}
              className={`hidden md:flex items-center gap-2 px-3 py-2 rounded-xl border text-sm transition ${dark?'border-gray-700 text-gray-400 hover:bg-gray-800':'border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
              <Search size={15}/>
              <span className="text-xs">Search</span>
              <kbd className={`ml-1 text-xs px-1.5 py-0.5 rounded ${dark?'bg-gray-700':'bg-gray-100'}`}>⌘K</kbd>
            </button>

            {/* Import CSV */}
            <label className="flex items-center gap-2 text-sm px-4 py-2 bg-indigo-600 text-white rounded-xl cursor-pointer hover:bg-indigo-700 transition font-medium shadow-sm">
              <Upload size={15}/> Import CSV
              <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden"/>
            </label>

            {/* Notifications */}
            <div className="relative">
              <button onClick={()=>{setShowNotifications(n=>!n); setShowProfileMenu(false);}}
                className={`relative p-2.5 rounded-xl transition ${dark?'hover:bg-gray-800 text-gray-400':'hover:bg-gray-100 text-gray-600'}`}>
                <Bell size={19}/>
                {unreadNotifs>0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold leading-none">
                    {unreadNotifs}
                  </span>
                )}
              </button>
              {showNotifications && <NotificationPanel dark={dark} notifs={notifs} setNotifs={setNotifs} onClose={()=>setShowNotifications(false)}/>}
            </div>

            {/* Settings icon */}
            <button onClick={()=>setShowSettings(true)}
              className={`p-2.5 rounded-xl transition ${dark?'hover:bg-gray-800 text-gray-400':'hover:bg-gray-100 text-gray-600'}`}>
              <Settings size={19}/>
            </button>

            {/* Profile Avatar */}
            <div className="relative">
              <button onClick={()=>{setShowProfileMenu(p=>!p); setShowNotifications(false);}}
                className="flex items-center gap-2 p-1 rounded-xl hover:ring-2 hover:ring-indigo-400 transition">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                  {initials}
                </div>
                <ChevronDown size={14} className={`${textMuted} ${showProfileMenu?'rotate-180':''} transition-transform`}/>
              </button>
              {showProfileMenu && (
                <ProfileMenu dark={dark} user={user} onClose={()=>setShowProfileMenu(false)}
                  onLogout={()=>{ localStorage.clear(); navigate('/login'); addToast('Logged out','info'); }}
                  onOpenSettings={()=>setShowSettings(true)}
                  onOpenProfile={()=>setShowProfile(true)}/>
              )}
            </div>
          </div>
        </div>

        <div className="px-8 py-6">
          {/* Upload / Budget Alerts */}
          {uploadedFile && (
            <div className={`mb-5 flex items-center justify-between p-3 px-4 rounded-xl border text-sm ${dark?'bg-emerald-900/20 border-emerald-800 text-emerald-400':'bg-emerald-50 border-emerald-200 text-emerald-700'}`}>
              <span>✓ Loaded: <strong>{uploadedFile}</strong> — {analytics?.transactionCount} transactions</span>
              <button onClick={()=>{setUploadedFile(null);setTransactions([]);setAnalytics(null);}} className="hover:opacity-70"><X size={14}/></button>
            </div>
          )}
          <BudgetAlertBanner analytics={analytics} budgets={budgets} dark={dark} threshold={userSettings.alertThreshold||80}/>

          {/* ── DASHBOARD ── */}
          {section==='dashboard' && (
            <div className="space-y-6">
              <div className="grid grid-cols-4 gap-4">
                {/* Wallet Card */}
                <div className={`rounded-2xl p-6 border col-span-1 ${dark?'bg-indigo-900/40 border-indigo-800':'bg-gradient-to-br from-indigo-600 to-violet-600'}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-indigo-200 text-xs font-semibold uppercase tracking-wider mb-1">Wallet Balance</p>
                      {balanceLoading ? (
                        <div className="h-8 w-24 bg-indigo-500/40 rounded animate-pulse"/>
                      ) : (
                        <h3 className="text-2xl font-bold font-mono text-white">
                          {userSettings.showBalance
                            ? walletBalance!==null?`₹${Number(walletBalance).toLocaleString('en-IN')}`:'—'
                            : '₹ ••••••'}
                        </h3>
                      )}
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <button onClick={fetchWalletBalance} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition"><RefreshCw size={15} className="text-white"/></button>
                      <button onClick={()=>setUserSettings(s=>({...s,showBalance:!s.showBalance}))} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition">
                        {userSettings.showBalance?<Eye size={15} className="text-white"/>:<EyeOff size={15} className="text-white"/>}
                      </button>
                    </div>
                  </div>
                  <p className="text-indigo-200 text-xs">Live from wallet</p>
                </div>
                <StatCard icon={TrendingUp} label="Total Income" value={`₹${(analytics?.totalIncome||0).toLocaleString('en-IN')}`} sub={`${analytics?.savingsRate||0}% savings rate`} color="text-emerald-500" dark={dark}/>
                <StatCard icon={TrendingDown} label="Total Expenses" value={`₹${(analytics?.totalExpenses||0).toLocaleString('en-IN')}`} sub={`Across ${Object.keys(analytics?.categoryBreakdown||{}).length} categories`} color="text-red-500" dark={dark}/>
                <StatCard icon={Activity} label="Avg Daily Spend" value={`₹${analytics?.avgDailySpend||0}`} sub={`${analytics?.transactionCount||0} total transactions`} color="text-amber-500" dark={dark}/>
              </div>

              {/* Transactions + Chart */}
              <div className="grid grid-cols-2 gap-6">
                <div className={`rounded-2xl border ${dark?'bg-gray-800 border-gray-700':'bg-white border-gray-100'}`}>
                  <div className={`flex items-center justify-between px-5 py-4 border-b ${dark?'border-gray-700':'border-gray-100'}`}>
                    <h3 className={`font-semibold text-sm ${textMain}`}>Recent Transactions</h3>
                    <div className="flex gap-1">
                      {['all','income','expense'].map(tab=>(
                        <button key={tab} onClick={()=>setActiveTab(tab)}
                          className={`px-3 py-1 rounded-lg text-xs font-medium capitalize transition ${activeTab===tab
                            ? tab==='income'?'bg-emerald-100 text-emerald-700':tab==='expense'?'bg-red-100 text-red-700':'bg-indigo-100 text-indigo-700'
                            : dark?'text-gray-400 hover:bg-gray-700':'text-gray-500 hover:bg-gray-100'}`}>{tab}</button>
                      ))}
                    </div>
                  </div>
                  <div className="overflow-auto max-h-80">
                    {filteredTx.slice(0,12).map(t=>{
                      const Icon=getCategoryIcon(t.category);
                      return (
                        <div key={t.id} className={`flex items-center gap-3 px-5 py-3 border-b last:border-0 transition ${dark?'border-gray-700/50 hover:bg-gray-750':'border-gray-50 hover:bg-gray-50'}`}>
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${t.type==='income'?'bg-emerald-100':dark?'bg-red-900/30':'bg-red-50'}`}>
                            <Icon size={15} className={t.type==='income'?'text-emerald-600':'text-red-500'}/>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium truncate ${textMain}`}>{t.name}</p>
                            <p className={`text-xs ${textMuted}`}>{t.date} · {t.category}</p>
                          </div>
                          <span className={`font-mono text-sm font-semibold ${t.type==='income'?'text-emerald-500':'text-red-500'}`}>
                            {t.type==='income'?'+':'-'}₹{Math.abs(t.amount).toLocaleString('en-IN')}
                          </span>
                        </div>
                      );
                    })}
                    {filteredTx.length===0 && <p className={`text-center text-sm py-10 ${textMuted}`}>No transactions. Upload a CSV to get started.</p>}
                  </div>
                </div>
                <div className={`rounded-2xl p-6 border ${dark?'bg-gray-800 border-gray-700':'bg-white border-gray-100'}`}>
                  <h3 className={`font-semibold text-sm mb-4 ${textMain}`}>Balance Trend</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={analytics?.dailySpending||[]}>
                      <defs>
                        <linearGradient id="balG" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25}/><stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke={dark?'#374151':'#f3f4f6'}/>
                      <XAxis dataKey="date" fontSize={10} stroke={dark?'#9ca3af':'#6b7280'} tickFormatter={v=>{const d=new Date(v);return isNaN(d)?v:`${d.getDate()}/${d.getMonth()+1}`;}}/>
                      <YAxis fontSize={10} stroke={dark?'#9ca3af':'#6b7280'}/>
                      <Tooltip content={<CustomTooltip dark={dark}/>}/>
                      <Area type="monotone" dataKey="balance" stroke="#6366f1" fill="url(#balG)" strokeWidth={2.5} name="Balance" dot={false} activeDot={{r:4,fill:'#6366f1'}}/>
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Category Cards */}
              {analytics?.categoryBreakdown&&Object.keys(analytics.categoryBreakdown).length>0&&(
                <div className={`rounded-2xl p-6 border ${dark?'bg-gray-800 border-gray-700':'bg-white border-gray-100'}`}>
                  <h3 className={`font-semibold text-sm mb-5 ${textMain}`}>Spending by Category</h3>
                  <div className="grid grid-cols-4 gap-3">
                    {Object.entries(analytics.categoryBreakdown).sort((a,b)=>b[1]-a[1]).map(([cat,amt],i)=>{
                      const Icon=getCategoryIcon(cat);
                      const pct=((amt/analytics.totalExpenses)*100).toFixed(0);
                      return (
                        <div key={cat} className={`p-4 rounded-xl border transition hover:shadow-sm cursor-pointer ${dark?'bg-gray-750 border-gray-700 hover:bg-gray-700':'bg-gray-50 border-gray-100 hover:bg-white'}`}>
                          <div className="flex items-center gap-2 mb-3">
                            <div className="p-1.5 rounded-lg" style={{background:COLORS[i%COLORS.length]+'22'}}>
                              <Icon size={14} style={{color:COLORS[i%COLORS.length]}}/>
                            </div>
                            <span className={`text-xs font-medium ${textMuted}`}>{cat}</span>
                          </div>
                          <p className={`text-lg font-bold font-mono ${textMain}`}>₹{amt.toFixed(0)}</p>
                          <p className={`text-xs mt-1 ${textMuted}`}>{pct}% of spend</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {section==='reports'&&<ReportsSection analytics={analytics} transactions={transactions} dark={dark} addToast={addToast}/>}
          {section==='analytics'&&<AnalyticsSection analytics={analytics} dark={dark}/>}
          {section==='planning'&&<PlanningSection analytics={analytics} dark={dark} addToast={addToast} budgets={budgets} setBudgets={setBudgets}/>}
        </div>
      </main>

      {/* Click outside to close dropdowns */}
      {(showNotifications||showProfileMenu)&&(
        <div className="fixed inset-0 z-10" onClick={()=>{setShowNotifications(false);setShowProfileMenu(false);}}/>
      )}
    </div>
  );
}