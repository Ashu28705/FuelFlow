/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Users, UserCheck, Calendar, DollarSign, Plus, Award, 
  MapPin, Clock, X, ChevronDown, Check, ShieldAlert, CheckCircle2, UserPlus 
} from 'lucide-react';

interface WorkersViewProps {
  user: any;
  workersList: any[];
  stations: any[];
  onRefresh: () => void;
  toast: (msg: string, type: 'success' | 'danger') => void;
  token: string;
}

export function WorkersView({ user, workersList, stations, onRefresh, toast, token }: WorkersViewProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedWorkerId, setSelectedWorkerId] = useState<string | null>(null);
  
  // Registration form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('worker123'); // seed helper
  const [phone, setPhone] = useState('');
  const [stationId, setStationId] = useState('');
  const [salary, setSalary] = useState(3000);

  // Attendance logging state
  const [attendanceDate, setAttendanceDate] = useState(() => new Date().toISOString().split('T')[0]);

  const isOwner = user.role === 'owner' || user.role === 'admin' || user.role === 'manager';

  const handleRegisterWorker = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast('Worker name, email and access passwords are required', 'danger');
      return;
    }

    try {
      // Step 1: Register User as worker
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name,
          email,
          password,
          role: 'worker',
          phone,
          assignedStationId: stationId
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Worker registration failed');

      toast('New field worker registered successfully in directory!', 'success');
      setShowAddModal(false);
      setName('');
      setEmail('');
      setPhone('');
      setSalary(3000);
      onRefresh();
    } catch (err: any) {
      toast(err.message, 'danger');
    }
  };

  const handleLogAttendance = async (wkId: string, status: 'Present' | 'Absent' | 'Leave') => {
    try {
      const res = await fetch(`/api/workers/${wkId}/attendance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          date: attendanceDate,
          status
        })
      });
      if (!res.ok) throw new Error('Failed to update shifts attendance');
      toast(`Marked as ${status} successfully for ${attendanceDate}`, 'success');
      onRefresh();
    } catch (err: any) {
      toast(err.message, 'danger');
    }
  };

  return (
    <div className="flex-grow p-8 bg-slate-900 text-slate-100 font-sans overflow-y-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-6">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-400" /> Active Workers & Field Crews directory
          </h2>
          <p className="text-slate-400 text-xs">Manage station payrolls, verify daily work registers, and trigger interactive attendance loggers.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Quick Date Picker for attendance logs */}
          <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <input
              id="attendance-date-select"
              type="date"
              value={attendanceDate}
              onChange={e => setAttendanceDate(e.target.value)}
              className="bg-transparent text-[11px] font-bold text-slate-300 border-none outline-none focus:ring-0"
            />
          </div>

          {isOwner && (
            <button
              id="worker-btn-add-worker"
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-lg flex items-center gap-1.5 shadow-lg transition"
            >
              <UserPlus className="w-4 h-4" /> Add Field Worker
            </button>
          )}
        </div>
      </div>

      {/* Grid Workers list */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {workersList.map(wk => {
          const u = wk.user;
          const st = wk.station;
          if (!u) return null;

          const currentStatus = wk.attendance[attendanceDate] || 'Unmarked';

          return (
            <div key={u.id} className="p-5 bg-slate-950 border border-slate-800/80 rounded-xl relative overflow-hidden flex flex-col justify-between">
              <div className="space-y-4">
                {/* Header Card avatar */}
                <div className="flex items-center gap-3">
                  <img 
                    src={u.profileImage || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150'} 
                    alt="" 
                    className="w-10 h-10 rounded-full object-cover border border-slate-800"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <h3 className="text-sm font-bold text-white tracking-tight">{u.name}</h3>
                    <p className="text-[10px] text-slate-400">{u.email}</p>
                  </div>
                </div>

                {/* Performance stats */}
                <div className="p-3 bg-slate-900 border border-slate-900 rounded-lg text-xs space-y-1.5 text-slate-400">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Contact:</span>
                    <span className="text-slate-200 font-semibold">{u.phone || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Assigned Station:</span>
                    <span className="text-emerald-400 font-bold max-w-[150px] truncate">{st ? st.name : 'Unallocated'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Base Salary Rate:</span>
                    <span className="text-white font-semibold">${wk.salary || 3200}/mo</span>
                  </div>
                </div>

                {/* Attendance Tracker */}
                <div className="border-t border-slate-900 pt-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] uppercase font-bold text-slate-500">Attendance ({attendanceDate}):</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                      currentStatus === 'Present' ? 'bg-emerald-500/10 text-emerald-400' :
                      currentStatus === 'Absent' ? 'bg-rose-500/10 text-rose-400' :
                      currentStatus === 'Leave' ? 'bg-amber-500/10 text-amber-400' : 'bg-slate-900 text-slate-400'
                    }`}>
                      {currentStatus}
                    </span>
                  </div>

                  {isOwner && (
                    <div className="grid grid-cols-3 gap-1.5">
                      <button
                        id={`mark-present-${u.id}`}
                        onClick={() => handleLogAttendance(u.id, 'Present')}
                        className="py-1 bg-emerald-500/5 hover:bg-emerald-500/15 border border-emerald-500/15 text-emerald-400 text-[10px] font-bold rounded transition"
                      >
                        Present
                      </button>
                      <button
                        id={`mark-absent-${u.id}`}
                        onClick={() => handleLogAttendance(u.id, 'Absent')}
                        className="py-1 bg-red-500/5 hover:bg-red-500/15 border border-red-500/15 text-red-400 text-[10px] font-bold rounded transition"
                      >
                        Absent
                      </button>
                      <button
                        id={`mark-leave-${u.id}`}
                        onClick={() => handleLogAttendance(u.id, 'Leave')}
                        className="py-1 bg-amber-500/5 hover:bg-amber-500/15 border border-amber-500/15 text-amber-500 text-[10px] font-bold rounded transition"
                      >
                        Leave
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* modal - Add Direct worker register */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex justify-center items-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 relative">
            <button id="wk-add-close" onClick={() => setShowAddModal(false)} className="absolute top-4 right-4 text-slate-500 hover:text-white">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-base font-bold text-white mb-4">Register Station Worker</h3>
            <form onSubmit={handleRegisterWorker} className="space-y-4">
              <div>
                <label className="block text-xs uppercase text-slate-400 font-bold mb-1">Full Worker Name</label>
                <input
                  id="worker-name-inputs"
                  type="text"
                  required
                  placeholder="e.g. John Miller"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-emerald-500 animate-none"
                />
              </div>

              <div>
                <label className="block text-xs uppercase text-slate-400 font-bold mb-1">Login Email Address</label>
                <input
                  id="worker-email-inputs"
                  type="email"
                  required
                  placeholder="john@fuelflow.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <div className="flex justify-between">
                  <label className="block text-xs uppercase text-slate-400 font-bold mb-1">Access Password</label>
                  <span className="text-[10px] text-slate-500 italic">Pre-filled default</span>
                </div>
                <input
                  id="worker-pwd-inputs"
                  type="text"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs uppercase text-slate-400 font-bold mb-1">Worker Contact Phone</label>
                <input
                  id="worker-phone-inputs"
                  type="text"
                  placeholder="+1 555-0105"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs uppercase text-slate-400 font-bold mb-1">Select Station Assignment</label>
                <select
                  id="worker-station-inputs"
                  value={stationId}
                  onChange={e => setStationId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                >
                  <option value="">No station allocated</option>
                  {stations.map(st => (
                    <option key={st.id} value={st.id}>{st.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs uppercase text-slate-400 font-bold mb-1">Wages Salary Rate ($3000 default)</label>
                <input
                  id="worker-sal-inputs"
                  type="number"
                  value={salary}
                  onChange={e => setSalary(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <button
                id="worker-register-submit"
                type="submit"
                className="w-full py-2 bg-emerald-500 text-slate-950 font-bold text-xs rounded-lg shadow-lg hover:bg-emerald-400 transition transform mt-2 text-center"
              >
                Register & Provision Credentials
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
