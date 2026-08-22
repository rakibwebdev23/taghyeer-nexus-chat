'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '@/context/ChatContext';
import { Send, Loader2 } from 'lucide-react';

export function MessageInput() {
  const { sendMessage, activeConversation, isSending } = useChat();
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = 'auto';
      const newHeight = Math.min(el.scrollHeight, 160);
      el.style.height = `${newHeight}px`;
    }
  }, [text]);

  if (!activeConversation) return null;

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || isSending) return;

    setText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    try {
      await sendMessage(trimmed);
    } catch (err) {
      console.error('Send message error:', err);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="p-4 bg-[#0F172A]/90 backdrop-blur-md border-t border-[#334155] shrink-0 w-full">
      <form onSubmit={handleSend} className="w-full flex items-end gap-3">
        <div className="flex-1 relative min-w-0">
          <textarea
            ref={textareaRef}
            rows={1}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message... (Enter to send, Shift+Enter for new line)"
            className="w-full px-4 py-3 rounded-2xl bg-[#1E293B] border border-[#334155] text-slate-100 placeholder-slate-400 focus:outline-none focus:border-[#38BDF8] focus:ring-1 focus:ring-[#38BDF8] text-sm resize-none max-h-40 min-h-[48px] overflow-y-auto leading-relaxed [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          />
        </div>

        <button
          type="submit"
          disabled={!text.trim() || isSending}
          className="h-[48px] w-[48px] rounded-2xl bg-gradient-to-r from-[#FFB03A] to-[#FF9800] hover:from-[#FFC670] hover:to-[#FFA726] text-[#0F172A] font-bold flex items-center justify-center shadow-lg shadow-[#FFB03A]/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shrink-0"
        >
          {isSending ? (
            <Loader2 className="w-5 h-5 animate-spin text-[#0F172A]" />
          ) : (
            <Send className="w-5 h-5 text-[#0F172A]" />
          )}
        </button>
      </form>
    </div>
  );
}
