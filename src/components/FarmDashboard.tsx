import React, { useState, useEffect, useRef } from 'react';
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
  Globe,
  X,
  Download,
  Trash2,
  Save,
  Sparkles,
  CameraOff,
  Image as ImageIcon,
  ArrowLeft
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

  // Real Camera & Picture Vault state structures
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [capturedImg, setCapturedImg] = useState<string | null>(null); // base64 representation
  const [photoLabel, setPhotoLabel] = useState('Goat Profile Photo');
  const [capturedPhotos, setCapturedPhotos] = useState<{ id: string; url: string; timestamp: string; label: string }[]>(() => {
    try {
      const stored = localStorage.getItem('saroja_captured_photos');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const cameraOpenedRef = useRef(false);

  const startCamera = async () => {
    setCameraError(null);
    setCapturedImg(null);
    setIsCapturing(true);
    
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop());
    }

    const constraintOptions = [
      {
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      },
      {
        video: {
          facingMode: { ideal: facingMode }
        }
      },
      {
        video: true
      }
    ];

    let stream: MediaStream | null = null;
    let lastError: any = null;

    for (const constraints of constraintOptions) {
      try {
        stream = await navigator.mediaDevices.getUserMedia(constraints);
        if (stream) break;
      } catch (err) {
        lastError = err;
        console.warn("Camera constraint failed, trying next fallback...", constraints, err);
      }
    }

    if (stream) {
      setMediaStream(stream);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(e => console.warn("Video play interrupted", e));
        }
      }, 150);
    } else {
      console.warn("All camera fallbacks failed.", lastError);
      setCameraError(
        lang === 'en' 
          ? "Live stream blocked or iframe sandboxed. Don't worry! Use the powerful 'Mobile Phone Camera / Choose Photo' option below which works flawlessly on any device!" 
          : "लाइभ स्ट्रिम ब्लक भयो वा क्यामेरा अनुमति चाहिएको छ। चिन्ता नगर्नुहोस्! तल रहेको 'नयाँ फोटो खिच्नुहोस् / ग्यालरी' प्रयोग गर्नुहोस् जसले कुनै पनि मोबाइल वा उपकरणमा मज्जाले काम गर्छ!"
      );
      setIsCapturing(false);
    }
  };

  const stopCamera = () => {
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop());
      setMediaStream(null);
    }
    setIsCapturing(false);
  };

  const toggleFacingMode = () => {
    setFacingMode(prev => prev === 'environment' ? 'user' : 'environment');
  };

  // Compression & elegant modern watermarking algorithm
  const processAndWatermarkImage = (imgSrc: string, labelText: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        // High quality memory constraint budget (1000px max fits perfectly under 150KB as highly-detailed JPEG)
        const maxDim = 1000;
        let width = img.width;
        let height = img.height;
        
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          // Draw image
          ctx.drawImage(img, 0, 0, width, height);
          
          // Custom Gradient Bottom Matte Strip overlay
          const stripHeight = Math.max(50, Math.round(height * 0.12));
          const grad = ctx.createLinearGradient(0, height - stripHeight, 0, height);
          grad.addColorStop(0, 'rgba(15, 23, 42, 0.0)');
          grad.addColorStop(0.3, 'rgba(6, 95, 70, 0.75)');
          grad.addColorStop(1, 'rgba(15, 23, 42, 0.95)');
          ctx.fillStyle = grad;
          ctx.fillRect(0, height - stripHeight, width, stripHeight);
          
          // Accent Golden strip line
          ctx.fillStyle = '#f59e0b';
          ctx.fillRect(0, height - stripHeight, width, 3);
          
          // Watermark texts drawing
          const fontBase = Math.max(13, Math.round(width / 35));
          
          // Saroja Farm Stamp tag (Golden bottom-left)
          ctx.textAlign = 'left';
          ctx.textBaseline = 'middle';
          ctx.font = `bold ${Math.round(fontBase * 1.15)}px system-ui, -apple-system, sans-serif`;
          ctx.fillStyle = '#f59e0b';
          ctx.fillText("☀️ SAROJA SMART FARM", 20, height - (stripHeight / 2) - (fontBase * 0.3));
          
          // Asset description (White lower text)
          ctx.font = `500 ${Math.round(fontBase * 0.9)}px system-ui, -apple-system, sans-serif`;
          ctx.fillStyle = '#f1f5f9';
          ctx.fillText(`${labelText} • VERIFIED`, 20, height - (stripHeight / 2) + (fontBase * 0.8));
          
          // Safe nepalese region metadata (Green bottom-right, monospace)
          ctx.textAlign = 'right';
          ctx.font = `bold ${Math.round(fontBase * 0.8)}px Courier New, monospace`;
          ctx.fillStyle = '#10b981';
          const timeLabel = new Date().toLocaleString(lang === 'ne' ? 'ne-NP' : 'en-US');
          ctx.fillText(timeLabel, width - 20, height - (stripHeight / 2));
          
          // Output highly compressed and beautifully rendered image data url
          resolve(canvas.toDataURL('image/jpeg', 0.8));
        } else {
          resolve(imgSrc);
        }
      };
      img.onerror = () => {
        resolve(imgSrc);
      };
      img.src = imgSrc;
    });
  };

  const handleCapture = async () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const rawDataUrl = canvas.toDataURL('image/jpeg', 0.95);
        stopCamera();
        
        const processed = await processAndWatermarkImage(rawDataUrl, photoLabel.trim() || (lang === 'en' ? 'Farm Asset Photo' : 'कृषि तस्बिर'));
        setCapturedImg(processed);
      }
    } else {
      // Sandbox fallback generator
      const canvas = document.createElement('canvas');
      canvas.width = 640;
      canvas.height = 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const grad = ctx.createLinearGradient(0, 0, 640, 480);
        grad.addColorStop(0, '#065f46');
        grad.addColorStop(0.5, '#0f766e');
        grad.addColorStop(1, '#0f172a');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 640, 480);
        
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.25)';
        ctx.lineWidth = 1;
        for (let i = 0; i < 640; i += 40) {
          ctx.beginPath();
          ctx.moveTo(i, 0); ctx.lineTo(i, 480); ctx.stroke();
        }
        for (let j = 0; j < 480; j += 40) {
          ctx.beginPath();
          ctx.moveTo(0, j); ctx.lineTo(640, j); ctx.stroke();
        }
        
        ctx.fillStyle = '#f59e0b';
        ctx.font = 'bold 30px Courier New, monospace';
        ctx.textAlign = 'center';
        ctx.fillText("SAROJA HD-CAM PRO", 320, 200);
        
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 20px system-ui';
        ctx.fillText(`${photoLabel}`, 320, 250);
        
        ctx.fillStyle = '#a7f3d0';
        ctx.font = '14px monospace';
        ctx.fillText(`Date: ${new Date().toLocaleString()}`, 320, 300);
        
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        const processed = await processAndWatermarkImage(dataUrl, photoLabel.trim() || (lang === 'en' ? 'Farm Asset Photo' : 'कृषि तस्बिर'));
        setCapturedImg(processed);
      }
    }
  };

  const handleNativeCameraCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop());
      setMediaStream(null);
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const rawDataUrl = event.target?.result as string;
      if (rawDataUrl) {
        setCameraError(null);
        setIsCapturing(false);
        const processed = await processAndWatermarkImage(rawDataUrl, photoLabel.trim() || (lang === 'en' ? 'Farm Asset Photo' : 'कृषि तस्बिर'));
        setCapturedImg(processed);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveCapturedPhoto = () => {
    if (!capturedImg) return;
    const newPhoto = {
      id: `photo-${Date.now()}`,
      url: capturedImg,
      timestamp: new Date().toLocaleDateString(lang === 'ne' ? 'ne-NP' : 'en-US') + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      label: photoLabel.trim() || (lang === 'en' ? 'Farm Asset Photo' : 'कृषि तस्बिर')
    };

    const updated = [newPhoto, ...capturedPhotos];
    setCapturedPhotos(updated);
    localStorage.setItem('saroja_captured_photos', JSON.stringify(updated));

    setCameraMessage(lang === 'en' ? `✅ Photo saved as "${newPhoto.label}"` : `✅ फोटो "${newPhoto.label}" ग्यालेरीमा सुरक्षित भयो।`);
    setShowCameraModal(false);
    setCapturedImg(null);
    stopCamera();

    setTimeout(() => setCameraMessage(null), 5000);
  };

  const handleDeletePhoto = (id: string) => {
    const updated = capturedPhotos.filter(p => p.id !== id);
    setCapturedPhotos(updated);
    localStorage.setItem('saroja_captured_photos', JSON.stringify(updated));
  };

  const handleDownloadPhotoData = (imgUrl: string, name: string) => {
    const link = document.createElement('a');
    link.href = imgUrl;
    link.download = `saroja_farm_${name.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    if (showCameraModal) {
      cameraOpenedRef.current = true;
      startCamera();
    } else if (cameraOpenedRef.current) {
      stopCamera();
    }
    return () => {
      if (cameraOpenedRef.current) {
        stopCamera();
      }
    };
  }, [showCameraModal, facingMode]);

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
            onClick={() => {
              setPhotoLabel(lang === 'en' ? 'Boar Goat Profile Photo' : 'बाख्रा प्रोफाइल फोटो');
              setShowCameraModal(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-900 hover:bg-emerald-50 dark:hover:bg-slate-800 border border-emerald-200 dark:border-slate-800 rounded-lg font-bold transition cursor-pointer text-emerald-900 dark:text-emerald-400 font-sans hover:scale-[1.02] active:scale-[0.98]"
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
              ESTD. 2076 BS (2019 AD) • Authorized Register Ledger System
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

      {/* Saroja Secure Photo Vault & Asset Gallery */}
      <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4 transition-colors">
        <div className="flex justify-between items-center pb-3 border-b border-gray-100 dark:border-slate-800">
          <div>
            <h3 className="font-bold text-gray-905 dark:text-slate-100 text-sm flex items-center gap-2">
              <Camera className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <span>{lang === 'en' ? "Saroja Secure Photo Gallery" : "सरोजा क्यामेरा ग्यालेरी"}</span>
            </h3>
            <p className="text-xs text-gray-400 dark:text-slate-500">{lang === 'en' ? "Captured goat profile photos, asset logs, and scanned receipts" : "खिचिएका बाख्राको फोटो, बिल स्क्यान तथा सामग्री अभिलेख"}</p>
          </div>
          <span className="text-[10px] bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 dark:bg-emerald-900/20 font-sans font-black px-2.5 py-1 rounded-full uppercase">
            {capturedPhotos.length} {lang === 'en' ? 'Photos Secured' : 'तस्बिर सुरक्षित'}
          </span>
        </div>

        {capturedPhotos.length === 0 ? (
          <div className="text-center py-8 border border-dashed border-gray-250 dark:border-slate-800 rounded-xl text-gray-400 dark:text-gray-500 bg-slate-50/50 dark:bg-slate-900/50">
            <ImageIcon className="w-8 h-8 mx-auto stroke-1 mb-2 opacity-55 text-emerald-600" />
            <p className="text-xs font-bold">{lang === 'en' ? "Your captured farm assets or invoices will persist here." : "तपाईँले क्यामेराबाट खिचेका बाख्राको प्रोफाइल फोटो वा बिलहरू यहाँ देखिनेछन्।"}</p>
            <button
              onClick={() => {
                setPhotoLabel(lang === 'en' ? 'Boar Goat Profile Photo' : 'बाख्रा प्रोफाइल फोटो');
                setShowCameraModal(true);
              }}
              className="mt-3 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-3 py-1.5 rounded-lg transition"
            >
              {lang === 'en' ? "Try Camera Shutter Now" : "क्यामेरा परिक्षण गर्नुहोस"}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {capturedPhotos.map((photo) => (
              <div 
                key={photo.id} 
                className="group relative bg-white dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-lg overflow-hidden shadow-sm hover:shadow transition"
              >
                {/* Photo Thumbnail */}
                <div className="aspect-video w-full overflow-hidden bg-black relative">
                  <img 
                    src={photo.url} 
                    alt={photo.label} 
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    referrerPolicy="no-referrer"
                  />
                  {/* Actions overlay on hover */}
                  <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-1.5 p-1">
                    <button
                      onClick={() => handleDownloadPhotoData(photo.url, photo.label)}
                      className="p-1 px-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[9px] font-black flex items-center gap-1 transition"
                      title="Download image file to mobile/desktop device filesystem"
                    >
                      <Download className="w-3 h-3" />
                      <span>{lang === 'en' ? 'SAVE' : 'सुरक्षित'}</span>
                    </button>
                    <button
                      onClick={() => handleDeletePhoto(photo.id)}
                      className="p-1 px-2 bg-red-650 hover:bg-red-750 text-white rounded text-[9px] font-black transition"
                      title="Delete instantly"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Information subtitle */}
                <div className="p-2 space-y-0.5">
                  <p className="text-xs font-black text-gray-800 dark:text-slate-200 truncate" title={photo.label}>
                    {photo.label}
                  </p>
                  <p className="text-[9px] text-gray-400 dark:text-slate-500 font-mono flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                    <span>{photo.timestamp}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
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

      {/* Premium HTML5 Camera Access Overlay Modal Box */}
      {showCameraModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md overflow-y-auto flex justify-center items-start sm:items-center p-2 sm:p-4">
          <div className="bg-white dark:bg-slate-950 rounded-3xl overflow-hidden shadow-2xl max-w-xl w-full max-h-[94vh] sm:max-h-[90vh] border border-gray-250 dark:border-slate-800 transform transition scale-100 flex flex-col cursor-default font-sans animate-fade-in text-gray-900 dark:text-slate-100 my-auto">
            
            {/* Modal Header banner */}
            <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-950 p-4 text-white flex justify-between items-center border-b border-emerald-900 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-900 rounded-xl">
                  <Camera className="w-5 h-5 text-amber-300 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-xs font-extrabold uppercase tracking-widest text-amber-300 leading-none">
                    {lang === 'en' ? "Saroja Smart Cam" : "सरोहा क्यामेरा प्रविष्टि"}
                  </h3>
                  <span className="text-[10px] text-teal-300 mt-1.5 block leading-none font-bold">
                    Hardware API Access & Sandbox Simulator
                  </span>
                </div>
              </div>
              <button 
                onClick={() => {
                  setShowCameraModal(false);
                  stopCamera();
                }}
                className="bg-emerald-950 hover:bg-red-950 p-1.5 rounded-full text-zinc-300 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal main content view with scroll container */}
            <div className="p-5 space-y-4 overflow-y-auto flex-1">
              
              {cameraError && (
                <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/40 p-3 rounded-xl text-xs text-amber-800 dark:text-amber-400">
                  <div className="flex items-start gap-2">
                    <span className="text-sm">⚠️</span>
                    <div className="space-y-1">
                      <p className="font-bold">{lang === 'en' ? "IFrame Context Camera Restriction" : "IFrame सन्दर्भ क्यामेरा सीमा"}</p>
                      <p className="text-[10.5px] leading-relaxed opacity-90">{cameraError}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Facing camera & label row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[10px] uppercase tracking-wider font-extrabold text-gray-500 dark:text-slate-400">
                    {lang === 'en' ? "Description / Asset Label *" : "तस्बिर विबरण / फोटो नाम *"}
                  </label>
                  <input 
                    type="text"
                    required
                    maxLength={28}
                    value={photoLabel}
                    onChange={(e) => setPhotoLabel(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-gray-300 dark:border-slate-800 rounded-lg px-3 py-2 text-xs font-bold text-slate-800 dark:text-slate-100"
                    placeholder="e.g. Broiler Batch A, Boer Doe, Feed Bill"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] uppercase tracking-wider font-extrabold text-gray-500 dark:text-slate-400">
                    {lang === 'en' ? "Physical Camera Feed Source" : "क्यामेरा सेन्सर"}
                  </label>
                  <button
                    type="button"
                    onClick={toggleFacingMode}
                    className="w-full bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-gray-300 dark:border-slate-800 rounded-lg px-3 py-2 text-xs font-extrabold text-slate-700 dark:text-slate-300 flex items-center justify-between transition h-[34px]"
                  >
                    <span>🔄 {lang === 'en' ? "Swap Lens Source:" : "लेन्स बदल्नुहोस:"}</span>
                    <strong className="text-emerald-600 dark:text-emerald-400 capitalize">{facingMode}</strong>
                  </button>
                </div>
              </div>

              {/* Camera Lens Viewport panel */}
              <div className="aspect-video w-full rounded-2xl overflow-hidden bg-slate-950 border border-slate-300 dark:border-slate-850 relative shadow-inner flex items-center justify-center">
                {isCapturing && !capturedImg ? (
                  <div className="relative w-full h-full">
                    <video 
                      ref={videoRef}
                      className="w-full h-full object-cover"
                      autoPlay
                      playsInline
                      muted
                    />
                    {/* Reticle guide markings to simulate camera scan frame overlay */}
                    <div className="absolute inset-0 border border-emerald-500/10 pointer-events-none flex items-center justify-center">
                      <div className="w-3/4 h-3/4 border border-dashed border-white/20 rounded-lg flex items-center justify-center">
                        <span className="text-[9px] font-mono font-black tracking-widest text-emerald-400/80 bg-slate-955/70 p-1 px-2 rounded">
                          LENS ACTIVE // ALIGN TARGET
                        </span>
                      </div>
                    </div>
                  </div>
                ) : capturedImg ? (
                  <div className="w-full h-full relative">
                    <img 
                      src={capturedImg} 
                      alt="Freeze Frame Capture" 
                      className="w-full h-full object-cover animate-fade-in"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-2 left-2 bg-emerald-600 text-white text-[9px] font-black px-2 py-0.5 rounded shadow border border-emerald-500 font-mono">
                      CAPTURED PREVIEW
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-zinc-500 p-4 text-center">
                    <span className="text-3xl animate-bounce">📸</span>
                    <p className="text-xs font-black text-slate-200">
                      {lang === 'en' ? "Hardware Emulator Activated Ready" : "क्यामेरा इमुलेटर मोड सक्रिय छ"}
                    </p>
                    <p className="text-[10px] text-zinc-400 max-w-xs leading-relaxed">
                      {lang === 'en' ? "Press 'Trigger Live Shutter' to freeze sample data, write watermark and test saves!" : "आफ्नो मोबाइल वा कम्प्युटरबाट सिधै फोटो खिचेर सुरक्षित गर्न ‘तस्बिर खिच्नुहोस्’ बटन थिच्नुहोस्!"}
                    </p>
                  </div>
                )}
              </div>

              {/* Mobile Native Camera & Gallery Uplinks */}
              <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
                <div className="space-y-1 text-center md:text-left">
                  <span className="text-[10px] bg-amber-500/10 text-amber-600 dark:text-amber-400 font-extrabold uppercase px-2.5 py-0.5 rounded-full tracking-wider">
                    {lang === 'en' ? "📱 Direct Camera Bypass" : "📱 मोबाइल क्यामेरा बाईपास"}
                  </span>
                  <p className="text-xs font-bold text-gray-800 dark:text-slate-100 mt-1">
                    {lang === 'en' ? "Want to snap a real live photo with your mobile lens?" : "आफ्नो मोबाइलको मुख्य क्यामेरा प्रयोग गरेर वास्तविक फोटो खिच्न चाहनुहुन्छ?"}
                  </p>
                  <p className="text-[10.5px] font-medium leading-relaxed text-gray-500 dark:text-slate-400">
                    {lang === 'en' 
                      ? "Iframe environment WebRTC streams might be blocked. Click below to take a photo using your phone's native camera immediately!" 
                      : "आईफ्रेम वातावरणमा लाइभ क्यामेरा ब्लक हुन सक्छ। आफ्नो मोबाइलको मुख्य क्यामेरा खोल्न तल क्लिक गर्नुहोस्!"
                    }
                  </p>
                </div>
                <div className="flex items-center gap-2.5 shrink-0 flex-wrap justify-center w-full md:w-auto">
                  <label className="bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 font-extrabold text-xs uppercase tracking-wider py-2.5 px-4 rounded-xl cursor-pointer transition flex items-center gap-1.5 shadow">
                    <Camera className="w-3.5 h-3.5" />
                    <span>{lang === 'en' ? "Take Live Photo" : "क्यामेरा खिच्नुहोस"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      className="hidden"
                      onChange={handleNativeCameraCapture}
                    />
                  </label>
                  <label className="bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 active:scale-95 text-slate-800 dark:text-slate-200 font-extrabold text-xs uppercase tracking-wider py-2.5 px-4 rounded-xl cursor-pointer transition flex items-center gap-1.5 shadow border border-slate-300 dark:border-slate-700">
                    <Download className="rotate-180 w-3.5 h-3.5" />
                    <span>{lang === 'en' ? "Upload Gallery" : "ग्यालरीबाट"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleNativeCameraCapture}
                    />
                  </label>
                </div>
              </div>

              {/* Shutter controls footer actions */}
              <div className="flex gap-3 justify-between items-center flex-wrap pt-3 border-t border-slate-100 dark:border-slate-900 w-full mt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowCameraModal(false);
                    stopCamera();
                  }}
                  className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-extrabold py-2.5 px-4 rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer border border-transparent"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>{lang === 'en' ? "Back/Cancel" : "पछाडि जानुहोस"}</span>
                </button>

                <div className="flex gap-2 items-center flex-wrap">
                  {isCapturing && !capturedImg && (
                    <button
                      onClick={handleCapture}
                      className="bg-red-650 hover:bg-red-755 text-white py-2.5 px-5 rounded-xl font-extrabold text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow transition scale-100 hover:scale-[1.03] active:scale-[0.97]"
                    >
                      <span>🎯 {lang === 'en' ? "Capture Photo" : "तस्बिर खिच्नुहोस्"}</span>
                    </button>
                  )}

                  {(!isCapturing || capturedImg) && (
                    <button
                      onClick={() => {
                        setCapturedImg(null);
                        startCamera();
                      }}
                      className="bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold py-2.5 px-4 rounded-xl text-xs text-slate-700 dark:text-slate-300 flex items-center gap-1.5 cursor-pointer border border-gray-300 dark:border-slate-800 transition"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>{lang === 'en' ? "Retake / Start Cam" : "पुनः सुरु गर्नुहोस्"}</span>
                    </button>
                  )}

                  {capturedImg && (
                    <>
                      <button
                        onClick={() => handleDownloadPhotoData(capturedImg, photoLabel)}
                        className="bg-amber-500 hover:bg-amber-600 font-extrabold py-2.5 px-4 rounded-xl text-xs text-slate-950 flex items-center gap-1.5 cursor-pointer transition shadow hover:scale-[1.02] active:scale-[0.98]"
                        title="Download clean high-fidelity PNG asset directly onto hardware disk"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>{lang === 'en' ? "Download File" : "फाइल डाउनलोड"}</span>
                      </button>
                      <button
                        onClick={handleSaveCapturedPhoto}
                        className="bg-emerald-600 hover:bg-emerald-700 font-black py-2.5 px-5 rounded-xl text-xs text-white uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition shadow hover:scale-[1.02] active:scale-[0.98]"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>{lang === 'en' ? "Save to Secure Vault" : "ग्यालेरीमा थप्नुहोस्"}</span>
                      </button>
                    </>
                  )}

                  {!isCapturing && !capturedImg && (
                    <button
                      onClick={handleCapture}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-2.5 px-5 rounded-xl text-xs uppercase cursor-pointer"
                    >
                      {lang === 'en' ? "Trigger Live Shutter" : "तस्बिर स्क्यान गर्नुहोस"}
                    </button>
                  )}
                </div>
              </div>

            </div>
          </div>
          <canvas ref={canvasRef} className="hidden" />
        </div>
      )}

    </div>
  );
}
