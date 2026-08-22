'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export function CtaBanner() {
  return (
    <section className="py-20 px-6 bg-[#0B1120] border-t border-[#334155] text-center relative overflow-hidden">
      <div className="max-w-4xl mx-auto space-y-7 relative z-10 reveal-hidden">
        <h2 className="text-3xl sm:text-5xl font-black text-slate-100">
          Ready to Experience Nexus Chat?
        </h2>
        <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto font-normal">
          Join the live chat application, create groups, test search as you type, and experience real-time messaging with Redux state synchronization.
        </p>
        <div className="pt-2">
          <Link
            href="/chat"
            className="inline-flex items-center gap-3 px-9 py-4.5 rounded-2xl bg-gradient-to-r from-[#FFB03A] to-[#FF9800] hover:from-[#FFC670] hover:to-[#FFA726] text-[#0F172A] font-black text-lg shadow-2xl shadow-[#FFB03A]/30 transition-all hover:scale-105 cursor-pointer"
          >
            <span>Launch Live Chat Application</span>
            <ArrowRight className="w-6 h-6 text-[#0F172A]" />
          </Link>
        </div>
      </div>
    </section>
  );
}
