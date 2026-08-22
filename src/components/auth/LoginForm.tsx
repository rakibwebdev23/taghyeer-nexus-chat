'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { MessageSquare, Phone, User, Loader2, ArrowRight } from 'lucide-react';

export function LoginForm() {
  const { login } = useAuth();
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim() || !name.trim()) {
      setError('Please enter both your phone number and display name');
      return;
    }

    setError(null);
    setLoading(true);
    try {
      await login(phone.trim(), name.trim());
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#0B1120] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-[#38BDF8]/15 blur-[140px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md p-8 rounded-3xl bg-[#1E293B]/95 border border-[#334155] shadow-2xl backdrop-blur-xl animate-fade-in text-white relative z-10">
        <div className="text-center space-y-3 mb-8">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-[#FFB03A] to-[#FF9800] flex items-center justify-center mx-auto shadow-xl shadow-[#FFB03A]/20 border border-[#FFB03A]/30 text-[#0F172A]">
            <MessageSquare className="w-8 h-8 text-[#0F172A]" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-slate-100 via-[#38BDF8] to-slate-200 bg-clip-text text-transparent">
            Welcome to Nexus Chat
          </h1>
          <p className="text-xs text-slate-400">
            Enter your phone number & name to start chatting instantly
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-medium text-center">
            {error}
          </div>
        )}

        {/* form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Phone Number
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="e.g. +1999123456"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-[#0F172A] border border-[#334155] text-slate-100 placeholder-slate-400 focus:outline-none focus:border-[#38BDF8] focus:ring-1 focus:ring-[#38BDF8] text-sm transition-all"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Display Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="e.g. Alice Smith"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-[#0F172A] border border-[#334155] text-slate-100 placeholder-slate-400 focus:outline-none focus:border-[#38BDF8] focus:ring-1 focus:ring-[#38BDF8] text-sm transition-all"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#FFB03A] to-[#FF9800] hover:from-[#FFC670] hover:to-[#FFA726] text-[#0F172A] font-bold text-sm shadow-xl shadow-[#FFB03A]/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin text-[#0F172A]" />
            ) : (
              <>
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4 text-[#0F172A]" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-[#334155]/60 text-center">
          <p className="text-[11px] text-slate-400 leading-relaxed">
            💡 Demo tip: Any phone number & name combination creates or restores your user account.
          </p>
        </div>
      </div>
    </div>
  );
}
