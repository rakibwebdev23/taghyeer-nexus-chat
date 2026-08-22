'use client';

import React from 'react';
import { Message } from '@/types/chat';
import { Check, CheckCheck, Clock, AlertCircle } from 'lucide-react';

interface MessageItemProps {
  msg: Message;
  isOwn: boolean;
  senderName: string;
  senderId: string;
  initial: string;
  timeString: string;
  onOpenDirectChat: (userId: string) => void;
}

export function MessageItem({
  msg,
  isOwn,
  senderName,
  senderId,
  initial,
  timeString,
  onOpenDirectChat,
}: MessageItemProps) {
  const isSeen = msg.status === 'seen';

  let tickIcon = null;
  if (msg.status === 'sending') {
    tickIcon = (
      <span title="Sending...">
        <Clock className="w-3.5 h-3.5 animate-spin text-sky-200" />
      </span>
    );
  } else if (msg.status === 'error') {
    tickIcon = (
      <span title="Failed to send">
        <AlertCircle className="w-3.5 h-3.5 text-rose-300" />
      </span>
    );
  } else if (isSeen) {
    // Seen / Read: Double Ticks (✓✓)
    tickIcon = (
      <span title="Seen (Double Ticks)">
        <CheckCheck className="w-4 h-4 text-sky-100 stroke-[2.5]" />
      </span>
    );
  } else {
    // Sent / Unseen / Offline: Single Tick (✓)
    tickIcon = (
      <span title="Sent (Single Tick)">
        <Check className="w-3.5 h-3.5 text-sky-200/90 stroke-[2.5]" />
      </span>
    );
  }

  return (
    <div
      className={`flex items-end gap-2.5 ${
        isOwn ? 'justify-end' : 'justify-start'
      } animate-fade-in`}
    >
      {/* Left Avatar for Incoming Messages */}
      {!isOwn && (
        <button
          onClick={() => onOpenDirectChat(senderId)}
          title={`Start 1-to-1 chat with ${senderName}`}
          className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#FFB03A] to-[#FF9800] flex items-center justify-center font-bold text-[#0F172A] text-xs shrink-0 shadow-md mb-1 hover:scale-110 hover:ring-2 hover:ring-[#FFB03A] transition-all cursor-pointer"
        >
          {initial}
        </button>
      )}

      {/* Message Content & Bubble */}
      <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} max-w-[85%] md:max-w-[70%]`}>
        {/* Sender Name for Incoming Messages */}
        {!isOwn && (
          <button
            onClick={() => onOpenDirectChat(senderId)}
            title={`Start 1-to-1 chat with ${senderName}`}
            className="text-[11px] font-bold text-[#FFB03A] hover:text-[#FFC670] hover:underline mb-1 pl-1 text-left cursor-pointer transition-colors"
          >
            {senderName}
          </button>
        )}

        <div
          className={`px-4 py-2.5 rounded-2xl shadow-sm text-sm leading-relaxed ${
            isOwn
              ? 'bg-gradient-to-r from-[#0284C7] to-[#0369A1] text-white rounded-br-none font-medium shadow-md'
              : 'bg-[#1E293B] border border-[#334155] text-[#F8FAFC] rounded-bl-none shadow-sm'
          }`}
        >
          <p className="whitespace-pre-wrap break-words">{msg.text}</p>
          <div
            className={`flex items-center justify-end gap-1.5 mt-1 text-[10px] ${
              isOwn ? 'text-sky-100/90' : 'text-slate-400'
            }`}
          >
            <span>{timeString}</span>
            {isOwn && <span className="inline-flex items-center ml-0.5">{tickIcon}</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
