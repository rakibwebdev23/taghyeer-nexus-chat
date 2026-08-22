'use client';

import React from 'react';
import { UserPlus, MessageSquare, Globe } from 'lucide-react';

export function FeatureShowcase() {
  return (
    <section id="features" className="py-24 px-6 bg-[#0B1120] border-t border-[#334155]">
      <div className="max-w-7xl mx-auto space-y-16">
        <div className="text-center space-y-4 max-w-2xl mx-auto reveal-hidden">
          <h2 className="text-3xl sm:text-4xl font-black text-slate-100">Packed With Modern Features</h2>
          <p className="text-sm text-slate-300">Everything expected in a production-ready real-time communication platform.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-7 rounded-3xl bg-[#1E293B] border border-[#334155] space-y-4 shadow-lg hover:border-[#38BDF8]/40 transition-colors reveal-hidden">
            <div className="flex items-center gap-2 text-[#38BDF8] font-extrabold text-sm">
              <UserPlus className="w-5 h-5" />
              <span>Live Debounced Search</span>
            </div>
            <h4 className="font-bold text-lg text-slate-100">Search As You Type</h4>
            <p className="text-xs text-slate-300 leading-relaxed font-normal">
              300ms debounced user search preloads recent contacts instantly when query is empty and executes live regex searches across phone & name fields.
            </p>
          </div>

          <div className="p-7 rounded-3xl bg-[#1E293B] border border-[#334155] space-y-4 shadow-lg hover:border-[#FFB03A]/40 transition-colors reveal-hidden">
            <div className="flex items-center gap-2 text-[#FFB03A] font-extrabold text-sm">
              <MessageSquare className="w-5 h-5" />
              <span>Clickable Profile Links</span>
            </div>
            <h4 className="font-bold text-lg text-slate-100">1-to-1 Direct Chat Launch</h4>
            <p className="text-xs text-slate-300 leading-relaxed font-normal">
              Click any sender avatar or member name in group notice pills to immediately jump into a direct 1-to-1 conversation room.
            </p>
          </div>

          <div className="p-7 rounded-3xl bg-[#1E293B] border border-[#334155] space-y-4 shadow-lg hover:border-[#22D3EE]/40 transition-colors reveal-hidden">
            <div className="flex items-center gap-2 text-[#22D3EE] font-extrabold text-sm">
              <Globe className="w-5 h-5" />
              <span>Chronological Messaging</span>
            </div>
            <h4 className="font-bold text-lg text-slate-100">Strict Timeline Ordering</h4>
            <p className="text-xs text-slate-300 leading-relaxed font-normal">
              Messages strictly sorted from oldest at top to newest at bottom, with smart scroll anchoring during pagination and smooth jump-to-bottom controls.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
