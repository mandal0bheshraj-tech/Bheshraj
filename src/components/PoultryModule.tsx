import React, { useState } from 'react';
import { FarmState, PoultryBatch, DailyPoultryEntry, PoultrySale } from '../types';
import { translations } from '../utils/translations';
import { 
  Plus, 
  Trash2, 
  Calendar, 
  FileText, 
  DollarSign, 
  Scale, 
  Activity, 
  CheckCircle, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  Info,
  Clock,
  Coins
} from 'lucide-react';

interface PoultryProps {
  state: FarmState;
  onUpdateState: (newState: FarmState) => void;
  lang: 'en' | 'ne';
}

export function PoultryModule({ state, onUpdateState, lang }: PoultryProps) {
  const t = translations[lang];
  const [selectedBatchId, setSelectedBatchId] = useState<string>(
    state.poultryBatches[0]?.id || ''
  );

  // New Batch Form State - All numbers start as completely empty ('') so the user can enter them themselves
  const [showBatchForm, setShowBatchForm] = useState(false);
  const [newBatchName, setNewBatchName] = useState('');
  const [arrivalDate, setArrivalDate] = useState(new Date().toISOString().split('T')[0]);
  const [totalChicks, setTotalChicks] = useState<number | ''>('');
  const [breed, setBreed] = useState('');
  const [supplier, setSupplier] = useState('');
  const [initialCost, setInitialCost] = useState<number | ''>('');

  // Daily Entry Form State - All numbers start as completely empty ('') so the user can enter them themselves
  const [showLogForm, setShowLogForm] = useState(false);
  const [feedUsed, setFeedUsed] = useState<number | ''>('');
  const [waterUsed, setWaterUsed] = useState<number | ''>('');
  const [medUsed, setMedUsed] = useState('');
  const [deathsCount, setDeathsCount] = useState<number | ''>('');
  const [avgWeightG, setAvgWeightG] = useState<number | ''>('');
  const [tempVal, setTempVal] = useState<number | ''>('');
  const [isVaccinated, setIsVaccinated] = useState(false);
  const [vaccineName, setVaccineName] = useState('');

  // Sale Entry Form State - All numbers start as completely empty ('') so the user can enter them themselves
  const [showSaleForm, setShowSaleForm] = useState(false);
  const [soldQty, setSoldQty] = useState<number | ''>('');
  const [soldWeight, setSoldWeight] = useState<number | ''>('');
  const [pricePerKg, setPricePerKg] = useState<number | ''>('');
  const [buyerName, setBuyerName] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');

  const selectedBatch = state.poultryBatches.find(b => b.id === selectedBatchId);

  const handleCreateBatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBatchName) return;

    const chicksValue = totalChicks === '' ? 0 : Number(totalChicks);
    const costValue = initialCost === '' ? 0 : Number(initialCost);

    const newBatch: PoultryBatch = {
      id: `p-batch-${Date.now()}`,
      name: newBatchName,
      arrivalDate,
      totalChicks: chicksValue,
      breed: breed || 'Broiler',
      supplier: supplier || 'Unspecified Vendor',
      initialCost: costValue,
      daysActive: 1,
      status: 'active',
      dailyLogs: [],
      sales: []
    };

    // Log the initial chicks cost automatically in finance transactions strictly if the cost is greater than 0
    const batchTransaction = {
      id: `tr-${Date.now()}`,
      date: arrivalDate,
      type: 'expense' as const,
      amount: costValue,
      category: 'poultry' as const,
      description: `Initial purchase cost of ${chicksValue} chicks for ${newBatchName}`
    };

    const newState: FarmState = {
      ...state,
      poultryBatches: [newBatch, ...state.poultryBatches],
      finances: costValue > 0 ? [batchTransaction, ...state.finances] : state.finances
    };

    onUpdateState(newState);
    setSelectedBatchId(newBatch.id);
    setShowBatchForm(false);
    
    // Clear form inputs
    setNewBatchName('');
    setBreed('');
    setSupplier('');
    setTotalChicks('');
    setInitialCost('');
  };

  const handleAddDailyEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBatch) return;

    const finalFeedUsed = feedUsed === '' ? 0 : Number(feedUsed);
    const finalWaterUsed = waterUsed === '' ? 0 : Number(waterUsed);
    const finalDeathsCount = deathsCount === '' ? 0 : Number(deathsCount);
    const finalAvgWeightG = avgWeightG === '' ? 0 : Number(avgWeightG);
    const finalTempVal = tempVal === '' ? 0 : Number(tempVal);

    const newLog: DailyPoultryEntry = {
      id: `p-log-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      feedUsedKg: finalFeedUsed,
      waterUsageLiters: finalWaterUsed,
      medicineUsed: medUsed || 'None',
      mortalityCount: finalDeathsCount,
      averageWeightG: finalAvgWeightG,
      temperatureC: finalTempVal,
      vaccinated: isVaccinated,
      vaccineName: isVaccinated ? vaccineName : undefined
    };

    // Deduct feed stock from Inventory if any is registered (50kg bag equivalent)
    const updatedInventory = state.inventory.map(item => {
      if (item.category === 'feed' && item.name.toLowerCase().includes('poultry') && finalFeedUsed > 0) {
        return {
          ...item,
          currentStock: Math.max(0, item.currentStock - Math.ceil(finalFeedUsed / 50))
        };
      }
      return item;
    });

    const updatedBatches = state.poultryBatches.map(b => {
      if (b.id === selectedBatch.id) {
        return {
          ...b,
          dailyLogs: [newLog, ...b.dailyLogs]
        };
      }
      return b;
    });

    onUpdateState({
      ...state,
      poultryBatches: updatedBatches,
      inventory: updatedInventory
    });

    setShowLogForm(false);
    // Clear Daily Form Inputs so they start completely clean next time
    setFeedUsed('');
    setWaterUsed('');
    setDeathsCount('');
    setAvgWeightG('');
    setTempVal('');
    setMedUsed('');
    setVaccineName('');
    setIsVaccinated(false);
  };

  const handleRecordSale = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBatch) return;

    const finalSoldQty = soldQty === '' ? 0 : Number(soldQty);
    const finalSoldWeight = soldWeight === '' ? 0 : Number(soldWeight);
    const finalPricePerKg = pricePerKg === '' ? 0 : Number(pricePerKg);
    const revenue = finalSoldWeight * finalPricePerKg;

    const newSale: PoultrySale = {
      id: `p-sale-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      quantitySold: finalSoldQty,
      totalWeightKg: finalSoldWeight,
      pricePerKg: finalPricePerKg,
      buyerName: buyerName || 'Local Buyer',
      buyerPhone: buyerPhone || 'Unspecified',
      totalRevenue: revenue
    };

    // Auto load transaction as income
    const transaction = {
      id: `tr-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      type: 'income' as const,
      amount: revenue,
      category: 'poultry' as const,
      description: `Sold ${finalSoldQty} chickens (${finalSoldWeight}kg) from ${selectedBatch.name} to ${buyerName || 'buyer'}`
    };

    const updatedBatches = state.poultryBatches.map(b => {
      if (b.id === selectedBatch.id) {
        const updatedSales = [newSale, ...b.sales];
        const currentMorts = b.dailyLogs.reduce((acc, l) => acc + l.mortalityCount, 0);
        const totalDisplaced = updatedSales.reduce((acc, s) => acc + s.quantitySold, 0) + currentMorts;
        const remainingbirds = b.totalChicks - totalDisplaced;
        
        return {
          ...b,
          sales: updatedSales,
          status: remainingbirds <= 5 ? 'sold' as const : 'active' as const
        };
      }
      return b;
    });

    onUpdateState({
      ...state,
      poultryBatches: updatedBatches,
      finances: [transaction, ...state.finances]
    });

    setShowSaleForm(false);
    // Clear Sales inputs
    setSoldQty('');
    setSoldWeight('');
    setPricePerKg('');
    setBuyerName('');
    setBuyerPhone('');
  };

  const [confirmDeleteBatchId, setConfirmDeleteBatchId] = useState<string | null>(null);

  const handleToggleBatchStatus = () => {
    if (!selectedBatch) return;
    const nextStatus: 'active' | 'sold' = selectedBatch.status === 'active' ? 'sold' : 'active';
    const updatedBatches = state.poultryBatches.map(b => {
      if (b.id === selectedBatch.id) {
        return { ...b, status: nextStatus };
      }
      return b;
    });
    onUpdateState({ ...state, poultryBatches: updatedBatches });
  };

  const handleDeleteBatch = (id: string) => {
    const updated = state.poultryBatches.filter(b => b.id !== id);
    onUpdateState({ ...state, poultryBatches: updated });
    if (selectedBatchId === id) {
      setSelectedBatchId(updated[0]?.id || '');
    }
    setConfirmDeleteBatchId(null);
  };

  // Purely calculated parameters - ONLY using user-entered data without arbitrary generic fallbacks or padding factors!
  const totalMortality = selectedBatch?.dailyLogs.reduce((acc, curr) => acc + (curr.mortalityCount || 0), 0) || 0;
  const quantitySold = selectedBatch?.sales.reduce((acc, s) => acc + (s.quantitySold || 0), 0) || 0;
  const currentChicksRemaining = selectedBatch ? Math.max(0, selectedBatch.totalChicks - totalMortality - quantitySold) : 0;
  
  // Real mortality percentage calculation based strictly on user's total chicks and daily entry of deaths
  const mortalityPercentage = selectedBatch && selectedBatch.totalChicks > 0 
    ? ((totalMortality / selectedBatch.totalChicks) * 100).toFixed(1) 
    : "0.0";
  
  const survivalPercentage = selectedBatch && selectedBatch.totalChicks > 0
    ? (((selectedBatch.totalChicks - totalMortality) / selectedBatch.totalChicks) * 100).toFixed(1)
    : "100.0";

  // Strict User entries aggregation
  const totalFeedUsedKg = selectedBatch?.dailyLogs.reduce((acc, curr) => acc + (curr.feedUsedKg || 0), 0) || 0;
  const totalWaterUsedLiters = selectedBatch?.dailyLogs.reduce((acc, curr) => acc + (curr.waterUsageLiters || 0), 0) || 0;
  const totalSalesRevenue = selectedBatch?.sales.reduce((acc, s) => acc + (s.totalRevenue || 0), 0) || 0;
  const totalSalesWeightKg = selectedBatch?.sales.reduce((acc, s) => acc + (s.totalWeightKg || 0), 0) || 0;

  // Latest average weight logged by the user
  const latestAvgWeightG = selectedBatch && selectedBatch.dailyLogs.length > 0
    ? (selectedBatch.dailyLogs.find(l => l.averageWeightG > 0)?.averageWeightG || 0)
    : 0;

  // Calculate strict Feed Conversion Ratio (FCR)
  // Total Meat Produced includes weight sold out + weight of remaining live flock calculated via current average weight
  const remainingLiveWeightKg = (latestAvgWeightG / 1000) * currentChicksRemaining;
  const totalLiveWeightGainKg = totalSalesWeightKg + remainingLiveWeightKg;
  const feedConversionRatio = totalLiveWeightGainKg > 0 && totalFeedUsedKg > 0
    ? (totalFeedUsedKg / totalLiveWeightGainKg).toFixed(2)
    : "0.00";

  // Financial balance calculations using feed price estimate in Chitwan, Nepal (~Rs. 75 per kg) and chicks cost
  const estimatedFeedCost = totalFeedUsedKg * 75;
  const totalCalculatedExpenses = (selectedBatch?.initialCost || 0) + estimatedFeedCost;
  const netProfitOrLoss = totalSalesRevenue - totalCalculatedExpenses;

  // Collect vaccines and medicines entered by user
  const administeredVaccines = selectedBatch?.dailyLogs
    .filter(l => l.vaccinated && l.vaccineName)
    .map(l => l.vaccineName as string)
    .filter((value, index, self) => self.indexOf(value) === index) || [];

  const administeredMedicines = selectedBatch?.dailyLogs
    .filter(l => l.medicineUsed && l.medicineUsed.toLowerCase() !== 'none' && l.medicineUsed.toLowerCase() !== 'no')
    .map(l => l.medicineUsed)
    .filter((value, index, self) => self.indexOf(value) === index) || [];

  return (
    <div className="space-y-6">
      {/* Title bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="text-3xl">🐔</div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">{t.poultry} ({t.totalPoultry})</h2>
            <p className="text-xs text-gray-500">
              {lang === 'en' 
                ? "Manually record daily inputs. FCR, survival rate and cost balance calculated strictly at the end."
                : "दैनिक रेकर्डहरू आफै प्रविष्टि गर्नुहोस्। FCR, बचदर र नाफा नोक्सान हिसाब चक्रको अन्त्यमा गणना हुनेछ।"
              }
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedBatchId}
            onChange={(e) => setSelectedBatchId(e.target.value)}
            className="bg-gray-50 border border-gray-300 rounded-lg px-3 py-1.5 text-xs font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="">-- Choose Batch --</option>
            {state.poultryBatches.map(b => (
              <option key={b.id} value={b.id}>
                {b.name} ({b.status === 'active' ? (lang === 'en' ? 'Active' : 'सक्रिय') : (lang === 'en' ? 'Sold Out / Closed' : 'बन्द भएको')})
              </option>
            ))}
          </select>

          <button
            onClick={() => setShowBatchForm(!showBatchForm)}
            className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>{t.newBatch}</span>
          </button>
        </div>
      </div>

      {/* New Batch registration form */}
      {showBatchForm && (
        <form onSubmit={handleCreateBatch} className="bg-white border border-red-200 p-5 rounded-xl shadow-md grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-3 pb-2 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-bold text-xs uppercase text-red-600 font-mono tracking-wider flex items-center gap-1.5">
              <span>🐣 Create Registered Chick Batch</span>
              <span className="text-[9px] bg-red-100 text-red-700 px-2 py-0.5 rounded uppercase font-black font-sans">No Prefilled Numbers</span>
            </h3>
            <button type="button" onClick={() => setShowBatchForm(false)} className="text-xs text-gray-400 hover:text-gray-600">Close ✕</button>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1">{t.batchName} *</label>
            <input 
              type="text" 
              placeholder="e.g. Cobb-500-Summer" 
              required
              value={newBatchName}
              onChange={(e) => setNewBatchName(e.target.value)}
              className="w-full bg-gray-50 border border-gray-300 rounded px-3 py-1.5 text-xs text-gray-900 focus:ring-1 focus:ring-red-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1">{t.arrivalDate}</label>
            <input 
              type="date" 
              value={arrivalDate}
              onChange={(e) => setArrivalDate(e.target.value)}
              className="w-full bg-gray-50 border border-gray-300 rounded px-2 py-1.5 text-xs text-gray-900 focus:ring-1 focus:ring-red-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1">{t.totalChicks} (चल्ला थपेको संख्या) *</label>
            <input 
              type="number" 
              placeholder="Enter number of chicks, e.g. 500"
              required
              value={totalChicks}
              onChange={(e) => setTotalChicks(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full bg-gray-50 border border-gray-300 rounded px-3 py-1.5 text-xs text-gray-900 focus:ring-1 focus:ring-red-500 focus:outline-none font-mono"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1">{t.breed} (जात)</label>
            <input 
              type="text" 
              placeholder="e.g. Cobb 500 / Hubbard"
              value={breed}
              onChange={(e) => setBreed(e.target.value)}
              className="w-full bg-gray-50 border border-gray-300 rounded px-3 py-1.5 text-xs text-gray-900 focus:ring-1 focus:ring-red-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1">{t.supplier} (विक्रेता)</label>
            <input 
              type="text" 
              placeholder="e.g. Sunsari Hatcheries Ltd"
              value={supplier}
              onChange={(e) => setSupplier(e.target.value)}
              className="w-full bg-gray-50 border border-gray-300 rounded px-3 py-1.5 text-xs text-gray-900 focus:ring-1 focus:ring-red-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1">{t.chicksCost} (Rs. कुल खरिद लागत) *</label>
            <input 
              type="number" 
              placeholder="Rs. Total cost of broiler chicks"
              required
              value={initialCost}
              onChange={(e) => setInitialCost(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full bg-gray-50 border border-gray-300 rounded px-3 py-1.5 text-xs text-gray-900 focus:ring-1 focus:ring-red-500 focus:outline-none font-mono"
            />
          </div>
          <div className="md:col-span-3 pt-2 text-right">
            <button type="submit" className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-5 py-2 rounded-lg cursor-pointer shadow">
              {t.save} / {lang === 'en' ? 'Register Batch' : 'ब्याच दर्ता गर्नुहोस्'}
            </button>
          </div>
        </form>
      )}

      {selectedBatch ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* LEFT: Batch Profile card and active status controls */}
          <div className="lg:col-span-1 space-y-6 animate-fadeIn">
            <div className="bg-white border border-gray-200 p-5 rounded-xl shadow-sm space-y-4">
              <div className="flex justify-between items-start pb-3 border-b border-gray-100">
                <div>
                  <h3 className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-red-500" />
                    <span>{selectedBatch.name}</span>
                  </h3>
                  <div className="mt-1 flex items-center gap-2">
                    <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded ${
                      selectedBatch.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {selectedBatch.status === 'active' ? t.active : (lang === 'en' ? 'Sold Out / Closed' : 'बिक्री / बन्द भएको')}
                    </span>
                    <span className="text-[9px] text-gray-400 font-mono">ID: {selectedBatch.id.slice(-6)}</span>
                  </div>
                </div>
                {confirmDeleteBatchId === selectedBatch.id ? (
                  <div className="flex items-center gap-1 animate-pulse bg-rose-50 border border-rose-200 p-1.5 rounded-lg shrink-0">
                    <button
                      onClick={() => handleDeleteBatch(selectedBatch.id)}
                      className="bg-red-650 hover:bg-red-700 text-white font-extrabold text-[10px] px-2 py-1 rounded cursor-pointer transition"
                    >
                      Delete Batch?
                    </button>
                    <button
                      onClick={() => setConfirmDeleteBatchId(null)}
                      className="bg-gray-200 text-gray-700 font-extrabold text-[10px] px-1.5 py-1 rounded cursor-pointer transition"
                    >
                      X
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => setConfirmDeleteBatchId(selectedBatch.id)}
                    className="text-red-500 hover:text-red-700 p-1.5 rounded-lg hover:bg-red-50 text-xs transition inline-flex items-center gap-1 cursor-pointer" 
                    title="Delete batch file"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Initial profile values entered by the user */}
              <div className="space-y-2.5 text-xs bg-slate-50 p-3 rounded-lg border border-slate-100 font-medium">
                <span className="text-[10px] text-gray-400 block uppercase tracking-wider font-extrabold pb-1">Arrival Logistics (दर्ता समयको रेकर्ड)</span>
                <div className="flex justify-between text-gray-500"><span className="font-medium">{t.arrivalDate}:</span> <strong className="text-gray-900 font-mono">{selectedBatch.arrivalDate}</strong></div>
                <div className="flex justify-between text-gray-500"><span className="font-medium">{t.totalChicks}:</span> <strong className="text-gray-900 font-mono">{selectedBatch.totalChicks} birds</strong></div>
                <div className="flex justify-between text-gray-500"><span className="font-medium">{t.breed}:</span> <strong className="text-gray-800">{selectedBatch.breed || 'N/A'}</strong></div>
                <div className="flex justify-between text-gray-500"><span className="font-medium">{t.supplier}:</span> <strong className="text-gray-800 truncate max-w-[120px]">{selectedBatch.supplier || 'N/A'}</strong></div>
                <div className="flex justify-between text-gray-500"><span className="font-medium">{t.chicksCost}:</span> <strong className="text-red-700 font-mono">Rs. {selectedBatch.initialCost}</strong></div>
              </div>

              {/* Daily state indicator - purely computed */}
              <div className="space-y-2.5 text-xs p-3 bg-red-50/50 border border-red-100 rounded-lg">
                <span className="text-[10px] text-red-500 block uppercase tracking-wider font-extrabold pb-1">Real-Time Indicators (लग संकलन स्थिति)</span>
                <div className="flex justify-between text-gray-600"><span className="font-medium">Total mortalities (Died count):</span> <strong className="text-red-600 font-sans">{totalMortality} birds ({mortalityPercentage}%)</strong></div>
                <div className="flex justify-between text-gray-600"><span className="font-medium">Remaining chicks at farm:</span> <strong className="text-gray-900 font-sans">{currentChicksRemaining} birds</strong></div>
                <div className="flex justify-between text-gray-600"><span className="font-medium">Total Feed Fed (दाना मात्रा):</span> <strong className="text-gray-900 font-mono">{totalFeedUsedKg} kg</strong></div>
                <div className="flex justify-between text-gray-600"><span className="font-medium">Total Water Usage (पानी मात्रा):</span> <strong className="text-gray-900 font-mono">{totalWaterUsedLiters} L</strong></div>
              </div>

              {/* Functional actions block */}
              <div className="pt-2 space-y-2">
                <div className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wide">Operations Control Panel</div>
                {selectedBatch.status === 'active' ? (
                  <>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setShowSaleForm(false);
                          setShowLogForm(!showLogForm);
                        }}
                        className="flex-1 bg-white hover:bg-slate-50 border border-gray-300 text-gray-800 text-xs font-bold py-2.5 px-3 rounded-lg text-center transition flex justify-center items-center gap-1 cursor-pointer"
                      >
                        📝 {t.logDailyEntry}
                      </button>
                      <button
                        onClick={() => {
                          setShowLogForm(false);
                          setShowSaleForm(!showSaleForm);
                        }}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-2.5 px-3 rounded-lg text-center transition flex justify-center items-center gap-1 cursor-pointer shadow-sm"
                      >
                        💰 Record Sale (बिक्री)
                      </button>
                    </div>

                    <button
                      onClick={handleToggleBatchStatus}
                      className="w-full bg-gray-800 hover:bg-black text-white text-xs font-extrabold py-2 px-3 rounded-lg text-center transition flex justify-center items-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span>{lang === 'en' ? 'Close & Complete Cycle' : 'ब्याच बन्द गरी हिसाब गर्नुहोस्'}</span>
                    </button>
                  </>
                ) : (
                  <div className="space-y-2">
                    <div className="text-[11px] text-gray-500 text-center font-medium bg-gray-100 p-2.5 rounded-lg border border-gray-200">
                      Closed Batch file. Additions are locked to preserve calculations.
                    </div>
                    <button
                      onClick={handleToggleBatchStatus}
                      className="w-full bg-white hover:bg-slate-50 border border-gray-300 text-gray-700 text-xs font-extrabold py-2 px-3 rounded-lg text-center transition flex justify-center items-center gap-1 cursor-pointer"
                    >
                      <Clock className="w-4 h-4 text-amber-500" />
                      <span>{lang === 'en' ? 'Reopen Cycle Registers' : 'ब्याच पुनः खोल्नुहोस्'}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Dynamic context alert */}
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl space-y-1.5 text-xs text-amber-800">
              <h5 className="font-extrabold flex items-center gap-1.5 text-amber-950">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Custom Manual Reporting Mode</span>
              </h5>
              <p className="leading-relaxed text-justify text-[11px]">
                {lang === 'en'
                  ? "Saroja Agro standard auto-mocking is deactivated. FCR and balance sheet updates require your day-by-day feed, mortality (died chicks count), vaccines, and weight records to execute correct aggregated reports."
                  : "सरोजा एग्रो स्वचालित नमूना डेटा बन्द गरिएको छ। FCR र शुद्ध मुनाफा विवरण वास्तविक रूपमा निकाल्न तपाईंले दैनिक दाना प्रयोग, मृत्यु संख्या, खोप, र तौल प्रविष्टि चढाउनुपर्छ।"}
              </p>
            </div>
          </div>

          {/* MIDDLE & RIGHT: Interactive operational forms and calculated summaries */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Daily log record insertion form */}
            {showLogForm && (
              <form onSubmit={handleAddDailyEntry} className="bg-white border border-red-300 p-5 rounded-xl shadow-md grid grid-cols-1 md:grid-cols-2 gap-4 animate-slideDown">
                <div className="md:col-span-2 pb-2 border-b border-gray-150 flex justify-between items-center">
                  <h4 className="font-bold text-xs uppercase text-red-600 font-mono tracking-wider flex items-center gap-1.5">
                    <span>📝 {lang === 'en' ? 'Log Daily Operations Status' : 'दैनिक वस्तुस्थिति फारम'}</span>
                  </h4>
                  <button type="button" onClick={() => setShowLogForm(false)} className="text-xs text-gray-400 hover:text-gray-600 font-bold">✕ Close</button>
                </div>
                
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">{t.feedUsed} *</label>
                  <input 
                    type="number" 
                    placeholder="Enter feed consumed in Kilograms (kg)"
                    required
                    value={feedUsed}
                    onChange={(e) => setFeedUsed(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full bg-gray-50 border border-gray-300 rounded px-3 py-1.5 text-xs text-gray-900 focus:ring-1 focus:ring-red-500 focus:outline-none font-mono"
                  />
                </div>
                
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">{t.waterUsed} (Liters) *</label>
                  <input 
                    type="number" 
                    placeholder="Enter water usage in Liters"
                    required
                    value={waterUsed}
                    onChange={(e) => setWaterUsed(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full bg-gray-50 border border-gray-300 rounded px-3 py-1.5 text-xs text-gray-900 focus:ring-1 focus:ring-red-500 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">{t.avgWeight} (grams) *</label>
                  <input 
                    type="number" 
                    placeholder="Enter average chick weight, e.g. 850"
                    required
                    value={avgWeightG}
                    onChange={(e) => setAvgWeightG(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full bg-gray-50 border border-gray-300 rounded px-3 py-1.5 text-xs text-gray-900 focus:ring-1 focus:ring-red-500 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Mortality Count Today (मरेका चल्ला संख्या) *</label>
                  <input 
                    type="number" 
                    placeholder="Chicks died today, e.g. 2 (Enter 0 if none)"
                    required
                    value={deathsCount}
                    onChange={(e) => setDeathsCount(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full bg-gray-50 border border-gray-300 rounded px-3 py-1.5 text-xs text-gray-900 focus:ring-1 focus:ring-red-500 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">{t.tempC}</label>
                  <input 
                    type="number" 
                    placeholder="Standard coop temperature, e.g. 29"
                    value={tempVal}
                    onChange={(e) => setTempVal(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full bg-gray-50 border border-gray-300 rounded px-3 py-1.5 text-xs text-gray-900 focus:ring-1 focus:ring-red-500 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">{t.vaccinatedQuestion}</label>
                  <div className="flex gap-4 items-center h-[34px]">
                    <label className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer">
                      <input 
                        type="radio" 
                        name="vac_today" 
                        checked={isVaccinated} 
                        onChange={() => setIsVaccinated(true)} 
                      /> Yes (हो)
                    </label>
                    <label className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer">
                      <input 
                        type="radio" 
                        name="vac_today" 
                        checked={!isVaccinated} 
                        onChange={() => setIsVaccinated(false)} 
                      /> No (होइन)
                    </label>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="text-xs font-bold text-gray-700 block mb-1">Medicine adminstered or Vaccine Name (दिएको ओषधी/भ्याक्सिन नाम)</label>
                  {isVaccinated ? (
                    <input 
                      type="text" 
                      placeholder="e.g. Lasota Vaccine booster / Newcastle booster" 
                      required
                      value={vaccineName}
                      onChange={(e) => setVaccineName(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-300 rounded px-3 py-1.5 text-xs text-gray-900 focus:ring-1 focus:ring-red-500 focus:outline-none"
                    />
                  ) : (
                    <input 
                      type="text" 
                      placeholder="e.g. Vitamin A/D/E Liquid or Electrolytes (leave empty if none)" 
                      value={medUsed}
                      onChange={(e) => setMedUsed(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-300 rounded px-3 py-1.5 text-xs text-gray-900 focus:ring-1 focus:ring-red-500 focus:outline-none"
                    />
                  )}
                </div>

                <div className="md:col-span-2 text-right">
                  <button type="submit" className="bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs px-5 py-2 rounded-lg cursor-pointer shadow-sm">
                    {t.save} Daily Log
                  </button>
                </div>
              </form>
            )}

            {/* Sale logging form */}
            {showSaleForm && (
              <form onSubmit={handleRecordSale} className="bg-white border border-red-300 p-5 rounded-xl shadow-md space-y-4 animate-slideDown">
                <div className="pb-2 border-b border-gray-150 flex justify-between items-center">
                  <h4 className="font-bold text-xs uppercase text-red-600 font-mono tracking-wider">💰 {t.recordPoultrySale}</h4>
                  <button type="button" onClick={() => setShowSaleForm(false)} className="text-xs text-gray-400 font-bold">✕ Close</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-medium">
                  <div>
                    <label className="font-bold text-gray-700 block mb-1">{t.soldQty} *</label>
                    <input 
                      type="number" 
                      placeholder="e.g. 250 birds"
                      required
                      value={soldQty}
                      onChange={(e) => setSoldQty(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full bg-gray-50 border border-gray-300 rounded px-3 py-1.5 text-xs text-gray-900 font-mono focus:ring-1 focus:ring-red-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-gray-700 block mb-1">{t.salesWeightKg} *</label>
                    <input 
                      type="number" 
                      placeholder="e.g. 520 kg"
                      required
                      value={soldWeight}
                      onChange={(e) => setSoldWeight(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full bg-gray-50 border border-gray-300 rounded px-3 py-1.5 text-xs text-gray-900 font-mono focus:ring-1 focus:ring-red-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-gray-700 block mb-1">{t.soldPricePerKg} *</label>
                    <input 
                      type="number" 
                      placeholder="e.g. Rs. 310"
                      required
                      value={pricePerKg}
                      onChange={(e) => setPricePerKg(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full bg-gray-50 border border-gray-300 rounded px-3 py-1.5 text-xs text-gray-900 font-mono focus:ring-1 focus:ring-red-500 focus:outline-none"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="font-bold text-gray-700 block mb-1">{t.buyerDetails} Name *</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Sunsari Meat Center"
                      required
                      value={buyerName}
                      onChange={(e) => setBuyerName(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-300 rounded px-3 py-1.5 text-xs text-gray-900 focus:ring-1 focus:ring-red-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-gray-700 block mb-1">{t.phone}</label>
                    <input 
                      type="text" 
                      placeholder="e.g. 98550xxxxx" 
                      value={buyerPhone}
                      onChange={(e) => setBuyerPhone(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-300 rounded px-3 py-1.5 text-xs text-gray-900 font-mono focus:ring-1 focus:ring-red-500 focus:outline-none"
                    />
                  </div>
                </div>
                <div className="bg-red-50 p-3 rounded-lg border border-red-100 text-right flex justify-between items-center">
                  <span className="text-xs text-red-800 font-bold">Calculation Summary: </span>
                  <span className="text-base font-black text-red-700 font-mono">
                    Rs. {soldWeight && pricePerKg ? Number(soldWeight) * Number(pricePerKg) : 0}
                  </span>
                </div>
                <div className="text-right">
                  <button type="submit" className="bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs px-5 py-2 rounded-lg cursor-pointer shadow-sm">
                    {t.save} Sales Record
                  </button>
                </div>
              </form>
            )}

            {/* HIGH SPECIFICATION: Pure Cumulative Analysis and Financial Balance Statement */}
            <div className="bg-white border-2 border-slate-900/90 rounded-2xl p-6 shadow-md space-y-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="bg-slate-900 text-white p-2 rounded-xl">
                    <Scale className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-gray-950 text-sm tracking-tight">
                      {lang === 'en' ? 'Batch Lifecycle Summary & Calculator' : 'ब्याच चक्रको अन्तिम हिसाब किताब विवरण'}
                    </h3>
                    <p className="text-[11px] text-gray-500 font-medium">Calculations generated strictly from manual logs entered by you</p>
                  </div>
                </div>
                <span className="bg-amber-100 text-amber-900 text-[9px] font-black uppercase px-2.5 py-1 rounded-full border border-amber-250">
                  {selectedBatch.status === 'active' ? (lang === 'en' ? 'Live Progress' : 'चलिरहेको रेकर्ड') : (lang === 'en' ? 'Final Calculated Report' : 'बन्द भएको चक्र रिपोर्ट')}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                
                {/* Survival box */}
                <div className="bg-emerald-50/70 border border-emerald-250 p-3.5 rounded-xl text-center space-y-1">
                  <span className="text-[9px] font-black uppercase text-emerald-800 tracking-wider block">Survival Rate</span>
                  <p className="text-xl font-black text-emerald-900 font-mono tracking-tight leading-none">{survivalPercentage}%</p>
                  <span className="text-[10px] text-emerald-700 font-bold block">{selectedBatch.totalChicks - totalMortality} of {selectedBatch.totalChicks} birds</span>
                </div>

                {/* Mortality loss box */}
                <div className="bg-rose-50/70 border border-rose-250 p-3.5 rounded-xl text-center space-y-1">
                  <span className="text-[9px] font-black uppercase text-rose-800 tracking-wider block">Mortality Loss</span>
                  <p className="text-xl font-black text-rose-900 font-mono tracking-tight leading-none">{mortalityPercentage}%</p>
                  <span className="text-[10px] text-rose-700 font-bold block">{totalMortality} chicks died</span>
                </div>

                {/* Total Feed Bags box */}
                <div className="bg-sky-50/70 border border-sky-250 p-3.5 rounded-xl text-center space-y-1">
                  <span className="text-[9px] font-black uppercase text-sky-800 tracking-wider block">Total Feed Fed</span>
                  <p className="text-xl font-black text-sky-900 font-mono tracking-tight leading-none">{totalFeedUsedKg} kg</p>
                  <span className="text-[10px] text-sky-700 font-bold block">~{(totalFeedUsedKg / 50).toFixed(1)} Bags (50kg)</span>
                </div>

                {/* Calculated Feed Efficiency FCR box */}
                <div className="bg-purple-50/70 border border-purple-250 p-3.5 rounded-xl text-center space-y-1">
                  <span className="text-[9px] font-black uppercase text-purple-800 tracking-wider block">Feed Efficiency (FCR)</span>
                  <p className="text-xl font-black text-purple-900 font-mono tracking-tight leading-none">{feedConversionRatio}</p>
                  <span className="text-[10px] text-purple-700 font-semibold block uppercase">
                    {Number(feedConversionRatio) === 0 ? 'No Data' : (Number(feedConversionRatio) <= 1.6 ? 'Excellent' : Number(feedConversionRatio) <= 1.8 ? 'Good' : 'Needs Improvement')}
                  </span>
                </div>

              </div>

              {/* FCR breakdown math explanation */}
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl text-xs space-y-2 leading-relaxed">
                <span className="text-[10px] text-slate-500 uppercase font-black tracking-wider block flex items-center gap-1">
                  <Info className="w-3.5 h-3.5 text-slate-500" />
                  <span>How FCR is Calculated Strictly from your data:</span>
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 text-slate-700">
                  <p>1. <strong>Total Feed Fed:</strong> <span className="font-mono text-slate-900 font-bold">{totalFeedUsedKg} kg</span></p>
                  <p>2. <strong>Total Live Weight Produced:</strong> <span className="font-mono text-slate-900 font-bold">{(totalLiveWeightGainKg).toFixed(1)} kg</span></p>
                  <p className="md:col-span-2 text-[10px] text-gray-500">
                    Formula: (Total chicken weight sold in register: <strong>{totalSalesWeightKg} kg</strong>) + (Remaining live flock: <strong>{currentChicksRemaining}</strong> birds × Latest avg weight: <strong>{latestAvgWeightG}g</strong> = <strong>{remainingLiveWeightKg.toFixed(1)} kg</strong>) = <strong>{totalLiveWeightGainKg.toFixed(1)} kg</strong> produced weight.
                  </p>
                </div>
                <div className="h-px bg-slate-200" />
                <p className="font-mono text-[11px] text-slate-900">
                  FCR Math: <strong>{totalFeedUsedKg} kg Feed</strong> ÷ <strong>{totalLiveWeightGainKg.toFixed(1)} kg Weight Gain</strong> = <strong className="text-purple-700 text-xs font-black">{feedConversionRatio} FCR</strong>
                </p>
              </div>

              {/* Lifecycle balance statement */}
              <div className="border border-slate-200 hover:border-slate-300 rounded-xl overflow-hidden shadow-sm">
                <div className="bg-slate-900 text-white px-4 py-2 text-xs font-bold uppercase tracking-wider flex justify-between items-center">
                  <span>💰 Financial Balance Sheet (वित्तीय हिसाव खाता)</span>
                  <span className="text-[9px] font-mono lowercase">Estimated feed cost factor: Rs. 75/kg</span>
                </div>
                
                <div className="p-4 space-y-3.5 text-xs text-gray-750 font-semibold leading-relaxed">
                  
                  {/* Expense segment */}
                  <div className="space-y-2">
                    <span className="text-rose-700 block uppercase tracking-wider text-[9px] font-extrabold pb-0.5">Estimated Expenditure (कुल खर्च विवरण)</span>
                    <div className="flex justify-between items-center text-gray-500 border-b border-gray-100 pb-1.5">
                      <span>• Initial chicks cost (Rs.):</span>
                      <span className="font-mono text-gray-900 font-bold">Rs. {selectedBatch.initialCost}</span>
                    </div>
                    <div className="flex justify-between items-center text-gray-500 border-b border-gray-100 pb-1.5">
                      <span>• Calculated dynamic feed cost ({totalFeedUsedKg} kg × Rs. 75/kg):</span>
                      <span className="font-mono text-gray-900 font-bold">Rs. {estimatedFeedCost}</span>
                    </div>
                    <div className="flex justify-between items-center text-rose-950 font-black pt-1 bg-red-50/30 px-2 py-1 rounded">
                      <span>Total Costs (कुल खर्च):</span>
                      <span className="font-mono">Rs. {totalCalculatedExpenses}</span>
                    </div>
                  </div>

                  {/* Revenue Segment */}
                  <div className="space-y-2">
                    <span className="text-emerald-700 block uppercase tracking-wider text-[9px] font-extrabold pb-0.5">Realized Revenue (कुल बिक्री आम्दानी)</span>
                    <div className="flex justify-between items-center text-gray-500 border-b border-gray-100 pb-1.5">
                      <span>• Total sales income registered in sales register:</span>
                      <span className="font-mono text-emerald-700 font-bold">Rs. {totalSalesRevenue}</span>
                    </div>
                    <div className="flex justify-between items-center text-emerald-950 font-black pt-1 bg-emerald-50/30 px-2 py-1 rounded">
                      <span>Total Income (कुल आम्दानी):</span>
                      <span className="font-mono text-emerald-700">Rs. {totalSalesRevenue}</span>
                    </div>
                  </div>

                  {/* Final Net balance report */}
                  <div className={`p-4 rounded-xl border flex flex-col md:flex-row justify-between items-center gap-3 ${
                    netProfitOrLoss >= 0 ? 'bg-emerald-50 border-emerald-300 text-emerald-800' : 'bg-rose-50 border-rose-300 text-rose-800'
                  }`}>
                    <div className="space-y-0.5 text-center md:text-left">
                      <span className="text-[10px] uppercase font-black tracking-widest block font-sans">
                        Net Profit/Loss (चल्ला चक्र पूरा भएपछिको खुद मुनाफा / नोक्सानी)
                      </span>
                      <p className="text-[10.5px] font-medium opacity-90">
                        {netProfitOrLoss >= 0 
                          ? "Congratulations! This batch cycle operates in healthy financial profit margins."
                          : "This batch cycle registers a monetary cost deficit. Check mortality records or feed leakage factors."}
                      </p>
                    </div>
                    <div className="text-center md:text-right font-mono self-center shrink-0">
                      <span className="text-[9px] uppercase block font-bold leading-none">Net Return on Investment</span>
                      <span className="text-xl font-black block tracking-tight pt-1">
                        Rs. {netProfitOrLoss}
                      </span>
                    </div>
                  </div>

                </div>
              </div>

              {/* Administered Medical record highlights */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-slate-100 p-4 rounded-xl space-y-2 bg-slate-50/50">
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest font-black block">🛡️ Vaccines Log Summary</span>
                  {administeredVaccines.length === 0 ? (
                    <p className="text-xs text-gray-400 italic">No vaccinations entered manually yet.</p>
                  ) : (
                    <ul className="text-xs text-slate-800 font-semibold space-y-1 list-disc list-inside">
                      {administeredVaccines.map((v, i) => (
                        <li key={i}>{v}</li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="border border-slate-100 p-4 rounded-xl space-y-2 bg-slate-50/50">
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest font-black block">💊 Treatment Medicines given</span>
                  {administeredMedicines.length === 0 ? (
                    <p className="text-xs text-gray-400 italic">No custom medical remedies entered manually yet.</p>
                  ) : (
                    <ul className="text-xs text-slate-800 font-semibold space-y-1 list-disc list-inside">
                      {administeredMedicines.map((m, i) => (
                        <li key={i}>{m}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

            </div>

            {/* List Daily Logs */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-gray-900 text-sm">{t.dailyLogTable}</h3>
                <span className="text-[10px] bg-slate-100 font-bold text-slate-700 px-2 py-0.5 rounded font-mono">
                  {selectedBatch.dailyLogs.length} Logs recorded
                </span>
              </div>
              
              {selectedBatch.dailyLogs.length === 0 ? (
                <p className="text-xs text-gray-500 py-6 text-center">No daily logs recorded for this batch yet. Click the "Log Daily Entry" button to start.</p>
              ) : (
                <div className="overflow-x-auto pr-1">
                  <table className="w-full text-xs text-left text-gray-500 font-medium whitespace-nowrap">
                    <thead className="text-[10px] text-gray-700 uppercase bg-gray-50">
                      <tr>
                        <th className="px-3 py-2.5">{t.date}</th>
                        <th className="px-3 py-2.5">{t.feedUsed}</th>
                        <th className="px-3 py-2.5">{t.waterUsed}</th>
                        <th className="px-3 py-2.5">Died Count (Morts)</th>
                        <th className="px-3 py-2.5">{t.avgWeight}</th>
                        <th className="px-3 py-2.5">{t.tempC}</th>
                        <th className="px-3 py-2.5">Medicines & Vaccines</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 font-mono">
                      {selectedBatch.dailyLogs.map(log => (
                        <tr key={log.id} className="hover:bg-gray-50">
                          <td className="px-3 py-2.5 font-bold text-gray-900 font-sans">{log.date}</td>
                          <td className="px-3 py-2.5 text-gray-900">{log.feedUsedKg} kg</td>
                          <td className="px-3 py-2.5 text-gray-805">{log.waterUsageLiters} L</td>
                          <td className={`px-3 py-2.5 font-black ${log.mortalityCount > 0 ? 'text-rose-600' : 'text-slate-400'}`}>
                            {log.mortalityCount} birds
                          </td>
                          <td className="px-3 py-2.5 text-blue-600 font-bold">{log.averageWeightG} g</td>
                          <td className="px-3 py-2.5">{log.temperatureC} °C</td>
                          <td className="px-3 py-2.5 whitespace-normal truncate font-sans max-w-[160px]" title={log.vaccineName || log.medicineUsed}>
                            {log.vaccinated ? (
                              <span className="bg-emerald-50 text-emerald-800 font-bold text-[10px] px-2 py-0.5 rounded border border-emerald-200">
                                💉 {log.vaccineName}
                              </span>
                            ) : (
                              <span className="text-gray-600">{log.medicineUsed}</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Historic Sales Logs */}
            {selectedBatch.sales.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-3">
                <h3 className="font-bold text-gray-950 text-sm">Batch Sales Register (बिक्री अभिलेख)</h3>
                <div className="space-y-3">
                  {selectedBatch.sales.map(sale => (
                    <div key={sale.id} className="bg-green-50 border border-green-200 p-4 rounded-lg flex flex-col md:flex-row justify-between text-xs gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-green-950">{sale.buyerName}</span>
                          <span className="bg-green-100 text-green-800 font-bold px-1.5 py-0.2 rounded font-mono text-[9px]">{sale.date}</span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-1 text-gray-500 font-medium">
                          <span>Qty Sold: <strong className="text-gray-900">{sale.quantitySold} birds</strong></span>
                          <span>Weight sum: <strong className="text-gray-900">{sale.totalWeightKg} kg</strong></span>
                          <span>Price/kg: <strong className="text-gray-900">Rs. {sale.pricePerKg}</strong></span>
                        </div>
                      </div>
                      <div className="text-right flex flex-col justify-center shrink-0">
                        <span className="text-[10px] text-green-800 uppercase font-semibold">Net Income</span>
                        <span className="text-sm font-black text-green-700">Rs. {sale.totalRevenue}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

        </div>
      ) : (
        <div className="bg-white p-12 text-center rounded-xl border border-gray-200 shadow-sm text-gray-500">
          <p className="font-bold">No poultry batch registered yet.</p>
          <p className="text-xs pt-1.5 opacity-80">Click the "{t.newBatch}" button above to register the arrival of chicks and begin recording daily operations.</p>
        </div>
      )}
    </div>
  );
}
