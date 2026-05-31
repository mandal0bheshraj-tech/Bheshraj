import React, { useState } from 'react';
import { FarmState, WorkerProfile, WorkerAttendance } from '../types';
import { translations } from '../utils/translations';
import { Plus, Trash2, Calendar, CheckSquare, Clock, UserCheck } from 'lucide-react';

interface WorkerProps {
  state: FarmState;
  onUpdateState: (newState: FarmState) => void;
  lang: 'en' | 'ne';
}

export function WorkerModule({ state, onUpdateState, lang }: WorkerProps) {
  const t = translations[lang];
  const [showWorkerForm, setShowWorkerForm] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);

  // New Worker State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [salary, setSalary] = useState<number | ''>('');
  const [role, setRole] = useState<'Manager' | 'Worker'>('Worker');

  // Task dispatcher state
  const [dispatcherWorkerId, setDispatcherWorkerId] = useState(state.workers[0]?.id || '');
  const [newTaskStr, setNewTaskStr] = useState('');

  const handleRegisterWorker = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;

    const numericSalary = salary === '' ? 0 : Number(salary);

    const newWorker: WorkerProfile = {
      id: `wrk-${Date.now()}`,
      name,
      phoneNumber: phone,
      salary: numericSalary,
      role,
      assignedTasks: [],
      attendance: []
    };

    onUpdateState({
      ...state,
      workers: [newWorker, ...state.workers]
    });

    setShowWorkerForm(false);
    setName('');
    setPhone('');
    setSalary('');
  };

  const handleUpdateAttendance = (workerId: string, status: 'Present' | 'Absent' | 'On Leave') => {
    const todayStr = "2026-05-29"; // matching system date
    
    const updated = state.workers.map(w => {
      if (w.id === workerId) {
        // filter out older attendance of same day if any, and insert fresh
        const cleanedAtt = w.attendance.filter(a => a.date !== todayStr);
        const newRecord: WorkerAttendance = {
          date: todayStr,
          status,
          checkIn: status === 'Present' ? "07:00 AM" : undefined,
          checkOut: status === 'Present' ? "05:00 PM" : undefined
        };
        return {
          ...w,
          attendance: [newRecord, ...cleanedAtt]
        };
      }
      return w;
    });

    onUpdateState({ ...state, workers: updated });
  };

  const handleDispatchTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dispatcherWorkerId || !newTaskStr) return;

    const updated = state.workers.map(w => {
      if (w.id === dispatcherWorkerId) {
        return {
          ...w,
          assignedTasks: [...w.assignedTasks, newTaskStr]
        };
      }
      return w;
    });

    onUpdateState({ ...state, workers: updated });
    setNewTaskStr('');
    setShowTaskForm(false);
    alert("Task successfully appended to worker profile assigned jobs.");
  };

  const handleDeleteTask = (workerId: string, taskIdx: number) => {
    const updated = state.workers.map(w => {
      if (w.id === workerId) {
        const cleaned = w.assignedTasks.filter((_, idx) => idx !== taskIdx);
        return {
          ...w,
          assignedTasks: cleaned
        };
      }
      return w;
    });
    onUpdateState({ ...state, workers: updated });
  };

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const handleDeleteWorker = (id: string) => {
    const updated = state.workers.filter(w => w.id !== id);
    onUpdateState({ ...state, workers: updated });
    setConfirmDeleteId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header operations */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="text-3xl">🧑‍🌾</div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">{t.workers}</h2>
            <p className="text-xs text-gray-500">Log manager duties, workers attendance sheets & assignments</p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setShowTaskForm(!showTaskForm)}
            className="bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-700 font-bold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition cursor-pointer"
          >
            📋 {t.createTask}
          </button>
          <button
            onClick={() => setShowWorkerForm(!showWorkerForm)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>{t.addWorker}</span>
          </button>
        </div>
      </div>

      {showWorkerForm && (
        <form onSubmit={handleRegisterWorker} className="bg-white border border-gray-200 p-5 rounded-xl shadow-sm grid grid-cols-1 md:grid-cols-4 gap-4 font-medium text-xs text-gray-700">
          <div className="md:col-span-4 pb-2 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded p-2">
            <h3 className="font-bold text-emerald-700 uppercase tracking-wider">{t.addWorker}</h3>
            <button type="button" onClick={() => setShowWorkerForm(false)} className="text-xs text-gray-400 font-bold">✕ Close</button>
          </div>
          <div>
            <label className="font-semibold block mb-1">{t.workerName} *</label>
            <input 
              type="text" 
              placeholder="e.g. Kiran Thapa" 
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-gray-55 border border-gray-300 rounded px-3 py-1.5 text-xs text-gray-900"
            />
          </div>
          <div>
            <label className="font-semibold block mb-1">{t.phone} *</label>
            <input 
              type="text" 
              placeholder="e.g. 9845xxxxxx" 
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-gray-55 border border-gray-300 rounded px-3 py-1.5 text-xs text-gray-950 font-mono"
            />
          </div>
          <div>
            <label className="font-semibold block mb-1">{t.salaryMonth} *</label>
            <input 
              type="number" 
              value={salary}
              onChange={(e) => setSalary(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full bg-gray-55 border border-gray-300 rounded px-3 py-1.5 text-xs text-gray-950 font-mono"
            />
          </div>
          <div>
            <label className="font-semibold block mb-1">Organizational Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as any)}
              className="w-full bg-gray-55 border border-gray-300 rounded px-2.5 py-1.5 text-xs text-gray-900 font-semibold"
            >
              <option value="Worker">Worker (सहयोगी)</option>
              <option value="Manager">Manager (मेनेजर)</option>
            </select>
          </div>
          <div className="md:col-span-4 pt-2 text-right">
            <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2' rounded-lg cursor-pointer">
              {t.save}
            </button>
          </div>
        </form>
      )}

      {showTaskForm && (
        <form onSubmit={handleDispatchTask} className="bg-white border border-gray-200 p-5 rounded-xl shadow-md space-y-4 font-medium text-xs text-gray-700">
          <div className="pb-2 border-b border-gray-100 flex justify-between items-center bg-sky-50 rounded p-2">
            <h3 className="font-bold text-sky-850 uppercase tracking-wider">{t.createTask}</h3>
            <button type="button" onClick={() => setShowTaskForm(false)} className="text-xs text-gray-400 font-bold">✕ Close</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1">Select Farm Worker Profile</label>
              <select
                value={dispatcherWorkerId}
                onChange={(e) => setDispatcherWorkerId(e.target.value)}
                className="w-full bg-gray-55 border border-gray-300 rounded px-2.5 py-1.5 text-xs font-semibold text-gray-900"
              >
                {state.workers.map(w => (
                  <option key={w.id} value={w.id}>{w.name} ({w.role})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block mb-1">Enter Duty / Assigned Task details *</label>
              <input 
                type="text" 
                placeholder="e.g. Replenish water inside Broiler coops"
                required
                value={newTaskStr}
                onChange={(e) => setNewTaskStr(e.target.value)}
                className="w-full bg-gray-55 border border-gray-300 rounded px-3 py-1.5 text-xs text-gray-900"
              />
            </div>
          </div>
          <div className="text-right">
            <button type="submit" className="bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs px-5 py-2 rounded-lg cursor-pointer shadow">
              Dispatch Task
            </button>
          </div>
        </form>
      )}

      {/* Workers grids */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Workers Attendance Sheets */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm lg:col-span-2 space-y-4">
          <h3 className="font-bold text-gray-900 text-sm pb-2 border-b border-gray-100 flex items-center gap-1.5">
            <UserCheck className="w-5 h-5 text-emerald-600" />
            <span>Staff Roster & Attendance Check-In (हाजिरी पुस्तिका)</span>
          </h3>

          <div className="space-y-4">
            {state.workers.map(worker => {
              const todayStr = "2026-05-29";
              const todayAtt = worker.attendance.find(a => a.date === todayStr);
              
              return (
                <div key={worker.id} className="bg-gray-50/50 hover:bg-gray-50 border border-gray-200/60 p-4 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs font-semibold">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-extrabold text-gray-950 text-sm">{worker.name}</h4>
                      <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 bg-white text-gray-600 border border-gray-250 rounded">
                        {worker.role}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-gray-500 font-medium mt-1">
                      <span>Phone: <strong className="text-gray-900">{worker.phoneNumber}</strong></span>
                      <span>Salary: <strong className="text-gray-900">Rs. {worker.salary}</strong></span>
                    </div>
                  </div>

                  {/* Checkin selection row */}
                  <div className="flex flex-col sm:items-end gap-1.5 w-full sm:w-auto shrink-0">
                    <span className="text-[10px] text-gray-400 font-bold block sm:text-right uppercase">Attendance today:</span>
                    <div className="flex bg-white border border-gray-200 p-0.5 rounded-lg text-[11px] font-bold">
                      {(['Present', 'Absent', 'On Leave'] as const).map(st => (
                        <button
                          key={st}
                          onClick={() => handleUpdateAttendance(worker.id, st)}
                          className={`px-2 py-1 rounded transition ${
                            todayAtt?.status === st
                              ? st === 'Present' ? 'bg-emerald-600 text-white' : st === 'Absent' ? 'bg-red-600 text-white' : 'bg-amber-500 text-white'
                              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                    {confirmDeleteId === worker.id ? (
                      <div className="flex items-center gap-1.5 animate-pulse mt-1">
                        <button
                          onClick={() => handleDeleteWorker(worker.id)}
                          className="bg-red-600 hover:bg-red-700 text-white font-extrabold text-[9px] px-2 py-0.5 rounded cursor-pointer"
                        >
                          Confirm dismiss?
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
                        onClick={() => setConfirmDeleteId(worker.id)}
                        className="text-[10px] text-red-500 font-semibold hover:underline mt-1 bg-transparent border-none cursor-pointer self-start sm:self-auto"
                      >
                        Dismiss worker (हटाउनुहोस्)
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Worker task columns */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4">
          <h3 className="font-bold text-gray-950 text-sm pb-2 border-b border-gray-100 flex items-center gap-1.5">
            <CheckSquare className="w-5 h-5 text-sky-600" />
            <span>Active Duties Board (तोकिएको कार्य)</span>
          </h3>

          <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
            {state.workers.map(w => (
              <div key={w.id} className="space-y-2">
                <span className="text-xs font-extrabold text-gray-950 block border-b border-gray-100 pb-1">{w.name} duties:</span>
                {w.assignedTasks.length === 0 ? (
                  <p className="text-[11px] text-gray-400 italic">No task assigned today.</p>
                ) : (
                  <div className="space-y-1.5 text-xs font-semibold">
                    {w.assignedTasks.map((tVal, listIdx) => (
                      <div key={listIdx} className="bg-sky-50/50 border border-sky-100 text-sky-900 p-2.5 rounded-lg flex justify-between items-center gap-2">
                        <span>• {tVal}</span>
                        <button 
                          onClick={() => handleDeleteTask(w.id, listIdx)}
                          className="text-[10px] font-bold text-red-650 hover:text-red-800 transition"
                        >
                          ✕ Complete
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
