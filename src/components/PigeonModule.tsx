import React, { useState } from 'react';
import { FarmState, PigeonRecord } from '../types';
import { translations } from '../utils/translations';
import { Plus, Trash2, Calendar, Sparkles, TrendingUp, HelpCircle } from 'lucide-react';

interface PigeonProps {
  state: FarmState;
  onUpdateState: (newState: FarmState) => void;
  lang: 'en' | 'ne';
}

export function PigeonModule({ state, onUpdateState, lang }: PigeonProps) {
  const t = translations[lang];
  const [selectedPairId, setSelectedPairId] = useState<string>(
    state.pigeons[0]?.id || ''
  );

  // Forms Visibility
  const [showPairForm, setShowPairForm] = useState(false);

  // New Pair Form State
  const [breed, setBreed] = useState('Fantail (लक्का)');
  const [pairId, setPairId] = useState('');
  const [eggCount, setEggCount] = useState<number | ''>('');
  const [hatchRate, setHatchRate] = useState<number | ''>('');
  const [babyCount, setBabyCount] = useState<number | ''>('');
  const [hatchDate, setHatchDate] = useState('2026-06-10');

  const selectedPair = state.pigeons.find(p => p.id === selectedPairId);

  const handleCreatePair = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pairId) return;

    const numEggs = eggCount === '' ? 0 : Number(eggCount);
    const numHatch = hatchRate === '' ? 0 : Number(hatchRate);
    const numBabies = babyCount === '' ? 0 : Number(babyCount);

    const newPair: PigeonRecord = {
      id: `pig-${Date.now()}`,
      breed,
      pairId,
      eggProduction: numEggs * 6, // overall prediction
      hatchRatePercent: numHatch,
      healthStatus: "Healthy",
      eggsLaidCount: numEggs,
      hatchDate: hatchDate || undefined,
      babyPigeonsCount: numBabies,
      vaccines: ["Pox Vaccine"]
    };

    onUpdateState({
      ...state,
      pigeons: [newPair, ...state.pigeons]
    });

    setSelectedPairId(newPair.id);
    setShowPairForm(false);
    setPairId('');
    setEggCount('');
    setHatchRate('');
    setBabyCount('');
  };

  const [confirmDeletePairId, setConfirmDeletePairId] = useState<string | null>(null);

  const handleDeletePair = (id: string) => {
    const updated = state.pigeons.filter(p => p.id !== id);
    onUpdateState({ ...state, pigeons: updated });
    if (selectedPairId === id) {
      setSelectedPairId(updated[0]?.id || '');
    }
    setConfirmDeletePairId(null);
  };

  // Add Eggs Laid Quick Tally
  const handleModifyEggsCount = (incrementBy: number) => {
    if (!selectedPair) return;
    const updated = state.pigeons.map(p => {
      if (p.id === selectedPair.id) {
        const nextEggs = Math.max(0, p.eggsLaidCount + incrementBy);
        return {
          ...p,
          eggsLaidCount: nextEggs,
          eggProduction: p.eggProduction + (incrementBy > 0 ? 1 : 0)
        };
      }
      return p;
    });
    onUpdateState({ ...state, pigeons: updated });
  };

  // Add Baby Squabs Quick Tally
  const handleModifyBabyCount = (incrementBy: number) => {
    if (!selectedPair) return;
    const updated = state.pigeons.map(p => {
      if (p.id === selectedPair.id) {
        const nextBabies = Math.max(0, p.babyPigeonsCount + incrementBy);
        // Let's also adjust hatch rate
        let nextHatch = p.hatchRatePercent;
        if (incrementBy > 0 && p.eggsLaidCount > 0) {
          nextHatch = Math.round((nextBabies / (nextBabies + p.eggsLaidCount)) * 100);
        }
        return {
          ...p,
          babyPigeonsCount: nextBabies,
          hatchRatePercent: nextHatch
        };
      }
      return p;
    });
    onUpdateState({ ...state, pigeons: updated });
  };

  const handleLogPigeonSale = () => {
    if (!selectedPair) return;
    const clientName = window.prompt("Enter purchaser name:");
    if (!clientName) return;
    const revenueStr = window.prompt("Enter total sell price for squab pair (Rs.):", "3000");
    if (!revenueStr) return;
    const revenue = Number(revenueStr);

    const transaction = {
      id: `tr-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      type: 'income' as const,
      amount: revenue,
      category: 'pigeon' as const,
      description: `Sold premium squabs of Pair ${selectedPair.pairId} (${selectedPair.breed}) to ${clientName}`
    };

    // Deduct 2 babies from pair count
    const updated = state.pigeons.map(p => {
      if (p.id === selectedPair.id) {
        return {
          ...p,
          babyPigeonsCount: Math.max(0, p.babyPigeonsCount - 2)
        };
      }
      return p;
    });

    onUpdateState({
      ...state,
      pigeons: updated,
      finances: [transaction, ...state.finances]
    });

    alert(`Sold squabs pair successfully! Cashbook updated with Rs. ${revenue}`);
  };

  return (
    <div className="space-y-6">
      {/* Target heading control */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="text-3xl">🕊️</div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">{t.pigeon} ({state.pigeons.length} pairs)</h2>
            <p className="text-xs text-gray-500">Pair nesting cycles, egg tallies, hatch rates and vaccine booster schedules</p>
          </div>
        </div>

        <button
          onClick={() => setShowPairForm(!showPairForm)}
          className="bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition cursor-pointer shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>{t.addPigeonPair}</span>
        </button>
      </div>

      {showPairForm && (
        <form onSubmit={handleCreatePair} className="bg-white border border-gray-200 p-5 rounded-xl shadow-sm grid grid-cols-1 md:grid-cols-3 gap-4 font-medium text-xs text-gray-700">
          <div className="md:col-span-3 pb-2 border-b border-gray-100 flex justify-between items-center bg-amber-50 rounded p-2">
            <h3 className="font-bold text-amber-800 uppercase tracking-wider">{t.addPigeonPair}</h3>
            <button type="button" onClick={() => setShowPairForm(false)} className="text-xs text-gray-400 font-bold">✕ Close</button>
          </div>
          <div>
            <label className="font-semibold block mb-1">{t.pairId} *</label>
            <input 
              type="text" 
              placeholder="e.g. Pair-K04" 
              required
              value={pairId}
              onChange={(e) => setPairId(e.target.value)}
              className="w-full bg-gray-55 border border-gray-300 rounded px-3 py-1.5 text-xs text-gray-900"
            />
          </div>
          <div>
            <label className="font-semibold block mb-1">{t.breed}</label>
            <select
              value={breed}
              onChange={(e) => setBreed(e.target.value)}
              className="w-full bg-gray-55 border border-gray-300 rounded px-3 py-1.5 text-xs text-gray-900"
            >
              <option value="Fantail (लक्का)">Fantail (लक्का)</option>
              <option value="Mukhi (मुखी)">Mukhi (मुखी)</option>
              <option value="Siraaj (सिराज)">Siraaj (सिराज)</option>
              <option value="Gola / Local (गोला)">Gola / Local (गोला)</option>
            </select>
          </div>
          <div>
            <label className="font-semibold block mb-1">{t.eggsLaid} (nested)</label>
            <input 
              type="number" 
              value={eggCount}
              onChange={(e) => setEggCount(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full bg-gray-55 border border-gray-300 rounded px-3 py-1.5 text-xs text-gray-900"
            />
          </div>
          <div>
            <label className="font-semibold block mb-1">Expected Hatch Rate (%)</label>
            <input 
              type="number" 
              value={hatchRate}
              onChange={(e) => setHatchRate(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full bg-gray-55 border border-gray-300 rounded px-2 py-1.5 text-xs text-gray-900"
            />
          </div>
          <div>
            <label className="font-semibold block mb-1">{t.babyPigeons} Count</label>
            <input 
              type="number" 
              value={babyCount}
              onChange={(e) => setBabyCount(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full bg-gray-55 border border-gray-300 rounded px-2 py-1.5 text-xs text-gray-900"
            />
          </div>
          <div>
            <label className="font-semibold block mb-1">{t.hatchDate}</label>
            <input 
              type="date" 
              value={hatchDate}
              onChange={(e) => setHatchDate(e.target.value)}
              className="w-full bg-gray-55 border border-gray-300 rounded px-2.5 py-1.5 text-xs text-gray-900"
            />
          </div>
          <div className="md:col-span-3 pt-2 text-right">
            <button type="submit" className="bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs px-5 py-2 rounded-lg cursor-pointer">
              {t.save}
            </button>
          </div>
        </form>
      )}

      {/* Pigeon Selection columns */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left selection tags list */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm space-y-4">
          <span className="text-xs text-gray-500 block uppercase font-bold text-center tracking-widest font-mono">Select Nest Pair ID</span>
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {state.pigeons.map(p => (
              <div 
                key={p.id}
                onClick={() => setSelectedPairId(p.id)}
                className={`p-3 rounded-lg border text-xs font-semibold cursor-pointer flex justify-between items-center transition ${
                  p.id === selectedPairId
                    ? 'border-amber-500 bg-amber-50 text-amber-950'
                    : 'border-gray-200 hover:bg-gray-50 text-gray-750'
                }`}
              >
                <div>
                  <h4 className="font-bold">Pair: {p.pairId}</h4>
                  <span className="text-[10px] text-gray-400 font-medium">{p.breed}</span>
                </div>
                <div className="text-right flex flex-col items-end">
                  <span className="bg-amber-100 text-amber-800 text-[10px] px-1.5 py-0.2 rounded">{p.eggsLaidCount || 0} eggs</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Nest stats analyzer */}
        {selectedPair ? (
          <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Pair Summary box */}
            <div className="bg-white border border-gray-200 p-5 rounded-xl shadow-sm space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex justify-between pb-2 border-b border-gray-100">
                  <div>
                    <h3 className="font-extrabold text-gray-950 text-base">Pair ID: {selectedPair.pairId}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">{selectedPair.breed}</p>
                  </div>
                  {confirmDeletePairId === selectedPair.id ? (
                    <div className="flex items-center gap-1 animate-pulse bg-rose-50 border border-rose-200 p-1 rounded-lg shrink-0">
                      <button
                        onClick={() => handleDeletePair(selectedPair.id)}
                        className="bg-red-650 hover:bg-red-755 text-white font-extrabold text-[10px] px-1.5 py-0.5 rounded cursor-pointer"
                      >
                        Delete?
                      </button>
                      <button
                        onClick={() => setConfirmDeletePairId(null)}
                        className="bg-gray-200 text-gray-700 font-extrabold text-[10px] px-1.5 py-0.5 rounded cursor-pointer"
                      >
                        X
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmDeletePairId(selectedPair.id)}
                      className="text-red-500 hover:text-red-700 p-1.5 rounded hover:bg-rose-50 cursor-pointer transition"
                      title="Delete breeding pair"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="space-y-2 text-xs pt-3 text-gray-600 font-medium">
                  <div className="flex justify-between"><span>Pair Health Status: </span> <strong className="text-emerald-700">{selectedPair.healthStatus}</strong></div>
                  <div className="flex justify-between"><span>{t.eggProd} Tally: </span> <strong className="text-gray-950">{selectedPair.eggProduction} eggs</strong></div>
                  <div className="flex justify-between"><span>{t.hatchRate}: </span> <strong className="text-amber-600 font-mono">{selectedPair.hatchRatePercent}%</strong></div>
                  <div className="flex justify-between"><span>{t.hatchDate}: </span> <strong className="text-gray-900 font-mono">{selectedPair.hatchDate || 'No laying logs'}</strong></div>
                  <div className="flex justify-between font-bold text-gray-900 pt-2 border-t border-gray-100">
                    <span>Active Squabs (Babies): </span>
                    <span className="text-amber-600 font-mono">{selectedPair.babyPigeonsCount} squabs</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 h-px" />

              <button
                onClick={handleLogPigeonSale}
                className="w-full bg-amber-500 hover:bg-amber-600 text-white font-black text-xs py-2.5 rounded-lg text-center transition cursor-pointer shadow-sm"
              >
                💸 Sell Nest Baby Squabs
              </button>
            </div>

            {/* Quick nest adjustments counters */}
            <div className="bg-white border border-gray-200 p-5 rounded-xl shadow-sm space-y-4 md:col-span-2">
              <h3 className="font-bold text-gray-950 text-sm tracking-wide bg-gradient-to-r from-amber-50 to-white p-2 rounded flex items-center gap-1">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Nesting Egg and Squab Live Counter</span>
              </h3>

              <p className="text-xs text-gray-500">Quickly tally eggs laid or hatching parameters right inside cages without typing.</p>

              <div className="grid grid-cols-2 gap-4 pt-2">
                {/* Eggs counter */}
                <div className="bg-amber-50/50 border border-amber-200/55 rounded-xl p-4 text-center space-y-2 flex flex-col justify-between">
                  <div>
                    <span className="text-xs uppercase text-amber-800 font-semibold block">{t.eggsLaid} (Active)</span>
                    <strong className="text-3xl font-black text-amber-700 mt-2 block font-mono">{selectedPair.eggsLaidCount || 0}</strong>
                  </div>
                  <div className="flex gap-2 justify-center pt-3">
                    <button 
                      onClick={() => handleModifyEggsCount(-1)}
                      className="bg-white hover:bg-amber-100 border border-amber-200 w-8 h-8 rounded text-sm font-bold cursor-pointer transition flex items-center justify-center"
                    >
                      -
                    </button>
                    <button 
                      onClick={() => handleModifyEggsCount(1)}
                      className="bg-amber-500 hover:bg-amber-600 text-white w-8 h-8 rounded text-sm font-bold cursor-pointer transition flex items-center justify-center"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Squabs counter */}
                <div className="bg-amber-50/50 border border-amber-200/55 rounded-xl p-4 text-center space-y-2 flex flex-col justify-between">
                  <div>
                    <span className="text-xs uppercase text-amber-800 font-semibold block">{t.babyPigeons} (Active)</span>
                    <strong className="text-3xl font-black text-amber-700 mt-2 block font-mono">{selectedPair.babyPigeonsCount}</strong>
                  </div>
                  <div className="flex gap-2 justify-center pt-3">
                    <button 
                      onClick={() => handleModifyBabyCount(-1)}
                      className="bg-white hover:bg-amber-100 border border-amber-200 w-8 h-8 rounded text-sm font-bold cursor-pointer transition flex items-center justify-center"
                    >
                      -
                    </button>
                    <button 
                      onClick={() => handleModifyBabyCount(1)}
                      className="bg-amber-500 hover:bg-amber-600 text-white w-8 h-8 rounded text-sm font-bold cursor-pointer transition flex items-center justify-center"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Standard vaccinations */}
              <div className="bg-gray-50 p-3 rounded-lg flex items-center justify-between text-xs font-semibold text-gray-700">
                <span className="flex items-center gap-1">💉 Pox vaccine & Salmonella multi-booster status:</span>
                <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded text-[10px] uppercase font-bold">Standard Protective vaccine active</span>
              </div>
            </div>

          </div>
        ) : (
          <div className="lg:col-span-3 bg-white p-12 text-center rounded-xl border border-gray-200 shadow-sm text-gray-500">
            <p>Please register a pigeon nesting pair to begin tallies.</p>
          </div>
        )}

      </div>
    </div>
  );
}
