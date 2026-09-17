/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Construction, MapPin, Phone, CheckCircle, XCircle, Plus, Edit, 
  Trash2, Layers, Users, RefreshCw, X 
} from 'lucide-react';

interface StationsViewProps {
  user: any;
  stations: any[];
  workersList: any[];
  onRefresh: () => void;
  toast: (msg: string, type: 'success' | 'danger') => void;
  token: string;
}

export function StationsView({ user, stations, workersList, onRefresh, toast, token }: StationsViewProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [selectedStation, setSelectedStation] = useState<any>(null);

  // Form states
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [address, setAddress] = useState('');
  const [contact, setContact] = useState('');
  const [selectedFuelTypes, setSelectedFuelTypes] = useState<string[]>(['Petrol', 'Diesel']);
  
  // Fuel prices states
  const [petrolPriceInput, setPetrolPriceInput] = useState('3.45');
  const [dieselPriceInput, setDieselPriceInput] = useState('3.85');

  // Assign worker states
  const [assignWorkerIds, setAssignWorkerIds] = useState<string[]>([]);

  const isOwner = user.role === 'owner' || user.role === 'admin';

  const handleOpenPriceModal = (station: any) => {
    setSelectedStation(station);
    setPetrolPriceInput(String(station.petrolPrice || 3.45));
    setDieselPriceInput(String(station.dieselPrice || 3.85));
    setShowPriceModal(true);
  };

  const handleSavePrices = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStation) return;

    try {
      const res = await fetch(`/api/stations/${selectedStation.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          petrolPrice: Number(petrolPriceInput),
          dieselPrice: Number(dieselPriceInput)
        })
      });
      if (!res.ok) throw new Error('Could not update station pricing profile');
      toast('Fuel station pricing matrix updated & broadcasted successfully!', 'success');
      setShowPriceModal(false);
      onRefresh();
    } catch (err: any) {
      toast(err.message, 'danger');
    }
  };

  const handleCreateStation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !location) {
      toast('Station name and location map markers are required', 'danger');
      return;
    }

    try {
      const res = await fetch('/api/stations', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name,
          location,
          address,
          contact,
          fuelTypes: selectedFuelTypes
        })
      });
      if (!res.ok) throw new Error('Could not create fuel station');
      toast('Fuel station deployed successfully!', 'success');
      setShowAddModal(false);
      setName('');
      setLocation('');
      setAddress('');
      setContact('');
      onRefresh();
    } catch (err: any) {
      toast(err.message, 'danger');
    }
  };

  const handleDeleteStation = async (id: string) => {
    if (!window.confirm('Are you absolutely sure you want to delete this station? All logged historical pump configurations will be detached.')) return;

    try {
      const res = await fetch(`/api/stations/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Could not remove station link');
      toast('Fuel station removed from network successfully', 'success');
      onRefresh();
    } catch (err: any) {
      toast(err.message, 'danger');
    }
  };

  const handleOpenAssignModal = (station: any) => {
    setSelectedStation(station);
    setAssignWorkerIds(station.workerIds || []);
    setShowAssignModal(true);
  };

  const handleSaveAssignWorkers = async () => {
    if (!selectedStation) return;

    try {
      const res = await fetch(`/api/stations/${selectedStation.id}/workers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ workerIds: assignWorkerIds })
      });
      if (!res.ok) throw new Error('Failed to update worker assignment matrix');
      toast('Workers assigned to station pumps successfully!', 'success');
      setShowAssignModal(false);
      onRefresh();
    } catch (err: any) {
      toast(err.message, 'danger');
    }
  };

  const handleToggleFuelType = (type: string) => {
    if (selectedFuelTypes.includes(type)) {
      setSelectedFuelTypes(selectedFuelTypes.filter(t => t !== type));
    } else {
      setSelectedFuelTypes([...selectedFuelTypes, type]);
    }
  };

  const handleToggleWorkerSelect = (workerId: string) => {
    if (assignWorkerIds.includes(workerId)) {
      setAssignWorkerIds(assignWorkerIds.filter(id => id !== workerId));
    } else {
      setAssignWorkerIds([...assignWorkerIds, workerId]);
    }
  };

  return (
    <div className="flex-grow p-8 bg-slate-900 text-slate-100 font-sans overflow-y-auto space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-slate-800 pb-6">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight text-white flex items-center gap-2">
            <Construction className="w-5 h-5 text-emerald-400" /> Remotely Managed Stations Hub
          </h2>
          <p className="text-slate-400 text-xs">A unified command center to provision stations, monitor pump nodes, and coordinate field workers list.</p>
        </div>
        
        <div className="flex gap-2">
          <button 
            id="station-btn-refresh"
            onClick={onRefresh} 
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          {isOwner && (
            <button
              id="station-btn-add-station"
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-lg flex items-center gap-2 shadow-lg transition"
            >
              <Plus className="w-4 h-4" /> Deploy New Station
            </button>
          )}
        </div>
      </div>

      {/* Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {stations.map(st => {
          const isActive = st.status === 'Active';
          return (
            <div key={st.id} className="p-6 bg-slate-950 border border-slate-800 rounded-xl relative overflow-hidden flex flex-col justify-between">
              {/* Badge */}
              <div className="absolute top-4 right-4 flex items-center gap-1.5">
                {isActive ? (
                  <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold rounded-full flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Online
                  </span>
                ) : (
                  <span className="px-2 py-0.5 bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[10px] font-bold rounded-full flex items-center gap-1">
                    <XCircle className="w-3 h-3" /> Inactive
                  </span>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">{st.name}</h3>
                  <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" /> {st.location}
                  </p>
                </div>

                <div className="space-y-2 border-t border-slate-900 pt-4 text-xs text-slate-400">
                  <p className="flex justify-between">
                    <span className="text-slate-500 font-semibold uppercase text-[10px]">Address:</span>
                    <span className="text-slate-300 font-medium text-[11px] text-right max-w-[200px]">{st.address || 'N/A'}</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-slate-500 font-semibold uppercase text-[10px]">Pumps Hotline:</span>
                    <span className="text-slate-300 font-medium text-[11px]">{st.contact || 'N/A'}</span>
                  </p>
                  <p className="flex justify-between items-center bg-slate-900/40 p-2 rounded border border-slate-900">
                    <span className="text-slate-500 font-semibold uppercase text-[10px] shrink-0">Litre Pricing:</span>
                    <span className="text-slate-300 font-bold font-mono">
                      Petrol: <span className="text-emerald-400">${st.petrolPrice || 3.45}</span> | Diesel: <span className="text-indigo-400">${st.dieselPrice || 3.85}</span>
                    </span>
                  </p>
                  <p className="flex justify-between items-center">
                    <span className="text-slate-500 font-semibold uppercase text-[10px] shrink-0">Supported Fuels:</span>
                    <span className="flex gap-1 flex-wrap justify-end">
                      {st.fuelTypes.map((ft: string) => (
                        <span key={ft} className="px-1.5 py-0.5 bg-slate-900 border border-slate-800 text-slate-300 rounded font-black text-[9px]">
                          {ft}
                        </span>
                      ))}
                    </span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-slate-500 font-semibold uppercase text-[10px]">Active Crews:</span>
                    <span className="text-emerald-400 font-bold text-xs flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" /> {(st.workerIds || []).length} crew members
                    </span>
                  </p>
                </div>
              </div>

              {isOwner && (
                <div className="mt-6 pt-4 border-t border-slate-900 flex justify-end gap-2 text-xs">
                  <button
                    id={`station-btn-prices-${st.id}`}
                    onClick={() => handleOpenPriceModal(st)}
                    className="px-2.5 py-1.5 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/20 hover:border-emerald-500/40 rounded-lg flex items-center gap-1 font-semibold transition"
                  >
                    <Edit className="w-3 h-3" /> Update Rates
                  </button>
                  <button
                    id={`station-btn-assign-${st.id}`}
                    onClick={() => handleOpenAssignModal(st)}
                    className="px-2.5 py-1.5 bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-400 border border-indigo-500/20 hover:border-indigo-500/40 rounded-lg flex items-center gap-1 font-semibold transition"
                  >
                    <Users className="w-3.5 h-3.5" /> Assign Crew
                  </button>
                  <button
                    id={`station-btn-delete-${st.id}`}
                    onClick={() => handleDeleteStation(st.id)}
                    className="px-2.5 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 hover:border-rose-500/40 rounded-lg flex items-center gap-1 font-semibold transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Remove
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* modal - Add Station */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex justify-center items-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 relative">
            <button _id="st-add-close" onClick={() => setShowAddModal(false)} className="absolute top-4 right-4 text-slate-500 hover:text-white">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-base font-bold text-white mb-4">Deploy Fuel Station</h3>
            <form onSubmit={handleCreateStation} className="space-y-4">
              <div>
                <label className="block text-xs text-slate-400 font-bold uppercase mb-1">Station / Plaza Name</label>
                <input
                  id="station-name"
                  type="text"
                  required
                  placeholder="e.g. Broad Express Pumps"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 font-bold uppercase mb-1">Location City</label>
                <input
                  id="station-location"
                  type="text"
                  required
                  placeholder="e.g. New York, Queens"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 font-bold uppercase mb-1">Street Address</label>
                <input
                  id="station-address"
                  type="text"
                  placeholder="e.g. 120 Main St, Suite F"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 font-bold uppercase mb-1">Hotline Contact</label>
                <input
                  id="station-contact"
                  type="text"
                  placeholder="+1 555-0000"
                  value={contact}
                  onChange={e => setContact(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 font-bold uppercase mb-1">Available Fuel Pumps Grid</label>
                <div className="flex gap-2 flex-wrap">
                  {['Petrol', 'Diesel', 'CNG', 'Premium Petrol'].map(fuel => {
                    const selected = selectedFuelTypes.includes(fuel);
                    return (
                      <button
                        id={`fuel-select-${fuel}`}
                        type="button"
                        key={fuel}
                        onClick={() => handleToggleFuelType(fuel)}
                        className={`px-3 py-1 rounded text-xs border transition ${
                          selected 
                            ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 font-bold' 
                            : 'bg-slate-950 border-slate-800 text-slate-500 hover:text-white'
                        }`}
                      >
                        {fuel}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                id="station-submit-btn"
                type="submit"
                className="w-full py-2 bg-emerald-500 text-slate-950 font-bold text-xs rounded-lg shadow-lg hover:bg-emerald-400 transition mt-2"
              >
                Provision Station Node
              </button>
            </form>
          </div>
        </div>
      )}

      {/* modal - Allocate Crew */}
      {showAssignModal && selectedStation && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex justify-center items-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 relative flex flex-col max-h-[85vh]">
            <button id="st-assign-close" onClick={() => setShowAssignModal(false)} className="absolute top-4 right-4 text-slate-500 hover:text-white">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-base font-bold text-white mb-2">Assign Station Crew</h3>
            <p className="text-[11px] text-slate-400 mb-4">Allocate active field workers to coordinate shifts at "{selectedStation.name}"</p>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1 mb-6">
              {workersList.map(wk => {
                const userObj = wk.user;
                if (!userObj) return null;
                const isChecked = assignWorkerIds.includes(userObj.id);
                return (
                  <div 
                    id={`worker-option-${userObj.id}`}
                    key={userObj.id} 
                    onClick={() => handleToggleWorkerSelect(userObj.id)}
                    className={`p-3 bg-slate-950 border rounded-lg flex items-center justify-between cursor-pointer transition ${
                      isChecked ? 'border-emerald-500 bg-emerald-500/5' : 'border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <img 
                        src={userObj.profileImage || `https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150`} 
                        alt="" 
                        className="w-7 h-7 rounded-full border border-slate-800 object-cover" 
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <h4 className="text-xs font-bold text-slate-200">{userObj.name}</h4>
                        <p className="text-[10px] text-slate-400">Salary: ${wk.salary}/mo | Phone: {userObj.phone || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="w-4 h-4 rounded-full border border-slate-800 flex items-center justify-center">
                      {isChecked && <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse"></div>}
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              id="station-assign-submit"
              onClick={handleSaveAssignWorkers}
              className="w-full py-2 bg-emerald-500 text-slate-950 font-bold text-xs rounded-lg hover:bg-emerald-400 transition"
            >
              Update Allocation Matrix
            </button>
          </div>
        </div>
      )}

      {/* modal - Update Fuel Rates */}
      {showPriceModal && selectedStation && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex justify-center items-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm p-6 relative">
            <button id="st-price-close" onClick={() => setShowPriceModal(false)} className="absolute top-4 right-4 text-slate-500 hover:text-white">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-base font-bold text-white mb-1">Set Station Fuel Rates</h3>
            <p className="text-[11px] text-slate-400 mb-4">Set pricing rules for "{selectedStation.name}". This automatically calculates workers' daily shift totals.</p>

            <form onSubmit={handleSavePrices} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Petrol Price/Litre ($)</label>
                <input
                  id="station-price-petrol"
                  type="number"
                  step="0.01"
                  required
                  value={petrolPriceInput}
                  onChange={e => setPetrolPriceInput(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Diesel Price/Litre ($)</label>
                <input
                  id="station-price-diesel"
                  type="number"
                  step="0.01"
                  required
                  value={dieselPriceInput}
                  onChange={e => setDieselPriceInput(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <button
                id="station-price-submit"
                type="submit"
                className="w-full py-2 bg-emerald-500 text-slate-950 font-bold text-xs rounded-lg hover:bg-emerald-400 transition"
              >
                Apply Broadcast Rates
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
