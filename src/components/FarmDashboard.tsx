import React, { useState } from 'react';
import { FarmState, FarmReminder } from '../types';
import { translations } from '../utils/translations';
import { SarojaLogo } from './SarojaLogo';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  Calendar, 
  Clock, 
  Activity, 
  ShoppingBag, 
  Compass, 
  Plus, 
  RefreshCw, 
  Camera, 
  Globe
} from 'lucide-react';

interface DashboardProps {
  state: FarmState;
  onUpdateState: (newState: FarmState) => void;
  setActiveTab: (tab: string) => void;
  lang: 'en' | 'ne';
}

export function FarmDashboard({ state, onUpdateState, setActiveTab, lang }: DashboardProps) {
  const t = translations[lang];
  const [cameraMessage, setCameraMessage] = useState<string | null>(null);
  
  // Calculate counts & aggregates
  const activePoultryCount = state.poultryBatches
    .filter(b => b.status === "active")
    .reduce((acc, curr) => acc + curr.totalChicks - curr.dailyLogs.reduce((dAcc, d) => dAcc + d.mortalityCount, 0), 0);
    
  const activePondsCount = state.fishPonds.filter(p => p.status === "active").length;
  
  const totalGoatsCount = state.goats.length;
  const sickGoatsCount = state.goats.filter(g => g.healthStatus === "Under Treatment").length;
  
  const totalPigeonsCount = state.pigeons.reduce((acc, curr) => acc + 2 + curr.babyPigeonsCount, 0); // 2 adults per pair + babies
  
  // Feed stock summaries
  const lowStockItems = state.inventory.filter(item => item.currentStock <= item.reorderPoint);
  const totalFeedSacks = state.inventory
    .filter(i => i.category === "feed")
    .reduce((acc, curr) => acc + curr.currentStock, 0);

  // Financial summaries
  const todayStr = "2026-05-29"; // Hardcoded matching system local time
  const todayIncome = state.finances
    .filter(f => f.type === "income" && f.date === todayStr)
    .reduce((acc, curr) => acc + curr.amount, 0);
    
  const todayExpense = state.finances
    .filter(f => f.type === "expense" && f.date === todayStr)
    .reduce((acc, curr) => acc + curr.amount, 0);
    
  const totalIncome = state.finances
    .filter(f => f.type === "income")
    .reduce((acc, curr) => acc + curr.amount, 0);
    
  const totalExpense = state.finances
    .filter(f => f.type === "expense")
    .reduce((acc, curr) => acc + curr.amount, 0);
    
  const monthlyProfitEst = Math.max(0, totalIncome - totalExpense);

  const pendingRemindersCount = state.reminders.filter(r => !r.completed).length;

  const toggleReminder = (id: string) => {
    const updated = state.reminders.map(rem => 
      rem.id === id ? { ...rem, completed: !rem.completed } : rem
    );
    onUpdateState({ ...state, reminders: updated });
  };

  const handleSimulateCamera = () => {
    setCameraMessage(t.photoCaptured);
    setTimeout(() => setCameraMessage(null), 4000);
  };

  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const resetToDemoDefaults = () => {
    localStorage.removeItem('saroja_farm_state_v1');
    window.location.reload();
  };

  return (
    <div className="space-y-6">
      {/* Offline and Status Bar */}
      <div className="bg-emerald-50 border border-emerald-200/60 rounded-xl p-3.5 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-emerald-800">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
          <p className="font-semibold">{t.localSyncActive} | <span className="font-medium text-emerald-700">Offline Storage persists in Nepal region</span></p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleSimulateCamera}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-white hover:bg-emerald-100 border border-emerald-300 rounded-md font-medium transition cursor-pointer text-emerald-900"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>{t.simulatePhoto}</span>
          </button>
          {showResetConfirm ? (
            <div className="flex items-center gap-1.5 animate-pulse bg-emerald-100 p-1 rounded-lg border border-emerald-300">
              <button
                onClick={resetToDemoDefaults}
                className="bg-red-600 hover:bg-red-700 text-white px-2.5 py-1 rounded-md font-extrabold text-[11px] transition cursor-pointer"
              >
                Confirm?
              </button>
              <button
                onClick={() => setShowResetConfirm(false)}
                className="bg-white hover:bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md border border-slate-300 font-extrabold text-[11px] transition cursor-pointer"
              >
                X
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setShowResetConfirm(true)}
              className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 rounded-md font-medium transition cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Reset Demo</span>
            </button>
          )}
        </div>
      </div>

      {cameraMessage && (
        <div className="bg-blue-50 border border-blue-200 text-blue-800 text-xs px-4 py-3 rounded-lg flex items-center gap-2 animate-fade-in">
          <CheckCircle className="w-4 h-4 text-blue-600" />
          <span>{cameraMessage}</span>
        </div>
      )}

      {/* Royal Saroja Welcome Banner Dashboard Card */}
      <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-950 border border-amber-400/30 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden select-none">
        {/* Subtle decorative grid lines and glow spots */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_120%,rgba(245,158,11,0.12)_0%,rgba(16,185,129,0)_60%)] pointer-events-none" />
        
        <div className="flex items-center gap-4.5 z-10 w-full md:w-auto">
          <div className="p-1 bg-[#022c22] rounded-2xl border-2 border-amber-400/25 shadow-lg shrink-0">
            <SarojaLogo size={105} showLabels={false} className="drop-shadow-[0_0_15px_rgba(245,158,11,0.2)]" />
          </div>
          <div className="space-y-1 text-center md:text-left">
            <span className="text-[10px] font-black tracking-widest text-amber-400 uppercase bg-amber-400/10 border border-amber-400/20 px-2.5 py-0.5 rounded-full inline-block leading-none">
              कृषि र पशुपालनको आधुनिक संवाहक
            </span>
            <h2 className="text-xl md:text-2xl font-extrabold text-amber-300 font-serif leading-tight">
              सरोजा कृषि तथा पशुपालन फर्म
            </h2>
            <p className="text-xs text-emerald-200/90 font-medium font-serif">
              Saroja Krishi Tatha Pashupalan Firm • Barju-4 Sunsari, Nepal
            </p>
            <p className="text-[10px] text-teal-300/80 font-mono uppercase tracking-widest leading-none pt-1">
              ESTD. 2078 BS (2021 AD) • Authorized Register Ledger System
            </p>
          </div>
        </div>

        {/* Live fast telemetry counters in golden pill boxes */}
        <div className="grid grid-cols-2 xs:grid-cols-4 gap-3 bg-[#011c15]/80 border border-emerald-800/40 p-4 rounded-xl shrink-0 w-full md:w-auto z-10">
          <div className="text-center px-1.5 border-r border-emerald-950">
            <span className="text-[9px] text-teal-400 block uppercase font-mono tracking-wider font-bold">Poultry</span>
            <span className="text-sm font-black text-amber-300 font-mono mt-0.5 block">{activePoultryCount}</span>
          </div>
          <div className="text-center px-1.5 md:border-r border-emerald-950">
            <span className="text-[9px] text-teal-400 block uppercase font-mono tracking-wider font-bold">Aqua Fish</span>
            <span className="text-sm font-black text-amber-300 font-mono mt-0.5 block">{activePondsCount} Ponds</span>
          </div>
          <div className="text-center px-1.5 border-r border-emerald-950">
            <span className="text-[9px] text-teal-400 block uppercase font-mono tracking-wider font-bold">Goats Stock</span>
            <span className="text-sm font-black text-amber-300 font-mono mt-0.5 block">{totalGoatsCount} Hd</span>
          </div>
          <div className="text-center px-1.5">
            <span className="text-[9px] text-teal-400 block uppercase font-mono tracking-wider font-bold">Pigeons</span>
            <span className="text-sm font-black text-amber-300 font-mono mt-0.5 block">{totalPigeonsCount} Birds</span>
          </div>
        </div>
      </div>

      {/* Colorful Cards Section - Red=Poultry, Blue=Fish, Green=Goat, Yellow=Pigeon */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Poultry (Red) */}
        <div 
          onClick={() => setActiveTab('poultry')} 
          className="bg-white border-l-4 border-red-500 hover:shadow-md transition p-5 rounded-r-xl shadow-sm cursor-pointer hover:-translate-y-0.5 transform duration-200"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs uppercase tracking-wider font-semibold text-gray-500">{t.poultry}</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{activePoultryCount} <span className="text-xs text-gray-500 font-normal">birds</span></h3>
              <p className="text-[10px] text-red-600 font-medium mt-1 uppercase">
                {state.poultryBatches.filter(b => b.status === "active").map(b => b.name)[0] || 'No active batch'}
              </p>
            </div>
            <div className="bg-red-50 p-2.5 rounded-lg text-red-500">
              <span className="text-xl font-bold">🐓</span>
            </div>
          </div>
          <div className="mt-4 pt-2.5 border-t border-gray-100 flex justify-between items-center text-[11px] text-gray-500">
            <span>{t.totalPoultry} (Cobb 500)</span>
            <span className="text-red-500 font-semibold">{t.view} ➜</span>
          </div>
        </div>

        {/* Fish (Blue) */}
        <div 
          onClick={() => setActiveTab('fish')} 
          className="bg-white border-l-4 border-sky-500 hover:shadow-md transition p-5 rounded-r-xl shadow-sm cursor-pointer hover:-translate-y-0.5 transform duration-200"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs uppercase tracking-wider font-semibold text-gray-500">{t.fish}</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{activePondsCount} <span className="text-xs text-gray-500 font-normal">ponds active</span></h3>
              <p className="text-[10px] text-sky-600 font-medium mt-1 uppercase">Tilapia Stocking active</p>
            </div>
            <div className="bg-sky-50 p-2.5 rounded-lg text-sky-500">
              <span className="text-xl font-bold">🐟</span>
            </div>
          </div>
          <div className="mt-4 pt-2.5 border-t border-gray-100 flex justify-between items-center text-[11px] text-gray-500">
            <span>{t.totalFishPonds}</span>
            <span className="text-sky-500 font-semibold">{t.view} ➜</span>
          </div>
        </div>

        {/* Goats (Green) */}
        <div 
          onClick={() => setActiveTab('goat')} 
          className="bg-white border-l-4 border-emerald-500 hover:shadow-md transition p-5 rounded-r-xl shadow-sm cursor-pointer hover:-translate-y-0.5 transform duration-200"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs uppercase tracking-wider font-semibold text-gray-500">{t.goat}</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{totalGoatsCount} <span className="text-xs text-gray-500 font-normal">registered</span></h3>
              <p className="text-[10px] text-emerald-600 font-medium mt-1 uppercase">
                {sickGoatsCount > 0 ? `${sickGoatsCount} Sick / under care` : 'All healthy'}
              </p>
            </div>
            <div className="bg-emerald-50 p-2.5 rounded-lg text-emerald-500">
              <span className="text-xl font-bold">🐐</span>
            </div>
          </div>
          <div className="mt-4 pt-2.5 border-t border-gray-100 flex justify-between items-center text-[11px] text-gray-500">
            <span>{t.totalGoats} (Boer / Khari)</span>
            <span className="text-emerald-500 font-semibold">{t.view} ➜</span>
          </div>
        </div>

        {/* Pigeons (Yellow) */}
        <div 
          onClick={() => setActiveTab('pigeon')} 
          className="bg-white border-l-4 border-amber-500 hover:shadow-md transition p-5 rounded-r-xl shadow-sm cursor-pointer hover:-translate-y-0.5 transform duration-200"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs uppercase tracking-wider font-semibold text-gray-500">{t.pigeon}</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{totalPigeonsCount} <span className="text-xs text-gray-500 font-normal">flock</span></h3>
              <p className="text-[10px] text-amber-600 font-medium mt-1 uppercase">
                {state.pigeons.length} pairs on cages
              </p>
            </div>
            <div className="bg-amber-50 p-2.5 rounded-lg text-amber-500">
              <span className="text-xl font-bold">🕊️</span>
            </div>
          </div>
          <div className="mt-4 pt-2.5 border-t border-gray-100 flex justify-between items-center text-[11px] text-gray-500">
            <span>{t.totalPigeons} (Fantail lakka)</span>
            <span className="text-amber-500 font-semibold">{t.view} ➜</span>
          </div>
        </div>
      </div>

      {/* Main Dash Grid: Charts and Feed Inventory Warnings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Financial Visualizer Ledger Box */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm lg:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center pb-4 border-b border-gray-100">
              <div>
                <h3 className="font-bold text-gray-900 text-sm tracking-wide">{t.financialSummary}</h3>
                <p className="text-xs text-gray-500">Total revenue bookkeeping logs</p>
              </div>
              <span className="text-[10px] px-2.5 py-1 rounded bg-indigo-50 border border-indigo-100 text-indigo-700 font-semibold tracking-wide uppercase">
                {t.bestPerformingSector}: <span className="text-indigo-900 font-bold">Fish (3.4L)</span>
              </span>
            </div>

            {/* Income Expense Today Summary Row */}
            <div className="grid grid-cols-3 gap-4 pt-4 pb-6">
              <div className="bg-emerald-50/50 p-3 rounded-lg border border-emerald-100">
                <span className="text-[10px] text-emerald-800 uppercase font-semibold block">{t.dailyIncome} (Today)</span>
                <span className="text-lg font-bold text-emerald-700 mt-1 block">Rs. {todayIncome}</span>
              </div>
              <div className="bg-red-50/50 p-3 rounded-lg border border-red-100">
                <span className="text-[10px] text-red-800 uppercase font-semibold block">{t.dailyExpenses} (Today)</span>
                <span className="text-lg font-bold text-red-700 mt-1 block">Rs. {todayExpense}</span>
              </div>
              <div className="bg-indigo-50/50 p-3 rounded-lg border border-indigo-100">
                <span className="text-[10px] text-indigo-800 uppercase font-semibold block">{t.monthlyProfit}</span>
                <span className="text-lg font-bold text-indigo-700 mt-1 block">Rs. {monthlyProfitEst}</span>
              </div>
            </div>

            {/* Beautiful Custom SVG Graph Chart of Cashbook Ingress */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-gray-700 block">{t.incomeExpenseRatio} (Saroja Farm Cash Flow)</span>
              <div className="h-44 w-full flex items-end justify-between bg-gray-50 rounded-lg p-3 border border-gray-100">
                {/* Custom bar 1: Poultry */}
                <div className="flex flex-col items-center flex-1 group">
                  <div className="flex gap-1 items-end justify-center w-full h-24">
                    <div className="bg-emerald-500 w-3 rounded-t" style={{ height: '35%' }} title="Poultry income" />
                    <div className="bg-red-500 w-3 rounded-t" style={{ height: '55%' }} title="Poultry expense" />
                  </div>
                  <span className="text-[10px] font-semibold text-gray-500 mt-2">Poultry</span>
                </div>
                {/* Custom bar 2: Fish */}
                <div className="flex flex-col items-center flex-1">
                  <div className="flex gap-1 items-end justify-center w-full h-24">
                    <div className="bg-emerald-500 w-3 rounded-t" style={{ height: '90%' }} />
                    <div className="bg-red-500 w-3 rounded-t" style={{ height: '20%' }} />
                  </div>
                  <span className="text-[10px] font-semibold text-gray-500 mt-2">Fish</span>
                </div>
                {/* Custom bar 3: Goats */}
                <div className="flex flex-col items-center flex-1">
                  <div className="flex gap-1 items-end justify-center w-full h-24">
                    <div className="bg-emerald-500 w-3 rounded-t" style={{ height: '50%' }} />
                    <div className="bg-red-500 w-3 rounded-t" style={{ height: '18%' }} />
                  </div>
                  <span className="text-[10px] font-semibold text-gray-500 mt-2">Goat</span>
                </div>
                {/* Custom bar 4: Pigeons */}
                <div className="flex flex-col items-center flex-1">
                  <div className="flex gap-1 items-end justify-center w-full h-24">
                    <div className="bg-emerald-500 w-3 rounded-t" style={{ height: '15%' }} />
                    <div className="bg-red-500 w-3 rounded-t" style={{ height: '10%' }} />
                  </div>
                  <span className="text-[10px] font-semibold text-gray-500 mt-2">Pigeon</span>
                </div>
                {/* Custom bar 5: Feed/Other */}
                <div className="flex flex-col items-center flex-1">
                  <div className="flex gap-1 items-end justify-center w-full h-24">
                    <div className="bg-emerald-500 w-3 rounded-t" style={{ height: '5%' }} />
                    <div className="bg-red-500 w-3 rounded-t" style={{ height: '75%' }} />
                  </div>
                  <span className="text-[10px] font-semibold text-gray-500 mt-2">Feed Stocks</span>
                </div>
              </div>
              <div className="flex justify-center gap-6 text-[10px] text-gray-500 font-medium">
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-emerald-500 rounded" /> Income / आम्दानी</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-red-500 rounded" /> Expenses / खर्च</span>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-3.5 border-t border-gray-100 flex justify-end">
            <button 
              onClick={() => setActiveTab('finance')} 
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition"
            >
              {t.finance} ➜
            </button>
          </div>
        </div>

        {/* Quick Inventory Stock Alert Panel */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-gray-900 text-sm pb-3 border-b border-gray-100 flex items-center gap-1.5">
              <span className="p-1 bg-amber-50 rounded text-amber-600">🔔</span>
              <span>{t.inventory} {lowStockItems.length > 0 && <span className="bg-red-100 text-red-600 px-1.5 py-0.5 rounded text-[10px] font-bold animate-pulse">{lowStockItems.length}</span>}</span>
            </h3>

            {/* Saroja stock gauge */}
            <div className="py-4 flex items-center justify-between">
              <div>
                <span className="text-xs text-gray-500">{t.feedStockLeft}</span>
                <h4 className="text-xl font-extrabold text-gray-900">{totalFeedSacks} Sacks <span className="text-xs font-normal text-gray-500">remaining</span></h4>
              </div>
              <div className="text-right">
                <span className="text-[10px] bg-amber-500/10 text-amber-600 font-semibold px-2 py-0.5 rounded border border-amber-200">
                  Total feed: {totalFeedSacks * 50} kg
                </span>
              </div>
            </div>

            {/* Alert List */}
            <div className="space-y-2.5 overflow-y-auto max-h-[170px] pr-1">
              {lowStockItems.map(item => (
                <div key={item.id} className="bg-amber-50/70 border border-amber-200/50 p-2.5 rounded-lg text-xs space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-gray-800 truncate max-w-[150px]">{item.name}</span>
                    <span className="bg-red-100 text-red-700 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase">{t.lowStockWarning}</span>
                  </div>
                  <div className="flex justify-between text-gray-500 font-medium">
                    <span>Current: <strong className="text-gray-900">{item.currentStock} {item.unit}</strong></span>
                    <span>Reorder at: {item.reorderPoint}</span>
                  </div>
                </div>
              ))}

              {state.inventory.filter(i => i.expiryDate && new Date(i.expiryDate) < new Date("2026-09-01")).map(item => (
                <div key={item.id} className="bg-rose-50 border border-rose-200 p-2.5 rounded-lg text-xs">
                  <div className="flex justify-between">
                    <span className="font-bold text-rose-900">{item.name}</span>
                    <span className="text-rose-600 font-bold text-[9px]">{t.expiryReminder}</span>
                  </div>
                  <p className="text-[10px] text-rose-700 mt-1 font-medium">Expires on: {item.expiryDate}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3.5 border-t border-gray-100 flex justify-end">
            <button 
              onClick={() => setActiveTab('inventory')} 
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition"
            >
              {t.inventory} ➜
            </button>
          </div>
        </div>

      </div>

      {/* Reminders / Veterinary Schedules Center */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
        <div className="flex justify-between items-center pb-3 border-b border-gray-100">
          <div>
            <h3 className="font-bold text-gray-900 text-sm tracking-wide flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-indigo-600" />
              <span>{t.alertReminder}</span>
            </h3>
            <p className="text-xs text-gray-500">Vaccinations, breeding delivery dates, and pond diagnostics</p>
          </div>
          <span className="bg-indigo-100 text-indigo-800 px-2.5 py-0.5 rounded-full text-xs font-bold font-mono">
            {pendingRemindersCount} {t.remNo}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
          {state.reminders.map((reminder) => (
            <div 
              key={reminder.id} 
              className={`p-3.5 rounded-xl border transition flex items-start gap-3 ${
                reminder.completed 
                  ? 'bg-gray-50 border-gray-200 opacity-65' 
                  : 'bg-white border-gray-200 hover:border-indigo-200'
              }`}
            >
              <input 
                type="checkbox"
                checked={reminder.completed}
                onChange={() => toggleReminder(reminder.id)}
                className="mt-1 h-4 w-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500 cursor-pointer"
              />
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold ${reminder.completed ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                    {reminder.title}
                  </span>
                  <span className={`text-[9px] uppercase font-bold px-1.5 py-0.2 rounded border ${
                    reminder.category === 'poultry' ? 'bg-red-50 text-red-700 border-red-200' :
                    reminder.category === 'fish' ? 'bg-sky-50 text-sky-700 border-sky-200' :
                    reminder.category === 'goat' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                    'bg-amber-50 text-amber-700 border-amber-200'
                  }`}>
                    {reminder.category}
                  </span>
                </div>
                {reminder.notes && (
                  <p className="text-xs text-gray-500">{reminder.notes}</p>
                )}
                <div className="flex items-center gap-3 text-[10px] text-gray-400 font-mono pt-1">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> {reminder.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {reminder.time}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Disease Detection & Feed prediction quick preview */}
      <div className="p-4 bg-gradient-to-r from-emerald-800 to-teal-900 rounded-xl text-white flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="space-y-1 md:max-w-xl">
          <span className="text-[10px] bg-emerald-500 text-white font-mono uppercase px-2 py-0.5 rounded-full font-bold">
            Smart Advisor Simulation
          </span>
          <h4 className="text-sm font-bold mt-1">Want to run AI Disease Scans or 30-Day Feed Projection forecasts?</h4>
          <p className="text-xs text-emerald-200">Our smart Nepalese farm adviser prediction model estimates feed shortages and analyses upload health symptoms instantly offline.</p>
        </div>
        <button 
          onClick={() => setActiveTab('ai')}
          className="bg-white hover:bg-emerald-100 text-emerald-900 font-bold px-4 py-2 rounded-lg text-xs shrink-0 cursor-pointer shadow transition"
        >
          Open AI Assistant ➜
        </button>
      </div>

    </div>
  );
}
