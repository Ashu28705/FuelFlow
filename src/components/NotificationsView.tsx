/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Bell, Check, Trash2, Calendar, AlertTriangle, UserPlus, FileCheck } from 'lucide-react';

interface NotificationsViewProps {
  notifications: any[];
  onMarkRead: (id: string) => void;
  onRefresh: () => void;
  token: string;
}

export function NotificationsView({ notifications, onMarkRead, onRefresh, token }: NotificationsViewProps) {
  return (
    <div className="flex-grow p-8 bg-slate-900 text-slate-100 font-sans overflow-y-auto space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-slate-800 pb-6">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight text-white flex items-center gap-2">
            <Bell className="w-5 h-5 text-emerald-400" /> Platform Security Alerts & Notifications Logs
          </h2>
          <p className="text-slate-400 text-xs text-left">Real-time indicators corresponding to shift expense validations, revenue drops, or staff changes.</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto space-y-4">
        {notifications.length > 0 ? (
          notifications.map(not => {
            const isRead = not.status === 'read';
            const dateStr = new Date(not.createdAt).toLocaleDateString() + ' ' + new Date(not.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            
            return (
              <div 
                key={not.id} 
                className={`p-4 rounded-xl border flex items-start gap-4 transition relative overflow-hidden ${
                  isRead 
                    ? 'bg-slate-950/40 border-slate-900/80 text-slate-400' 
                    : 'bg-slate-950 border-slate-800 text-slate-100 shadow-md'
                }`}
              >
                {/* Visual indicators based on notification types */}
                {!isRead && <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-400"></div>}

                <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800 shrink-0">
                  {not.type === 'expense_alert' && <AlertTriangle className="w-5 h-5 text-rose-400" />}
                  {not.type === 'revenue_drop' && <AlertTriangle className="w-5 h-5 text-amber-500 animate-bounce" />}
                  {not.type === 'worker_added' && <UserPlus className="w-5 h-5 text-indigo-400" />}
                  {not.type === 'report_submitted' && <FileCheck className="w-5 h-5 text-emerald-400" />}
                  {!not.type && <Bell className="w-5 h-5 text-slate-400" />}
                </div>

                <div className="flex-grow space-y-1">
                  <div className="flex justify-between items-start gap-2">
                    <h3 className={`text-xs font-bold ${isRead ? 'text-slate-400' : 'text-white'}`}>{not.title}</h3>
                    <span className="text-[10px] text-slate-500 font-mono whitespace-nowrap">{dateStr}</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed text-left">{not.message}</p>
                </div>

                {!isRead && (
                  <button 
                    id={`not-read-btn-${not.id}`}
                    onClick={() => onMarkRead(not.id)}
                    className="p-1.5 hover:bg-slate-900 rounded-lg text-emerald-400 hover:text-emerald-300 transition shrink-0"
                    title="Mark as Read"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                )}
              </div>
            );
          })
        ) : (
          <div className="p-12 text-center text-slate-500 bg-slate-950 border border-slate-855 rounded-2xl flex flex-col items-center gap-3">
            <Bell className="w-8 h-8 text-slate-600" />
            <p className="text-xs font-semibold">No notifications logged in current shift cycle.</p>
          </div>
        )}
      </div>
    </div>
  );
}
