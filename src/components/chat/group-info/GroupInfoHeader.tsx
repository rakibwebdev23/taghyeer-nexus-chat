import React from 'react';
import { Users, X } from 'lucide-react';

interface GroupInfoHeaderProps {
  conversationName: string;
  participantsCount: number;
  onlineCount: number;
  onClose: () => void;
}

export function GroupInfoHeader({
  conversationName,
  participantsCount,
  onlineCount,
  onClose,
}: GroupInfoHeaderProps) {
  return (
    <div className="flex items-center justify-between pb-4 border-b border-[#334155]">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#FFB03A] to-[#FF9800] flex items-center justify-center text-[#0F172A] font-bold shadow-md">
          <Users className="w-6 h-6" />
        </div>
        <div>
          <h2 className="font-bold text-base text-slate-100 flex items-center gap-2">
            <span>{conversationName}</span>
          </h2>
          <p className="text-xs text-slate-400">
            {participantsCount} Members • {onlineCount} Online
          </p>
        </div>
      </div>
      <button
        onClick={onClose}
        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
}
