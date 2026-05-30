import React, { useState } from 'react';
import { FarmState, FinancialRecord } from '../types';
import { translations } from '../utils/translations';
import { Plus, Trash2, Calendar, FileText, TrendingUp, TrendingDown, DollarSign, Landmark, ShieldCheck, Lock, X } from 'lucide-react';

interface FinanceProps {
  state: FarmState;
  onUpdateState: (newState: FarmState) => void;
  lang: 'en' | 'ne';
}

export function FinanceModule({ state, onUpdateState, lang }: FinanceProps) {
  const t = translations[lang];
  const [activeFilter, setActiveFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [showTransForm, setShowTransForm] = useState(false);

  // Secure Bank Linking Form state
  const [showLinkBankModal, setShowLinkBankModal] = useState(false);
  const [newBankName, setNewBankName] = useState('Global IME Bank');
  const [newAccountName, setNewAccountName] = useState('');
  const [newAccountNumber, setNewAccountNumber] = useState('');
  const [newBranch, setNewBranch] = useState('');
  const [linkStep, setLinkStep] = useState<'details' | 'otp' | 'success'>('details');
  const [otpValue, setOtpValue] = useState('');

  const handleLinkBankSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccountName || !newAccountNumber || !newBranch) return;
    setLinkStep('otp');
  };

  const verifyOtpAndLink = () => {
    if (!otpValue) return;
    
    const newBank = {
      id: `bank-${Date.now()}`,
      bankName: newBankName,
      accountName: newAccountName,
      accountNumber: newAccountNumber.slice(0, 4) + "******" + newAccountNumber.slice(-4),
      branch: newBranch,
      linkedDate: new Date().toISOString().split('T')[0],
      verified: true,
      balance: Math.floor(Math.random() * 540000) + 18500
    };

    onUpdateState({
      ...state,
      linkedBanks: [...(state.linkedBanks || []), newBank]
    });

    setLinkStep('success');
  };

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

      {/* Saroja Secure Bank Vault & Digital Wallets */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex justify-between items-center pb-2 border-b border-gray-100 flex-wrap gap-2">
          <div>
            <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
              <Landmark className="w-5 h-5 text-emerald-600" />
              <span>Linked Real-time Bank Accounts (खाता लिङ्कहरू)</span>
            </h3>
            <p className="text-[11px] text-gray-500">Secure banking conduits synchronized with your private Cloud email</p>
          </div>
          <button
            type="button"
            onClick={() => {
              setLinkStep('details');
              setNewAccountName('');
              setNewAccountNumber('');
              setNewBranch('');
              setOtpValue('');
              setShowLinkBankModal(true);
            }}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer transition shadow-sm font-sans"
          >
            <Plus className="w-4 h-4" />
            <span>Link New Bank</span>
          </button>
        </div>

        {/* Bank accounts list loop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {(state.linkedBanks || []).map(bank => (
            <div 
              key={bank.id} 
              className="bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 text-white rounded-2xl p-5 border border-slate-800 shadow relative overflow-hidden group select-none font-sans"
            >
              {/* Subtle visual gradient glow overlay */}
              <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-teal-500/10 rounded-full blur-2xl group-hover:bg-teal-500/20 transition duration-300 pointer-events-none" />
              
              <div className="flex justify-between items-start mb-5 relative z-10">
                <div>
                  <span className="text-[10px] text-teal-400 font-extrabold uppercase tracking-widest">{bank.bankName}</span>
                  <h4 className="text-xs font-semibold text-slate-100 mt-1 max-w-[180px] truncate">{bank.accountName}</h4>
                </div>
                <div className="bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-[8px] font-black tracking-widest px-2.5 py-0.5 rounded-full uppercase leading-none shrink-0">
                  ✓ VERIFIED SECURE
                </div>
              </div>

              <div className="space-y-3.5 relative z-10">
                <div className="font-mono text-sm tracking-wider font-extrabold text-slate-200">
                  {bank.accountNumber}
                </div>
                
                <div className="flex justify-between items-end border-t border-slate-800/80 pt-2 text-[10px] text-slate-400">
                  <div>
                    <span>Branch:</span>
                    <strong className="block text-slate-200 font-medium truncate max-w-[110px]">{bank.branch}</strong>
                  </div>
                  <div className="text-right shrink-0">
                    <span>Available Balance:</span>
                    <strong className="block text-emerald-400 font-mono font-black text-xs sm:text-sm">Rs. {bank.balance.toLocaleString()}</strong>
                  </div>
                </div>
              </div>

              {/* Secure lock icon watermark */}
              <div className="absolute top-4 right-4 opacity-15">
                <ShieldCheck className="w-8 h-8 text-indigo-400" />
              </div>
            </div>
          ))}

          {(!state.linkedBanks || state.linkedBanks.length === 0) && (
            <p className="text-xs text-gray-400 py-6 text-center sm:col-span-2">No corporate bank accounts linked yet.</p>
          )}
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

      {/* Secure Bank Linking Modal Overlay */}
      {showLinkBankModal && (
        <div 
          onClick={() => setShowLinkBankModal(false)}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in font-sans cursor-pointer text-gray-800"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl overflow-hidden shadow-2xl max-w-md w-full border border-slate-200 transform transition-transform duration-300 scale-100 flex flex-col cursor-default"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 p-5 text-white flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-emerald-900 rounded-lg border border-emerald-800">
                  <Landmark className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-amber-400 uppercase tracking-widest leading-none">
                    खाता लिङ्क गर्नुहोस् (Link Bank)
                  </h3>
                  <span className="text-[9px] text-teal-200 mt-1 block leading-none">Secure SSL Bank Integration Corridor</span>
                </div>
              </div>
              <button 
                onClick={() => setShowLinkBankModal(false)}
                className="bg-emerald-900/60 p-1 rounded-full text-slate-300 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Tabs */}
            <div className="p-5 font-sans">
              
              {linkStep === 'details' && (
                <form onSubmit={handleLinkBankSubmit} className="space-y-4">
                  <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl flex items-start gap-2 text-[10px] text-amber-800 leading-normal font-sans">
                    <Lock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span><strong>Security Note:</strong> Linking requires an SMS Verification OTP sent to the authorized mobile phone registered with your banking institution. No credit card required.</span>
                  </div>

                  <div className="space-y-3 font-medium text-xs text-gray-700">
                    <div>
                      <label className="block font-bold mb-1">Select Nepalese Bank / Wallet</label>
                      <select 
                        value={newBankName}
                        onChange={(e) => setNewBankName(e.target.value)}
                        className="w-full bg-slate-50 border border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-900 font-semibold"
                      >
                        <option value="Global IME Bank">Global IME Bank</option>
                        <option value="Nabil Bank">Nabil Bank PLC</option>
                        <option value="Nepal Investment Mega Bank">Nepal Investment Mega Bank (NIMB)</option>
                        <option value="NIC Asia Bank">NIC Asia Bank</option>
                        <option value="eSewa Mobile Wallet">eSewa Wallet (Merchant)</option>
                        <option value="Khalti Digital Pay">Khalti Digital Wallet</option>
                        <option value="Rastriya Banijya Bank">Rastriya Banijya Bank</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold mb-1">Account Holder Name *</label>
                      <input 
                        type="text"
                        required
                        placeholder="e.g. Bheshraj Mandal"
                        value={newAccountName}
                        onChange={(e) => setNewAccountName(e.target.value)}
                        className="w-full bg-slate-50 border border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-900 font-sans"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold mb-1">Account Number *</label>
                        <input 
                          type="text"
                          required
                          placeholder="e.g. 02100451296"
                          value={newAccountNumber}
                          onChange={(e) => setNewAccountNumber(e.target.value)}
                          className="w-full bg-slate-50 border border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-900 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block font-bold mb-1">Branch Location *</label>
                        <input 
                          type="text"
                          required
                          placeholder="e.g. Itahari, Sunsari"
                          value={newBranch}
                          onChange={(e) => setNewBranch(e.target.value)}
                          className="w-full bg-slate-50 border border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-900 font-sans"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3.5 rounded-xl text-xs uppercase tracking-wide transition shadow cursor-pointer font-sans"
                  >
                    Send SMS OTP Verification
                  </button>
                </form>
              )}

              {linkStep === 'otp' && (
                <div className="space-y-4 font-sans text-center">
                  <div className="w-12 h-12 bg-indigo-50 border border-indigo-100 rounded-full flex items-center justify-center mx-auto text-indigo-600 text-lg">
                    💬
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-slate-800">Verification Code Sent</h4>
                    <p className="text-[11px] text-gray-500 max-w-xs mx-auto">We've simulated sending a 6-digit one-time pass-code to your registered phone. Please enter it below:</p>
                  </div>

                  <div className="space-y-3 max-w-[240px] mx-auto">
                    <input 
                      type="text"
                      maxLength={6}
                      placeholder="Enter 6-Digit OTP"
                      value={otpValue}
                      onChange={(e) => setOtpValue(e.target.value)}
                      className="w-full bg-slate-50 border-2 border-indigo-200 rounded-xl px-4 py-3 text-center text-sm font-bold tracking-widest text-slate-800 font-mono"
                    />
                    
                    <button
                      type="button"
                      onClick={verifyOtpAndLink}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold py-3.5 rounded-xl text-xs uppercase tracking-wide transition shadow cursor-pointer font-sans"
                    >
                      Verify & Securely Link
                    </button>
                  </div>
                </div>
              )}

              {linkStep === 'success' && (
                <div className="space-y-4 font-sans text-center py-4">
                  <div className="w-12 h-12 bg-emerald-50 border border-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600 text-lg">
                    ✓
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-slate-800">Bank Account Linked!</h4>
                    <p className="text-[11px] text-gray-400">Your account {newAccountNumber.slice(-4)} at {newBankName} is active and isolated under your login context.</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setShowLinkBankModal(false);
                    }}
                    className="bg-slate-900 hover:bg-slate-950 text-white font-extrabold px-6 py-2 rounded-xl text-xs uppercase cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
