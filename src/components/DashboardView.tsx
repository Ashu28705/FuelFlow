/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  TrendingUp, Users, Fuel, DollarSign, PlusCircle, AlertCircle, 
  ArrowRight, ShieldAlert, Award, ChevronRight, Zap 
} from 'lucide-react';
import { Role } from '../types.js';

interface DashboardViewProps {
  user: any;
  dashboardData: any;
  stations: any[];
  reports: any[];
  loading: boolean;
  onNavigate: (tab: string) => void;
  onOpenReportModal: () => void;
  onOpenExpenseModal: () => void;
}

export function DashboardView({ 
  user, 
  dashboardData, 
  stations,
  reports,
  loading, 
  onNavigate, 
  onOpenReportModal, 
  onOpenExpenseModal 
}: DashboardViewProps) {
  
  const [selectedStationId, setSelectedStationId] = useState('all');

  if (loading || !dashboardData) {
    return (
      <div className="flex-1 p-8 bg-slate-900 flex justify-center items-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-semibold text-slate-400">Loading dynamic FuelFlow stats...</p>
        </div>
      </div>
    );
  }

  const { metrics, stationsComparison, workersPerformance } = dashboardData;

  const isOwner = user.role === 'owner' || user.role === 'admin';
  const isWorker = user.role === 'worker';

  // Compute active metrics dynamically if filtered
  const targetStation = stations.find(s => s.id === selectedStationId);
  const isFiltered = selectedStationId !== 'all';

  let displayTodayRevenue = metrics.todayRevenue;
  let displayMonthlyRevenue = metrics.monthlyRevenue;
  let displayFuelSold = metrics.totalFuelSold;
  let displayWorkers = metrics.activeWorkers;

  if (isFiltered) {
    const stationReports = reports.filter(r => r.stationId === selectedStationId);
    displayMonthlyRevenue = stationReports.reduce((sum, r) => sum + (r.grossIncome || 0), 0);
    displayTodayRevenue = Math.round(displayMonthlyRevenue / 15) || 0;
    displayFuelSold = stationReports.reduce((sum, r) => sum + (Number(r.petrolSalesLitres || 0) + Number(r.dieselSalesLitres || 0)), 0);
    displayWorkers = targetStation ? (targetStation.workerIds || []).length : 0;
  }

  return (
    <div className="flex-grow p-8 bg-slate-900 text-slate-100 font-sans overflow-y-auto space-y-8">
      {/* Greeting Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-6">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
            Welcome Back, {user.name} <Zap className="w-5 h-5 text-amber-400" />
          </h2>
          <p className="text-slate-400 text-xs mt-1">
            Role: <span className="text-emerald-400 font-semibold uppercase">{user.role}</span> | Managing live pumps and sales consolidated.
          </p>
        </div>
        
        {/* Hub Selector */}
        {isOwner && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg">
            <span className="text-[10px] uppercase font-extrabold text-slate-500 font-mono shrink-0">Workspace Hub:</span>
            <select
              id="dash-station-dropdown-filter"
              value={selectedStationId}
              onChange={e => setSelectedStationId(e.target.value)}
              className="bg-transparent border-none text-xs font-bold text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="all">Consolidated Hub (All Stations)</option>
              {stations.map(st => (
                <option key={st.id} value={st.id}>{st.name}</option>
              ))}
            </select>
          </div>
        )}

        {/* Quick Action buttons */}
        <div className="flex gap-3">
          {isWorker && (
            <button
              id="dash-btn-record-shift"
              onClick={onOpenReportModal}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-lg flex items-center gap-2 shadow-lg transition"
            >
              <PlusCircle className="w-4 h-4" /> Record New Shift Sales
            </button>
          )}
          {isOwner && (
            <>
              <button
                id="dash-btn-add-station"
                onClick={() => onNavigate('stations')}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-lg flex items-center gap-2 shadow-lg transition"
              >
                <PlusCircle className="w-4 h-4" /> Add Station
              </button>
              <button
                id="dash-btn-log-expense"
                onClick={onOpenExpenseModal}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs rounded-lg flex items-center gap-2 transition"
              >
                <PlusCircle className="w-4 h-4" /> Log Expense
              </button>
            </>
          )}
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Card 1 */}
        <div className="p-6 bg-slate-950 border border-slate-800/80 rounded-xl flex items-center justify-between relative overflow-hidden">
          <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 w-20 h-20 bg-emerald-500/5 rounded-full pointer-events-none"></div>
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              {isFiltered ? 'Station Today Sales' : "Today's Revenue"}
            </span>
            <span className="text-2xl font-black text-white">${displayTodayRevenue.toLocaleString()}</span>
            <span className="text-[10px] text-emerald-400 font-semibold block mt-1.5 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> Live pump aggregates
            </span>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-lg">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2 */}
        <div className="p-6 bg-slate-950 border border-slate-800/80 rounded-xl flex items-center justify-between relative overflow-hidden">
          <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 w-20 h-20 bg-indigo-500/5 rounded-full pointer-events-none"></div>
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              {isFiltered ? 'Station Yield Gross' : 'Consolidated Gross'}
            </span>
            <span className="text-2xl font-black text-white">${displayMonthlyRevenue.toLocaleString()}</span>
            <span className="text-[10px] text-indigo-400 font-semibold block mt-1.5">
              Accumulated sales data
            </span>
          </div>
          <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-lg">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3 */}
        <div className="p-6 bg-slate-950 border border-slate-800/80 rounded-xl flex items-center justify-between relative overflow-hidden">
          <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 w-20 h-10 bg-emerald-500/5 rounded-full pointer-events-none"></div>
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Fuel Sales Litres</span>
            <span className="text-2xl font-black text-white">{displayFuelSold.toLocaleString()} Ltr</span>
            <span className="text-[10px] text-emerald-400 font-semibold block mt-1.5">
              Petrol & Diesel composite
            </span>
          </div>
          <div className="p-3 bg-teal-500/10 text-teal-400 rounded-lg">
            <Fuel className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4 */}
        <div className="p-6 bg-slate-950 border border-slate-800/80 rounded-xl flex items-center justify-between relative overflow-hidden">
          <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 w-20 h-20 bg-amber-500/5 rounded-full pointer-events-none"></div>
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              {isFiltered ? 'Assigned Field Crews' : 'Active Station Workers'}
            </span>
            <span className="text-2xl font-black text-white">{displayWorkers}</span>
            <span className="text-[10px] text-amber-400 font-semibold block mt-1.5">
              Field crews operating pumps
            </span>
          </div>
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-lg">
            <Users className="w-6 h-6" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Section left: Comparative leaderboard stations */}
        <div className="p-6 bg-slate-950 border border-slate-800 rounded-xl space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Multi-Station Comparative Sales</h3>
              <p className="text-[11px] text-slate-400">Total revenue generated by pump installation</p>
            </div>
            {isOwner && (
              <button 
                id="dash-go-stations"
                onClick={() => onNavigate('stations')} 
                className="text-xs text-emerald-400 hover:underline flex items-center gap-1 font-semibold"
              >
                Manage Hub <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="space-y-3">
            {stationsComparison && stationsComparison.length > 0 ? (
              stationsComparison.map((st: any, index: number) => (
                <div key={st.stationId} className="p-4 bg-slate-900/60 border border-slate-800/60 hover:border-slate-700/60 rounded-lg flex items-center justify-between transition">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-slate-500 text-xs w-4">#{index + 1}</span>
                    <div>
                      <h4 className="text-xs font-bold text-slate-200">{st.name}</h4>
                      <p className="text-[10px] text-slate-500">
                        Pumps: {st.workersCount} Assigned | {st.fuelSoldLitres.toLocaleString()} Ltr Sold
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-xs text-emerald-400">${st.revenue.toLocaleString()}</span>
                    <span className="text-[9px] text-slate-500 block">Gross Yield</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-slate-500 text-xs py-4 text-center">No stations logged in platform yet.</p>
            )}
          </div>
        </div>

        {/* Section right: Workers performance records */}
        <div className="p-6 bg-slate-950 border border-slate-800 rounded-xl space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Shifts Operations Roster</h3>
              <p className="text-[11px] text-slate-400">Worker sales logged & shift completions</p>
            </div>
            {isOwner && (
              <button 
                id="dash-go-workers"
                onClick={() => onNavigate('workers')} 
                className="text-xs text-emerald-400 hover:underline flex items-center gap-1 font-semibold"
              >
                Workers Index <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="space-y-3">
            {workersPerformance && workersPerformance.length > 0 ? (
              workersPerformance.slice(0, 3).map((wk: any) => (
                <div key={wk.workerId} className="p-3 bg-slate-900/40 border border-slate-800/80 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img 
                      src={wk.profileImage || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'} 
                      alt="" 
                      className="w-8 h-8 rounded-full border border-slate-800 object-cover" 
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <h4 className="text-xs font-bold text-slate-300">{wk.name}</h4>
                      <p className="text-[10px] text-slate-500">{wk.shiftsCompleted} pump shifts recorded</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-indigo-400">${wk.revenueLogged.toLocaleString()}</span>
                    <span className="text-[9px] text-slate-500 block">Coordinated Sales</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-slate-400 text-xs py-4 text-center">No worker rosters registered yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
