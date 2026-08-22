import React from 'react';
import { LogOut } from 'lucide-react';

interface GroupInfoFooterProps {
  onClose: () => void;
  onLeaveGroup: () => void;
}

export function GroupInfoFooter({ onClose, onLeaveGroup }: GroupInfoFooterProps) {
  return (
    <div className="pt-4 mt-2 border-t border-[#334155] flex items-center justify-between">
      <button
        onClick={onLeaveGroup}
        className="px-3.5 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
      >
        <LogOut className="w-3.5 h-3.5" />
        <span>Leave Group</span>
      </button>

      <button
        onClick={onClose}
        className="px-4 py-1.5 rounded-xl bg-[#0F172A] hover:bg-[#334155] text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
      >
        Close
      </button>
    </div>
  );
}
