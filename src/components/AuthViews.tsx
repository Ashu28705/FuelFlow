/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Fuel, Lock, Mail, User, Shield, Phone, MapPin, Eye, EyeOff } from 'lucide-react';

interface AuthViewsProps {
  view: 'login' | 'signup' | 'forgot';
  onNavigate: (tab: string) => void;
  onLoginSuccess: (token: string, user: any) => void;
  toast: (message: string, type: 'success' | 'danger') => void;
}

export function AuthViews({ view, onNavigate, onLoginSuccess, toast }: AuthViewsProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'owner' | 'worker'>('owner');
  const [stationName, setStationName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (view === 'login') {
      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Login failed');

        toast('Successfully authenticated with FuelFlow cloud!', 'success');
        onLoginSuccess(data.token, data.user);
      } catch (err: any) {
        toast(err.message, 'danger');
      } finally {
        setLoading(false);
      }
    } else if (view === 'signup') {
      try {
        // Step 1: Register User
        const registerBody = {
          name,
          email,
          password,
          role,
          phone,
          assignedStationId: ''
        };

        const regRes = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(registerBody)
        });
        const regData = await regRes.json();
        if (!regRes.ok) throw new Error(regData.error || 'Registration failed');

        toast('Account deployed successfully!', 'success');
        onLoginSuccess(regData.token, regData.user);
      } catch (err: any) {
        toast(err.message, 'danger');
      } finally {
        setLoading(false);
      }
    } else {
      // Forgot Password simulate dispatch success
      setTimeout(() => {
        setLoading(false);
        toast('Instructions instructions reset token dispatched.', 'success');
        onNavigate('login');
      }, 1000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-slate-100 font-sans">
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/20 via-slate-950 to-teal-950/20 pointer-events-none opacity-50"></div>

      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl relative z-10">
        <div className="flex flex-col items-center text-center mb-8 cursor-pointer" onClick={() => onNavigate('landing')}>
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl mb-3">
            <Fuel className="w-8 h-8 animate-pulse" />
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight text-white">FuelFlow Management</h2>
          <p className="text-slate-400 text-xs mt-1">Smart petrol pumps operations & analytics hub</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {view === 'signup' && (
            <>
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                  <input
                    id="signup-name-input"
                    type="text"
                    required
                    placeholder="Enter full name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5">Contact Phone</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                  <input
                    id="signup-phone-input"
                    type="tel"
                    placeholder="+1 555-000-0000"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5">Are you Owners or Shift Workers?</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    id="role-select-owner"
                    type="button"
                    onClick={() => setRole('owner')}
                    className={`py-2 px-4 rounded-lg text-xs font-semibold border transition ${
                      role === 'owner' 
                        ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' 
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    Station Owner
                  </button>
                  <button
                    id="role-select-worker"
                    type="button"
                    onClick={() => setRole('worker')}
                    className={`py-2 px-4 rounded-lg text-xs font-semibold border transition ${
                      role === 'worker' 
                        ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' 
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    Station Worker
                  </button>
                </div>
              </div>

              {role === 'owner' && (
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5">Pre-provision Station Name</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                    <input
                      id="signup-station-input"
                      type="text"
                      required
                      placeholder="e.g., Summit Fuel Plaza"
                      value={stationName}
                      onChange={e => setStationName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-emerald-500 transition"
                    />
                  </div>
                </div>
              )}
            </>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
              <input
                id="auth-email-input"
                type="email"
                required
                placeholder="name@company.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-emerald-500 transition"
              />
            </div>
          </div>

          {view !== 'forgot' && (
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-semibold uppercase text-slate-400">Password</label>
                {view === 'login' && (
                  <button 
                    id="btn-forgot-pwd"
                    type="button" 
                    onClick={() => onNavigate('forgot')}
                    className="text-[11px] text-emerald-400 hover:underline hover:text-emerald-300 transition"
                  >
                    Forgot?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                <input
                  id="auth-password-input"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-emerald-500 transition"
                />
                <button
                  id="btn-password-visibility"
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          <button
            id="auth-submit-btn"
            type="submit"
            disabled={loading}
            className="w-full py-2.5 mt-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-sm transition shadow-lg relative flex justify-center items-center"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
            ) : view === 'login' ? (
              'Access FuelFlow'
            ) : view === 'signup' ? (
              'Deploy Platform'
            ) : (
              'Dispatch Email Reset'
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-500 border-t border-slate-800/80 pt-4">
          {view === 'login' ? (
            <p>
              New station operator?{' '}
              <button id="toggle-signup" onClick={() => onNavigate('signup')} className="text-emerald-400 hover:underline font-semibold ml-1">
                Deploy Station Account
              </button>
            </p>
          ) : (
            <p>
              Already registered?{' '}
              <button id="toggle-login" onClick={() => onNavigate('login')} className="text-emerald-400 hover:underline font-semibold ml-1">
                Enter Account Portal
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
