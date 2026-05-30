import React, { useState, useEffect } from 'react';
import { 
  getProjectsFromFirestore, 
  saveProjectToFirestore, 
  deleteProjectFromFirestore, 
  FarmProject 
} from '../utils/firebase';
import { translations } from '../utils/translations';
import { FarmState } from '../types';
import { INITIAL_FARM_STATE } from '../utils/initialState';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Folder, 
  Plus, 
  CloudRain, 
  FolderHeart, 
  CloudUpload, 
  Trash2, 
  Check, 
  FolderClosed, 
  FolderOpen, 
  Calendar, 
  Sparkles,
  RefreshCw,
  AlertTriangle,
  Info
} from 'lucide-react';

interface ProjectManagerProps {
  currentUserId: string;
  activeProjectId: string | null;
  onSelectProject: (project: FarmProject | null) => void;
  lang: 'en' | 'ne';
  activeState: FarmState;
  onSyncState: (projectId: string, state: FarmState) => Promise<void>;
}

export function ProjectManager({ 
  currentUserId, 
  activeProjectId, 
  onSelectProject, 
  lang, 
  activeState,
  onSyncState 
}: ProjectManagerProps) {
  const t = translations[lang];
  const [projects, setProjects] = useState<FarmProject[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [useCurrentState, setUseCurrentState] = useState(true);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Fetch projects from Cloud Firestore on mount or user change
  const fetchProjects = async () => {
    setLoading(true);
    try {
      const list = await getProjectsFromFirestore(currentUserId);
      setProjects(list);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUserId) {
      fetchProjects();
    }
  }, [currentUserId]);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    setLoading(true);
    const projectId = 'proj-' + Date.now();
    const targetState = useCurrentState ? activeState : INITIAL_FARM_STATE;

    try {
      await saveProjectToFirestore(
        currentUserId, 
        projectId, 
        newName.trim(), 
        newDesc.trim(), 
        targetState,
        true
      );
      setNewName('');
      setNewDesc('');
      setShowCreateForm(false);
      setSuccessMsg(lang === 'en' ? "New cloud project registered!" : "नयाँ क्लाउड प्रोजेक्ट सुरक्षित भयो!");
      setTimeout(() => setSuccessMsg(null), 3000);
      await fetchProjects();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    setLoading(true);
    try {
      await deleteProjectFromFirestore(currentUserId, projectId);
      if (activeProjectId === projectId) {
        onSelectProject(null); // Fallback to sandbox if selected project was deleted
      }
      setConfirmDeleteId(null);
      setSuccessMsg(lang === 'en' ? "Project deleted permanently." : "प्रोजेक्ट सफलतापूर्वक हटाइयो।");
      setTimeout(() => setSuccessMsg(null), 3000);
      await fetchProjects();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleManualSync = async (proj: FarmProject) => {
    setLoading(true);
    try {
      await onSyncState(proj.projectId, activeState);
      setSuccessMsg(t.cloudBackupSuccess);
      setTimeout(() => setSuccessMsg(null), 3500);
      await fetchProjects();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-6">
      
      {/* Header and Sync overview */}
      <div className="flex justify-between items-start border-b border-gray-150 pb-3 flex-wrap gap-3">
        <div>
          <h3 className="font-extrabold text-gray-950 text-base flex items-center gap-2 text-emerald-800">
            <FolderHeart className="w-5 h-5 text-emerald-600" />
            <span>{t.cloudProjectsTitle}</span>
          </h3>
          <p className="text-[11px] text-gray-400 mt-0.5">
            {lang === 'en' 
              ? "Create, isolate, and save different agricultural segments or farm projects in your secure account."
              : "सुरक्षित ब्राउजर खाता भित्र रहेर फरक फरक कृषि क्षेत्र वा फर्महरू छुट्टाछुट्टै व्यवस्थापन र सिङ्क गर्नुहोस्।"
            }
          </p>
        </div>
        
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{t.createNewProject}</span>
        </button>
      </div>

      {/* Slide-down Create Project form */}
      <AnimatePresence>
        {showCreateForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleCreateProject}
            className="bg-slate-50 border border-gray-150 rounded-xl p-4 space-y-4 overflow-hidden"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-gray-450 block tracking-wider">
                  {t.projectNameLabel} *
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Sunsari Broiler Farm #1"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-gray-450 block tracking-wider">
                  {t.projectDescLabel}
                </label>
                <input
                  type="text"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="e.g. Inarwa Ward 4, Sunsari (Broiler & Tilapia)"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-emerald-600"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                id="use-current-state"
                type="checkbox"
                checked={useCurrentState}
                onChange={(e) => setUseCurrentState(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
              />
              <label htmlFor="use-current-state" className="text-xs font-semibold text-gray-700 cursor-pointer select-none">
                {lang === 'en' 
                  ? "Initialize project with my current display data" 
                  : "हाल स्क्रिनमा प्रदर्शित डाटाको प्रतिलिपिबाट सुरु गर्नुहोस्"
                }
              </label>
            </div>

            <div className="flex justify-end gap-2 text-xs font-bold pt-1">
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="px-3 py-1.5 text-gray-500 hover:bg-gray-150 rounded-lg cursor-pointer"
              >
                {t.cancel}
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition shrink-0 cursor-pointer flex items-center gap-1.5"
              >
                {loading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>{lang === 'en' ? "Register Project" : "प्रोजेक्ट दर्ता गर्नुहोस्"}</span>
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Notifications bar */}
      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-lg text-xs font-bold flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Projects Grid */}
      {loading && projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 space-y-2">
          <RefreshCw className="w-7 h-7 text-emerald-600 animate-spin" />
          <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Syncing workspace...</span>
        </div>
      ) : projects.length === 0 ? (
        <div className="border border-dashed border-gray-200 rounded-xl p-8 text-center space-y-3 bg-slate-50/40">
          <FolderClosed className="w-10 h-10 text-gray-300 mx-auto" />
          <div className="space-y-1">
            <span className="text-xs font-black text-gray-800 uppercase tracking-wide block">{t.noCloudProjects}</span>
            <p className="text-[11px] text-gray-400 max-w-xs mx-auto">
              {lang === 'en' 
                ? "You don't have any cloud projects running. Click 'Create New Farm Project' to initialize custom isolated ledgers."
                : "तपाईंसँग हाल कुनै क्लाउड प्रोजेक्ट छैन। 'नयाँ प्रोजेक्ट दर्ता' मा क्लिक गरी डेटा सुरक्षित गर्नुहोस्।"
              }
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Loop over project profiles */}
          {projects.map((proj) => {
            const isActive = activeProjectId === proj.projectId;
            const poultryCount = proj.state?.poultryBatches?.length || 0;
            const fishCount = proj.state?.fishPonds?.length || 0;
            const goatCount = proj.state?.goats?.length || 0;
            const pigeonCount = proj.state?.pigeons?.length || 0;

            return (
              <div 
                key={proj.projectId}
                className={`border rounded-xl p-4.5 transition flex flex-col justify-between hover:shadow-md ${
                  isActive 
                    ? 'border-emerald-600 bg-emerald-50/10 shadow-sm' 
                    : 'border-gray-200 bg-white'
                }`}
              >
                <div className="space-y-3.5">
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className={`p-2 rounded-lg shrink-0 ${isActive ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
                        {isActive ? <FolderOpen className="w-5 h-5" /> : <Folder className="w-5 h-5" />}
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-gray-950 truncate max-w-[200px] leading-tight flex items-center gap-1.5">
                          {proj.name}
                          {isActive && (
                            <span className="bg-emerald-100 border border-emerald-300 text-emerald-800 text-[8px] font-black uppercase px-1.5 py-0.2 rounded shrink-0">
                              ACTIVE
                            </span>
                          )}
                        </h4>
                        <span className="text-[10px] text-gray-400 font-medium truncate block max-w-[200px] mt-0.5">
                          {proj.description || (lang === 'en' ? "No descriptive notes" : "केहि विवरण छैन")}
                        </span>
                      </div>
                    </div>

                    {/* Delete handler */}
                    {confirmDeleteId === proj.projectId ? (
                      <div className="flex items-center gap-1.5 bg-rose-50 border border-rose-200 p-1.5 rounded-lg shrink-0 animate-pulse">
                        <button
                          onClick={() => handleDeleteProject(proj.projectId)}
                          className="bg-red-650 hover:bg-red-755 text-white font-extrabold text-[9px] px-2 py-0.5 rounded cursor-pointer"
                        >
                          Confirm?
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          className="bg-gray-200 text-gray-700 font-extrabold text-[9px] px-2 py-0.5 rounded cursor-pointer"
                        >
                          X
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDeleteId(proj.projectId)}
                        className="text-gray-400 hover:text-red-500 p-1 rounded-full hover:bg-rose-50 transition cursor-pointer shrink-0"
                        title="Delete cloud project"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Micro breakdown of stock items inside the state representing actual value */}
                  <div className="grid grid-cols-4 gap-1.5 text-center p-2 bg-slate-50 border border-slate-150/40 rounded-lg text-[9px] font-bold text-gray-500">
                    <div className="border-r border-slate-200 last:border-0 pr-0.5">
                      <span className="block text-gray-800 font-black">{poultryCount}</span>
                      <span>Poultry</span>
                    </div>
                    <div className="border-r border-slate-200 last:border-0 px-0.5">
                      <span className="block text-gray-800 font-black">{fishCount}</span>
                      <span>Ponds</span>
                    </div>
                    <div className="border-r border-slate-200 last:border-0 px-0.5">
                      <span className="block text-gray-800 font-black">{goatCount}</span>
                      <span>Goats</span>
                    </div>
                    <div className="last:border-0 pl-0.5">
                      <span className="block text-gray-800 font-black">{pigeonCount}</span>
                      <span>Pigeons</span>
                    </div>
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="flex items-center justify-between border-t border-gray-150/60 pt-3 mt-4 flex-wrap gap-2">
                  <div className="flex items-center gap-1 text-[9px] text-gray-400 font-bold">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    <span>UID: {proj.projectId.slice(-6)}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Cloud Push Force Sync */}
                    <button
                      onClick={() => handleManualSync(proj)}
                      className="border border-emerald-600/30 bg-emerald-50/5 hover:bg-emerald-50/30 text-emerald-800 font-bold text-[10px] px-2.5 py-1 rounded transition flex items-center gap-1 cursor-pointer"
                      title="Override project memory onto server"
                    >
                      <CloudUpload className="w-3 h-3" />
                      <span>{lang === 'en' ? "Sync" : "सिङ्क"}</span>
                    </button>

                    {/* Open Project */}
                    <button
                      onClick={() => onSelectProject(proj)}
                      disabled={isActive}
                      className={`font-black text-[10px] px-3.5 py-1 rounded-lg transition duration-200 cursor-pointer ${
                        isActive 
                          ? 'bg-emerald-50 border border-emerald-250 text-emerald-700 cursor-default font-black' 
                          : 'bg-emerald-800 hover:bg-emerald-900 text-white shadow-sm'
                      }`}
                    >
                      <span>{isActive ? (lang === 'en' ? "Current" : "चालू छ") : (lang === 'en' ? "Open" : "खोल्नुहोस्")}</span>
                    </button>
                  </div>
                </div>

              </div>
            );
          })}

        </div>
      )}

      {/* Guidelines warning */}
      <div className="flex items-start gap-2 border border-slate-200/60 bg-slate-50/80 p-3 rounded-xl text-[10px] text-gray-500 font-medium">
        <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <span className="font-bold text-gray-700 uppercase tracking-wider block">Relational State Synchronization Note:</span>
          <p>
            This dashboard uses Google Cloud Firestore for zero-data-loss real-time ledger storage. When entering data (adding poultry registers, sales receipts) while active on a project, changes instantly sync securely to your profile cloud database partitions.
          </p>
        </div>
      </div>

    </div>
  );
}
