import React from 'react';
import { AlertTriangle, Loader2, LogOut } from 'lucide-react';

interface LeaveGroupConfirmModalProps {
  isOpen: boolean;
  conversationName: string;
  onCancel: () => void;
  onConfirm: () => void;
  actionLoading: string | null;
}

export function LeaveGroupConfirmModal({
  isOpen,
  conversationName,
  onCancel,
  onConfirm,
  actionLoading,
}: LeaveGroupConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in text-white">
      <div className="w-full max-w-sm bg-[#1E293B] border border-rose-500/30 rounded-2xl p-5 shadow-2xl">
        <div className="flex items-center gap-3 text-rose-400 mb-3">
          <div className="p-2 rounded-xl bg-rose-500/15 border border-rose-500/30">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-100">Leave Group</h3>
        </div>
        <p className="text-xs text-slate-300 mb-5 leading-relaxed">
          Are you sure you want to leave <strong className="text-white">{conversationName}</strong>? You will lose access to future group messages unless an admin adds you back.
        </p>
        <div className="flex items-center justify-end gap-2.5">
          <button
            onClick={onCancel}
            disabled={actionLoading === 'leave'}
            className="px-4 py-2 rounded-xl bg-[#0F172A] hover:bg-[#334155] text-slate-300 text-xs font-bold transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={actionLoading === 'leave'}
            className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
          >
            {actionLoading === 'leave' ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
            ) : (
              <>
                <LogOut className="w-3.5 h-3.5" />
                <span>Yes, Leave</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
