'use client';

import React from 'react';
import { Info } from 'lucide-react';

interface SystemNoticePillProps {
  textClean?: string;
  parsedNotice?: {
    type?: string;
    adminName?: string;
    adminId?: string;
    actionText?: string;
    targetName?: string | null;
    targetId?: string | null;
  };
  isNotSelfAdmin?: boolean;
  isNotSelfTarget?: boolean;
  timeString: string;
  onOpenDirectChat?: (userId: string) => void;
}

export function SystemNoticePill({
  textClean,
  parsedNotice,
  isNotSelfAdmin = false,
  isNotSelfTarget = false,
  timeString,
  onOpenDirectChat,
}: SystemNoticePillProps) {
  // Safe fallback if textClean is passed directly from MessageList
  const displayText = textClean || (parsedNotice ? `${parsedNotice.adminName || ''} ${parsedNotice.actionText || ''} ${parsedNotice.targetName || ''}` : '');

  return (
    <div className="flex justify-center my-2 animate-fade-in">
      <span className="px-3.5 py-1.5 rounded-full bg-[#1E293B] border border-[#334155] text-slate-200 text-[11px] font-medium shadow-sm flex items-center gap-1.5 flex-wrap justify-center text-center">
        <Info className="w-3.5 h-3.5 text-[#FFB03A] shrink-0" />

        {parsedNotice && parsedNotice.adminName ? (
          <>
            {/* Actor / Admin Name */}
            {isNotSelfAdmin && parsedNotice.adminId && onOpenDirectChat ? (
              <button
                onClick={() => onOpenDirectChat(parsedNotice.adminId!)}
                title={`Start 1-to-1 chat with ${parsedNotice.adminName}`}
                className="text-[#FFB03A] hover:text-[#FFC670] hover:underline font-bold cursor-pointer transition-colors"
              >
                {parsedNotice.adminName}
              </button>
            ) : (
              <span className="font-bold text-slate-100">{parsedNotice.adminName}</span>
            )}

            {/* Verb */}
            <span className="text-slate-300">{parsedNotice.actionText}</span>

            {/* Target Member Name */}
            {parsedNotice.targetName &&
              (isNotSelfTarget && parsedNotice.targetId && onOpenDirectChat ? (
                <button
                  onClick={() => onOpenDirectChat(parsedNotice.targetId!)}
                  title={`Start 1-to-1 chat with ${parsedNotice.targetName}`}
                  className="text-[#FFB03A] hover:text-[#FFC670] hover:underline font-bold cursor-pointer transition-colors"
                >
                  {parsedNotice.targetName}
                </button>
              ) : (
                <span className="font-bold text-slate-100">{parsedNotice.targetName}</span>
              ))}
          </>
        ) : (
          <span className="font-medium text-slate-200">{displayText}</span>
        )}

        <span className="text-[10px] text-slate-400">• {timeString}</span>
      </span>
    </div>
  );
}
