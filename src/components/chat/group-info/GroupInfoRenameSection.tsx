import React from 'react';
import { Edit2, Check, X, Loader2 } from 'lucide-react';

interface GroupInfoRenameSectionProps {
  isAdmin: boolean | null;
  isRenaming: boolean;
  setIsRenaming: (val: boolean) => void;
  newGroupName: string;
  setNewGroupName: (val: string) => void;
  handleRename: () => void;
  actionLoading: string | null;
  conversationName: string;
}

export function GroupInfoRenameSection({
  isAdmin,
  isRenaming,
  setIsRenaming,
  newGroupName,
  setNewGroupName,
  handleRename,
  actionLoading,
  conversationName,
}: GroupInfoRenameSectionProps) {
  return (
    <div className="py-3 border-b border-[#334155]/60">
      {isRenaming ? (
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            className="flex-1 px-3 py-1.5 rounded-xl bg-[#0F172A] border border-[#334155] text-xs text-slate-100 focus:outline-none focus:border-[#38BDF8]"
            autoFocus
          />
          <button
            onClick={handleRename}
            disabled={actionLoading === 'rename'}
            className="p-2 rounded-xl bg-[#FFB03A] text-[#0F172A] hover:bg-[#FF9800] font-bold transition-all cursor-pointer"
          >
            {actionLoading === 'rename' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Check className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={() => setIsRenaming(false)}
            className="p-2 rounded-xl bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Group Title
            </span>
            <span className="font-semibold text-sm text-slate-200">
              {conversationName}
            </span>
          </div>
          {isAdmin && (
            <button
              onClick={() => setIsRenaming(true)}
              className="p-2 rounded-xl bg-[#0F172A] hover:bg-[#334155] border border-[#334155] text-slate-300 hover:text-white transition-all text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5 text-[#FFB03A]" />
              <span>Rename</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
