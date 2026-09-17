/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Fuel, LayoutDashboard, Construction, Users, FileSpreadsheet, 
  BarChart3, Bell, User as UserIcon, LogOut, Settings 
} from 'lucide-react';
import { Role } from '../types.js';

interface SidebarProps {
  currentTab: string;
  userRole: Role;
  unreadCount: number;
  onNavigate: (tab: string) => void;
  onLogout: () => void;
}

export function Sidebar({ currentTab, userRole, unreadCount, onNavigate, onLogout }: SidebarProps) {
  // Navigation tabs config based on roles
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'owner', 'manager', 'worker'] },
    { id: 'stations', label: 'Stations Hub', icon: Construction, roles: ['admin', 'owner', 'manager'] },
    { id: 'workers', label: 'Workers Index', icon: Users, roles: ['admin', 'owner', 'manager'] },
    { id: 'reports', label: 'Sales Reports', icon: FileSpreadsheet, roles: ['admin', 'owner', 'manager', 'worker'] },
    { id: 'analytics', label: 'Advanced Analytics', icon: BarChart3, roles: ['admin', 'owner'] },
    { id: 'notifications', label: 'Alerts Logs', icon: Bell, roles: ['admin', 'owner', 'manager', 'worker'], badge: unreadCount },
    { id: 'profile', label: 'Access Profile', icon: UserIcon, roles: ['admin', 'owner', 'manager', 'worker'] }
  ];

  const filteredMenu = menuItems.filter(item => item.roles.includes(userRole));

  return (
    <aside className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col shrink-0 text-slate-300">
      {/* Brand logo */}
      <div 
        id="sidebar-logo-brand"
        onClick={() => onNavigate('dashboard')} 
        className="p-6 border-b border-slate-900 flex items-center gap-3 cursor-pointer text-emerald-400"
      >
        <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
          <Fuel className="w-5 h-5 animate-pulse" />
        </div>
        <div>
          <h1 className="text-sm font-extrabold tracking-tight text-white leading-tight">FuelFlow SaaS</h1>
          <span className="text-[10px] text-slate-500 font-medium tracking-wide uppercase">Core Terminal</span>
        </div>
      </div>

      {/* Navigation items list */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {filteredMenu.map(item => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              id={`nav-tab-${item.id}`}
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition relative group ${
                isActive 
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 transition ${isActive ? 'text-emerald-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && item.badge > 0 && (
                <span className="px-1.5 py-0.5 bg-rose-500 text-white font-black text-[9px] rounded-full leading-none">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer / Logout */}
      <div className="p-4 border-t border-slate-900 bg-slate-950 flex flex-col gap-2">
        <button
          id="sidebar-btn-logout"
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition"
        >
          <LogOut className="w-4 h-4" />
          <span>Exit Account Portal</span>
        </button>
      </div>
    </aside>
  );
}
