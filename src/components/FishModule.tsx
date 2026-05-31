import React, { useState } from 'react';
import { FarmState, FishPond, WaterQualityLog, FishHarvest } from '../types';
import { translations } from '../utils/translations';
import { Plus, Trash2, Calendar, Droplets, Waves, Clipboard, Scale } from 'lucide-react';

interface FishProps {
  state: FarmState;
  onUpdateState: (newState: FarmState) => void;
  lang: 'en' | 'ne';
}

export function FishModule({ state, onUpdateState, lang }: FishProps) {
  const t = translations[lang];
  const [selectedPondId, setSelectedPondId] = useState<string>(
    state.fishPonds[0]?.id || ''
  );

  // Forms Visibility State
  const [showPondForm, setShowPondForm] = useState(false);
  const [showWaterForm, setShowWaterForm] = useState(false);
  const [showHarvestForm, setShowHarvestForm] = useState(false);

  // New Pond state
  const [pondNo, setPondNo] = useState('');
  const [pondSize, setPondSize] = useState<number | ''>('');
  const [fishType, setFishType] = useState('Tilapia (तिलापिया)');
  const [quantity, setQuantity] = useState<number | ''>('');
  const [stockingDate, setStockingDate] = useState(new Date().toISOString().split('T')[0]);

  // Water Quality log state
  const [phLevel, setPhLevel] = useState<number | ''>('');
  const [tempC, setTempC] = useState<number | ''>('');
  const [oxygenLevel, setOxygenLevel] = useState<number | ''>('');
  const [waterChange, setWaterChange] = useState(false);
  const [feedQuantity, setFeedQuantity] = useState<number | ''>('');
  const [deadCount, setDeadCount] = useState<number | ''>('');

  // Harvest state
  const [harvestWeight, setHarvestWeight] = useState<number | ''>('');
  const [marketPrice, setMarketPrice] = useState<number | ''>('');
  const [buyerName, setBuyerName] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');

  const selectedPond = state.fishPonds.find(p => p.id === selectedPondId);

  const handleCreatePond = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pondNo) return;

    const newPond: FishPond = {
      id: `pond-${Date.now()}`,
      pondNumber: pondNo,
      pondSizeSqFt: pondSize === '' ? 0 : Number(pondSize),
      fishType,
      stockingDate,
      quantityStocked: quantity === '' ? 0 : Number(quantity),
      status: "active",
      waterLogs: [],
      harvests: []
    };

    onUpdateState({
      ...state,
      fishPonds: [newPond, ...state.fishPonds]
    });

    setSelectedPondId(newPond.id);
    setShowPondForm(false);
    setPondNo('');
    setPondSize('');
    setQuantity('');
  };

  const handleAuditWater = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPond) return;

    const numericPH = phLevel === '' ? 7.2 : Number(phLevel);
    const numericTemp = tempC === '' ? 24 : Number(tempC);
    const numericO2 = oxygenLevel === '' ? 6.0 : Number(oxygenLevel);
    const numericFeed = feedQuantity === '' ? 0 : Number(feedQuantity);
    const numericDead = deadCount === '' ? 0 : Number(deadCount);

    const newLog: WaterQualityLog = {
      id: `w-log-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      phLevel: numericPH,
      temperatureC: numericTemp,
      oxygenLevelDOmgl: numericO2,
      waterChangeDone: waterChange,
      feedQuantityKg: numericFeed,
      mortalityCount: numericDead
    };

    // Deduct fish feed from stock
    const updatedInventory = state.inventory.map(item => {
      if (item.category === 'feed' && item.name.toLowerCase().includes('fish')) {
        return {
          ...item,
          currentStock: Math.max(0, item.currentStock - Math.ceil(numericFeed / 25)) // 25kg bag equivalent
        };
      }
      return item;
    });

    const updatedPonds = state.fishPonds.map(pond => {
      if (pond.id === selectedPond.id) {
        return {
          ...pond,
          waterLogs: [newLog, ...pond.waterLogs]
        };
      }
      return pond;
    });

    // Add reminder if pH is outside ideal boundaries (less than 6.5 or higher than 8.5)
    const updatedReminders = [...state.reminders];
    if (numericPH < 6.5 || numericPH > 8.5) {
      updatedReminders.push({
        id: `rem-${Date.now()}`,
        title: `CRITICAL pH Alert on ${selectedPond.pondNumber}: pH ${phLevel}`,
        date: new Date().toISOString().split('T')[0],
        time: "12:00 PM",
        category: "fish",
        type: "water_change",
        completed: false,
        notes: "Add lime powder to raise pH or replace water to reduce high pH levels."
      });
    }

    onUpdateState({
      ...state,
      fishPonds: updatedPonds,
      inventory: updatedInventory,
      reminders: updatedReminders
    });

    setShowWaterForm(false);
    setWaterChange(false);
    setPhLevel('');
    setTempC('');
    setOxygenLevel('');
    setFeedQuantity('');
    setDeadCount('');
  };

  const handleRecordHarvest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPond) return;

    const numericWeight = harvestWeight === '' ? 0 : Number(harvestWeight);
    const numericPrice = marketPrice === '' ? 0 : Number(marketPrice);
    const totalRev = numericWeight * numericPrice;

    const newHarvest: FishHarvest = {
      id: `harv-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      weightHarvestedKg: numericWeight,
      pricePerKg: numericPrice,
      totalRevenue: totalRev,
      buyerName,
      buyerPhone
    };

    const transaction = {
      id: `tr-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      type: 'income' as const,
      amount: totalRev,
      category: 'fish' as const,
      description: `Harvested & sold ${numericWeight}kg of fish from ${selectedPond.pondNumber} to ${buyerName}`
    };

    const updatedPonds = state.fishPonds.map(pond => {
      if (pond.id === selectedPond.id) {
        return {
          ...pond,
          harvests: [newHarvest, ...pond.harvests],
          status: 'harvested' as const // close the pond
        };
      }
      return pond;
    });

    onUpdateState({
      ...state,
      fishPonds: updatedPonds,
      finances: [transaction, ...state.finances]
    });

    setShowHarvestForm(false);
    setHarvestWeight('');
    setMarketPrice('');
    setBuyerName('');
    setBuyerPhone('');
  };

  const [confirmDeletePondId, setConfirmDeletePondId] = useState<string | null>(null);

  const handleDeletePond = (id: string) => {
    const updated = state.fishPonds.filter(p => p.id !== id);
    onUpdateState({ ...state, fishPonds: updated });
    if (selectedPondId === id) {
      setSelectedPondId(updated[0]?.id || '');
    }
    setConfirmDeletePondId(null);
  };

  const totalDeadFish = selectedPond?.waterLogs.reduce((acc, curr) => acc + curr.mortalityCount, 0) || 0;
  const currentQuantityRemaining = selectedPond ? (selectedPond.quantityStocked - totalDeadFish) : 0;
  const recentPh = selectedPond?.waterLogs[0]?.phLevel || '--';
  const recentDO = selectedPond?.waterLogs[0]?.oxygenLevelDOmgl || '--';

  return (
    <div className="space-y-6">
      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="text-3xl">🐟</div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">{t.fish} ({t.totalFishPonds})</h2>
            <p className="text-xs text-gray-500">Pond parameters, pH monitors, and harvests</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedPondId}
            onChange={(e) => setSelectedPondId(e.target.value)}
            className="bg-gray-50 border border-gray-300 rounded-lg px-3 py-1.5 text-xs font-semibold text-gray-700"
          >
            <option value="">-- Choose Pond --</option>
            {state.fishPonds.map(p => (
              <option key={p.id} value={p.id}>
                {p.pondNumber} ({p.status === 'active' ? 'Active Stock' : 'Harvested'})
              </option>
            ))}
          </select>

          <button
            onClick={() => setShowPondForm(!showPondForm)}
            className="bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>{t.newPond}</span>
          </button>
        </div>
      </div>

      {showPondForm && (
        <form onSubmit={handleCreatePond} className="bg-white border border-gray-200 p-5 rounded-xl shadow-sm grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-3 pb-2 border-b border-gray-100 flex justify-between">
            <h3 className="font-bold text-xs uppercase text-sky-600 font-mono tracking-wider">{t.newPond}</h3>
            <button type="button" onClick={() => setShowPondForm(false)} className="text-xs text-gray-400 hover:text-gray-600">Close ✕</button>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1">{t.pondNo} *</label>
            <input 
              type="text" 
              placeholder="e.g. Pond #3 East-Side" 
              required
              value={pondNo}
              onChange={(e) => setPondNo(e.target.value)}
              className="w-full bg-gray-50 border border-gray-300 rounded px-3 py-1.5 text-xs text-gray-900"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1">{t.pondSize} (Sq Ft)</label>
            <input 
              type="number" 
              value={pondSize}
              onChange={(e) => setPondSize(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full bg-gray-55 border border-gray-300 rounded px-3 py-1.5 text-xs text-gray-900"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1">{t.fishBreed}</label>
            <input 
              type="text" 
              value={fishType}
              onChange={(e) => setFishType(e.target.value)}
              className="w-full bg-gray-55 border border-gray-300 rounded px-3 py-1.5 text-xs text-gray-900"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1">{t.qtyStocked}</label>
            <input 
              type="number" 
              value={quantity}
              onChange={(e) => setQuantity(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full bg-gray-55 border border-gray-300 rounded px-3 py-1.5 text-xs text-gray-900"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1">{t.stockingDate}</label>
            <input 
              type="date" 
              value={stockingDate}
              onChange={(e) => setStockingDate(e.target.value)}
              className="w-full bg-gray-50 border border-gray-300 rounded px-3 py-1.5 text-xs text-gray-900"
            />
          </div>
          <div className="md:col-span-3 pt-2 text-right">
            <button type="submit" className="bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs px-5 py-2 rounded-lg cursor-pointer">
              {t.save}
            </button>
          </div>
        </form>
      )}

      {selectedPond ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left panel diagnostics parameters */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white border border-gray-200 p-5 rounded-xl shadow-sm space-y-4">
              <div className="flex justify-between items-start pb-3 border-b border-gray-100">
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">{selectedPond.pondNumber}</h3>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                    selectedPond.status === 'active' ? 'bg-sky-100 text-sky-850' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {selectedPond.status === 'active' ? t.active : 'Harvested'}
                  </span>
                </div>
                {confirmDeletePondId === selectedPond.id ? (
                  <div className="flex items-center gap-1 animate-pulse bg-rose-50 border border-rose-200 p-1.5 rounded-lg shrink-0">
                    <button
                      onClick={() => handleDeletePond(selectedPond.id)}
                      className="bg-red-650 hover:bg-red-755 text-white font-extrabold text-[10px] px-1.5 py-0.5 rounded cursor-pointer transition"
                    >
                      Delete?
                    </button>
                    <button
                      onClick={() => setConfirmDeletePondId(null)}
                      className="bg-gray-200 text-gray-700 font-extrabold text-[10px] px-1.5 py-0.5 rounded cursor-pointer transition"
                    >
                      X
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => setConfirmDeletePondId(selectedPond.id)}
                    className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-rose-50 text-xs transition cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between text-gray-500"><span className="font-medium">{t.fishBreed}:</span> <strong className="text-gray-900">{selectedPond.fishType}</strong></div>
                <div className="flex justify-between text-gray-500"><span className="font-medium">{t.pondSize}:</span> <strong className="text-gray-900 font-mono">{selectedPond.pondSizeSqFt} Sq. Ft.</strong></div>
                <div className="flex justify-between text-gray-500"><span className="font-medium">{t.qtyStocked}:</span> <strong className="text-gray-900 font-mono">{selectedPond.quantityStocked} fry</strong></div>
                <div className="flex justify-between text-gray-500"><span className="font-medium">{t.stockingDate}:</span> <strong className="text-gray-900 font-mono">{selectedPond.stockingDate}</strong></div>
                
                <div className="h-px bg-gray-100 my-2" />

                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="bg-sky-50 border border-sky-100 p-2 rounded-lg">
                    <span className="text-[10px] text-sky-800 uppercase block font-semibold">Latest pH</span>
                    <strong className="text-sm font-bold text-sky-955">{recentPh}</strong>
                  </div>
                  <div className="bg-blue-50 border border-blue-100 p-2 rounded-lg">
                    <span className="text-[10px] text-blue-800 uppercase block font-semibold">Latest DO</span>
                    <strong className="text-sm font-bold text-blue-955">{recentDO} mg/L</strong>
                  </div>
                </div>

                <div className="flex justify-between text-gray-500 pt-2"><span className="font-medium">Stock Remaining:</span> <strong className="text-gray-900 font-mono">{currentQuantityRemaining} fish</strong></div>
                <div className="flex justify-between text-gray-500"><span className="font-medium">Total losses:</span> <strong className="text-red-700 font-mono">{totalDeadFish} fry</strong></div>
              </div>

              {selectedPond.status === 'active' && (
                <div className="pt-2 flex flex-col gap-2">
                  <button
                    onClick={() => setShowWaterForm(!showWaterForm)}
                    className="w-full bg-sky-50 text-sky-700 border border-sky-200 text-xs font-bold py-2.5 rounded-lg text-center transition cursor-pointer hover:bg-sky-100"
                  >
                    💧 {t.addEntry} / Monitor Water
                  </button>
                  <button
                    onClick={() => setShowHarvestForm(!showHarvestForm)}
                    className="w-full bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold py-2.5 rounded-lg text-center transition cursor-pointer shadow"
                  >
                    🎣 {t.recordHarvest}
                  </button>
                </div>
              )}
            </div>

            {/* Optimal water metrics references */}
            <div className="bg-sky-50 border border-sky-200 p-4 rounded-xl space-y-2.5">
              <h4 className="text-xs font-bold text-sky-800 flex items-center gap-1">
                <Droplets className="w-4 h-4 text-sky-600" />
                <span>Optimal Water Parameters</span>
              </h4>
              <div className="text-[11px] text-sky-700 space-y-1 my-1 leading-relaxed">
                <p>• <strong>pH level:</strong> 6.8 to 8.2 (Below 6.0 stymies breathing)</p>
                <p>• <strong>Dissolved Oxygen (DO):</strong> Above 5.0 mg/L</p>
                <p>• <strong>Temperature:</strong> 22°C - 28°C for best growth</p>
                <p>Run aerator pump daily from 11 PM to 5 AM to control morning oxygen spikes.</p>
              </div>
            </div>
          </div>

          {/* Right side operational log lists */}
          <div className="lg:col-span-2 space-y-6">
            
            {showWaterForm && (
              <form onSubmit={handleAuditWater} className="bg-white border border-gray-200 p-5 rounded-xl shadow-md space-y-4">
                <div className="pb-2 border-b border-gray-100 flex justify-between">
                  <h4 className="font-bold text-xs uppercase text-sky-600 font-mono tracking-wider">{t.waterQuality}</h4>
                  <button type="button" onClick={() => setShowWaterForm(false)} className="text-xs text-gray-400">Close ✕</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-medium">
                  <div>
                    <label className="text-gray-700 block mb-1">pH Level (0-14)</label>
                    <input 
                      type="number" 
                      step="0.1"
                      value={phLevel}
                      onChange={(e) => setPhLevel(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full bg-gray-55 border border-gray-300 rounded px-3 py-1.5 text-xs text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="text-gray-700 block mb-1">Dissolved Oxygen (mg/L)</label>
                    <input 
                      type="number" 
                      step="0.1"
                      value={oxygenLevel}
                      onChange={(e) => setOxygenLevel(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full bg-gray-55 border border-gray-300 rounded px-3 py-1.5 text-xs text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="text-gray-700 block mb-1">Water Temp (°C)</label>
                    <input 
                      type="number" 
                      value={tempC}
                      onChange={(e) => setTempC(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full bg-gray-55 border border-gray-300 rounded px-3 py-1.5 text-xs text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="text-gray-700 block mb-1">Feed Stock added (kg) *</label>
                    <input 
                      type="number" 
                      value={feedQuantity}
                      onChange={(e) => setFeedQuantity(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full bg-gray-55 border border-gray-300 rounded px-3 py-1.5 text-xs text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="text-gray-700 block mb-1">Mortality Count today</label>
                    <input 
                      type="number" 
                      value={deadCount}
                      onChange={(e) => setDeadCount(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full bg-gray-55 border border-gray-300 rounded px-3 py-1.5 text-xs text-gray-900"
                    />
                  </div>
                  <div className="flex items-center pt-5">
                    <label className="flex items-center gap-2 cursor-pointer text-gray-700 text-xs font-semibold">
                      <input 
                        type="checkbox" 
                        checked={waterChange}
                        onChange={() => setWaterChange(!waterChange)}
                        className="h-4 w-4 text-sky-600 border-gray-300 rounded"
                      />
                      <span>Water changed today?</span>
                    </label>
                  </div>
                </div>
                <div className="text-right">
                  <button type="submit" className="bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs px-5 py-2 rounded-lg cursor-pointer shadow">
                    {t.save}
                  </button>
                </div>
              </form>
            )}

            {showHarvestForm && (
              <form onSubmit={handleRecordHarvest} className="bg-white border border-gray-200 p-5 rounded-xl shadow-md space-y-4">
                <div className="pb-2 border-b border-gray-100 flex justify-between">
                  <h4 className="font-bold text-xs uppercase text-sky-600 font-mono tracking-wider">{t.recordHarvest}</h4>
                  <button type="button" onClick={() => setShowHarvestForm(false)} className="text-xs text-gray-400">Close ✕</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-medium">
                  <div>
                    <label className="text-gray-700 block mb-1">{t.harvestQty} *</label>
                    <input 
                      type="number" 
                      value={harvestWeight}
                      onChange={(e) => setHarvestWeight(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full bg-gray-55 border border-gray-300 rounded px-3 py-1.5 text-xs text-gray-900 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-gray-700 block mb-1">{t.marketPrice} *</label>
                    <input 
                      type="number" 
                      value={marketPrice}
                      onChange={(e) => setMarketPrice(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full bg-gray-55 border border-gray-300 rounded px-3 py-1.5 text-xs text-gray-900 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-gray-700 block mb-1">Buyer Shop Name *</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Kathmandu Fish Center"
                      value={buyerName}
                      onChange={(e) => setBuyerName(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-300 rounded px-3 py-1.5 text-xs text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="text-gray-700 block mb-1">Buyer Contact *</label>
                    <input 
                      type="text" 
                      placeholder="98xxxxxxx"
                      value={buyerPhone}
                      onChange={(e) => setBuyerPhone(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-300 rounded px-3 py-1.5 text-xs text-gray-900 font-mono"
                    />
                  </div>
                </div>
                <div className="bg-sky-50 p-3 rounded text-right">
                  <span className="text-xs text-sky-850 mr-4 font-semibold">Total Revenue:</span>
                  <span className="text-base font-extrabold text-sky-700">Rs. {Number(harvestWeight) * Number(marketPrice)}</span>
                </div>
                <div className="text-right">
                  <button type="submit" className="bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs px-5 py-2 rounded-lg cursor-pointer">
                    {t.save}
                  </button>
                </div>
              </form>
            )}

            {/* Historical water entries */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-3">
              <h3 className="font-bold text-gray-900 text-sm">{t.waterQuality} Journals</h3>
              
              {selectedPond.waterLogs.length === 0 ? (
                <p className="text-xs text-gray-500 py-6 text-center">No water audit parameters recorded yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left text-gray-500 font-medium">
                    <thead className="text-[10px] text-gray-700 uppercase bg-gray-50">
                      <tr>
                        <th className="px-3 py-2.5">{t.date}</th>
                        <th className="px-3 py-2.5">pH Level</th>
                        <th className="px-3 py-2.5">Temp</th>
                        <th className="px-3 py-2.5">O2 Dissolved</th>
                        <th className="px-3 py-2.5">Water Change</th>
                        <th className="px-3 py-2.5">Feed Used</th>
                        <th className="px-3 py-2.5">Deaths</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 font-mono">
                      {selectedPond.waterLogs.map(log => (
                        <tr key={log.id} className="hover:bg-gray-50">
                          <td className="px-3 py-2.5 font-bold text-gray-900 font-sans">{log.date}</td>
                          <td className={`px-3 py-2.5 font-bold ${log.phLevel < 6.5 || log.phLevel > 8.5 ? 'text-red-600' : 'text-emerald-600'}`}>
                            {log.phLevel}
                          </td>
                          <td className="px-3 py-2.5">{log.temperatureC} °C</td>
                          <td className="px-3 py-2.5 text-blue-600 font-bold">{log.oxygenLevelDOmgl} mg/L</td>
                          <td className="px-3 py-2.5 font-sans">
                            {log.waterChangeDone ? (
                              <span className="bg-green-100 text-green-800 text-[10px] px-1.5 py-0.2 rounded font-bold">Done</span>
                            ) : (
                              <span className="text-gray-400">None</span>
                            )}
                          </td>
                          <td className="px-3 py-2.5 text-gray-800">{log.feedQuantityKg} kg</td>
                          <td className="px-3 py-2.5 text-red-500 font-bold">{log.mortalityCount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Harvest entries */}
            {selectedPond.harvests.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-3">
                <h3 className="font-bold text-gray-900 text-sm">Harvest Records (माछा निकाल्ने र बिक्री विवरण)</h3>
                <div className="space-y-3">
                  {selectedPond.harvests.map(h => (
                    <div key={h.id} className="bg-sky-50 border border-sky-200 p-4 rounded-lg flex flex-col md:flex-row justify-between text-xs gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-sky-950">{h.buyerName}</span>
                          <span className="bg-sky-100 text-sky-800 px-1.5 py-0.2 rounded font-mono text-[9px] font-bold">{h.date}</span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-1 text-gray-500 font-medium">
                          <span>Harvested Qty: <strong className="text-gray-900 font-sans">{h.weightHarvestedKg} kg</strong></span>
                          <span>Price/kg: <strong className="text-gray-850">Rs. {h.pricePerKg}</strong></span>
                        </div>
                      </div>
                      <div className="text-right flex flex-col justify-center">
                        <span className="text-[10px] text-sky-800 uppercase font-bold">Pond Income</span>
                        <span className="text-sm font-black text-sky-700">Rs. {h.totalRevenue}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

        </div>
      ) : (
        <div className="bg-white p-12 text-center rounded-xl border border-gray-200 shadow-sm text-gray-500 font-medium">
          <p>Please register a fish pond using the button above to begin tracking water standards.</p>
        </div>
      )}
    </div>
  );
}
