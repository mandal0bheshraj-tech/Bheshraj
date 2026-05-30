import React, { useState, useEffect } from 'react';
import { FarmState } from './types';
import { loadFarmState, saveFarmState } from './utils/initialState';
import { translations } from './utils/translations';
import { motion, AnimatePresence } from 'motion/react';

// Import All Farm Modules
import { FarmDashboard } from './components/FarmDashboard';
import { PoultryModule } from './components/PoultryModule';
import { FishModule } from './components/FishModule';
import { GoatModule } from './components/GoatModule';
import { PigeonModule } from './components/PigeonModule';
import { InventoryModule } from './components/InventoryModule';
import { FinanceModule } from './components/FinanceModule';
import { WorkerModule } from './components/WorkerModule';
import { SalesModule } from './components/SalesModule';
import { AIFeatures } from './components/AIFeatures';
import { SarojaLogo } from './components/SarojaLogo';

// Cloud Components
import { AuthModal } from './components/AuthModal';
import { ProjectManager } from './components/ProjectManager';
import { auth, saveProjectToFirestore } from './utils/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';

// Icon Imports
import { 
  LayoutDashboard, 
  Bird, 
  Droplet, 
  Beef, 
  Flame, 
  Box, 
  Coins, 
  Users, 
  ShoppingCart, 
  Brain, 
  Settings, 
  Globe, 
  Wifi, 
  Database,
  CloudLightning,
  Smartphone,
  Cloud,
  CloudOff,
  LogIn,
  LogOut,
  User,
  FolderHeart,
  Menu,
  X,
  Sun,
  Moon
} from 'lucide-react';

export default function App() {
  const [state, setState] = useState<FarmState>(() => loadFarmState());
  const [currentTab, setCurrentTab] = useState<
    'dashboard' | 'poultry' | 'fish' | 'goat' | 'pigeon' | 'inventory' | 'finance' | 'workers' | 'sales' | 'ai' | 'settings'
  >('dashboard');
  const [lang, setLang] = useState<'en' | 'ne'>('en');
  const [currentUserRole, setCurrentUserRole] = useState<'Owner' | 'Manager' | 'Worker'>('Owner');
  const [showSplash, setShowSplash] = useState(true);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const stored = localStorage.getItem('saroja_theme');
    if (stored === 'dark' || stored === 'light') return stored;
    return 'light';
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('saroja_theme', theme);
  }, [theme]);

  // Cloud Account State
  const [user, setUser] = useState<any>(null);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(() => localStorage.getItem('saroja_active_project_id'));
  const [activeProjectName, setActiveProjectName] = useState<string | null>(() => localStorage.getItem('saroja_active_project_name'));
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const t = translations[lang];

  // Authenticated State Handler
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      if (!firebaseUser) {
        // Purge session variables and default back to sandbox
        setActiveProjectId(null);
        setActiveProjectName(null);
        localStorage.removeItem('saroja_active_project_id');
        localStorage.removeItem('saroja_active_project_name');
        const fresh = loadFarmState();
        setState(fresh);
      }
    });
    return () => unsubscribe();
  }, []);

  // Dismiss splash screen on mount with elegant timing
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 1600); //snappy, high impact 1.6s entry
    return () => clearTimeout(timer);
  }, []);

  // Sync state block
  const handleSyncProjectState = async (projId: string, customState: FarmState) => {
    if (!user) return;
    setIsSyncing(true);
    try {
      await saveProjectToFirestore(user.uid, projId, activeProjectName || "Saroja Project", "", customState);
    } catch (e) {
      console.error("Firestore sync error", e);
    } finally {
      setIsSyncing(false);
    }
  };

  // Select project handler
  const handleSelectProject = (project: any) => {
    if (project) {
      setActiveProjectId(project.projectId);
      setActiveProjectName(project.name);
      setState(project.state);
      saveFarmState(project.state);
      localStorage.setItem('saroja_active_project_id', project.projectId);
      localStorage.setItem('saroja_active_project_name', project.name);
    } else {
      setActiveProjectId(null);
      setActiveProjectName(null);
      localStorage.removeItem('saroja_active_project_id');
      localStorage.removeItem('saroja_active_project_name');
      const fresh = loadFarmState();
      setState(fresh);
    }
  };

  // Sign out handler
  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.error("Logout failed", e);
    }
  };

  // Auto persist state transitions
  const handleUpdateState = (newState: FarmState) => {
    setState(newState);
    saveFarmState(newState);

    // If logged in under an active file project, trigger cloud autosave in the background
    if (user && activeProjectId) {
      setIsSyncing(true);
      saveProjectToFirestore(user.uid, activeProjectId, activeProjectName || "Saroja Project", "", newState)
        .then(() => setIsSyncing(false))
        .catch((e) => {
          console.error("Autosave error", e);
          setIsSyncing(false);
        });
    }
  };

  const [showDbResetConfirm, setShowDbResetConfirm] = useState(false);

  const handleResetDatabase = () => {
    localStorage.removeItem('saroja_farm_state_v1');
    const fresh = loadFarmState();
    setState(fresh);
    setShowDbResetConfirm(false);
  };

  // Nav bar items list mapping helper
  const navigationItems = [
    { id: 'dashboard' as const, label: t.dashboard, icon: LayoutDashboard, color: 'text-emerald-600 bg-emerald-50' },
    { id: 'poultry' as const, label: t.poultry, icon: Bird, color: 'text-rose-600 bg-rose-50' },
    { id: 'fish' as const, label: t.fish, icon: Droplet, color: 'text-sky-600 bg-sky-50' },
    { id: 'goat' as const, label: t.goat, icon: Beef, color: 'text-teal-600 bg-teal-50' },
    { id: 'pigeon' as const, label: t.pigeon, icon: Flame, color: 'text-amber-600 bg-amber-50' },
    { id: 'inventory' as const, label: t.inventory, icon: Box, color: 'text-purple-600 bg-purple-50' },
    { id: 'finance' as const, label: t.finance, icon: Coins, color: 'text-amber-600 bg-amber-50' },
    { id: 'workers' as const, label: t.workers, icon: Users, color: 'text-cyan-600 bg-cyan-50' },
    { id: 'sales' as const, label: t.sales, icon: ShoppingCart, color: 'text-emerald-600 bg-emerald-50' },
    { id: 'ai' as const, label: t.aiFeatures, icon: Brain, color: 'text-sky-600 bg-sky-50' },
    { id: 'settings' as const, label: t.settings, icon: Settings, color: 'text-gray-600 bg-gray-50' }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-gray-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-300">
      
      {/* Upper Status Bar & Headings */}
      <header className="sticky top-0 z-40 bg-emerald-900 border-b border-emerald-950 text-white px-4 py-3 shadow-md flex justify-between items-center bg-emerald-900/95 backdrop-blur-sm shadow-sm transition-colors duration-300">
        <div className="flex items-center gap-2.5">
          {/* Mobile Sidebar Hamburger Toggle Button */}
          <button
            onClick={() => setShowMobileSidebar(true)}
            className="md:hidden p-1.5 -ml-1 text-teal-300 hover:text-white hover:bg-emerald-850 rounded-lg cursor-pointer transition focus:outline-none shrink-0"
            title="Sectors Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <button
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className="group relative p-1 bg-emerald-950 hover:bg-emerald-900 active:scale-95 rounded-xl border border-emerald-850 hover:border-amber-400/40 shrink-0 cursor-pointer overflow-visible transition duration-300 shadow flex items-center justify-center"
            title={lang === 'en' ? "Click Logo to Switch Light/Dark Mode" : "लाइट/डार्क मोड परिवर्तन गर्न लोगोमा क्लिक गर्नुहोस्"}
          >
            <SarojaLogo size={42} showLabels={false} className="group-hover:scale-105 group-hover:rotate-6 transition-transform duration-300" />
            {/* Embedded Mini Badge on the Logo background corner */}
            <div className="absolute -bottom-1 -right-1 bg-emerald-950 border border-emerald-700 rounded-full p-0.5 shadow-md flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
              {theme === 'light' ? (
                <Moon className="w-2.5 h-2.5 text-amber-300 fill-amber-300/10" />
              ) : (
                <Sun className="w-2.5 h-2.5 text-yellow-300 fill-yellow-300/10" />
              )}
            </div>
          </button>
          <div>
            <h1 className="text-sm font-black tracking-wide flex items-center gap-1.5 leading-none">
              {t.appName}
              <span className="text-[9px] uppercase tracking-widest font-bold px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                MVP Phase 2
              </span>
            </h1>
            <span className="text-[10px] text-emerald-200 mt-1 block leading-none">Smart Saroja Agro-Industrial Farm</span>
          </div>
        </div>

        {/* Global toggles - lang picker, theme selector, offline status, role switcher */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Dual-status Cloud Indicator */}
          {!user ? (
            <button
              onClick={() => setShowAuthModal(true)}
              className="hidden sm:flex items-center gap-1.5 text-[10px] bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 px-3 py-1 rounded-full font-bold border border-amber-500/20 transition cursor-pointer uppercase tracking-wider"
            >
              <CloudOff className="w-3 h-3 text-amber-500" />
              <span>{lang === 'en' ? 'Sandbox Mode' : 'स्थानीय मोड'}</span>
            </button>
          ) : (
            <div className="hidden sm:flex items-center gap-1.5 text-[10px] bg-emerald-950/50 text-teal-300 px-3 py-1 rounded-full font-bold border border-emerald-800">
              <span className={`w-1.5 h-1.5 rounded-full ${isSyncing ? 'bg-amber-400 animate-pulse' : 'bg-teal-400'}`} />
              <span className="truncate max-w-[120px]">
                {activeProjectName ? `☁️ ${activeProjectName}` : (lang === 'en' ? "Cloud Sync Active" : "क्लाउड सक्रिय")}
              </span>
            </div>
          )}

          {/* Quick role selector */}
          <div className="flex bg-emerald-950/40 border border-emerald-800 rounded-lg p-0.5 text-[10px]">
            {(['Owner', 'Manager', 'Worker'] as const).map(role => (
              <button
                key={role}
                onClick={() => {
                  setCurrentUserRole(role);
                }}
                className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold transition ${
                  currentUserRole === role
                    ? 'bg-emerald-600 text-white'
                    : 'text-emerald-300 hover:text-white'
                }`}
              >
                {role}
              </button>
            ))}
          </div>

          {/* Core Language indicator toggle */}
          <button
            onClick={() => setLang(lang === 'en' ? 'ne' : 'en')}
            className="bg-emerald-800 hover:bg-emerald-700 border border-emerald-700/60 text-white text-[10px] px-3 py-2 rounded-lg font-bold flex items-center gap-1 cursor-pointer transition-colors"
          >
            <Globe className="w-3.5 h-3.5 text-teal-300" />
            <span>{lang === 'en' ? 'नेपाली' : 'English'}</span>
          </button>



          {/* User Session Auth Button */}
          {!user ? (
            <button
              onClick={() => setShowAuthModal(true)}
              className="bg-gradient-to-r from-amber-400 to-yellow-300 hover:from-amber-500 hover:to-yellow-400 text-emerald-950 text-[10px] px-3 py-1.5 rounded-lg font-black flex items-center gap-1.5 cursor-pointer uppercase tracking-wider shadow-sm transition"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>{lang === 'en' ? 'Log In' : 'साइन इन'}</span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5">
              <div className="flex items-center gap-1.5 bg-emerald-950/60 px-2.5 py-1.5 rounded-lg border border-emerald-800 text-[10px] font-bold text-teal-200">
                {user.photoURL ? (
                  <img src={user.photoURL} alt="User Avatar" className="w-4.5 h-4.5 rounded-full object-cover shrink-0" referrerPolicy="no-referrer" />
                ) : (
                  <User className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                )}
                <span className="max-w-[70px] truncate shrink-0">
                  {user.displayName || user.phoneNumber || user.email?.split('@')[0]}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="bg-red-950/40 hover:bg-red-900 border border-red-900/40 hover:border-red-900 p-2 text-[10px] rounded-lg font-bold cursor-pointer transition text-red-200"
                title={t.logout}
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Structural view container */}
      <div className="flex-1 flex flex-col md:flex-row min-h-0">
        
        {/* Left Sidebar panel - Visible ONLY on desktop */}
        <aside className="hidden md:flex bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 w-60 shrink-0 flex-col justify-between py-4 select-none transition-colors duration-300">
          <div className="space-y-1 px-3">
            {/* Saroja Royal Badge */}
            <div className="flex flex-col items-center gap-1.5 p-3.5 mb-4 bg-gradient-to-b from-emerald-950 to-emerald-900 border border-emerald-850 text-white rounded-xl shadow-inner text-center">
              <SarojaLogo size={85} showLabels={false} />
              <div className="mt-1 text-center">
                <span className="text-[10px] font-black tracking-widest uppercase text-amber-400 block leading-none">SAROJA FIRM</span>
                <span className="text-[8px] text-teal-300 font-black tracking-widest uppercase mt-1 block leading-none">ESTD. 2078 BS</span>
              </div>
            </div>

            <span className="text-[10px] text-gray-400 dark:text-slate-400 font-bold uppercase tracking-widest px-3 block mb-2">{t.allSectors}</span>
            <div className="space-y-1">
              {navigationItems.map(item => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                
                return (
                  <motion.button
                    key={item.id}
                    onClick={() => setCurrentTab(item.id)}
                    whileHover={{ scale: 1.02, x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 220, damping: 25 }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold flex items-center justify-between gap-1.5 cursor-pointer ${
                      isActive 
                        ? `${item.color} dark:bg-slate-800 dark:text-white border-l-4 border-emerald-600` 
                        : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{item.label}</span>
                    </div>

                    {item.id === 'ai' && (
                      <span className="bg-sky-500 text-white text-[8px] font-black uppercase px-1 py-0.2 rounded leading-none shrink-0">AI</span>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Footer diagnostics widget inside sidebar */}
          <div className="hidden md:block p-4 border-t border-gray-150 dark:border-slate-800 text-[10px] space-y-1 text-gray-400 dark:text-slate-400 mt-4 leading-relaxed bg-slate-50/50 dark:bg-slate-900/50 m-3 rounded-lg border dark:border-slate-800 transition-colors">
            <span className="font-bold text-gray-700 dark:text-slate-300">App Metadata Ingress</span>
            <p>Database: <strong className="text-gray-800 dark:text-slate-200">IndexedDB (localStorage Mirror)</strong></p>
            <p>Connection: <strong className="text-gray-800 dark:text-slate-200">Local Sandbox Container</strong></p>
            <span className="text-emerald-700 dark:text-emerald-400 font-extrabold flex items-center gap-1 mt-1 font-sans">● System Synchronized</span>
          </div>
        </aside>

        {/* Mobile Drawer Slide-over Panel */}
        <AnimatePresence>
          {showMobileSidebar && (
            <>
              {/* Dark backdrop element */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowMobileSidebar(false)}
                className="fixed inset-0 bg-[#022c22]/70 backdrop-blur-sm z-50 md:hidden"
              />

              {/* Slide from left panel */}
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 220 }}
                className="fixed left-0 top-0 bottom-0 max-w-xs w-72 bg-white dark:bg-slate-900 z-50 shadow-2xl flex flex-col justify-between py-5 select-none md:hidden overflow-y-auto border-r border-gray-100 dark:border-slate-800 transition-colors"
              >
                <div className="space-y-1 px-4">
                  {/* Close trigger drawer */}
                  <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-100 dark:border-slate-800">
                    <span className="text-[10px] text-gray-400 dark:text-slate-500 font-extrabold uppercase tracking-widest">{t.allSectors}</span>
                    <button
                      onClick={() => setShowMobileSidebar(false)}
                      className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition cursor-pointer"
                    >
                      <X className="w-5 h-5 text-gray-700 dark:text-slate-200" />
                    </button>
                  </div>

                  {/* Saroja Royal Badge */}
                  <div className="flex flex-col items-center gap-1.5 p-3.5 mb-5 bg-gradient-to-b from-emerald-950 to-emerald-900 border border-emerald-850 text-white rounded-2xl shadow-inner text-center">
                    <SarojaLogo size={65} showLabels={false} />
                    <div className="mt-1 text-center">
                      <span className="text-[10px] font-black tracking-widest uppercase text-amber-400 block leading-none">SAROJA FIRM</span>
                      <span className="text-[8px] text-teal-300 font-black tracking-widest uppercase mt-1 block leading-none">ESTD. 2078 BS</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    {navigationItems.map(item => {
                      const Icon = item.icon;
                      const isActive = currentTab === item.id;
                      
                      return (
                        <motion.button
                          key={item.id}
                          onClick={() => {
                            setCurrentTab(item.id);
                            setShowMobileSidebar(false);
                          }}
                          whileHover={{ scale: 1.02, x: 4 }}
                          whileTap={{ scale: 0.98 }}
                          transition={{ type: "spring", stiffness: 220, damping: 25 }}
                          className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold flex items-center justify-between gap-1.5 cursor-pointer ${
                            isActive 
                              ? `${item.color} dark:bg-slate-800 dark:text-white border-l-4 border-emerald-600` 
                              : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <Icon className="w-4 h-4 shrink-0" />
                            <span>{item.label}</span>
                          </div>

                          {item.id === 'ai' && (
                            <span className="bg-sky-500 text-white text-[8px] font-black uppercase px-1 py-0.2 rounded leading-none shrink-0">AI</span>
                          )}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                {/* Footer in mobile drawer */}
                <div className="p-4 border-t border-gray-150 dark:border-slate-800 text-[10px] space-y-1 text-gray-400 dark:text-slate-400 mt-4 leading-relaxed bg-slate-50/50 dark:bg-slate-900/50 m-3 rounded-lg border dark:border-slate-800 transition-colors">
                  <span className="font-bold text-gray-700 dark:text-slate-300">App Metadata Ingress</span>
                  <p>Database: <strong className="text-gray-800 dark:text-slate-200">IndexedDB Local Cache</strong></p>
                  <p>Security: <strong className="text-gray-800 dark:text-slate-200">Active Private Sandboxing</strong></p>
                  <span className="text-emerald-700 dark:text-emerald-400 font-extrabold flex items-center gap-1 mt-1 font-sans">● System Synchronized</span>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Core Main Active Component Content panel */}
        <main className="flex-1 p-4 sm:p-6 max-w-7xl mx-auto w-full overflow-x-hidden relative">
          {/* Absolute glowing dual-tone radial gradient behind the watermark */}
          <div className="absolute inset-0 pointer-events-none select-none z-0 bg-[radial-gradient(circle_at_50%_40%,rgba(16,185,129,0.08)_0%,rgba(245,158,11,0.04)_30%,rgba(248,250,252,0)_70%)]" />

          {/* Absolute subtle watermark logo with animated depth and floating parallax */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden select-none z-0">
            <motion.div
              animate={{ 
                y: [0, -10, 0],
                rotate: [0, 1.5, 0],
                scale: [0.98, 1.01, 0.98]
              }}
              transition={{ 
                duration: 10, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
              style={{ willChange: 'transform, opacity' }}
              className="opacity-[0.05] filter blur-[0.4px] flex items-center justify-center p-8"
            >
              <SarojaLogo size={580} showLabels={true} />
            </motion.div>
          </div>

          <div className="relative z-10 w-full h-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentTab}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.16, ease: "easeOut" }}
                className="w-full"
              >
                {currentTab === 'dashboard' && (
                  <FarmDashboard 
                    state={state} 
                    onUpdateState={handleUpdateState} 
                    setActiveTab={(tab: any) => setCurrentTab(tab)} 
                    lang={lang} 
                  />
                )}

                {currentTab === 'poultry' && (
                  <PoultryModule state={state} onUpdateState={handleUpdateState} lang={lang} />
                )}

                {currentTab === 'fish' && (
                  <FishModule state={state} onUpdateState={handleUpdateState} lang={lang} />
                )}

                {currentTab === 'goat' && (
                  <GoatModule state={state} onUpdateState={handleUpdateState} lang={lang} />
                )}

                {currentTab === 'pigeon' && (
                  <PigeonModule state={state} onUpdateState={handleUpdateState} lang={lang} />
                )}

                {currentTab === 'inventory' && (
                  <InventoryModule state={state} onUpdateState={handleUpdateState} lang={lang} />
                )}

                {currentTab === 'finance' && (
                  <FinanceModule state={state} onUpdateState={handleUpdateState} lang={lang} />
                )}

                {currentTab === 'workers' && (
                  <WorkerModule state={state} onUpdateState={handleUpdateState} lang={lang} />
                )}

                {currentTab === 'sales' && (
                  <SalesModule state={state} onUpdateState={handleUpdateState} lang={lang} />
                )}

                {currentTab === 'ai' && (
                  <AIFeatures state={state} lang={lang} />
                )}

                {currentTab === 'settings' && (
                  <div className="space-y-6 max-w-2xl">
                    {/* Cloud Backup & Projects Workspace Isolator */}
                    {user ? (
                      <ProjectManager
                        currentUserId={user.uid}
                        activeProjectId={activeProjectId}
                        onSelectProject={handleSelectProject}
                        lang={lang}
                        activeState={state}
                        onSyncState={handleSyncProjectState}
                      />
                    ) : (
                      <div className="bg-gradient-to-br from-emerald-900 to-emerald-950 text-white rounded-2xl p-6 border border-emerald-800 shadow-md flex flex-col sm:flex-row justify-between items-center gap-5">
                        <div className="space-y-1.5 text-center sm:text-left">
                          <h3 className="font-extrabold text-base text-amber-400 flex items-center justify-center sm:justify-start gap-2">
                            <FolderHeart className="w-5 h-5 text-amber-400" />
                            <span>Cloud Workspace Synchronization</span>
                          </h3>
                          <p className="text-xs text-emerald-200 leading-relaxed max-w-sm">
                            Join Saroja Smart Farm cloud databases! Back up livestock logs, pigeon pairs, broiler units, and financial books securely. Sign in to enable multi-project isolation today.
                          </p>
                        </div>
                        <button
                          onClick={() => setShowAuthModal(true)}
                          className="bg-gradient-to-r from-amber-400 to-yellow-300 hover:from-amber-500 hover:to-yellow-400 text-emerald-950 font-black text-xs px-5 py-2.5 rounded-xl shadow transition shrink-0 hover:-translate-y-0.5 uppercase tracking-wide cursor-pointer"
                        >
                          🔑 Log In to Cloud
                        </button>
                      </div>
                    )}

                    {/* Brand Identity Card */}
                    <div className="bg-gradient-to-b from-white to-slate-50 border border-amber-400/30 rounded-xl p-5 shadow-md space-y-4">
                      <div className="flex justify-between items-start border-b border-gray-150 pb-3 flex-wrap gap-2">
                        <div>
                          <h3 className="font-extrabold text-gray-950 text-base flex items-center gap-2 text-emerald-800">
                            <Smartphone className="w-5 h-5 text-amber-500" />
                            <span>Saroja Brand Assets & Identity Kit</span>
                          </h3>
                          <p className="text-[11px] text-gray-400 mt-0.5">Official high-fidelity assets for digital, mobile app, and print formats.</p>
                        </div>
                        <span className="bg-amber-400/10 text-amber-600 border border-amber-400/20 text-[10px] font-bold px-2 rounded-full uppercase">Official Identity</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* 1. Launcher App Icon */}
                        <div className="border border-gray-200/80 bg-white rounded-xl p-4 flex flex-col items-center justify-between text-center space-y-3 shadow-sm">
                          <div className="space-y-1">
                            <span className="text-[10px] text-amber-600 font-extrabold uppercase tracking-wider block">1. Launcher App Icon</span>
                            <span className="text-[10px] text-gray-400 leading-none block">Mobile Tap-Target Squircle</span>
                          </div>
                          
                          {/* Simulated High-Res Phone Home Screen Icon */}
                          <div className="relative group cursor-pointer transition transform hover:scale-105">
                            <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 to-yellow-400 rounded-2xl blur opacity-25 group-hover:opacity-40 transition" />
                            <div className="relative w-24 h-24 bg-gradient-to-b from-emerald-950 via-emerald-900 to-emerald-950 border-2 border-amber-400/45 rounded-2xl flex items-center justify-center shadow-lg">
                              <SarojaLogo size={80} showLabels={false} />
                            </div>
                          </div>

                          <div className="text-[10px] text-gray-400 leading-normal p-1 bg-gray-50 rounded">
                            Fully optimized for iOS / Android app launcher grids (512x512 with gold frame outline).
                          </div>
                        </div>

                        {/* 2. Brand Logo & Billboard */}
                        <div className="border border-gray-200/80 bg-white rounded-xl p-4 flex flex-col items-center justify-between text-center space-y-3 shadow-sm">
                          <div className="space-y-1">
                            <span className="text-[10px] text-emerald-700 font-extrabold uppercase tracking-wider block">2. Brand Logo Poster</span>
                            <span className="text-[10px] text-gray-400 leading-none block">Invoices, Boards, Social Media</span>
                          </div>

                          {/* Scaled brand insignia vector preview */}
                          <div className="p-2 bg-[#022c22] rounded-xl border border-emerald-800 flex items-center justify-center shadow">
                            <SarojaLogo size={90} showLabels={true} />
                          </div>

                          <div className="text-[10px] text-gray-400 leading-normal p-1 bg-gray-50 rounded w-full">
                            Royal Crest Shield enclosing Pigeons, Poultries, Tilapia, and Goats with gold typography.
                          </div>
                        </div>
                      </div>

                      {/* 3. Opening Splash Screen Preview Trigger */}
                      <div className="bg-emerald-950 text-white rounded-lg p-3.5 flex items-center justify-between gap-4 border border-emerald-800 shadow-inner">
                        <div className="space-y-1">
                          <span className="text-[10px] text-amber-400 font-black tracking-wider block uppercase">3. Grand Launch Splash Screen</span>
                          <p className="text-[11px] text-emerald-250 leading-relaxed font-sans">
                            Opening greeting with animated gold dual halos, loading progression bars, and Nepali branding.
                          </p>
                        </div>
                        <button 
                          onClick={() => {
                            setShowSplash(true);
                            // Set high-impact snappy 2.2s replay
                            setTimeout(() => {
                              setShowSplash(false);
                            }, 2200);
                          }}
                          className="bg-gradient-to-r from-amber-400 to-yellow-300 hover:from-amber-500 hover:to-yellow-400 text-emerald-950 font-black px-3.5 py-1.5 rounded-lg text-xs transition duration-200 shadow-md transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer shrink-0 uppercase tracking-wider"
                        >
                          Replay Splash
                        </button>
                      </div>
                    </div>

                    {/* Classic Configuration Settings Card */}
                    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4">
                      <h3 className="font-extrabold text-gray-950 text-base pb-2 border-b border-gray-150 flex items-center gap-1.5 text-emerald-800">
                        <Settings className="w-5 h-5 text-emerald-600" />
                        <span>Saroja Farm Configuration Settings (सेटअप)</span>
                      </h3>
                      
                      <div className="space-y-3.5 text-xs text-gray-750 font-semibold leading-relaxed">
                        <div className="p-3 bg-gray-50 rounded-lg space-y-1">
                          <span className="text-gray-400 block uppercase tracking-widest text-[10px]">Access Role Management</span>
                          <p>Current authorized persona is: <strong className="text-emerald-700 uppercase">{currentUserRole}</strong></p>
                          <p className="text-[10px] text-gray-400 font-medium">Owners can reset ledger entries and configure worker files. Workers can add daily feed bags metrics.</p>
                        </div>

                        <div className="p-3 bg-gray-50 rounded-lg space-y-1">
                          <span className="text-gray-400 block uppercase tracking-widest text-[10px]">Farm Area Details</span>
                          <p>Subleasing Farm Sectors: <strong>Broilers Coops (3), Tilapia Ponds (2), Boer Goat Buck pens (2), Pigeons cages (2)</strong></p>
                          <p>Contact Address: <strong>Saroja Krishi Tatha Pashupalan Farm, Barju-4 Sunsari, Nepal</strong></p>
                        </div>

                        <div className="p-3 bg-gray-50 border border-amber-250/50 rounded-lg space-y-2">
                          <span className="text-amber-800 block uppercase tracking-widest text-[10px] font-bold">Database Reset Utilities</span>
                          <p className="text-[11px] text-gray-500 font-medium">To discard custom records, purge transaction books, or reset the sandbox defaults, execute a reset:</p>
                          {showDbResetConfirm ? (
                            <div className="flex items-center gap-1.5 animate-pulse bg-rose-50 border border-rose-200 p-2 rounded-lg">
                              <span className="text-[11px] text-red-600 font-extrabold pr-1">Are you sure?</span>
                              <button
                                onClick={handleResetDatabase}
                                className="bg-red-600 hover:bg-red-750 text-white font-extrabold text-[11px] px-2.5 py-1 rounded transition cursor-pointer"
                              >
                                Yes, Reset
                              </button>
                              <button
                                onClick={() => setShowDbResetConfirm(false)}
                                className="bg-gray-200 text-gray-700 font-extrabold text-[11px] px-2 py-1 rounded transition cursor-pointer"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button 
                              onClick={() => setShowDbResetConfirm(true)}
                              className="bg-rose-50 hover:bg-rose-100/80 border border-rose-250 text-rose-700 font-bold px-3 py-1.5 rounded text-xs transition inline-flex items-center gap-1 cursor-pointer"
                            >
                              <Database className="w-4 h-4" /> Reset Mock Data
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>

      </div>

      {/* Visual Bottom Nav Rail for Mobile screens specifically */}
      <nav className="md:hidden sticky bottom-0 z-50 bg-white dark:bg-slate-900 border-t border-gray-200/90 dark:border-slate-800 py-1.5 flex justify-around items-center select-none shadow transition-colors duration-300">
        {navigationItems.slice(0, 5).map(item => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${
                isActive ? 'text-emerald-700 dark:text-emerald-400 font-bold' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
              }`}
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span className="text-[8.5px] font-bold leading-none">{item.label}</span>
            </button>
          );
        })}
        
        {/* Toggle generic more menu */}
        <button
          onClick={() => {
            if (['inventory', 'finance', 'workers', 'sales', 'ai', 'settings'].includes(currentTab)) {
              setCurrentTab('dashboard');
            } else {
              setCurrentTab('inventory');
            }
          }}
          className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${
            ['inventory', 'finance', 'workers', 'sales', 'ai', 'settings'].includes(currentTab) 
              ? 'text-emerald-700 dark:text-emerald-400 font-bold' 
              : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
          }`}
        >
          <Box className="w-5 h-5" />
          <span className="text-[8.5px] font-bold leading-none">More...</span>
        </button>
      </nav>

      {/* Grand opening intro splash screen */}
      <AnimatePresence>
        {showSplash && (
          <motion.div
            key="splash"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.05, filter: "blur(4px)" }}
            transition={{ duration: 0.45, ease: "easeInOut" }}
            className="fixed inset-0 z-50 bg-gradient-to-b from-[#022c22] via-[#011c15] to-[#041511] flex flex-col items-center justify-center select-none"
          >
            {/* Ambient golden and emerald glow spots in background */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.6, type: "spring", damping: 15 }}
              className="flex flex-col items-center text-center space-y-6"
            >
              {/* Spinning subtle surrounding gold halos */}
              <div className="relative p-4 rounded-full">
                <div className="absolute inset-0 rounded-full border-2 border-dashed border-amber-400/20 animate-spin" style={{ animationDuration: '30s' }} />
                <div className="absolute inset-2 rounded-full border border-emerald-500/30 animate-spin" style={{ animationDuration: '15s', animationDirection: 'reverse' }} />
                <SarojaLogo size={230} showLabels={true} className="drop-shadow-[0_0_20px_rgba(245,158,11,0.25)]" />
              </div>

              <div className="space-y-2">
                <h2 className="text-xl font-extrabold text-amber-400 tracking-wider font-serif">
                  सरोजा कृषि तथा पशुपालन फर्म
                </h2>
                <p className="text-[11px] text-teal-400 font-bold uppercase tracking-widest font-mono">
                  Saroja Smart Farm Core OS
                </p>
              </div>

              {/* Progress bar loader */}
              <div className="w-56 h-1 bg-emerald-950 rounded-full overflow-hidden relative">
                <motion.div 
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 1.4, ease: "easeInOut" }}
                  className="h-full bg-gradient-to-r from-amber-500 to-yellow-300 rounded-full"
                />
              </div>

              <div className="text-[10px] text-teal-300/60 font-mono italic">
                Authorized Agricultural Ledger Loading...
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cloud Authentication modal element */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        lang={lang}
      />

    </div>
  );
}
