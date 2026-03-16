import React from 'react';
import { Building2, ShieldCheck, Zap } from 'lucide-react';

function App() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center space-y-6">
        <div className="flex justify-center">
          <div className="bg-blue-600 p-4 rounded-2xl shadow-lg shadow-blue-200">
            <Building2 className="w-12 h-12 text-white" />
          </div>
        </div>
        
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">LodgeEase</h1>
          <p className="text-slate-500 font-medium">Premium Lodge Management System</p>
        </div>

        <div className="grid grid-cols-1 gap-4 pt-4">
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
            <Zap className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-semibold text-slate-700">Real-time Dashboard</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
            <ShieldCheck className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-semibold text-slate-700">Secure Payments</span>
          </div>
        </div>

        <div className="pt-6">
          <button className="w-full bg-slate-900 text-white font-semibold py-3 rounded-xl hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200">
            Get Started
          </button>
        </div>
      </div>
      
      <p className="mt-8 text-slate-400 text-sm font-medium">
        Runtime Environment: Stabilized & Ready
      </p>
    </div>
  );
}

export default App;
