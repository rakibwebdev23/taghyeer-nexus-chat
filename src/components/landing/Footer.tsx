'use client';

import React from 'react';
import { MessageSquare } from 'lucide-react';

export function Footer() {
  return (
    <footer className="py-8 px-6 bg-[#0F172A] border-t border-[#334155] text-center text-xs text-slate-400">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-[#FFB03A] flex items-center justify-center shadow-md">
            <MessageSquare className="w-4 h-4 text-[#0F172A]" />
          </div>
          <span className="font-bold text-slate-200 text-sm">Nexus Chat</span>
        </div>
        <p>© 2026 Nexus Chat — Take-Home Assignment Deliverable.</p>
      </div>
    </footer>
  );
}
