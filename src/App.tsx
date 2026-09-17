/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

const socket = io({
  autoConnect: false
});
import { Sidebar } from './components/Sidebar.js';
import { DashboardView } from './components/DashboardView.js';
import { StationsView } from './components/StationsView.js';
import { WorkersView } from './components/WorkersView.js';
import { ReportsView } from './components/ReportsView.js';
import { AnalyticsView } from './components/AnalyticsView.js';
import { NotificationsView } from './components/NotificationsView.js';
import { ProfileView } from './components/ProfileView.js';
import { AuthViews } from './components/AuthViews.js';
import { LandingView } from './components/LandingView.js';
import { 
  Fuel, ShieldAlert, AlertCircle, X, CheckSquare, Plus, FileText, UploadCloud 
} from 'lucide-react';

export default function App() {
  const [token, setToken] = useState<string>(() => localStorage.getItem('fuelflow_token') || '');
  const [user, setUser] = useState<any>(() => {
    try {
      const saved = localStorage.getItem('fuelflow_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [currentTab, setCurrentTab] = useState<string>('landing');
  const [toastMessage, setToastMessage] = useState<{ message: string; type: 'success' | 'danger' } | null>(null);

  // Core backend stats states
  const [stations, setStations] = useState<any[]>([]);
  const [workersList, setWorkersList] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [dashboardData, setDashboardData] = useState<any>(null);
  
  // Loading flags
  const [loading, setLoading] = useState(false);

  // Modal dialog toggles
  const [showReportModal, setShowReportModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);

  // Report Form Field elements
  const [stationId, setStationId] = useState('');
  const [petrolLitres, setPetrolLitres] = useState('');
  const [petrolValue, setPetrolValue] = useState('');
  const [dieselLitres, setDieselLitres] = useState('');
  const [dieselValue, setDieselValue] = useState('');
  const [expenses, setExpenses] = useState('');
  const [cashCollection, setCashCollection] = useState('');
  const [onlinePayments, setOnlinePayments] = useState('');
  const [notes, setNotes] = useState('');
  const [billImage, setBillImage] = useState('');
  const [billFileName, setBillFileName] = useState('');

  // Payment management breakdown states
  const [paymentCash, setPaymentCash] = useState('');
  const [paymentUpi, setPaymentUpi] = useState('');
  const [paymentCard, setPaymentCard] = useState('');
  const [paymentCredit, setPaymentCredit] = useState('');

  // Expense Form elements
  const [expenseCategory, setExpenseCategory] = useState('Utilities');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseStationId, setExpenseStationId] = useState('');

  // Toast dispatch
  const toast = (message: string, type: 'success' | 'danger') => {
    setToastMessage({ message, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Automate fuel price calculation over selected station
  const curStation = stations.find(s => s.id === stationId);
  const petrolPrice = curStation ? (curStation.petrolPrice || 3.45) : 3.45;
  const dieselPrice = curStation ? (curStation.dieselPrice || 3.85) : 3.85;

  useEffect(() => {
    if (stationId && curStation) {
      if (petrolLitres) {
        setPetrolValue(String(Math.round(Number(petrolLitres) * petrolPrice * 100) / 100));
      } else {
        setPetrolValue('');
      }
    }
  }, [petrolLitres, stationId, petrolPrice]);

  useEffect(() => {
    if (stationId && curStation) {
      if (dieselLitres) {
        setDieselValue(String(Math.round(Number(dieselLitres) * dieselPrice * 100) / 100));
      } else {
        setDieselValue('');
      }
    }
  }, [dieselLitres, stationId, dieselPrice]);

  // Redirect on load if already authenticated, or keep on landing
  useEffect(() => {
    if (token && user) {
      setCurrentTab('dashboard');
    }
  }, [token, user]);

  // Load and sync all backend collections
  const loadPlatformData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const headers = { 'Authorization': `Bearer ${token}` };

      // Parallelize fetches for maximum performance
      const [stRes, wkRes, repRes, notRes, dbRes] = await Promise.all([
        fetch('/api/stations', { headers }),
        fetch('/api/workers', { headers }),
        fetch('/api/reports', { headers }),
        fetch('/api/notifications', { headers }),
        fetch('/api/analytics/dashboard', { headers })
      ]);

      const [stData, wkData, repData, notData, dbData] = await Promise.all([
        stRes.json(),
        wkRes.json(),
        repRes.json(),
        notRes.json(),
        dbRes.json()
      ]);

      if (stRes.ok) setStations(stData);
      if (wkRes.ok) setWorkersList(wkData);
      if (repRes.ok) setReports(repData);
      if (notRes.ok) setNotifications(notData);
      if (dbRes.ok) setDashboardData(dbData);

    } catch (e: any) {
      toast('Network connection sync exception', 'danger');
    } finally {
      setLoading(false);
    }
  };

  // Sync automatically upon authentication and instantiate real-time Socket.io channels
  useEffect(() => {
    if (token) {
      loadPlatformData();
      socket.connect();

      const handleNotification = (newNot: any) => {
        setNotifications((prev) => [newNot, ...prev]);
        toast(`Live Broadcast: ${newNot.title}`, 'success');
        loadPlatformData();
      };

      const handleReport = (data: any) => {
        toast(`Real-time update: Worker submitted shift sales report grossing $${data.computedGrossIncome}!`, 'success');
        loadPlatformData();
      };

      const handlePrice = (updatedSt: any) => {
        toast(`Pricing changed for ${updatedSt.name}! Petrol: $${updatedSt.petrolPrice}/L, Diesel: $${updatedSt.dieselPrice}/L`, 'success');
        setStations((prev) => prev.map((s) => (s.id === updatedSt.id ? updatedSt : s)));
        loadPlatformData();
      };

      const handlePayment = (newPay: any) => {
        toast(`Income transaction logged: Received $${newPay.amount} via ${newPay.paymentMethod}`, 'success');
        loadPlatformData();
      };

      socket.on('notification_added', handleNotification);
      socket.on('report_submitted', handleReport);
      socket.on('price_updated', handlePrice);
      socket.on('payment_recorded', handlePayment);

      return () => {
        socket.off('notification_added', handleNotification);
        socket.off('report_submitted', handleReport);
        socket.off('price_updated', handlePrice);
        socket.off('payment_recorded', handlePayment);
        socket.disconnect();
      };
    } else {
      socket.disconnect();
    }
  }, [token]);

  // Handle successful logins/signups
  const handleLoginSuccess = (newToken: string, newUser: any) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('fuelflow_token', newToken);
    localStorage.setItem('fuelflow_user', JSON.stringify(newUser));
    setCurrentTab('dashboard');
  };

  const handleLogout = () => {
    setToken('');
    setUser(null);
    localStorage.removeItem('fuelflow_token');
    localStorage.removeItem('fuelflow_user');
    setCurrentTab('landing');
    toast('Logged out cleanly from platform', 'success');
  };

  const handleRefreshUser = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/users/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data);
        localStorage.setItem('fuelflow_user', JSON.stringify(data));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkNotificationRead = async (id: string) => {
    try {
      const res = await fetch(`/api/notifications/${id}/read`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, status: 'read' } : n));
        // Refresh dashboard data to adjust counts
        loadPlatformData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Submit worker daily sales report
  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stationId) {
      toast('Please designate target fuel station plaza', 'danger');
      return;
    }

    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          stationId,
          petrolSalesLitres: petrolLitres,
          petrolSalesValue: petrolValue,
          dieselSalesLitres: dieselLitres,
          dieselSalesValue: dieselValue,
          expenses,
          cashCollection: paymentCash || cashCollection,
          onlinePayments: Number(paymentUpi) + Number(paymentCard) + Number(paymentCredit) || onlinePayments,
          paymentBreakdown: {
            cash: Number(paymentCash) || 0,
            upi: Number(paymentUpi) || 0,
            card: Number(paymentCard) || 0,
            credit: Number(paymentCredit) || 0
          },
          notes,
          billImage,
          billFileName
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Submission failed');

      toast('Daily Shift sales logged & synchronized successfully!', 'success');
      setShowReportModal(false);
      // Reset form fields
      setPetrolLitres('');
      setPetrolValue('');
      setDieselLitres('');
      setDieselValue('');
      setExpenses('');
      setCashCollection('');
      setOnlinePayments('');
      setPaymentCash('');
      setPaymentUpi('');
      setPaymentCard('');
      setPaymentCredit('');
      setNotes('');
      setBillImage('');
      setBillFileName('');

      loadPlatformData();
    } catch (err: any) {
      toast(err.message, 'danger');
    }
  };

  // Register standalone expense
  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseAmount || !expenseStationId) {
      toast('Amount and Station ID selection are required', 'danger');
      return;
    }

    try {
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          category: expenseCategory,
          amount: expenseAmount,
          stationId: expenseStationId
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'logging expense rejected');
      }

      toast('Operating expense successfully logged!', 'success');
      setShowExpenseModal(false);
      setExpenseAmount('');
      loadPlatformData();
    } catch (err: any) {
      toast(err.message, 'danger');
    }
  };

  // Utility to convert bill image upload to local base64 preview inside Daily Reports modal
  const handleReportBillUploadChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setBillFileName(file.name);
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        setBillImage(reader.result as string);
        toast('Bill receipt texture attached!', 'success');
      };
    }
  };

  const unreadNotificationsCount = notifications.filter(n => n.status === 'unread').length;

  return (
    <div className="flex w-screen h-screen bg-slate-900 text-slate-100 overflow-hidden font-sans select-none relative">
      {/* Toast Notification indicator */}
      {toastMessage && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg border flex items-center gap-2 shadow-2xl animate-bounce ${
          toastMessage.type === 'success' 
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
            : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
        }`}>
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span className="text-xs font-bold">{toastMessage.message}</span>
          <button onClick={() => setToastMessage(null)} className="ml-2 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Render Authentication screen or standard client views portal */}
      {!token ? (
        currentTab === 'landing' ? (
          <LandingView onNavigate={setCurrentTab} />
        ) : (
          <AuthViews 
            view={currentTab as any} 
            onNavigate={setCurrentTab} 
            onLoginSuccess={handleLoginSuccess} 
            toast={toast} 
          />
        )
      ) : (
        <div className="flex w-full h-full">
          {/* Navigation Sidebar */}
          <Sidebar 
            currentTab={currentTab} 
            userRole={user ? user.role : 'worker'} 
            unreadCount={unreadNotificationsCount} 
            onNavigate={setCurrentTab} 
            onLogout={handleLogout} 
          />

          {/* Main workspace frame container */}
          <main className="flex-1 flex flex-col relative overflow-hidden bg-slate-900 border-l border-slate-950">
            {currentTab === 'dashboard' && (
              <DashboardView 
                user={user} 
                dashboardData={dashboardData} 
                stations={stations}
                reports={reports}
                loading={loading} 
                onNavigate={setCurrentTab} 
                onOpenReportModal={() => setShowReportModal(true)} 
                onOpenExpenseModal={() => setShowExpenseModal(true)} 
              />
            )}
            {currentTab === 'stations' && (
              <StationsView 
                user={user} 
                stations={stations} 
                workersList={workersList} 
                onRefresh={loadPlatformData} 
                toast={toast} 
                token={token} 
              />
            )}
            {currentTab === 'workers' && (
              <WorkersView 
                user={user} 
                workersList={workersList} 
                stations={stations} 
                onRefresh={loadPlatformData} 
                toast={toast} 
                token={token} 
              />
            )}
            {currentTab === 'reports' && (
              <ReportsView 
                user={user} 
                reports={reports} 
                stations={stations} 
                onRefresh={loadPlatformData} 
                toast={toast} 
                token={token} 
              />
            )}
            {currentTab === 'analytics' && (
              <AnalyticsView 
                user={user} 
                dashboardData={dashboardData} 
                loading={loading} 
                onRefresh={loadPlatformData} 
                toast={toast} 
                token={token} 
              />
            )}
            {currentTab === 'notifications' && (
              <NotificationsView 
                notifications={notifications} 
                onMarkRead={handleMarkNotificationRead} 
                onRefresh={loadPlatformData} 
                token={token} 
              />
            )}
            {currentTab === 'profile' && (
              <ProfileView 
                user={user} 
                token={token} 
                onRefreshUser={handleRefreshUser} 
                toast={toast} 
              />
            )}
          </main>
        </div>
      )}

      {/* Modal - RECORD DAILY SHIFT REPORT */}
      {showReportModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex justify-center items-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 relative flex flex-col max-h-[90vh]">
            <button id="report-modal-close" onClick={() => setShowReportModal(false)} className="absolute top-4 right-4 text-slate-500 hover:text-white">
              <X className="w-5 h-5" />
            </button>
            
            <h3 className="text-base font-bold text-white mb-1">Submit Daily Shift Sales</h3>
            <p className="text-[10px] text-slate-400 mb-4">Record fuel litres, log operational costs, and automatically compute gross incomes.</p>

            <form onSubmit={handleSubmitReport} className="flex-1 overflow-y-auto pr-1 space-y-4">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Station Plaza Location</label>
                <select
                  id="report-select-station"
                  required
                  value={stationId}
                  onChange={e => setStationId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                >
                  <option value="">Choose designated station plaza</option>
                  {stations.filter(s => s.status === 'Active').map(st => (
                    <option key={st.id} value={st.id}>{st.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Petrol */}
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-2">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase">Petrol Octane Pumps</span>
                  <div>
                    <label className="block text-[9px] text-slate-500">Sales (Litres)</label>
                    <input
                      id="report-petrol-litres"
                      type="number"
                      required
                      placeholder="e.g. 1040"
                      value={petrolLitres}
                      onChange={e => setPetrolLitres(e.target.value)}
                      className="w-full py-1 bg-transparent border-b border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] text-slate-500">Value (USD $)</label>
                    <input
                      id="report-petrol-value"
                      type="number"
                      required
                      placeholder="e.g. 3588"
                      value={petrolValue}
                      onChange={e => setPetrolValue(e.target.value)}
                      className="w-full py-1 bg-transparent border-b border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>
                </div>

                {/* Diesel */}
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-2">
                  <span className="text-[10px] font-bold text-indigo-400 uppercase">Diesel Pumps</span>
                  <div>
                    <label className="block text-[9px] text-slate-500">Sales (Litres)</label>
                    <input
                      id="report-diesel-litres"
                      type="number"
                      required
                      placeholder="e.g. 820"
                      value={dieselLitres}
                      onChange={e => setDieselLitres(e.target.value)}
                      className="w-full py-1 bg-transparent border-b border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] text-slate-500">Value (USD $)</label>
                    <input
                      id="report-diesel-value"
                      type="number"
                      required
                      placeholder="e.g. 3157"
                      value={dieselValue}
                      onChange={e => setDieselValue(e.target.value)}
                      className="w-full py-1 bg-transparent border-b border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="p-3 bg-slate-950/40 border border-slate-800 rounded-lg space-y-3">
                <div className="flex justify-between items-center pb-2 border-b border-slate-900">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Payment Modes Collection Split</span>
                  <span className="text-[10px] font-bold text-emerald-400">
                    Total Revenue: ${(Number(petrolValue) + Number(dieselValue)).toLocaleString()}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[9px] text-slate-500 font-bold uppercase mb-1">Cash Payment ($)</label>
                    <input
                      id="report-pay-cash"
                      type="number"
                      placeholder="Cash amount received"
                      value={paymentCash}
                      onChange={e => setPaymentCash(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] text-slate-500 font-bold uppercase mb-1">UPI Payment ($)</label>
                    <input
                      id="report-pay-upi"
                      type="number"
                      placeholder="UPI amount received"
                      value={paymentUpi}
                      onChange={e => setPaymentUpi(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] text-slate-500 font-bold uppercase mb-1">Card Payment ($)</label>
                    <input
                      id="report-pay-card"
                      type="number"
                      placeholder="Card transaction amount"
                      value={paymentCard}
                      onChange={e => setPaymentCard(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] text-slate-500 font-bold uppercase mb-1">Credit Payment ($)</label>
                    <input
                      id="report-pay-credit"
                      type="number"
                      placeholder="Outstanding credit logged"
                      value={paymentCredit}
                      onChange={e => setPaymentCredit(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-900 flex justify-between items-center text-[10px] text-slate-500">
                  <span>Logged Expenses:</span>
                  <input
                    id="report-expenses-input"
                    type="number"
                    placeholder="e.g. 15"
                    value={expenses}
                    onChange={e => setExpenses(e.target.value)}
                    className="w-24 px-2 py-0.5 bg-slate-950 border border-slate-850 rounded text-xs text-slate-200 focus:outline-none text-right font-mono"
                  />
                </div>
              </div>

              {/* Upload Receipt Bill */}
              <div className="p-3 bg-slate-950/80 border border-slate-850 rounded-lg">
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">Attach Shift Meter Bill Receipt File</label>
                <div className="flex items-center gap-3">
                  <input
                    id="report-bill-uploader"
                    type="file"
                    accept="image/*"
                    onChange={handleReportBillUploadChange}
                    className="hidden"
                  />
                  <label 
                    htmlFor="report-bill-uploader"
                    className="px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-xs font-bold text-slate-300 cursor-pointer flex items-center gap-1.5 transition"
                  >
                    <UploadCloud className="w-4 h-4 text-emerald-400" /> Choose Receipt File
                  </label>
                  <span className="text-[10px] text-slate-500 truncate max-w-[200px]">{billFileName || 'No receipt photo selected'}</span>
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Operator footnotes</label>
                <textarea
                  id="report-notes"
                  placeholder="e.g., standard pump calibration completed peacefully."
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-emerald-500 h-16 resize-none"
                />
              </div>

              <button
                id="report-submit-btn"
                type="submit"
                className="w-full py-2 bg-emerald-500 text-slate-950 font-bold text-xs rounded-lg shadow-lg hover:bg-emerald-400 transition"
              >
                Log Shift & Synchronize Incomes
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal - ADD STANDALONE EXPENSE */}
      {showExpenseModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex justify-center items-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm p-6 relative">
            <button id="expense-modal-close" onClick={() => setShowExpenseModal(false)} className="absolute top-4 right-4 text-slate-500 hover:text-white">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-base font-bold text-white mb-4">Log Operating Expense</h3>

            <form onSubmit={handleAddExpense} className="space-y-4">
              <div>
                <label className="block text-xs text-slate-400 font-bold mb-1">Expense Category</label>
                <select
                  id="expense-select-category"
                  value={expenseCategory}
                  onChange={e => setExpenseCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                >
                  <option value="Utilities">Utilities (Electricity & Power)</option>
                  <option value="Equipment Maintenance">Equipment Maintenance</option>
                  <option value="Staff Salaries">Logistics & Supply Delivery</option>
                  <option value="Taxes & Permits">Legal Licenses & Inspections</option>
                  <option value="Other">Other Operating costs</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-slate-400 font-bold mb-1">Target Station Plaza Log</label>
                <select
                  id="expense-select-station"
                  required
                  value={expenseStationId}
                  onChange={e => setExpenseStationId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                >
                  <option value="">Select target stations</option>
                  {stations.map(st => (
                    <option key={st.id} value={st.id}>{st.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs text-slate-400 font-bold mb-1">Expenditure Amount (USD $)</label>
                <input
                  id="expense-amount"
                  type="number"
                  required
                  placeholder="e.g. 240"
                  value={expenseAmount}
                  onChange={e => setExpenseAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <button
                id="expense-submit-btn"
                type="submit"
                className="w-full py-2 bg-emerald-500 text-slate-950 font-bold text-xs rounded-lg shadow-lg hover:bg-emerald-400 transition transform duration-200"
              >
                Log Expenditure Node
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
