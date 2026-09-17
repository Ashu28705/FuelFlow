/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, BarChart3, Brain, SearchCheck, UploadCloud, Cpu, 
  ChevronRight, Sparkles, RefreshCw, AlertCircle, FileText, BrainCircuit, Upload, HelpCircle, Eye 
} from 'lucide-react';
// Recharts imports
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, BarChart, Bar, Legend 
} from 'recharts';

interface AnalyticsViewProps {
  user: any;
  dashboardData: any;
  loading: boolean;
  onRefresh: () => void;
  toast: (msg: string, type: 'success' | 'danger') => void;
  token: string;
}

const COLORS = ['#10b981', '#6366f1', '#f59e0b', '#ec4899', '#3b82f6'];

export function AnalyticsView({ user, dashboardData, loading, onRefresh, toast, token }: AnalyticsViewProps) {
  // Forecaster states
  const [forecasting, setForecasting] = useState(false);
  const [forecastResult, setForecastResult] = useState<any>(null);

  // Bill Scanner states
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);
  const [dragActive, setDragActive] = useState(false);

  // Trigger Gemini AI Forecasting
  const handleTriggerForecast = async () => {
    setForecasting(true);
    setForecastResult(null);
    try {
      const res = await fetch('/api/analytics/forecast', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Forecasting failed');
      setForecastResult(data);
      toast('AI forecasting complete!', 'success');
    } catch (err: any) {
      toast(err.message, 'danger');
    } finally {
      setForecasting(false);
    }
  };

  // Convert uploaded image to base64 and trigger OCR API scanning
  const handleUploadAndScan = async (file: File) => {
    if (!file) return;
    setScanning(true);
    setScanResult(null);
    toast('Converting invoice paper texture and dispatching to scanner...', 'success');

    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64Str = (reader.result as string).split(',')[1];
        const res = await fetch('/api/analytics/ocr-bill', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            base64Image: base64Str,
            mimeType: file.type
          })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Invoice analysis failed');
        setScanResult(data);
        toast('OCR receipt scan finished fully!', 'success');
      };
    } catch (err: any) {
      toast(err.message, 'danger');
    } finally {
      setScanning(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUploadAndScan(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleUploadAndScan(e.target.files[0]);
    }
  };

  if (loading || !dashboardData) {
    return (
      <div className="flex-1 p-8 bg-slate-900 flex justify-center items-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-semibold text-slate-400">Rendering high-performance charts...</p>
        </div>
      </div>
    );
  }

  const { chartData, pieData } = dashboardData;

  return (
    <div className="flex-grow p-8 bg-slate-900 text-slate-100 font-sans overflow-y-auto space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-slate-800 pb-6">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-400" /> Advanced Analytics Control Plane
          </h2>
          <p className="text-slate-400 text-xs">High-performance Recharts trends, interactive Gemini AI forecasting, and real-time OCR logistics scanners.</p>
        </div>
        <button 
          id="analytics-btn-refresh"
          onClick={onRefresh} 
          className="p-2.5 bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-300 rounded-lg transition"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Area Chart: Revenue vs Expenses */}
        <div className="lg:col-span-2 p-6 bg-slate-950 border border-slate-800/80 rounded-2xl space-y-4">
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Weekly Revenue vs Expenses Flow</h3>
            <p className="text-[10px] text-slate-500">Gross sales outcomes vs field expenditures logged</p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ec4899" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#ec4899" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b"/>
                <XAxis dataKey="date" stroke="#64748b" fontSize={11}/>
                <YAxis stroke="#64748b" fontSize={11}/>
                <Tooltip contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b' }} />
                <Area type="monotone" dataKey="Revenue" stroke="#10b981" fillOpacity={1} fill="url(#colorRev)" strokeWidth={2}/>
                <Area type="monotone" dataKey="Expenses" stroke="#ec4899" fillOpacity={1} fill="url(#colorExp)" strokeWidth={2}/>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expenses Category breakdown */}
        <div className="p-6 bg-slate-950 border border-slate-800/80 rounded-2xl flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Expenses Distribution</h3>
            <p className="text-[10px] text-slate-500">Breakdown of operational capital outlays</p>
          </div>
          {pieData && pieData.length > 0 ? (
            <>
              <div className="h-44 relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              {/* Legend */}
              <div className="space-y-1.5 border-t border-slate-900 pt-3">
                {pieData.map((d: any, index: number) => (
                  <div key={d.name} className="flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                      <span className="text-slate-300 font-semibold">{d.name}</span>
                    </div>
                    <span className="font-mono text-white font-bold">${d.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex-1 py-12 flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800/60 flex items-center justify-center">
                <HelpCircle className="w-6 h-6 text-slate-600" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-300">No active expense data</p>
                <p className="text-[10px] text-slate-500 max-w-[200px] mx-auto mt-0.5">Submit sales reports enclosing local station expenses to populate this breakdown.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Advanced AI Features Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Module A: Gemini AI Forecasting */}
        <div className="p-6 bg-slate-950 border border-slate-800/80 rounded-2xl flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-bold rounded-full uppercase inline-block">
                Predictive Analytics
              </span>
              <h3 className="text-sm font-extrabold text-white mt-1 flex items-center gap-2">
                <BrainCircuit className="w-4 h-4 text-emerald-400" /> Cognitive Revenue Forecast
              </h3>
            </div>
            <button
              id="btn-ai-predict"
              onClick={handleTriggerForecast}
              disabled={forecasting}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs rounded-lg shadow-lg flex items-center gap-2 transition"
            >
              {forecasting ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
                  Processing API...
                </>
              ) : (
                'Trigger Forecast'
              )}
            </button>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed text-left">
            Instruct custom regression models or call Gemini on core sales history vectors to project revenue thresholds.
          </p>

          <div className="flex-grow flex items-center justify-center p-6 bg-slate-900/60 border border-slate-900 rounded-xl relative">
            {forecastResult ? (
              <div className="w-full space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
                    <span className="text-[10px] text-slate-500 block uppercase font-bold">Tomorrow Project</span>
                    <span className="text-xl font-black text-white">${forecastResult.tomorrowForecast.toLocaleString()}</span>
                    <span className="text-[9px] text-emerald-400 block mt-1 font-semibold">Ready for shift</span>
                  </div>
                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
                    <span className="text-[10px] text-slate-500 block uppercase font-bold">Weekly Accumulate</span>
                    <span className="text-xl font-black text-white">${forecastResult.weeklyForecast.toLocaleString()}</span>
                    <span className="text-[9px] text-indigo-400 block mt-1 font-semibold">Reliability: {forecastResult.confidenceCode}</span>
                  </div>
                </div>
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-left">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1">AI Analytical Comments:</span>
                  <p className="text-xs text-slate-300 leading-relaxed italic">"{forecastResult.analysisText}"</p>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-2">
                <div className="p-4 bg-slate-950/80 rounded-full w-max mx-auto border border-slate-800">
                  <BrainCircuit className="w-8 h-8 text-indigo-500" />
                </div>
                <p className="text-xs text-slate-500">Press the trigger forecast buttons to formulate AI outcomes.</p>
              </div>
            )}
          </div>
        </div>

        {/* Module B: OCR Bill Scanner */}
        <div className="p-6 bg-slate-950 border border-slate-800/80 rounded-2xl flex flex-col justify-between space-y-4">
          <div>
            <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-bold rounded-full uppercase inline-block">
              Intelligent OCR Scanner
            </span>
            <h3 className="text-sm font-extrabold text-white mt-1 flex items-center gap-2">
              <Upload className="w-4 h-4 text-emerald-400" /> Fuel Bill Scanner
            </h3>
            <p className="text-xs text-slate-400 mt-1 text-left">Drag and drop receipts or bill photos. Automatically extracts totals, fuel volumes, and records expenses.</p>
          </div>

          <div
            id="analytics-drop-zone"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`cursor-pointer border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center transition ${
              dragActive ? 'border-emerald-400 bg-emerald-500/5' : 'border-slate-800 hover:border-slate-700 bg-slate-900/40'
            }`}
          >
            <input
              id="file-scan-upload"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <label htmlFor="file-scan-upload" className="cursor-pointer text-center space-y-2 block">
              <Upload className="w-8 h-8 text-slate-500 mx-auto" />
              <p className="text-xs font-bold text-slate-300">Click to Select Invoice receipt file</p>
              <p className="text-[10px] text-slate-500">Supports PNG, JPG (Max 5MB)</p>
            </label>
          </div>

          {/* Results preview */}
          {scanning && (
            <div className="flex items-center gap-2 py-2 text-indigo-400 text-xs font-semibold justify-center">
              <span className="w-3.5 h-3.5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"></span>
              Scanning invoice parameters...
            </div>
          )}

          {scanResult && !scanning && (
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg text-xs space-y-2 text-left">
              <div className="flex justify-between border-b border-slate-800 pb-1.5 text-emerald-400">
                <span className="font-bold uppercase text-[10px]">Extracted Invoice Value:</span>
                <span className="font-black text-sm">${scanResult.value}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-1.5">
                <span className="text-slate-500 uppercase text-[10px]">Extracted Volume:</span>
                <span className="font-semibold text-slate-200">{scanResult.litres} Litres</span>
              </div>
              <div>
                <span className="text-slate-500 uppercase text-[10px] block">Extract Notes:</span>
                <p className="text-slate-300 italic text-[11px] mt-0.5">"{scanResult.notes}"</p>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
