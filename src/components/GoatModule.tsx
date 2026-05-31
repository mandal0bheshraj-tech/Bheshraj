import React, { useState } from 'react';
import { FarmState, GoatRecord } from '../types';
import { translations } from '../utils/translations';
import { Plus, Trash2, Calendar, Clipboard, HeartCrack, Activity, Search, Sparkles } from 'lucide-react';

interface GoatProps {
  state: FarmState;
  onUpdateState: (newState: FarmState) => void;
  lang: 'en' | 'ne';
}

export function GoatModule({ state, onUpdateState, lang }: GoatProps) {
  const t = translations[lang];
  const [selectedGoatId, setSelectedGoatId] = useState<string>(
    state.goats[0]?.id || ''
  );
  const [searchTerm, setSearchTerm] = useState('');

  // Visibility togglers
  const [showGoatForm, setShowGoatForm] = useState(false);
  const [showBreedingForm, setShowBreedingForm] = useState(false);
  const [showMedicalForm, setShowMedicalForm] = useState(false);
  const [showSaleForm, setShowSaleForm] = useState(false);

  // New Goat State
  const [tagNo, setTagNo] = useState('');
  const [breed, setBreed] = useState('Pure Boer (बोयर)');
  const [gender, setGender] = useState<'Male' | 'Female'>('Female');
  const [ageMonths, setAgeMonths] = useState<number | ''>('');
  const [weightKg, setWeightKg] = useState<number | ''>('');
  const [healthStatus, setHealthStatus] = useState<'Healthy' | 'Sick' | 'Under Treatment'>('Healthy');
  const [photoUrl, setPhotoUrl] = useState('https://images.unsplash.com/photo-1524024973431-2ad916746881?auto=format&fit=crop&q=80&w=200');

  // Breeding state
  const [matingDate, setMatingDate] = useState('');
  const [pregStatus, setPregStatus] = useState<'Not Mated' | 'Pregnant' | 'Expected Delivery'>('Pregnant');
  const [expectedDeliv, setExpectedDeliv] = useState('');
  const [kidsCount, setKidsCount] = useState<number | ''>('');

  // Medical record state
  const [illDate, setIllDate] = useState('2026-05-29');
  const [illness, setIllness] = useState('');
  const [medsUsed, setMedsUsed] = useState('');

  // Sale records
  const [salePrice, setSalePrice] = useState<number | ''>('');
  const [buyerName, setBuyerName] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');

  const selectedGoat = state.goats.find(g => g.id === selectedGoatId);

  const handleCreateGoat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tagNo) return;

    const newGoat: GoatRecord = {
      id: `goat-${Date.now()}`,
      tagNo,
      breed,
      gender,
      ageMonths: ageMonths === '' ? 0 : Number(ageMonths),
      weightKg: weightKg === '' ? 0 : Number(weightKg),
      healthStatus,
      photoUrl,
      matingDate: undefined,
      pregnancyStatus: 'Not Mated',
      vaccines: [],
      dewormingDates: [],
      illnessHistory: []
    };

    onUpdateState({
      ...state,
      goats: [newGoat, ...state.goats]
    });

    setSelectedGoatId(newGoat.id);
    setShowGoatForm(false);
    setTagNo('');
    setAgeMonths('');
    setWeightKg('');
  };

  const handleUpdateBreeding = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGoat) return;

    const updatedGoats = state.goats.map(g => {
      if (g.id === selectedGoat.id) {
        return {
          ...g,
          matingDate: matingDate || undefined,
          pregnancyStatus: pregStatus,
          expectedDeliveryDate: expectedDeliv || undefined,
          kidsBornCount: kidsCount === '' ? 0 : Number(kidsCount)
        };
      }
      return g;
    });

    onUpdateState({
      ...state,
      goats: updatedGoats
    });

    setShowBreedingForm(false);
    setKidsCount('');
    setMatingDate('');
    setExpectedDeliv('');
  };

  const handleAddMedicalLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGoat || !illness) return;

    const newMedicalIdx = {
      date: illDate,
      illness,
      medicine: medsUsed
    };

    const updatedGoats = state.goats.map(g => {
      if (g.id === selectedGoat.id) {
        return {
          ...g,
          healthStatus: 'Under Treatment' as const,
          illnessHistory: [newMedicalIdx, ...g.illnessHistory]
        };
      }
      return g;
    });

    onUpdateState({
      ...state,
      goats: updatedGoats
    });

    setShowMedicalForm(false);
    setIllness('');
    setMedsUsed('');
  };

  const handleRecordGoatSale = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGoat) return;

    const numericPrice = salePrice === '' ? 0 : Number(salePrice);

    const transaction = {
      id: `tr-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      type: 'income' as const,
      amount: numericPrice,
      category: 'goat' as const,
      description: `Sold Goat ${selectedGoat.tagNo} (${selectedGoat.breed}) to ${buyerName}`
    };

    // Remove from active list
    const updatedGoats = state.goats.filter(g => g.id !== selectedGoat.id);

    // Append to customer database
    const order = {
      id: `ord-${Date.now()}`,
      customerName: buyerName,
      phoneNumber: buyerPhone,
      address: "Assigned Delivery",
      sector: 'goat' as const,
      productOrdered: `Breeding Goat ${selectedGoat.tagNo}`,
      quantityOrdered: "1 Unit",
      totalCost: numericPrice,
      paymentStatus: "Paid" as const,
      deliveryStatus: "Delivered" as const,
      orderDate: new Date().toISOString().split('T')[0]
    };

    onUpdateState({
      ...state,
      goats: updatedGoats,
      finances: [transaction, ...state.finances],
      orders: [order, ...state.orders]
    });

    setShowSaleForm(false);
    setSelectedGoatId(updatedGoats[0]?.id || '');
    setBuyerName('');
    setBuyerPhone('');
    setSalePrice('');
  };

  const [confirmDeleteGoatId, setConfirmDeleteGoatId] = useState<string | null>(null);

  const handleDeleteGoat = (id: string) => {
    const updated = state.goats.filter(g => g.id !== id);
    onUpdateState({ ...state, goats: updated });
    if (selectedGoatId === id) {
      setSelectedGoatId(updated[0]?.id || '');
    }
    setConfirmDeleteGoatId(null);
  };

  const handleSimulateDeworming = () => {
    if (!selectedGoat) return;
    const currentStr = new Date().toISOString().split('T')[0];
    const updated = state.goats.map(g => {
      if (g.id === selectedGoat.id) {
        return {
          ...g,
          dewormingDates: [currentStr, ...g.dewormingDates]
        };
      }
      return g;
    });
    onUpdateState({ ...state, goats: updated });
    alert("Deworming date successfully logged to goat history!");
  };

  const filteredGoats = state.goats.filter(g => 
    g.tagNo.toLowerCase().includes(searchTerm.toLowerCase()) || 
    g.breed.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="text-3xl">🐐</div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">{t.goat} ({state.goats.length} {lang === 'en' ? 'goats' : 'बाख्रा'})</h2>
            <p className="text-xs text-gray-500">Individual tag profiles, pregnancy status cycles & medical records</p>
          </div>
        </div>

        <button
          onClick={() => setShowGoatForm(!showGoatForm)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition cursor-pointer shadow"
        >
          <Plus className="w-4 h-4" />
          <span>{t.addGoat}</span>
        </button>
      </div>

      {showGoatForm && (
        <form onSubmit={handleCreateGoat} className="bg-white border border-gray-200 p-5 rounded-xl shadow-sm grid grid-cols-1 md:grid-cols-3 gap-4 font-medium text-xs text-gray-700">
          <div className="md:col-span-3 pb-2 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 p-2 rounded">
            <h3 className="font-bold text-emerald-700 uppercase tracking-wider">{t.addGoat}</h3>
            <button type="button" onClick={() => setShowGoatForm(false)} className="text-xs text-gray-400 font-bold">✕ Close</button>
          </div>
          <div>
            <label className="font-semibold block mb-1">{t.tagNo} *</label>
            <input 
              type="text" 
              placeholder="e.g. SG-Boer-004" 
              required
              value={tagNo}
              onChange={(e) => setTagNo(e.target.value)}
              className="w-full bg-gray-50 border border-gray-300 rounded px-3 py-1.5 text-xs text-gray-900"
            />
          </div>
          <div>
            <label className="font-semibold block mb-1">{t.breed}</label>
            <select
              value={breed}
              onChange={(e) => setBreed(e.target.value)}
              className="w-full bg-gray-50 border border-gray-300 rounded px-3 py-1.5 text-xs text-gray-900"
            >
              <option value="Pure Boer (बोयर)">Pure Boer (बोयर)</option>
              <option value="Boer Cross Breeders">Boer Cross Breeders</option>
              <option value="Jamunapari (जमुनापारी)">Jamunapari (जमुनापारी)</option>
              <option value="Local Khari (स्थानीय खरी)">Local Khari (स्थानीय खरी)</option>
            </select>
          </div>
          <div>
            <label className="font-semibold block mb-1">{t.gender}</label>
            <div className="flex gap-4 items-center h-[34px]">
              <label className="flex items-center gap-1">
                <input 
                  type="radio" 
                  name="g_gender" 
                  checked={gender === 'Female'} 
                  onChange={() => setGender('Female')} 
                /> {t.female}
              </label>
              <label className="flex items-center gap-1">
                <input 
                  type="radio" 
                  name="g_gender" 
                  checked={gender === 'Male'} 
                  onChange={() => setGender('Male')} 
                /> {t.male}
              </label>
            </div>
          </div>
          <div>
            <label className="font-semibold block mb-1">{t.ageMonths} (months)</label>
            <input 
              type="number" 
              value={ageMonths}
              onChange={(e) => setAgeMonths(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full bg-gray-55 border border-gray-300 rounded px-3 py-1.5 text-xs text-gray-900"
            />
          </div>
          <div>
            <label className="font-semibold block mb-1">{t.goatWeight} (kg)</label>
            <input 
              type="number" 
              value={weightKg}
              onChange={(e) => setWeightKg(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full bg-gray-55 border border-gray-300 rounded px-3 py-1.5 text-xs text-gray-900"
            />
          </div>
          <div>
            <label className="font-semibold block mb-1">{t.healthStatus}</label>
            <select
              value={healthStatus}
              onChange={(e) => setHealthStatus(e.target.value as any)}
              className="w-full bg-gray-50 border border-gray-300 rounded px-3 py-1.5 text-xs text-gray-900"
            >
              <option value="Healthy">Healthy</option>
              <option value="Sick">Sick</option>
              <option value="Under Treatment">Under Treatment</option>
            </select>
          </div>
          <div className="md:col-span-3">
            <label className="font-semibold block mb-1">Stock Image Representation URL</label>
            <input 
              type="text" 
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
              className="w-full bg-gray-50 border border-gray-300 rounded px-3 py-1.5 text-xs text-gray-900"
            />
          </div>
          <div className="md:col-span-3 pt-2 text-right">
            <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2 rounded-lg cursor-pointer">
              {t.save}
            </button>
          </div>
        </form>
      )}

      {/* Main Selection Area */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Side: searchable goat tags list */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search ID / Breed..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-gray-50 border border-gray-300 rounded-lg pl-9 pr-3 py-1.5 text-xs text-gray-900 w-full focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
            {filteredGoats.map(goat => (
              <div
                key={goat.id}
                onClick={() => setSelectedGoatId(goat.id)}
                className={`p-3 rounded-lg border text-xs cursor-pointer flex items-center justify-between transition ${
                  goat.id === selectedGoatId
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-900'
                    : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                }`}
              >
                <div>
                  <div className="font-bold flex items-center gap-1.5">
                    <span>Tag {goat.tagNo}</span>
                    <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${goat.gender === 'Male' ? 'bg-indigo-100 text-indigo-700' : 'bg-pink-100 text-pink-700'}`}>
                      {goat.gender === 'Male' ? 'Buck' : 'Doe'}
                    </span>
                  </div>
                  <div className="text-[10px] text-gray-500 font-medium mt-1 truncate max-w-[120px]">{goat.breed}</div>
                </div>
                <div className="text-right">
                  <span className={`text-[10px] font-bold uppercase ${
                    goat.healthStatus === 'Healthy' ? 'text-emerald-600' : 'text-red-500'
                  }`}>{goat.healthStatus}</span>
                </div>
              </div>
            ))}
            {filteredGoats.length === 0 && (
              <p className="text-[11px] text-center text-gray-400 py-6">No tags match search filters.</p>
            )}
          </div>
        </div>

        {/* Right Side: Detailed Profiler Card */}
        {selectedGoat ? (
          <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4">
              {/* Image & Main stats */}
              <div className="relative rounded-lg overflow-hidden border border-gray-100 shadow-sm h-40 bg-zinc-100">
                <img 
                  src={selectedGoat.photoUrl} 
                  alt={selectedGoat.tagNo} 
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover" 
                />
                {confirmDeleteGoatId === selectedGoat.id ? (
                  <div className="absolute right-2 top-2 flex items-center gap-1 bg-white/95 backdrop-blur border border-red-200 p-1.5 rounded-lg shadow-md animate-fade-in z-20">
                    <button
                      onClick={() => handleDeleteGoat(selectedGoat.id)}
                      className="bg-red-600 hover:bg-red-700 text-white font-extrabold text-[10px] px-1.5 py-1 rounded cursor-pointer"
                    >
                      Confirm Delete?
                    </button>
                    <button
                      onClick={() => setConfirmDeleteGoatId(null)}
                      className="bg-gray-200 text-gray-700 font-extrabold text-[10px] px-1.5 py-1 rounded cursor-pointer"
                    >
                      X
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => setConfirmDeleteGoatId(selectedGoat.id)}
                    className="absolute right-2 top-2 p-1.5 bg-white/90 hover:bg-red-50 text-red-600 rounded-full hover:shadow transition cursor-pointer z-10"
                    title="Remove goat profile"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div>
                <h3 className="font-extrabold text-gray-900 text-base flex items-center gap-2">
                  <span>Tag #{selectedGoat.tagNo}</span>
                  <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">Age: {selectedGoat.ageMonths}m</span>
                </h3>
                <p className="text-xs text-gray-500 mt-1">{selectedGoat.breed}</p>
              </div>

              <div className="space-y-2 text-xs border-t border-gray-100 pt-3">
                <div className="flex justify-between text-gray-500"><span className="font-medium">{t.goatWeight}:</span> <strong className="text-gray-900 font-mono">{selectedGoat.weightKg} kg</strong></div>
                <div className="flex justify-between text-gray-500"><span className="font-medium">{t.healthStatus}:</span> <strong className="text-gray-900 font-semibold">{selectedGoat.healthStatus}</strong></div>
                <div className="flex justify-between text-gray-500"><span className="font-medium">Gender:</span> <strong>{selectedGoat.gender}</strong></div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setShowSaleForm(!showSaleForm)}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-lg text-xs font-bold transition shadow cursor-pointer text-center"
                >
                  💰 Sell Breeding Doe/Buck
                </button>
              </div>
            </div>

            {/* Mating / Pregnancy and Health Tabs */}
            <div className="md:col-span-2 space-y-6">
              
              {/* Breeding subcard */}
              {selectedGoat.gender === 'Female' && (
                <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                    <h4 className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-pink-500 animate-pulse" />
                      <span>{t.matingStatus}</span>
                    </h4>
                    <button 
                      onClick={() => setShowBreedingForm(!showBreedingForm)}
                      className="text-xs font-bold text-emerald-600 hover:text-emerald-800"
                    >
                      Configure Mating Status
                    </button>
                  </div>

                  {showBreedingForm && (
                    <form onSubmit={handleUpdateBreeding} className="bg-gray-50 p-4 border border-gray-200 rounded-lg grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-gray-700 font-semibold">
                      <div>
                        <label className="block mb-1">Mating / Conception Date</label>
                        <input 
                          type="date"
                          value={matingDate}
                          onChange={(e) => setMatingDate(e.target.value)}
                          className="w-full bg-white border border-gray-300 rounded px-2.5 py-1 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block mb-1">Pregnancy Status Label</label>
                        <select
                          value={pregStatus}
                          onChange={(e) => setPregStatus(e.target.value as any)}
                          className="w-full bg-white border border-gray-300 rounded px-2.5 py-1 text-xs text-gray-900"
                        >
                          <option value="Not Mated">Not Mated</option>
                          <option value="Pregnant">Pregnant</option>
                          <option value="Expected Delivery">Expected Delivery</option>
                        </select>
                      </div>
                      <div>
                        <label className="block mb-1">{t.expectedDelivery}</label>
                        <input 
                          type="date"
                          value={expectedDeliv}
                          onChange={(e) => setExpectedDeliv(e.target.value)}
                          className="w-full bg-white border border-gray-300 rounded px-2.5 py-1 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block mb-1">{t.kidsBorn}</label>
                        <input 
                          type="number"
                          value={kidsCount}
                          onChange={(e) => setKidsCount(e.target.value === '' ? '' : Number(e.target.value))}
                          className="w-full bg-white border border-gray-300 rounded px-2.5 py-1 text-xs font-mono"
                        />
                      </div>
                      <div className="md:col-span-2 text-right pt-2">
                        <button type="submit" className="bg-emerald-600 text-white font-bold px-3 py-1.5 rounded text-xs cursor-pointer">
                          {t.save}
                        </button>
                      </div>
                    </form>
                  )}

                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div className="space-y-1">
                      <span className="text-gray-500 font-medium">Last mated on:</span>
                      <p className="font-mono font-bold text-gray-900">{selectedGoat.matingDate || 'No mating logs'}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-gray-500 font-medium">{t.pregnancyStatus}:</span>
                      <p className="font-bold text-pink-600">{selectedGoat.pregnancyStatus || 'Unknown'}</p>
                    </div>
                    {selectedGoat.expectedDeliveryDate && (
                      <div className="space-y-1">
                        <span className="text-gray-500 font-medium">Expected delivery:</span>
                        <p className="font-mono font-black text-rose-600">{selectedGoat.expectedDeliveryDate}</p>
                      </div>
                    )}
                    {selectedGoat.kidsBornCount !== undefined && selectedGoat.kidsBornCount > 0 && (
                      <div className="space-y-1">
                        <span className="text-gray-500 font-medium">Kids Born:</span>
                        <p className="font-mono font-extrabold text-blue-600">{selectedGoat.kidsBornCount} kids</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Sickness and Medical History journals */}
              <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                  <h4 className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-emerald-600" />
                    <span>Goat Veterinary Treatment Logs</span>
                  </h4>
                  <div className="flex gap-2">
                    <button 
                      onClick={handleSimulateDeworming}
                      className="text-[10px] bg-sky-50 border border-sky-100 font-bold px-2 py-1 rounded text-sky-700"
                    >
                      🧪 Dewormed Today
                    </button>
                    <button 
                      onClick={() => setShowMedicalForm(!showMedicalForm)}
                      className="text-[10px] bg-red-50 border border-red-100 font-bold px-2 py-1 rounded text-red-700"
                    >
                      + Log Sickness Record
                    </button>
                  </div>
                </div>

                {showMedicalForm && (
                  <form onSubmit={handleAddMedicalLog} className="bg-gray-50 p-4 border border-gray-250 rounded-lg space-y-3 text-xs text-gray-700 font-semibold">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block mb-1">Diagnosis Date</label>
                        <input 
                          type="date"
                          value={illDate}
                          onChange={(e) => setIllDate(e.target.value)}
                          className="w-full bg-white border border-gray-300 rounded px-2.5 py-1 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block mb-1">Diagnostic Illness *</label>
                        <input 
                          type="text"
                          placeholder="e.g. Hoof Rot / Lung congestion"
                          required
                          value={illness}
                          onChange={(e) => setIllness(e.target.value)}
                          className="w-full bg-white border border-gray-300 rounded px-2.5 py-1 text-xs text-gray-900"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block mb-1">Meds Administered / Active treatment Plan</label>
                      <input 
                        type="text"
                        placeholder="e.g. Zinc wash twice a day"
                        value={medsUsed}
                        onChange={(e) => setMedsUsed(e.target.value)}
                        className="w-full bg-white border border-gray-300 rounded px-2.5 py-1 text-xs text-gray-900"
                      />
                    </div>
                    <div className="text-right">
                      <button type="submit" className="bg-emerald-600 text-white font-bold px-3 py-1.5 rounded cursor-pointer">{t.save}</button>
                    </div>
                  </form>
                )}

                {/* Deworming dates & Illness journal view */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold text-gray-700">
                  <div className="space-y-1.5">
                    <span className="text-gray-500 font-medium">Historical deworming dates:</span>
                    {selectedGoat.dewormingDates.length === 0 ? (
                      <p className="text-[11px] text-gray-400">No deworming tablets logged yet.</p>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {selectedGoat.dewormingDates.map((date, idx) => (
                          <span key={idx} className="bg-sky-50 text-sky-850 px-2 py-0.5 rounded border border-sky-100 font-mono text-[10px]">{date}</span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-gray-500 font-medium">Standard Vaccines:</span>
                    <div className="flex flex-wrap gap-1 font-mono text-[10px]">
                      <span className="bg-emerald-50 text-emerald-800 px-2 py-0.5 border border-emerald-100 rounded">PPR Vaccine</span>
                      <span className="bg-emerald-50 text-emerald-800 px-2 py-0.5 border border-emerald-100 rounded">FMD Vaccine</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 border-t border-gray-100 pt-3">
                  <span className="text-xs text-gray-500 font-medium">Sickness Diagnostic History:</span>
                  {selectedGoat.illnessHistory.length === 0 ? (
                    <p className="text-xs text-gray-400">None logged. Animal is clean and healthy.</p>
                  ) : (
                    <div className="space-y-2 max-h-[140px] overflow-y-auto">
                      {selectedGoat.illnessHistory.map((h, i) => (
                        <div key={i} className="bg-rose-50 border border-rose-100 p-2.5 rounded-lg flex justify-between gap-3 text-[11px] font-medium leading-relaxed">
                          <div>
                            <p className="font-bold text-rose-950 font-sans">{h.illness}</p>
                            <span className="text-[10px] text-rose-700">Rx: {h.medicine}</span>
                          </div>
                          <span className="text-[10px] text-rose-600 font-mono shrink-0">{h.date}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>

              {/* Goat Sale dialog */}
              {showSaleForm && (
                <form onSubmit={handleRecordGoatSale} className="bg-white border border-gray-200 p-5 rounded-xl shadow-md space-y-4">
                  <div className="pb-2 border-b border-gray-100 flex justify-between">
                    <h4 className="font-bold text-xs uppercase text-emerald-600 font-mono tracking-wider">Sale Receipt generation</h4>
                    <button type="button" onClick={() => setShowSaleForm(false)} className="text-xs text-gray-400">Close ✕</button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-semibold">
                    <div>
                      <label className="text-gray-700 block mb-1">Selling Quote Price (Rs.) *</label>
                      <input 
                        type="number"
                        value={salePrice}
                        onChange={(e) => setSalePrice(e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full bg-gray-55 border border-gray-300 rounded px-2.5 py-1 font-mono text-xs text-gray-950"
                      />
                    </div>
                    <div>
                      <label className="text-gray-700 block mb-1">Buyer Full Name *</label>
                      <input 
                        type="text"
                        placeholder="e.g. Ram Prasad Adhikari"
                        required
                        value={buyerName}
                        onChange={(e) => setBuyerName(e.target.value)}
                        className="w-full bg-gray-55 border border-gray-300 rounded px-2.5 py-1 text-xs text-gray-950"
                      />
                    </div>
                    <div>
                      <label className="text-gray-700 block mb-1">Buyer phone *</label>
                      <input 
                        type="text"
                        placeholder="98xxxxxxx"
                        value={buyerPhone}
                        onChange={(e) => setBuyerPhone(e.target.value)}
                        className="w-full bg-gray-55 border border-gray-300 rounded px-2.5 py-1 text-xs text-gray-950"
                      />
                    </div>
                  </div>
                  <div className="text-right pt-2">
                    <button type="submit" className="bg-emerald-600 text-white font-bold text-xs px-5 py-2 rounded-lg cursor-pointer shadow">
                      Log Sale & Ledger Ingress
                    </button>
                  </div>
                </form>
              )}

            </div>

          </div>
        ) : (
          <div className="lg:col-span-3 bg-white p-12 text-center rounded-xl border border-gray-200 shadow-sm text-gray-500 font-medium">
            <p>Please select a goat from the list or register a new animal buck to audit diagnostics.</p>
          </div>
        )}

      </div>
    </div>
  );
}
