'use client';

import React from 'react';
import { Radio, Layers, Database, Users } from 'lucide-react';

export function PurposeSection() {
  return (
    <section id="purpose" className="py-24 px-6 bg-[#0F172A] border-t border-[#334155]">
      <div className="max-w-7xl mx-auto space-y-16">
        <div className="text-center space-y-4 max-w-3xl mx-auto reveal-hidden">
          <span className="px-4 py-1.5 rounded-full bg-[#FFB03A]/15 text-[#FFB03A] border border-[#FFB03A]/30 text-xs font-extrabold uppercase tracking-wider shadow-sm">
            Project Purpose & Engineering Value
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-100">
            Why Nexus Chat Was Built
          </h2>
          <p className="text-base text-slate-300 leading-relaxed">
            Traditional web chat apps often suffer from state sync lag, double-posted messages, slow room initialization, and unhandled disconnects. Nexus Chat was engineered specifically to solve these core architectural challenges.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="p-7 rounded-3xl bg-[#1E293B] border border-[#334155] hover:border-[#38BDF8]/60 transition-all space-y-5 shadow-xl group hover:-translate-y-1 duration-300 reveal-hidden">
            <div className="w-14 h-14 rounded-2xl bg-[#38BDF8]/15 text-[#38BDF8] border border-[#38BDF8]/30 flex items-center justify-center group-hover:scale-110 transition-transform shadow-md">
              <Radio className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-slate-100">Bi-Directional Sockets</h3>
            <p className="text-xs text-slate-300 leading-relaxed font-normal">
              Instant real-time message delivery over persistent WebSockets (`message:new`, `conversation:updated`), ensuring zero manual page refresh is ever required.
            </p>
          </div>

          <div className="p-7 rounded-3xl bg-[#1E293B] border border-[#334155] hover:border-[#FFB03A]/60 transition-all space-y-5 shadow-xl group hover:-translate-y-1 duration-300 reveal-hidden">
            <div className="w-14 h-14 rounded-2xl bg-[#FFB03A]/15 text-[#FFB03A] border border-[#FFB03A]/30 flex items-center justify-center group-hover:scale-110 transition-transform shadow-md">
              <Layers className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-slate-100">Optimistic State Engine</h3>
            <p className="text-xs text-slate-300 leading-relaxed font-normal">
              Messages render immediately with a temporary ID in Redux Toolkit state, ensuring instant visual feedback before server HTTP confirmation.
            </p>
          </div>

          <div className="p-7 rounded-3xl bg-[#1E293B] border border-[#334155] hover:border-[#22D3EE]/60 transition-all space-y-5 shadow-xl group hover:-translate-y-1 duration-300 reveal-hidden">
            <div className="w-14 h-14 rounded-2xl bg-[#22D3EE]/15 text-[#22D3EE] border border-[#22D3EE]/30 flex items-center justify-center group-hover:scale-110 transition-transform shadow-md">
              <Database className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-slate-100">Redis Cache Engine</h3>
            <p className="text-xs text-slate-300 leading-relaxed font-normal">
              Backend database responses for user search queries, active room lists, and message logs are cached in Redis with automated TTL expiration.
            </p>
          </div>

          <div className="p-7 rounded-3xl bg-[#1E293B] border border-[#334155] hover:border-[#FFB03A]/60 transition-all space-y-5 shadow-xl group hover:-translate-y-1 duration-300 reveal-hidden">
            <div className="w-14 h-14 rounded-2xl bg-[#FFB03A]/15 text-[#FFB03A] border border-[#FFB03A]/30 flex items-center justify-center group-hover:scale-110 transition-transform shadow-md">
              <Users className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-slate-100">Group System Notices</h3>
            <p className="text-xs text-slate-300 leading-relaxed font-normal">
              Smart event broadcasts (`abc added Raki`, `abc left the group`) with multi-clickable member links that launch private 1-to-1 chats directly.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
