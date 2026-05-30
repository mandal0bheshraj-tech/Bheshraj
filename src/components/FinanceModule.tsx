import React, { useState } from 'react';
import { FarmState, FinancialRecord } from '../types';
import { translations } from '../utils/translations';
import { Plus, Trash2, Calendar, FileText, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

interface FinanceProps {
  state: FarmState;
  onUpdateState: (newState: FarmState) => void;
  lang: 'en' | 'ne';
}

export function FinanceModule({ state, onUpdateState, lang }: FinanceProps) {
  const t = translations[lang];
  const [activeFilter, setActiveFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [showTransForm, setShowTransForm] = useState(false);

  // New Transaction Form State
  const [transType, setTransType] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState(5000);
  const [category, setCategory] = useState<FinancialRecord['category']>('feed');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('2026-05-29');

  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !description) return;

    const newTrans: FinancialRecord = {
      id: `tr-${Date.now()}`,
      date,
      type: transType,
      amount,
      category,
      description
    };

    onUpdateState({
      ...state,
      finances: [newTrans, ...state.finances]
    });

    setShowTransForm(false);
    setDescription('');
  };

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const handleDeleteTransaction = (id: string) => {
    const updated = state.finances.filter(f => f.id !== id);
    onUpdateState({ ...state, finances: updated });
    setConfirmDeleteId(null);
  };

  // Finance calculations
  const totalIncomes = state.finances
    .filter(f => f.type === 'income')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalExpenses = state.finances
    .filter(f => f.type === 'expense')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const netSavings = totalIncomes - totalExpenses;

  const filteredTrans = activeFilter === 'all'
    ? state.finances
    : state.finances.filter(f => f.type === activeFilter);

  // Expenses categories calculations
  const feedExpenses = state.finances.filter(f => f.type === 'expense' && f.category === 'feed').reduce((acc, x) => acc + x.amount, 0);
  const medExpenses = state.finances.filter(f => f.type === 'expense' && f.category === 'medicine').reduce((acc, x) => acc + x.amount, 0);
  const laborExpenses = state.finances.filter(f => f.type === 'expense' && f.category === 'labor').reduce((acc, x) => acc + x.amount, 0);
  const otherExpenses = state.finances.filter(f => f.type === 'expense' && !['feed', 'medicine', 'labor'].includes(f.category)).reduce((acc, x) => acc + x.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="text-3xl">💰</div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">{t.finance}</h2>
            <p className="text-xs text-gray-500">Farm Cashbook ledger, revenues, and operating expenses</p>
          </div>
        </div>

        <button
          onClick={() => setShowTransForm(!showTransForm)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition cursor-pointer shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>{t.recordFinancial}</span>
        </button>
      </div>

      {showTransForm && (
        <form onSubmit={handleAddTransaction} className="bg-white border border-gray-200 p-5 rounded-xl shadow-md grid grid-cols-1 md:grid-cols-5 gap-4 font-medium text-xs text-gray-700">
          <div className="md:col-span-5 pb-2 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded p-2">
            <h3 className="font-bold text-emerald-700 uppercase tracking-wider">{t.recordFinancial}</h3>
            <button type="button" onClick={() => setShowTransForm(false)} className="text-xs text-gray-450 font-bold">✕ Close</button>
          </div>
          <div>
            <label className="font-semibold block mb-1">{t.transactionType}</label>
            <select
              value={transType}
              onChange={(e) => setTransType(e.target.value as any)}
              className="w-full bg-gray-55 border border-gray-300 rounded px-2.5 py-1.5 text-xs text-gray-900 font-semibold"
            >
              <option value="expense">Expense (खर्च)</option>
              <option value="income">Income (आम्दानी)</option>
            </select>
          </div>
          <div>
            <label className="font-semibold block mb-1">{t.amountRs} *</label>
            <input 
              type="number" 
              required
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full bg-gray-55 border border-gray-300 rounded px-3 py-1.5 text-xs text-gray-900 font-mono"
            />
          </div>
          <div>
            <label className="font-semibold block mb-1">{t.categoryType}</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              className="w-full bg-gray-55 border border-gray-300 rounded px-2.5 py-1.5 text-xs text-gray-900 font-semibold"
            >
              <option value="poultry">Poultry Broilers (कुखुरा)</option>
              <option value="fish">Fish Ponds (माछा)</option>
              <option value="goat">Goat Livestock (बाख्रा)</option>
              <option value="pigeon">Pigeons Flock (परेवा)</option>
              <option value="labor">Worker Salary (तलब)</option>
              <option value="feed">Feed Stock purch (दाना)</option>
              <option value="medicine">Medicines & vaccines (औषधि)</option>
              <option value="electricity">Electricity / Water bills</option>
              <option value="transport">Transportation / Fuel</option>
              <option value="other">Other Incidentals</option>
            </select>
          </div>
          <div>
            <label className="font-semibold block mb-1">{t.date}</label>
            <input 
              type="date" 
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-gray-55 border border-gray-300 rounded px-2.5 py-1.5 text-xs text-gray-900"
            />
          </div>
          <div>
            <label className="font-semibold block mb-1">{t.description} *</label>
            <input 
              type="text" 
              required
              placeholder="e.g. Bought 2 PPR vaccine vials" 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-gray-55 border border-gray-300 rounded px-3 py-1.5 text-xs text-gray-900"
            />
          </div>
          <div className="md:col-span-5 pt-2 text-right">
            <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2' rounded-lg cursor-pointer">
              {t.save}
            </button>
          </div>
        </form>
      )}

      {/* Main Stats balances view */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <div className="flex justify-between items-center text-xs text-gray-550 mb-1">
            <span className="font-semibold">Cumulative Sales Revenue / आम्दानी</span>
            <TrendingUp className="w-5 h-5 text-emerald-500" />
          </div>
          <strong className="text-2xl font-black text-gray-950 font-mono">Rs. {totalIncomes}</strong>
          <div className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded mt-2.5 font-bold w-fit uppercase">
            Poultry + Fish + Goats
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <div className="flex justify-between items-center text-xs text-gray-550 mb-1">
            <span className="font-semibold">Cumulative Farm Expenses / खर्च</span>
            <TrendingDown className="w-5 h-5 text-red-500" />
          </div>
          <strong className="text-2xl font-black text-gray-950 font-mono">Rs. {totalExpenses}</strong>
          <div className="bg-red-105 text-red-700 text-[10px] bg-red-50 border border-red-100 px-2.5 py-0.5 rounded mt-2.5 font-bold w-fit uppercase">
            Feed + Labor + Power
          </div>
        </div>

        <div className="bg-white border border-gray-250 rounded-xl p-5 shadow-sm bg-gradient-to-br from-emerald-50 to-teal-55 text-emerald-990 border-emerald-200">
          <div className="flex justify-between items-center text-xs text-emerald-800 mb-1">
            <span className="font-bold">Net Farming Profit / नाफा</span>
            <span className="text-lg">📈</span>
          </div>
          <strong className="text-2xl font-black text-emerald-900 font-mono">Rs. {netSavings}</strong>
          <div className="bg-emerald-600 text-white text-[10px] px-2.5 py-0.5 rounded mt-2.5 font-bold w-fit uppercase">
            Net Surplus Margin
          </div>
        </div>
      </div>

      {/* Expense ledger split visualizers */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
        <h3 className="font-bold text-gray-900 text-sm pb-3 border-b border-gray-100">Expenses Distribution Metrics (खर्च विभाजन)</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 text-center">
          <div className="bg-indigo-50/50 p-3.5 rounded-xl border border-indigo-100">
            <span className="text-[10px] text-indigo-700 font-bold uppercase block">Feeds Cost</span>
            <strong className="text-base font-extrabold text-indigo-900 font-mono mt-1 block">Rs. {feedExpenses}</strong>
          </div>
          <div className="bg-rose-50/50 p-3.5 rounded-xl border border-rose-100 font-medium">
            <span className="text-[10px] text-rose-700 font-bold uppercase block">Medicines Vaccine</span>
            <strong className="text-base font-extrabold text-rose-900 font-mono mt-1 block">Rs. {medExpenses}</strong>
          </div>
          <div className="bg-teal-50/50 p-3.5 rounded-xl border border-teal-100 font-medium">
            <span className="text-[10px] text-teal-700 font-bold uppercase block">Worker Salary</span>
            <strong className="text-base font-extrabold text-teal-900 font-mono mt-1 block">Rs. {laborExpenses}</strong>
          </div>
          <div className="bg-amber-50/50 p-3.5 rounded-xl border border-amber-100">
            <span className="text-[10px] text-amber-700 font-bold uppercase block">Transport & Utilities</span>
            <strong className="text-base font-extrabold text-amber-900 font-mono mt-1 block">Rs. {otherExpenses}</strong>
          </div>
        </div>
      </div>

      {/* Incomes & Expense table entries list */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex justify-between items-center pb-2 border-b border-gray-100">
          <h3 className="font-bold text-gray-950 text-sm">Farm Ledger & Cash Book Journals</h3>
          
          <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200 text-xs">
            {(['all', 'income', 'expense'] as const).map(f => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-3 py-1 rounded transition font-semibold capitalize ${
                  activeFilter === f
                    ? 'bg-emerald-600 text-white shadow'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {filteredTrans.length === 0 ? (
          <p className="text-xs text-gray-400 py-6 text-center">No cash accounting journals recorded yet.</p>
        ) : (
          <div className="space-y-2.5">
            {filteredTrans.map(tr => (
              <div 
                key={tr.id} 
                className={`p-3.5 rounded-xl border transition flex items-center justify-between gap-4 text-xs ${
                  tr.type === 'income' 
                    ? 'bg-emerald-50/30 border-emerald-200/50 hover:border-emerald-300' 
                    : 'bg-rose-50/30 border-rose-200/50 hover:border-rose-300'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900 font-sans">{tr.description}</span>
                    <span className={`text-[9px] uppercase font-bold px-1.5 py-0.2 rounded font-sans leading-none ${
                      tr.type === 'income' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {tr.category}
                    </span>
                  </div>
                  <div className="text-[10px] text-gray-400 font-mono flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> {tr.date}
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0 font-mono">
                  <strong className={`text-sm font-black ${tr.type === 'income' ? 'text-emerald-700' : 'text-red-700'}`}>
                    {tr.type === 'income' ? '+' : '-'} Rs. {tr.amount}
                  </strong>
                  {confirmDeleteId === tr.id ? (
                    <div className="flex items-center gap-1.5 animate-pulse bg-rose-50 border border-rose-200 p-1 rounded-lg">
                      <button
                        onClick={() => handleDeleteTransaction(tr.id)}
                        className="bg-red-600 hover:bg-red-700 text-white font-extrabold text-[9px] px-1.5 py-0.5 rounded cursor-pointer"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(null)}
                        className="bg-gray-200 text-gray-700 font-extrabold text-[9px] px-1.5 py-0.5 rounded cursor-pointer"
                      >
                        X
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => setConfirmDeleteId(tr.id)}
                      className="text-gray-400 hover:text-red-600 p-1 cursor-pointer transition"
                      title="Delete record"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
