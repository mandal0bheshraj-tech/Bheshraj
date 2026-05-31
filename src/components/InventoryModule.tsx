import React, { useState } from 'react';
import { FarmState, InventoryItem } from '../types';
import { translations } from '../utils/translations';
import { Plus, Trash2, ShieldAlert, Package, Calendar, Settings } from 'lucide-react';

interface InventoryProps {
  state: FarmState;
  onUpdateState: (newState: FarmState) => void;
  lang: 'en' | 'ne';
}

export function InventoryModule({ state, onUpdateState, lang }: InventoryProps) {
  const t = translations[lang];
  const [activeCategory, setActiveCategory] = useState<'all' | 'feed' | 'medicine' | 'equipment'>('all');
  const [showItemForm, setShowItemForm] = useState(false);

  // New Item State
  const [category, setCategory] = useState<'feed' | 'medicine' | 'equipment'>('feed');
  const [name, setName] = useState('');
  const [stockLevel, setStockLevel] = useState<number | ''>('');
  const [unit, setUnit] = useState('Sacks (50kg)');
  const [supplier, setSupplier] = useState('');
  const [cost, setCost] = useState<number | ''>('');
  const [reorderLevel, setReorderLevel] = useState<number | ''>('');
  const [expiryDate, setExpiryDate] = useState('');

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    const numericStock = stockLevel === '' ? 0 : Number(stockLevel);
    const numericCost = cost === '' ? 0 : Number(cost);
    const numericReorder = reorderLevel === '' ? 0 : Number(reorderLevel);

    const newItem: InventoryItem = {
      id: `inv-${Date.now()}`,
      category,
      name,
      currentStock: numericStock,
      unit,
      supplier,
      purchaseCost: numericCost,
      reorderPoint: numericReorder,
      expiryDate: expiryDate || undefined
    };

    // Auto load cost transaction as an expense in cash logs
    const transaction = {
      id: `tr-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      type: 'expense' as const,
      amount: numericCost,
      category: category as any, // match 'feed'/'medicine'/'other'
      description: `Bought ${numericStock} ${unit} of ${name} from ${supplier}`
    };

    onUpdateState({
      ...state,
      inventory: [newItem, ...state.inventory],
      finances: [transaction, ...state.finances]
    });

    setShowItemForm(false);
    setName('');
    setSupplier('');
    setStockLevel('');
    setCost('');
    setReorderLevel('');
  };

  const handleModifyQuantity = (id: string, delta: number) => {
    const updated = state.inventory.map(item => {
      if (item.id === id) {
        return {
          ...item,
          currentStock: Math.max(0, item.currentStock + delta)
        };
      }
      return item;
    });
    onUpdateState({ ...state, inventory: updated });
  };

  const [confirmDeleteItemId, setConfirmDeleteItemId] = useState<string | null>(null);

  const handleDeleteItem = (id: string) => {
    const updated = state.inventory.filter(i => i.id !== id);
    onUpdateState({ ...state, inventory: updated });
    setConfirmDeleteItemId(null);
  };

  const filteredItems = activeCategory === 'all' 
    ? state.inventory 
    : state.inventory.filter(i => i.category === activeCategory);

  return (
    <div className="space-y-6">
      {/* Header operations */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="text-3xl">📦</div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">{t.inventory}</h2>
            <p className="text-xs text-gray-500">Track chicken feed levels, goat PPR vaccines, and water pump spares</p>
          </div>
        </div>

        <button
          onClick={() => setShowItemForm(!showItemForm)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition cursor-pointer shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>{t.addItem}</span>
        </button>
      </div>

      {showItemForm && (
        <form onSubmit={handleAddItem} className="bg-white border border-gray-200 p-5 rounded-xl shadow-sm grid grid-cols-1 md:grid-cols-4 gap-4 font-medium text-xs text-gray-700">
          <div className="md:col-span-4 pb-2 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 p-2 rounded">
            <h3 className="font-bold text-emerald-700 uppercase tracking-wider">{t.addItem}</h3>
            <button type="button" onClick={() => setShowItemForm(false)} className="text-xs text-gray-400 font-bold">✕ Close</button>
          </div>
          <div>
            <label className="font-semibold block mb-1">{t.itemCategory}</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              className="w-full bg-gray-55 border border-gray-300 rounded px-2.5 py-1.5 text-xs text-gray-900 font-semibold"
            >
              <option value="feed">Feed Stock (दाना)</option>
              <option value="medicine">Medicine Stock (औषधि/खोप)</option>
              <option value="equipment">Equipment (सामग्रीहरू)</option>
            </select>
          </div>
          <div>
            <label className="font-semibold block mb-1">{t.itemName} *</label>
            <input 
              type="text" 
              placeholder="e.g. Broiler L1 Feed Sacks" 
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-gray-55 border border-gray-300 rounded px-3 py-1.5 text-xs text-gray-900"
            />
          </div>
          <div>
            <label className="font-semibold block mb-1">{t.currentStock} *</label>
            <input 
              type="number" 
              required
              value={stockLevel}
              onChange={(e) => setStockLevel(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full bg-gray-55 border border-gray-300 rounded px-3 py-1.5 text-xs text-gray-900 font-mono"
            />
          </div>
          <div>
            <label className="font-semibold block mb-1">{t.unit}</label>
            <input 
              type="text" 
              value={unit}
              placeholder="e.g. Sacks (50kg) / Vials / Units"
              onChange={(e) => setUnit(e.target.value)}
              className="w-full bg-gray-55 border border-gray-300 rounded px-3 py-1.5 text-xs text-gray-900"
            />
          </div>
          <div>
            <label className="font-semibold block mb-1">Item Purchase Cost (Rs.) *</label>
            <input 
              type="number" 
              required
              value={cost}
              onChange={(e) => setCost(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full bg-gray-55 border border-gray-300 rounded px-3 py-1.5 text-xs text-gray-900 font-mono"
            />
          </div>
          <div>
            <label className="font-semibold block mb-1">{t.reorderLevel} (Threshold)</label>
            <input 
              type="number" 
              value={reorderLevel}
              onChange={(e) => setReorderLevel(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full bg-gray-55 border border-gray-300 rounded px-3 py-1.5 text-xs text-gray-900 font-mono"
            />
          </div>
          <div>
            <label className="font-semibold block mb-1">Supplier Info</label>
            <input 
              type="text" 
              placeholder="e.g. Sunsari Agri Suppliers"
              value={supplier}
              onChange={(e) => setSupplier(e.target.value)}
              className="w-full bg-gray-55 border border-gray-300 rounded px-3 py-1.5 text-xs text-gray-900"
            />
          </div>
          <div>
            <label className="font-semibold block mb-1">{t.expiryAlert} (Medicine Only)</label>
            <input 
              type="date" 
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              className="w-full bg-gray-55 border border-gray-300 rounded px-2.5 py-1.5 text-xs text-gray-900"
            />
          </div>
          <div className="md:col-span-4 pt-2 text-right">
            <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2' rounded-lg cursor-pointer">
              {t.save}
            </button>
          </div>
        </form>
      )}

      {/* Category selector rows */}
      <div className="flex border-b border-gray-200">
        {(['all', 'feed', 'medicine', 'equipment'] as const).map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2.5 text-xs font-semibold capitalize border-b-2 transition ${
              activeCategory === cat
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            {cat === 'all' ? t.allSectors : cat}
          </button>
        ))}
      </div>

      {/* Items list displays */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map(item => {
          const isLow = item.currentStock <= item.reorderPoint;
          
          return (
            <div 
              key={item.id} 
              className={`bg-white rounded-xl p-5 shadow-sm border transition ${
                isLow ? 'border-amber-400 shadow-amber-50' : 'border-gray-200 hover:border-gray-300'
              } flex flex-col justify-between`}
            >
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <span className={`text-[9px] font-mono uppercase font-bold px-1.5 py-0.2 rounded border ${
                      item.category === 'feed' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                      item.category === 'medicine' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                      'bg-orange-50 text-orange-700 border-orange-200'
                    }`}>
                      {item.category}
                    </span>
                    <h3 className="font-bold text-gray-950 text-sm mt-1.5 truncate max-w-[190px]">{item.name}</h3>
                  </div>
                  {confirmDeleteItemId === item.id ? (
                    <div className="flex items-center gap-1 animate-pulse bg-rose-50 border border-rose-200 p-1 rounded-lg shrink-0">
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="bg-red-650 hover:bg-red-755 text-white font-extrabold text-[9px] px-1.5 py-0.5 rounded cursor-pointer"
                      >
                        Delete?
                      </button>
                      <button
                        onClick={() => setConfirmDeleteItemId(null)}
                        className="bg-gray-200 text-gray-700 font-extrabold text-[9px] px-1.5 py-0.5 rounded cursor-pointer"
                      >
                        X
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => setConfirmDeleteItemId(item.id)}
                      className="text-gray-400 hover:text-red-500 p-1 cursor-pointer transition"
                      title="Delete item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="py-2.5 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-gray-500">Available Stock:</span>
                    <p className={`text-base font-black ${isLow ? 'text-amber-600' : 'text-gray-900'} font-mono`}>
                      {item.currentStock} <span className="text-xs font-medium text-gray-500 font-sans">{item.unit}</span>
                    </p>
                  </div>
                  
                  {isLow && (
                    <div className="bg-amber-100 text-amber-800 text-[9px] font-black uppercase px-2 py-0.5 rounded border border-amber-300 flex items-center gap-1">
                      <ShieldAlert className="w-3 h-3 animate-pulse" />
                      <span>{t.lowStockWarning}</span>
                    </div>
                  )}
                </div>

                <div className="text-xs text-gray-500 pt-1 space-y-1 font-medium leading-relaxed">
                  <p>Supplier: <strong className="text-gray-900">{item.supplier || '--'}</strong></p>
                  <p>Initial item cost: <strong className="text-gray-900">Rs. {item.purchaseCost}</strong></p>
                  {item.expiryDate && (
                    <p className="text-red-600 font-semibold font-mono">Expires on: {item.expiryDate}</p>
                  )}
                </div>
              </div>

              {/* Adjust stock value counts */}
              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between gap-2.5">
                <span className="text-[10px] text-gray-400 font-mono">Modify inventory:</span>
                <div className="flex gap-1">
                  <button 
                    onClick={() => handleModifyQuantity(item.id, -1)}
                    className="bg-gray-100 hover:bg-gray-200 border border-gray-200 text-gray-800 text-xs font-bold w-7 h-7 rounded flex items-center justify-center cursor-pointer transition"
                  >
                    -
                  </button>
                  <button 
                    onClick={() => handleModifyQuantity(item.id, 5)}
                    className="bg-emerald-50 text-emerald-800 border border-emerald-100 text-[10px] font-semibold px-2.5 py-0.5 rounded flex items-center justify-center transition cursor-pointer"
                  >
                    +5 restocked
                  </button>
                  <button 
                    onClick={() => handleModifyQuantity(item.id, 1)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold w-7 h-7 rounded flex items-center justify-center cursor-pointer transition shadow"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
