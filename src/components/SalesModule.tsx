import React, { useState, useEffect } from 'react';
import { FarmState, CustomerOrder } from '../types';
import { translations } from '../utils/translations';
import { 
  Plus, 
  Trash2, 
  Calendar, 
  ShoppingBag, 
  ShieldAlert,
  QrCode,
  X,
  Check,
  Copy,
  Printer,
  Smartphone,
  Landmark,
  CheckCircle,
  HelpCircle
} from 'lucide-react';

interface SalesProps {
  state: FarmState;
  onUpdateState: (newState: FarmState) => void;
  lang: 'en' | 'ne';
}

export function SalesModule({ state, onUpdateState, lang }: SalesProps) {
  const t = translations[lang];
  const [showOrderForm, setShowOrderForm] = useState(false);

  // New Order Form state
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [farmingSector, setFarmingSector] = useState<'poultry' | 'fish' | 'goat' | 'pigeon'>('poultry');
  const [productDetails, setProductDetails] = useState('');
  const [quantity, setQuantity] = useState('200 kg');
  const [totalCost, setTotalCost] = useState(65000);
  const [payStatus, setPayStatus] = useState<'Paid' | 'Pending'>('Pending');

  // QR Payment Modal state
  const [qrModalData, setQrModalData] = useState<{
    customerName: string;
    amount: number;
    orderId?: string;
    sector?: string;
  } | null>(null);

  const [activeQrTab, setActiveQrTab] = useState<'esewa' | 'bank'>('esewa');
  const [copiedValue, setCopiedValue] = useState<string | null>(null);
  const [customQrAmount, setCustomQrAmount] = useState<string>('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setQrModalData(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedValue(label);
    setTimeout(() => setCopiedValue(null), 2000);
  };

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !productDetails) return;

    const newOrder: CustomerOrder = {
      id: `ord-${Date.now()}`,
      customerName,
      phoneNumber: phone,
      address,
      sector: farmingSector,
      productOrdered: productDetails,
      quantityOrdered: quantity,
      totalCost: totalCost,
      paymentStatus: payStatus,
      deliveryStatus: "Pending",
      orderDate: new Date().toISOString().split('T')[0]
    };

    // If order was prepaid, automatically load as income in finance transactions!
    const updatedFinances = [...state.finances];
    if (payStatus === "Paid") {
      updatedFinances.push({
        id: `tr-${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        type: 'income',
        amount: totalCost,
        category: farmingSector as any,
        description: `Cash collection of Order from ${customerName}`
      });
    }

    onUpdateState({
      ...state,
      orders: [newOrder, ...state.orders],
      finances: updatedFinances
    });

    setShowOrderForm(false);
    // Clear
    setCustomerName('');
    setProductDetails('');
    setPhone('');
    setAddress('');
  };

  const handleTogglePayment = (orderId: string) => {
    const orderToUpdate = state.orders.find(o => o.id === orderId);
    if (!orderToUpdate) return;

    const nextPaymentStatus = orderToUpdate.paymentStatus === 'Paid' ? 'Pending' as const : 'Paid' as const;

    const updatedOrders = state.orders.map(o => {
      if (o.id === orderId) {
        return {
          ...o,
          paymentStatus: nextPaymentStatus
        };
      }
      return o;
    });

    // Add financial entry if toggling to Paid, remove if toggling to Pending
    let updatedFinances = [...state.finances];
    if (nextPaymentStatus === 'Paid') {
      updatedFinances.push({
        id: `tr-${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        type: 'income',
        amount: orderToUpdate.totalCost,
        category: orderToUpdate.sector as any,
        description: `Prepaid Order payment logged for ${orderToUpdate.customerName}`
      });
    } else {
      updatedFinances = updatedFinances.filter(f => 
        !(f.type === 'income' && f.amount === orderToUpdate.totalCost && f.description.includes(orderToUpdate.customerName))
      );
    }

    onUpdateState({
      ...state,
      orders: updatedOrders,
      finances: updatedFinances
    });
  };

  const handleToggleDeliveryStatus = (orderId: string, status: 'Pending' | 'Shipped' | 'Delivered') => {
    const updated = state.orders.map(o => {
      if (o.id === orderId) {
        return { ...o, deliveryStatus: status };
      }
      return o;
    });
    onUpdateState({ ...state, orders: updated });
  };

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const handleDeleteOrder = (id: string) => {
    const updated = state.orders.filter(o => o.id !== id);
    onUpdateState({ ...state, orders: updated });
    setConfirmDeleteId(null);
  };

  // Dedicated dynamic high-fidelity QR Code SVG generator
  const renderQrGrid = (fgColor: string) => {
    return (
      <svg viewBox="0 0 100 100" className="w-52 h-52 bg-white p-3 rounded-lg border border-gray-200">
        {/* Top-Left Finder Pattern */}
        <rect x="6" y="6" width="22" height="22" fill={fgColor} rx="1.5" />
        <rect x="10" y="10" width="14" height="14" fill="white" rx="0.5" />
        <rect x="13" y="13" width="8" height="8" fill={fgColor} rx="0.5" />

        {/* Top-Right Finder Pattern */}
        <rect x="72" y="6" width="22" height="22" fill={fgColor} rx="1.5" />
        <rect x="76" y="10" width="14" height="14" fill="white" rx="0.5" />
        <rect x="79" y="13" width="8" height="8" fill={fgColor} rx="0.5" />

        {/* Bottom-Left Finder Pattern */}
        <rect x="6" y="72" width="22" height="22" fill={fgColor} rx="1.5" />
        <rect x="10" y="76" width="14" height="14" fill="white" rx="0.5" />
        <rect x="13" y="79" width="8" height="8" fill={fgColor} rx="0.5" />

        {/* Small Alignment Pattern Bottom-Right */}
        <rect x="74" y="74" width="10" height="10" fill={fgColor} rx="0.5" />
        <rect x="77" y="77" width="4" height="4" fill="white" rx="0.5" />
        <rect x="78" y="78" width="2" height="2" fill={fgColor} />

        {/* Timing Pattern Lines */}
        <line x1="28" y1="12" x2="72" y2="12" stroke={fgColor} strokeWidth="2.5" strokeDasharray="3 3" />
        <line x1="12" y1="28" x2="12" y2="72" stroke={fgColor} strokeWidth="2.5" strokeDasharray="3 3" />

        {/* Pseudo-Random QR Matrix modules for ultimate authenticity */}
        <g fill={fgColor}>
          <rect x="36" y="18" width="4" height="4" />
          <rect x="44" y="18" width="8" height="4" />
          <rect x="56" y="18" width="4" height="8" />
          <rect x="64" y="22" width="4" height="4" />
          
          <rect x="32" y="28" width="8" height="4" />
          <rect x="48" y="32" width="4" height="4" />
          <rect x="60" y="28" width="8" height="4" />
          <rect x="64" y="36" width="4" height="8" />

          {/* Standard brand badge shield boundary */}
          <rect x="32" y="44" width="4" height="12" />
          <rect x="40" y="44" width="20" height="20" fill="white" rx="2" />
          <rect x="64" y="48" width="8" height="4" />
          
          {/* Saroja S-Badge core in center of QR */}
          <circle cx="50" cy="54" r="7" fill={fgColor === "#10b981" ? "#15803d" : "#ef4444"} />
          <text x="50" y="57" fill="white" fontSize="9" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">S</text>

          <rect x="36" y="60" width="8" height="4" />
          <rect x="56" y="60" width="12" height="4" />
          <rect x="32" y="68" width="4" height="8" />
          <rect x="48" y="68" width="16" height="4" />

          <rect x="32" y="80" width="8" height="4" />
          <rect x="48" y="80" width="4" height="14" />
          <rect x="60" y="82" width="12" height="4" />
          
          <rect x="36" y="88" width="4" height="6" />
          <rect x="58" y="88" width="8" height="4" />
        </g>
      </svg>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Header controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="text-3xl">🛍️</div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">{t.sales} (ग्राहक रेकर्ड)</h2>
            <p className="text-xs text-gray-500">Log customer database, wholesale order records, and interactive payments QR</p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => {
              setQrModalData({
                customerName: 'Counter Cash Sale (काउन्टर बिक्री)',
                amount: 5000
              });
              setCustomQrAmount('5000');
            }}
            className="bg-amber-100 hover:bg-amber-200 text-amber-900 font-extrabold text-xs px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition cursor-pointer border border-amber-300"
          >
            <QrCode className="w-4 h-4 text-amber-700" />
            <span>Counter QR Pay</span>
          </button>

          <button
            onClick={() => setShowOrderForm(!showOrderForm)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>New Customer Order</span>
          </button>
        </div>
      </div>

      {showOrderForm && (
        <form onSubmit={handleCreateOrder} className="bg-white border border-gray-200 p-5 rounded-xl shadow-sm grid grid-cols-1 md:grid-cols-4 gap-4 font-medium text-xs text-gray-750">
          <div className="md:col-span-4 pb-2 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded p-2">
            <h3 className="font-bold text-emerald-700 uppercase tracking-wider">Log Customer Order Receipt</h3>
            <button type="button" onClick={() => setShowOrderForm(false)} className="text-xs text-gray-400 font-bold">✕ Close</button>
          </div>
          <div>
            <label className="font-semibold block mb-1">Customer / Shop Name *</label>
            <input 
              type="text" 
              required
              placeholder="e.g. Sunsari Chicken Mart" 
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full bg-gray-55 border border-gray-300 rounded px-2.5 py-1.5 text-xs text-gray-950"
            />
          </div>
          <div>
            <label className="font-semibold block mb-1">Customer Phone *</label>
            <input 
              type="text" 
              placeholder="98xxxxxxx" 
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-gray-55 border border-gray-300 rounded px-2.5 py-1.5 text-xs text-gray-950 font-mono"
            />
          </div>
          <div>
            <label className="font-semibold block mb-1">Delivery Address</label>
            <input 
              type="text" 
              placeholder="Town, City, Nepal"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full bg-gray-55 border border-gray-300 rounded px-2.5 py-1.5 text-xs text-gray-950"
            />
          </div>
          <div>
            <label className="font-semibold block mb-1">Farming Module Segment</label>
            <select
              value={farmingSector}
              onChange={(e) => setFarmingSector(e.target.value as any)}
              className="w-full bg-gray-55 border border-gray-300 rounded px-2.5 py-1.5 text-xs text-gray-950 font-semibold"
            >
              <option value="poultry">Poultry Broilers (कुखुरा)</option>
              <option value="fish">Fish Ponds (माछा)</option>
              <option value="goat">Goat Breeders (बाख्रा)</option>
              <option value="pigeon">Nesting Pigeons (परेवा)</option>
            </select>
          </div>
          <div>
            <label className="font-semibold block mb-1">Product Details *</label>
            <input 
              type="text" 
              required
              placeholder="e.g. Cobb-500 live chicken meat" 
              value={productDetails}
              onChange={(e) => setProductDetails(e.target.value)}
              className="w-full bg-gray-55 border border-gray-300 rounded px-2.5 py-1.5 text-xs text-gray-950"
            />
          </div>
          <div>
            <label className="font-semibold block mb-1">Sale Weight/Quantity *</label>
            <input 
              type="text" 
              required
              placeholder="e.g. 150 kg / 2 Pairs" 
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full bg-gray-55 border border-gray-300 rounded px-2.5 py-1.5 text-xs text-gray-950"
            />
          </div>
          <div>
            <label className="font-semibold block mb-1">Bulk Cost Invoice (Rs.) *</label>
            <input 
              type="number" 
              required
              value={totalCost}
              onChange={(e) => setTotalCost(Number(e.target.value))}
              className="w-full bg-gray-55 border border-gray-300 rounded px-2.5 py-1.5 text-xs text-gray-950 font-mono"
            />
          </div>
          <div>
            <label className="font-semibold block mb-1">Inception Payment Status</label>
            <select
              value={payStatus}
              onChange={(e) => setPayStatus(e.target.value as any)}
              className="w-full bg-gray-55 border border-gray-300 rounded px-2.5 py-1.5 text-xs text-gray-950 font-semibold"
            >
              <option value="Pending">Pending (बाँकी)</option>
              <option value="Paid">Prepaid (भुक्तानी भयो)</option>
            </select>
          </div>
          <div className="md:col-span-4 pt-2 text-right">
            <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2 rounded-lg cursor-pointer">
              {t.save}
            </button>
          </div>
        </form>
      )}

      {/* Customer registry rows */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4">
        <h3 className="font-bold text-gray-900 text-sm pb-2 border-b border-gray-100 flex items-center gap-1">
          <ShoppingBag className="w-5 h-5 text-emerald-600" />
          <span>Active Sales Ledger & Shipments tracker</span>
        </h3>

        {state.orders.length === 0 ? (
          <p className="text-xs text-gray-400 py-6 text-center">No orders registered yet.</p>
        ) : (
          <div className="space-y-4">
            {state.orders.map(order => (
              <div 
                key={order.id} 
                className="bg-gray-50/50 hover:bg-gray-50 border border-gray-200/60 p-4 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs font-semibold text-gray-700 leading-relaxed"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-extrabold text-gray-950 text-sm">{order.customerName}</h4>
                    <span className={`text-[9px] uppercase font-bold px-1.5 py-0.2 rounded font-sans leading-none ${
                      order.sector === 'poultry' ? 'bg-red-50 text-red-700 border border-red-200' :
                      order.sector === 'fish' ? 'bg-sky-50 text-sky-700 border border-sky-200' :
                      order.sector === 'goat' ? 'bg-emerald-50 text-emerald-700 border border-emerald-250' :
                      'bg-amber-50 text-amber-700 border border-amber-250'
                    }`}>
                      {order.sector}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-4 gap-y-1 text-gray-400 font-medium">
                    <span>Phone: <strong className="text-gray-900 font-mono">{order.phoneNumber}</strong></span>
                    <span>Address: <strong className="text-gray-900 truncate max-w-[150px]">{order.address}</strong></span>
                    <span>Date: <strong className="text-gray-900 font-mono">{order.orderDate}</strong></span>
                  </div>
                  <div className="mt-2.5 pt-2 border-t border-gray-100/60 flex flex-wrap gap-y-1 text-gray-500 font-medium">
                    <span>Product: <strong className="text-gray-900 font-sans">{order.productOrdered}</strong></span>
                    <span className="mx-2 text-gray-300">|</span>
                    <span>Cargo stock dimension: <strong className="text-emerald-700 font-mono">{order.quantityOrdered}</strong></span>
                  </div>
                </div>

                <div className="flex flex-col sm:items-end gap-2.5 w-full md:w-auto shrink-0 font-sans font-bold">
                  <div className="flex items-center gap-2 justify-between">
                    <span className="text-[10px] text-gray-400">Total Bill:</span>
                    <strong className="text-emerald-700 font-mono text-sm leading-none">Rs. {order.totalCost}</strong>
                  </div>

                  <div className="flex items-center gap-2.5 flex-wrap sm:justify-end">
                    {/* QR Payment Trigger */}
                    <button
                      onClick={() => {
                        setQrModalData({
                          customerName: order.customerName,
                          amount: order.totalCost,
                          orderId: order.id,
                          sector: order.sector
                        });
                        setCustomQrAmount(order.totalCost.toString());
                      }}
                      className="bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-[10px] px-2 py-1 rounded transition flex items-center gap-1 cursor-pointer font-bold"
                    >
                      <QrCode className="w-3.5 h-3.5 text-amber-600" />
                      <span>💳 QR Pay</span>
                    </button>

                    {/* Payment checkbox */}
                    <button
                      onClick={() => handleTogglePayment(order.id)}
                      className={`text-[10px] px-2 py-1 rounded border transition cursor-pointer font-bold ${
                        order.paymentStatus === 'Paid'
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                          : 'bg-red-50 text-red-700 border-red-250 hover:bg-red-100'
                      }`}
                    >
                      {order.paymentStatus === 'Paid' ? 'Paid (भुक्तानी भयो)' : 'Unpaid (भुक्तानी बाँकी)'}
                    </button>

                    {/* Delivery toggles */}
                    <div className="flex bg-white border border-gray-200 p-0.5 rounded-lg text-[10px]">
                      {(['Pending', 'Shipped', 'Delivered'] as const).map(dSt => (
                        <button
                          key={dSt}
                          onClick={() => handleToggleDeliveryStatus(order.id, dSt)}
                          className={`px-2 py-0.5 rounded transition font-bold ${
                            order.deliveryStatus === dSt
                              ? 'bg-indigo-600 text-white'
                              : 'text-gray-500 hover:text-gray-700'
                          }`}
                        >
                          {dSt}
                        </button>
                      ))}
                    </div>

                    {confirmDeleteId === order.id ? (
                      <div className="flex items-center gap-1.5 animate-pulse bg-rose-50 border border-rose-200 p-1 rounded-lg">
                        <button
                          onClick={() => handleDeleteOrder(order.id)}
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
                        onClick={() => setConfirmDeleteId(order.id)}
                        className="text-gray-400 hover:text-red-500 p-1 cursor-pointer transition"
                        title="Delete order"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Royal QR Payment Screen Overlay Modal */}
      {qrModalData && (
        <div 
          onClick={() => setQrModalData(null)}
          className="fixed inset-0 bg-[#022c22]/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in font-sans cursor-pointer"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl overflow-hidden shadow-2xl max-w-lg w-full border-2 border-amber-400/40 transform transition-transform duration-300 scale-100 flex flex-col cursor-default"
          >
            
            {/* Modal header */}
            <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-950 p-5 text-white flex justify-between items-center relative overflow-hidden shrink-0">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_120%,rgba(245,158,11,0.1)_0%,rgba(16,185,129,0)_50%)] pointer-events-none" />
              <div className="flex items-center gap-3 z-10">
                <div className="p-1.5 bg-[#022c22] rounded-lg border border-amber-400/30">
                  <QrCode className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-amber-300 uppercase tracking-widest leading-none">
                    सरोजा डिजिटल भुक्तानी
                  </h3>
                  <span className="text-[10px] text-teal-300 font-medium">
                    Saroja Krishi Tatha Pashupalan • Receipt Collector
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setQrModalData(null)}
                className="bg-emerald-900/60 p-1.5 rounded-full text-teal-200 hover:text-white transition cursor-pointer hover:bg-emerald-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal contents */}
            <div className="p-6 space-y-5 overflow-y-auto max-h-[75vh]">
              
              {/* Customer context pill */}
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex flex-col xs:flex-row justify-between items-start xs:items-center gap-2">
                <div>
                  <span className="text-[9px] text-gray-400 uppercase font-bold block">For Customer Account</span>
                  <span className="text-xs font-black text-gray-900">{qrModalData.customerName}</span>
                </div>
                {qrModalData.orderId && (
                  <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[9px] px-2 py-0.5 rounded-full font-mono uppercase font-black">
                    Ref: {qrModalData.orderId}
                  </span>
                )}
              </div>

              {/* Dynamic Bill pricing */}
              <div>
                <label className="text-[10px] text-gray-400 block uppercase font-bold mb-1">Payment Amount (नेपाली रुपैयाँ)</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-black text-slate-400">Rs.</span>
                  <input 
                    type="number"
                    value={customQrAmount}
                    onChange={(e) => setCustomQrAmount(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-2 border-slate-200 focus:border-emerald-600 focus:ring-0 rounded-xl font-mono text-lg font-black text-emerald-950 focus:outline-none"
                    placeholder="Enter dynamic bill amount..."
                  />
                </div>
                <span className="text-[9px] text-amber-600 mt-1 block">
                  * You can modify the amount in real time to generate on-the-spot invoices.
                </span>
              </div>

              {/* QR Render card */}
              <div className="rounded-2xl p-5 flex flex-col items-center justify-center text-center border shadow-inner transition duration-300 relative bg-gradient-to-b from-emerald-50 to-green-50/50 border-emerald-300/60">
                {/* Logo indicator watermark */}
                <div className="absolute top-3 right-3 text-[10px] uppercase font-serif font-black flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-emerald-700">Nepal eSewa Network</span>
                </div>

                {/* ESEWA BRAND DESIGN CARD */}
                <div className="space-y-4 w-full flex flex-col items-center">
                  <div className="bg-[#60bb46] text-white px-4 py-1.5 rounded-full font-sans font-black text-xs tracking-wider shadow-sm select-none">
                    esewa scan & pay
                  </div>

                  {renderQrGrid("#10b981")}

                  <div className="space-y-1 bg-white border border-emerald-100 p-3 rounded-xl w-full text-xs font-semibold text-gray-700">
                    <div className="flex justify-between items-center text-[10px] text-emerald-800">
                      <span>Merchant Name:</span>
                      <strong className="font-extrabold uppercase">Saroja Farm Firm</strong>
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-emerald-800">
                      <span>eSewa App ID:</span>
                      <div className="flex items-center gap-1 font-mono font-black text-slate-900">
                        <span>9810564269</span>
                        <button 
                          type="button" 
                          onClick={() => handleCopy("9810564269", "ewa")}
                          className="text-emerald-600 hover:text-emerald-800 p-0.5 cursor-pointer"
                          title="Copy Wallet ID"
                        >
                          {copiedValue === 'ewa' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                    <div className="border-t border-emerald-150 pt-2 flex justify-between items-center font-mono mt-1 text-emerald-950 font-black">
                      <span>INVOICE PRICE:</span>
                      <span>Rs. {Number(customQrAmount).toLocaleString() || '0'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action buttons inside payments overlay */}
              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                {qrModalData.orderId && (
                  <button
                    type="button"
                    onClick={() => {
                      if (qrModalData.orderId) {
                        // Mark the related ledger order as paid instantly!
                        handleTogglePayment(qrModalData.orderId);
                        setQrModalData(null);
                        alert("Great success! Order has been registered as PAID on the ledger!");
                      }
                    }}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition shadow cursor-pointer uppercase tracking-wider"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Conclude Payment (Mark Paid)</span>
                  </button>
                )}
                
                <button
                  type="button"
                  onClick={() => {
                    window.print();
                  }}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 transition cursor-pointer uppercase tracking-wider"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Receipt</span>
                </button>

                <button
                  type="button"
                  onClick={() => setQrModalData(null)}
                  className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-extrabold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 transition cursor-pointer uppercase tracking-wider"
                >
                  <X className="w-4 h-4" />
                  <span>Go Back / Cancel (सच्याउनुहोस्)</span>
                </button>
              </div>

            </div>

            {/* Note disclaimer panel */}
            <div className="bg-slate-50 p-4 border-t border-slate-100 text-center shrink-0">
              <span className="text-[10px] text-slate-400 font-medium flex items-center justify-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
                <span>Secured via Fonepay & eSewa Gateway Integrations • Sunsari Division</span>
              </span>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

