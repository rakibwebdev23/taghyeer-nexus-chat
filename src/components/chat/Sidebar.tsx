'use client';

import React, { useState } from 'react';
import { useChat } from '@/context/ChatContext';
import { useAuth } from '@/context/AuthContext';
import { Conversation } from '@/types/chat';
import {
  Search,
  Plus,
  Users,
  MessageSquare,
  LogOut,
  UserCheck,
  Check,
  CheckCheck,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { NewChatModal } from './NewChatModal';
import { CreateGroupModal } from './CreateGroupModal';

export function Sidebar() {
  const { user, logout } = useAuth();
  const {
    conversations,
    activeConversation,
    selectConversation,
    isLoadingConversations,
    unreads,
    onlineUsers,
  } = useChat();

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'direct' | 'group'>('all');
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [isNewGroupOpen, setIsNewGroupOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const isUserOnline = (partnerId?: string, partnerPhone?: string) => {
    if (!partnerId && !partnerPhone) return false;
    return onlineUsers.some(
      (id) => id === partnerId || id === partnerPhone
    );
  };

  const filteredConversations = conversations.filter((c) => {
    if (filter === 'direct' && c.type !== 'direct') return false;
    if (filter === 'group' && c.type !== 'group') return false;

    if (!search.trim()) return true;
    const q = search.toLowerCase();

    if (c.type === 'group') {
      return c.name?.toLowerCase().includes(q);
    } else {
      return (
        c.participant?.name?.toLowerCase().includes(q) ||
        c.participant?.phone?.includes(q)
      );
    }
  });

  const getConvTitle = (conv: Conversation) => {
    if (conv.type === 'group') return conv.name || 'Group Chat';
    return conv.participant?.name || 'Direct Chat';
  };

  const formatTime = (isoString?: string) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    const now = new Date();

    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const formatLastMessagePreview = (text?: string): React.ReactNode => {
    if (!text) return <span className="italic text-slate-500">No messages yet</span>;

    const clean = text.replace(/\[u:[^\]]+\]/, '').trim();

    if (
      clean.includes('left the group') ||
      clean.includes('removed') ||
      clean.includes('added') ||
      clean.includes('created the group')
    ) {
      return <span className="text-[#FFB03A] font-medium">{clean}</span>;
    }

    return clean;
  };

  return (
    <>
      <aside className="w-full md:w-80 lg:w-96 bg-[#0F172A] border-r border-[#334155] flex flex-col h-full shrink-0 select-none">
        <div className="h-16 px-4 bg-[#1E293B] border-b border-[#334155] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative shrink-0">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#0284C7] to-[#38BDF8] flex items-center justify-center font-bold text-white shadow-md">
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-[#1E293B] shadow-sm shadow-emerald-500/50" />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-sm text-slate-100 truncate flex items-center gap-1.5">
                <span className="truncate">{user?.name || 'User'}</span>
                <UserCheck className="w-3.5 h-3.5 text-[#38BDF8] shrink-0" />
              </h3>
              <p className="text-xs text-slate-400 truncate flex items-center gap-1">
                <span>{user?.phone}</span>
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowLogoutConfirm(true)}
            title="Log out"
            className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer shrink-0"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        <div className="p-3 grid grid-cols-2 gap-2 border-b border-[#334155]/60">
          <button
            onClick={() => setIsNewChatOpen(true)}
            className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#FFB03A] to-[#FF9800] hover:from-[#FFC670] hover:to-[#FFA726] text-[#0F172A] font-extrabold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>New Chat</span>
          </button>

          <button
            onClick={() => setIsNewGroupOpen(true)}
            className="py-2.5 px-3 rounded-xl bg-[#38BDF8]/15 hover:bg-[#38BDF8]/25 text-[#38BDF8] border border-[#38BDF8]/35 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
          >
            <Users className="w-4 h-4" />
            <span>New Group</span>
          </button>
        </div>

        {/* search bar */}
        <div className="p-3 border-b border-[#334155]/60">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#1E293B] border border-[#334155] text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-[#38BDF8] transition-colors"
            />
          </div>

          {/* filter tabs */}
          <div className="flex items-center gap-1 mt-2.5 bg-[#1E293B] p-1 rounded-xl text-xs border border-[#334155]">
            <button
              onClick={() => setFilter('all')}
              className={`flex-1 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                filter === 'all'
                  ? 'bg-[#38BDF8] text-[#0F172A] shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('direct')}
              className={`flex-1 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                filter === 'direct'
                  ? 'bg-[#38BDF8] text-[#0F172A] shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Direct
            </button>
            <button
              onClick={() => setFilter('group')}
              className={`flex-1 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                filter === 'group'
                  ? 'bg-[#38BDF8] text-[#0F172A] shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Groups
            </button>
          </div>
        </div>

        {/* conversation list */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
          {isLoadingConversations ? (
            <div className="space-y-2 p-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-16 rounded-xl bg-[#1E293B]/60 animate-pulse flex items-center p-3 gap-3"
                >
                  <div className="w-10 h-10 rounded-full bg-[#334155]" />
                  <div className="flex-1 space-y-2">
                    <div className="w-24 h-3 bg-[#334155] rounded" />
                    <div className="w-36 h-2 bg-[#334155]/60 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs px-4">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 text-slate-500 opacity-60" />
              <p>No conversations found</p>
              <p className="mt-1 text-[11px] text-slate-500">
                Start a new chat or group using the buttons above!
              </p>
            </div>
          ) : (
            filteredConversations.map((conv) => {
              const isActive = activeConversation?._id === conv._id;
              const unreadCount = unreads[conv._id] || 0;
              const isGroup = conv.type === 'group';

              const isOnline = !isGroup && isUserOnline(
                conv.participant?._id,
                conv.participant?.phone
              );

              // check if last message
              const lastSenderId = typeof conv.lastMessage?.sender === 'object'
                ? conv.lastMessage.sender._id || conv.lastMessage.sender.phone
                : conv.lastMessage?.sender;
              const isLastMsgOwn = user && (lastSenderId === user._id || lastSenderId === user.phone);
              const isLastMsgSeen = conv.lastMessage?.status === 'seen';

              return (
                <div
                  key={conv._id}
                  onClick={() => selectConversation(conv._id)}
                  className={`p-3 rounded-2xl flex items-center gap-3 transition-all cursor-pointer border ${
                    isActive
                      ? 'bg-gradient-to-r from-[#0284C7]/20 to-[#38BDF8]/15 border-[#38BDF8]/60 text-white shadow-md'
                      : 'bg-[#1E293B]/70 hover:bg-[#1E293B] border-[#334155]/40 text-slate-300'
                  }`}
                >
                  <div className="relative shrink-0">
                    <div
                      className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-[#0F172A] text-sm shadow-md ${
                        isGroup
                          ? 'bg-gradient-to-tr from-[#FFB03A] to-[#FF9800]'
                          : 'bg-gradient-to-tr from-[#0284C7] to-[#38BDF8] text-white'
                      }`}
                    >
                      {isGroup ? (
                        <Users className="w-5 h-5 text-[#0F172A]" />
                      ) : (
                        getConvTitle(conv)[0]?.toUpperCase() || '?'
                      )}
                    </div>

                    {!isGroup && (
                      <span
                        className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-[#0F172A] ${
                          isOnline
                            ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50'
                            : 'bg-slate-500/80'
                        }`}
                        title={isOnline ? 'Online' : 'Offline'}
                      />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-sm text-slate-100 truncate flex items-center gap-1.5">
                        <span className="truncate">{getConvTitle(conv)}</span>
                      </h3>
                      <div className="flex items-center gap-1 text-[10px] text-slate-400 shrink-0">
                        {isLastMsgOwn && (
                          <span>
                            {isLastMsgSeen ? (
                              <span title="Seen">
                                <CheckCheck className="w-3.5 h-3.5 text-[#38BDF8]" />
                              </span>
                            ) : (
                              <span title="Sent / Unseen">
                                <Check className="w-3 h-3 text-slate-400" />
                              </span>
                            )}
                          </span>
                        )}
                        <span>{formatTime(conv.lastMessage?.createdAt || conv.updatedAt)}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-300">
                      <p className="truncate pr-2">
                        {formatLastMessagePreview(conv.lastMessage?.text)}
                      </p>

                      {unreadCount > 0 && (
                        <span className="w-5 h-5 rounded-full bg-[#FFB03A] text-[#0F172A] font-bold text-[10px] flex items-center justify-center shrink-0 shadow-md">
                          {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </aside>

      <NewChatModal
        isOpen={isNewChatOpen}
        onClose={() => setIsNewChatOpen(false)}
      />
      <CreateGroupModal
        isOpen={isNewGroupOpen}
        onClose={() => setIsNewGroupOpen(false)}
      />
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in text-white">
          <div className="w-full max-w-sm bg-[#1E293B] border border-rose-500/30 rounded-2xl p-5 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400 mb-3">
              <div className="p-2 rounded-xl bg-rose-500/15 border border-rose-500/30">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-100">Log Out</h3>
            </div>
            <p className="text-xs text-slate-300 mb-5 leading-relaxed">
              Are you sure you want to log out? You will need to log in again to access your messages.
            </p>
            <div className="flex items-center justify-end gap-2.5">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                disabled={isLoggingOut}
                className="px-4 py-2 rounded-xl bg-[#0F172A] hover:bg-[#334155] text-slate-300 text-xs font-bold transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setIsLoggingOut(true);
                  setTimeout(() => {
                    logout();
                  }, 400);
                }}
                disabled={isLoggingOut}
                className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoggingOut ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <LogOut className="w-3.5 h-3.5" />
                )}
                <span>{isLoggingOut ? 'Logging out...' : 'Yes, Log out'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
