'use client';

import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { useChat } from '@/context/ChatContext';
import { useAuth } from '@/context/AuthContext';
import { Message } from '@/types/chat';
import { ArrowDown, Loader2 } from 'lucide-react';
import { SystemNoticePill } from './SystemNoticePill';
import { MessageItem } from './MessageItem';

export function MessageList() {
  const { user } = useAuth();
  const {
    messages,
    isLoadingMessages,
    hasMoreMessages,
    loadMoreMessages,
    activeConversation,
    startDirectChat,
  } = useChat();

  const containerRef = useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [showScrollBottomBtn, setShowScrollBottomBtn] = useState(false);
  const prevScrollHeightRef = useRef<number>(0);
  const isLoadingMoreRef = useRef(false);

  // Guarantee strict chronological sorting (oldest first at top, newest at bottom)
  const sortedMessages = useMemo(() => {
    return [...messages].sort((a, b) => {
      const timeA = new Date(a.createdAt || 0).getTime();
      const timeB = new Date(b.createdAt || 0).getTime();
      return timeA - timeB;
    });
  }, [messages]);

  // Check scroll position
  const handleScroll = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;

    const distanceToBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    const atBottom = distanceToBottom < 100;
    setIsAtBottom(atBottom);

    // Only show button if user explicitly scrolls up significantly (> 350px)
    setShowScrollBottomBtn(distanceToBottom > 350);

    if (el.scrollTop < 50 && hasMoreMessages && !isLoadingMessages && !isLoadingMoreRef.current) {
      isLoadingMoreRef.current = true;
      prevScrollHeightRef.current = el.scrollHeight;
      loadMoreMessages().finally(() => {
        isLoadingMoreRef.current = false;
      });
    }
  }, [hasMoreMessages, isLoadingMessages, loadMoreMessages]);

  // Auto-scroll to bottom whenever active conversation or messages change
  const scrollToBottomImmediate = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
    setShowScrollBottomBtn(false);
    setIsAtBottom(true);
  }, []);

  // Reset scroll position & hide floating button whenever conversation changes
  useEffect(() => {
    setShowScrollBottomBtn(false);
    setIsAtBottom(true);

    const timer1 = setTimeout(scrollToBottomImmediate, 0);
    const timer2 = setTimeout(scrollToBottomImmediate, 100);
    const timer3 = setTimeout(scrollToBottomImmediate, 300);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [activeConversation?._id, scrollToBottomImmediate]);

  // Handle older message pagination scroll anchoring vs auto-scroll on new message
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    if (prevScrollHeightRef.current > 0) {
      const heightDifference = el.scrollHeight - prevScrollHeightRef.current;
      el.scrollTop = heightDifference;
      prevScrollHeightRef.current = 0;
    } else {
      // New message arrived or initial load: auto-scroll to bottom
      scrollToBottomImmediate();
    }
  }, [sortedMessages, scrollToBottomImmediate]);

  const scrollToBottomSmooth = () => {
    const el = containerRef.current;
    if (el) {
      el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
      setShowScrollBottomBtn(false);
      setIsAtBottom(true);
    }
  };

  const getSenderId = (msg: Message) => {
    if (typeof msg.sender === 'object' && msg.sender !== null) {
      return msg.sender._id || msg.sender.phone;
    }
    return msg.sender;
  };

  const isMessageOwn = (msg: Message) => {
    if (!user) return false;
    const sId = getSenderId(msg);
    return sId === user._id || sId === user.phone;
  };

  const getSenderName = (msg: Message) => {
    if (typeof msg.sender === 'object' && msg.sender !== null && msg.sender.name) {
      return msg.sender.name;
    }
    const sId = getSenderId(msg);
    if (user && (sId === user._id || sId === user.phone)) {
      return user.name;
    }
    if (activeConversation?.type === 'direct') {
      return activeConversation.participant?.name || 'Partner';
    }
    if (activeConversation?.type === 'group') {
      const found = activeConversation.participants?.find(
        (p) => p._id === sId || p.phone === sId
      );
      return found?.name || 'Member';
    }
    return 'Partner';
  };

  const getSenderInitial = (msg: Message) => {
    const name = getSenderName(msg);
    return name[0]?.toUpperCase() || '?';
  };

  const formatMessageTime = (isoString: string) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!activeConversation) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400 bg-[#0B1120]">
        <div className="w-16 h-16 rounded-full bg-[#1E293B] flex items-center justify-center mb-4 text-[#38BDF8] shadow-inner">
          <Loader2 className="w-8 h-8 animate-spin text-[#38BDF8]/40" />
        </div>
        <h2 className="text-xl font-bold text-slate-200">Welcome to Nexus Chat</h2>
        <p className="text-xs text-slate-400 max-w-sm mt-1">
          Select a conversation from the sidebar or start a new chat to begin messaging.
        </p>
      </div>
    );
  }

  return (
    <div className="relative flex-1 flex flex-col min-h-0 bg-[#0B1120]">
      {/* Scrollable Container */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 custom-scrollbar"
      >
        {/* Loading Spinner for older messages */}
        {isLoadingMessages && (
          <div className="flex items-center justify-center py-3 text-slate-400 text-xs gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-[#38BDF8]" />
            <span>Loading messages...</span>
          </div>
        )}

        {/* Empty state */}
        {!isLoadingMessages && sortedMessages.length === 0 && (
          <div className="py-20 text-center text-slate-400 text-xs">
            <p className="font-semibold text-slate-300">No messages in this chat yet.</p>
            <p className="mt-1 text-[#38BDF8]">Send a message below to start the conversation!</p>
          </div>
        )}

        {/* Message Items */}
        {sortedMessages.map((msg, index) => {
          const isOwn = isMessageOwn(msg);
          const senderId = getSenderId(msg);
          const senderName = getSenderName(msg);
          const initial = getSenderInitial(msg);
          const timeString = formatMessageTime(msg.createdAt);

          const textClean = msg.text.replace(/\[u:[^\]]+\]/, '').trim();
          const isSystemNotice =
            textClean.includes('left the group') ||
            textClean.includes('removed') ||
            textClean.includes('added') ||
            textClean.includes('created the group');

          if (isSystemNotice) {
            return (
              <SystemNoticePill
                key={msg._id || `sys-${index}`}
                textClean={textClean}
                timeString={timeString}
              />
            );
          }

          return (
            <MessageItem
              key={msg._id || `msg-${index}`}
              msg={msg}
              isOwn={isOwn}
              senderName={senderName}
              senderId={senderId}
              initial={initial}
              timeString={timeString}
              onOpenDirectChat={startDirectChat}
            />
          );
        })}
      </div>

      {/* Floating Scroll to Bottom Button */}
      {showScrollBottomBtn && (
        <button
          onClick={scrollToBottomSmooth}
          className="absolute bottom-4 right-6 p-2.5 rounded-full bg-[#0284C7] hover:bg-[#0369A1] text-white shadow-lg transition-all transform hover:scale-105 cursor-pointer z-10 flex items-center justify-center border border-white/20 animate-bounce"
          title="Scroll to bottom"
        >
          <ArrowDown className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
