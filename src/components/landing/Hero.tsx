'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { ChatSandbox } from './ChatSandbox';

interface HeroProps {
  onScrollTo: (e: React.MouseEvent, sectionId: string) => void;
}

export function Hero({ onScrollTo }: HeroProps) {
  return (
    <section className="relative min-h-[calc(100vh-80px)] flex flex-col justify-center items-center px-6 py-12">
      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10 my-auto">
        <div className="lg:col-span-7 space-y-7 text-center lg:text-left">

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.12]">
            Instant Real-Time Chat Engine Built For{' '}
            <span className="bg-gradient-to-r from-[#FFB03A] via-[#38BDF8] to-[#22D3EE] bg-clip-text text-transparent animate-gradient-text">
              Zero Latency & Total Reliability
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto lg:mx-0 font-normal">
            Nexus Chat combines <strong>Socket.io WebSockets</strong>, <strong>Redux Toolkit optimistic state</strong>, and <strong>Redis caching</strong> to deliver sub-15ms 1-to-1 direct messages and dynamic group collaboration with zero UI lag.
          </p>

          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
            <Link
              href="/chat"
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-[#FFB03A] to-[#FF9800] hover:from-[#FFC670] hover:to-[#FFA726] text-[#0F172A] font-extrabold text-base shadow-2xl shadow-[#FFB03A]/30 transition-all flex items-center gap-3 cursor-pointer hover:scale-105"
            >
              <span>Launch Chat Application</span>
              <ArrowRight className="w-5 h-5 text-[#0F172A]" />
            </Link>
            <a
              href="#purpose"
              onClick={(e) => onScrollTo(e, 'purpose')}
              className="px-8 py-4 rounded-2xl bg-[#1E293B] hover:bg-[#334155] text-slate-100 border border-[#334155] font-bold text-base transition-all cursor-pointer shadow-md"
            >
              Why Nexus Chat?
            </a>
          </div>

          {/* live metrics */}
          <div className="grid grid-cols-3 gap-4 pt-6 border-t border-[#334155]/60 max-w-xl mx-auto lg:mx-0">
            <div className="p-3 rounded-2xl bg-[#1E293B]/60 border border-[#334155]/40 backdrop-blur-sm">
              <h4 className="text-2xl font-black text-[#38BDF8]">&lt; 15ms</h4>
              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Socket Delivery</p>
            </div>
            <div className="p-3 rounded-2xl bg-[#1E293B]/60 border border-[#334155]/40 backdrop-blur-sm">
              <h4 className="text-2xl font-black text-[#FFB03A]">100%</h4>
              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Optimistic Sync</p>
            </div>
            <div className="p-3 rounded-2xl bg-[#1E293B]/60 border border-[#334155]/40 backdrop-blur-sm">
              <h4 className="text-2xl font-black text-[#22D3EE]">Redis</h4>
              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Cached Engine</p>
            </div>
          </div>
        </div>

        {/* chat sandbox  */}
        <div className="lg:col-span-5" id="demo">
          <ChatSandbox />
        </div>
      </div>
      <div className="pt-8 text-center animate-bounce cursor-pointer opacity-75 hover:opacity-100 transition-opacity">
        <a
          href="#purpose"
          onClick={(e) => onScrollTo(e, 'purpose')}
          className="inline-flex flex-col items-center gap-1 text-xs font-bold text-slate-400 hover:text-[#FFB03A]"
        >
          <span>Scroll For Details</span>
          <ChevronDown className="w-4 h-4 text-[#FFB03A]" />
        </a>
      </div>
    </section>
  );
}
