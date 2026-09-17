/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  User as UserIcon, Phone, Mail, Shield, CheckCircle, 
  Settings, Languages, Smartphone, Database, RefreshCw, Layers 
} from 'lucide-react';

interface ProfileViewProps {
  user: any;
  token: string;
  onRefreshUser: () => void;
  toast: (msg: string, type: 'success' | 'danger') => void;
}

export function ProfileView({ user, token, onRefreshUser, toast }: ProfileViewProps) {
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone || '');
  const [profileImage, setProfileImage] = useState(user.profileImage || '');
  const [loading, setLoading] = useState(false);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  // Load audit logs if owner/admin
  const loadAuditLogs = async () => {
    if (user.role !== 'owner' && user.role !== 'admin') return;
    setLoadingLogs(true);
    try {
      const res = await fetch('/api/users/audit-logs', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setAuditLogs(data.slice(0, 10)); // Retrieve last 10 logs
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    loadAuditLogs();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/users/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name, phone, profileImage })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Profile update failed');
      toast('Profile updated successfully!', 'success');
      onRefreshUser();
    } catch (err: any) {
      toast(err.message, 'danger');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-grow p-8 bg-slate-900 text-slate-100 font-sans overflow-y-auto space-y-8">
      {/* Header */}
      <div className="border-b border-slate-800 pb-6">
        <h2 className="text-xl font-extrabold tracking-tight text-white flex items-center gap-2">
          <UserIcon className="w-5 h-5 text-emerald-400" /> My Access Profile & Settings
        </h2>
        <p className="text-slate-400 text-xs">Configure personal operator information and view enterprise system audit trails.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Profile Card Form */}
        <div className="p-6 bg-slate-950 border border-slate-800 rounded-2xl space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Configure Profile Parameters</h3>
          
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="flex items-center gap-4">
              <img 
                src={profileImage || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'} 
                alt="Profile Avatar" 
                className="w-16 h-16 rounded-full border border-slate-800 object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="flex-grow">
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Avatar Image URL</label>
                <input
                  id="profile-avatar-url"
                  type="text"
                  placeholder="https://images.unsplash.com/..."
                  value={profileImage}
                  onChange={e => setProfileImage(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Full Operator Name</label>
              <input
                id="profile-name"
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Primary Email Address</label>
              <input
                id="profile-email"
                type="email"
                disabled
                value={user.email}
                className="w-full px-3 py-2 bg-slate-900/60 border border-slate-800 rounded-lg text-xs text-slate-500 italic cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Contact Phone</label>
              <div className="relative">
                <Phone className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-500" />
                <input
                  id="profile-phone"
                  type="text"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <button
              id="profile-submit-btn"
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-emerald-500 text-slate-950 font-bold text-xs rounded-lg hover:bg-emerald-400 transition"
            >
              {loading ? 'Saving...' : 'Update Profile'}
            </button>
          </form>
        </div>

        {/* Enterprise System Audit Trails */}
        {(user.role === 'owner' || user.role === 'admin') && (
          <div className="p-6 bg-slate-950 border border-slate-800 rounded-2xl flex flex-col justify-between space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Operator Audit Logs</h3>
                <p className="text-[10px] text-slate-500">Traceable database updates checklist</p>
              </div>
              <button 
                id="audit-ref-btn"
                onClick={loadAuditLogs} 
                className="p-1 px-2 border border-slate-800 hover:border-slate-700 bg-slate-900 text-slate-400 hover:text-white rounded flex items-center gap-1 text-[10px] font-bold"
              >
                <RefreshCw className="w-3 h-3" /> Refresh
              </button>
            </div>

            <div className="flex-1 overflow-y-auto max-h-[300px] space-y-2.5 pr-1">
              {loadingLogs ? (
                <p className="text-xs text-slate-500 text-center py-6 animate-pulse">Retrieving audit keys...</p>
              ) : auditLogs.length > 0 ? (
                auditLogs.map(log => {
                  const dateStr = new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  return (
                    <div key={log.id} className="p-3 bg-slate-900 border border-slate-900 rounded-lg text-[11px] flex justify-between items-start">
                      <div>
                        <span className="font-bold text-slate-300 block">{log.action}</span>
                        <span className="text-slate-500 text-[10px]">Actor: {log.userName} ({log.userRole})</span>
                        <p className="text-slate-400 mt-1">{log.details}</p>
                      </div>
                      <span className="text-slate-600 font-mono text-[9px] whitespace-nowrap">{dateStr}</span>
                    </div>
                  );
                })
              ) : (
                <p className="text-xs text-slate-500 text-center py-6">No audits registered in current session.</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Bonus platform configurations */}
      <div className="p-6 bg-slate-950 border border-slate-800 rounded-2xl">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Bonus Capabilities configurations</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-slate-900/60 border border-slate-850 rounded-xl flex items-start gap-3">
            <Languages className="w-5 h-5 text-indigo-400 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-white mb-1">Multi-Language Support</h4>
              <p className="text-[10px] text-slate-500">Auto-detecting English, Spanish, and French terminal frameworks based on browser preferences.</p>
              <span className="px-1.5 py-0.5 bg-slate-950 border border-slate-800 text-emerald-400 font-bold text-[9px] rounded block w-max mt-2">Active: English (US)</span>
            </div>
          </div>

          <div className="p-4 bg-slate-900/60 border border-slate-850 rounded-xl flex items-start gap-3">
            <Smartphone className="w-5 h-5 text-emerald-400 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-white mb-1">PWA Manifest Support</h4>
              <p className="text-[10px] text-slate-500">Ready for offline service operations caching. Install FuelFlow safely to your home screen.</p>
              <span className="px-1.5 py-0.5 bg-slate-950 border border-slate-800 text-emerald-400 font-bold text-[9px] rounded block w-max mt-2">PWA Status: Compliant</span>
            </div>
          </div>

          <div className="p-4 bg-slate-900/60 border border-slate-850 rounded-xl flex items-start gap-3">
            <Database className="w-5 h-5 text-amber-400 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-white mb-1">Cloud Database Mode</h4>
              <p className="text-[10px] text-slate-500">Operating in automatic offline caching mode with highly durable file persistence.</p>
              <span className="px-1.5 py-0.5 bg-slate-950 border border-slate-800 text-slate-400 font-bold text-[9px] rounded block w-max mt-2">Local File DB Cache</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
