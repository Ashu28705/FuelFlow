/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Fuel, ShieldCheck, TrendingUp, Users, Cpu, ArrowRight, Activity, CircleGauge } from 'lucide-react';
import { motion } from 'motion/react';

interface LandingViewProps {
  onNavigate: (tab: string) => void;
}

export function LandingView({ onNavigate }: LandingViewProps) {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      {/* Navigation */}
      <header className="px-6 py-4 flex justify-between items-center border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-50">
        <div className="flex items-center gap-2 cursor-pointer font-bold text-lg text-emerald-400" onClick={() => onNavigate('landing')}>
          <Fuel className="w-6 h-6 animate-pulse" />
          <span>FuelFlow</span>
        </div>
        <div className="flex items-center gap-4">
          <button 
            id="landing-btn-login"
            onClick={() => onNavigate('login')} 
            className="text-sm font-medium hover:text-emerald-400 transition"
          >
            Sign In
          </button>
          <button 
            id="landing-btn-signup"
            onClick={() => onNavigate('signup')} 
            className="px-4 py-2 bg-emerald-500 text-slate-950 hover:bg-emerald-400 font-semibold text-sm rounded-lg transition"
          >
            Deploy Station
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative px-6 py-20 bg-gradient-to-b from-slate-950 to-slate-900 border-b border-slate-800 flex flex-col items-center justify-center text-center overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none"></div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl"
        >
          <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-semibold tracking-wider uppercase rounded-full border border-emerald-500/20 mb-6 inline-block">
            Next-Gen Fuel Automation Suite
          </span>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-300 via-teal-100 to-emerald-400 bg-clip-text text-transparent mb-6">
            Intelligent Remote Management for Smart Fuel Stations
          </h1>
          <p className="text-lg text-slate-400 mb-8 max-w-2xl mx-auto leading-relaxed">
            Configure petrol pumps, verify daily sales reports, track dynamic live income metrics, manage workers, and run instant AI revenue forecasting forecasts in real-time.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              id="hero-btn-demo"
              onClick={() => onNavigate('login')}
              className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg shadow-lg flex items-center justify-center gap-2 group transition"
            >
              Start Free Trial Demo <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </button>
            <button 
              id="hero-btn-learn"
              onClick={() => {
                const docSection = document.getElementById('details_features');
                if (docSection) docSection.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-lg border border-slate-700 transition"
            >
              Explore Solutions
            </button>
          </div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section id="details_features" className="px-6 py-20 bg-slate-950/40 max-w-7xl mx-auto w-full">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-white mb-4">Powerful Features Crafted for Enterprise Operators</h2>
          <p className="text-slate-400 max-w-xl mx-auto">One central control plane. No complex configurations. Full visibility into pump performance.</p>
        </div>

        <div className="grid md:grid-cols-4 gap-8">
          {/* Card 1 */}
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl hover:border-emerald-500/40 transition">
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-lg w-max mb-4">
              <CircleGauge className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Remote Pumps Monitor</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Track live status of multi-station pumps, configure active octane levels, CNG dispensers, or diesel assets state anywhere.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl hover:border-emerald-500/40 transition">
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-lg w-max mb-4">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Role-Based Operations</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Super Admin, Owner, Manager, and Field Worker access controls. Workers easily record reports; owners evaluate statistics.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl hover:border-emerald-500/40 transition">
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-lg w-max mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">OCR Smart Bill Scanner</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Scan fuel manifests and logistics receipts using on-device Gemini AI processing. Automatically categorizes operational expenses.
            </p>
          </div>

          {/* Card 4 */}
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl hover:border-emerald-500/40 transition">
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-lg w-max mb-4">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">AI Revenue Forecasting</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Leverage historical regression models and Gemini's cognitive context to safely forecast weekly and tomorrow's sales values.
            </p>
          </div>
        </div>
      </section>

      <section className="px-6 py-12 bg-slate-900 border-t border-slate-800">
        <div className="max-w-4xl mx-auto bg-slate-950 border border-slate-800 rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-bold text-emerald-400 mb-2">Start with your live operating data</h3>
            <p className="text-slate-400 text-sm">
              Create an owner account, register your stations, and invite your workers. FuelFlow never adds sample business data to your account.
            </p>
          </div>
          <button 
            id="landing-instant-btn"
            onClick={() => onNavigate('login')}
            className="px-6 py-3 bg-emerald-500 text-slate-950 font-bold rounded-lg hover:bg-emerald-400 whitespace-nowrap transition"
          >
            Create account
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto px-6 py-8 border-t border-slate-800 text-center text-xs text-slate-500 bg-slate-950">
        <p>© 2026 FuelFlow platform Inc. All rights reserved. Full audit architecture, GDPR ready, compliant with ISO 27001 operations.</p>
      </footer>
    </div>
  );
}
