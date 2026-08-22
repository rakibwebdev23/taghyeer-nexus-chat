'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '@/context/ChatContext';
import { api } from '@/lib/api';
import { User } from '@/types/chat';
import { Search, X, UserPlus, Loader2 } from 'lucide-react';

interface NewChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NewChatModal({ isOpen, onClose }: NewChatModalProps) {
  const { startDirectChat, onlineUsers } = useChat();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [startingUser, setStartingUser] = useState<string | null>(null);

  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setResults([]);
      setLoading(false);
      setStartingUser(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSearchChange = (q: string) => {
    setQuery(q);
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (!q.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const users = await api.searchUsers(q.trim());
        setResults(users);
      } catch (err) {
        console.error('Search failed:', err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
  };

  const handleStartChat = async (userId: string) => {
    setStartingUser(userId);
    try {
      await startDirectChat(userId);
      onClose();
    } catch (err) {
      console.error('Failed to start direct chat:', err);
    } finally {
      setStartingUser(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in text-white">
      <div className="w-full max-w-md bg-[#1E293B] border border-[#334155] rounded-2xl p-6 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#FFB03A]/15 text-[#FFB03A] border border-[#FFB03A]/30">
              <UserPlus className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-100">Start Direct Conversation</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-4">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Type to search name or phone number..."
              value={query}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#0F172A] border border-[#334155] text-slate-100 placeholder-slate-400 focus:outline-none focus:border-[#38BDF8] text-sm"
              autoFocus
            />
            {loading && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <Loader2 className="w-4 h-4 animate-spin text-[#38BDF8]" />
              </div>
            )}
          </div>
        </div>

        <div className="max-h-64 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
          {loading ? (
            <div className="py-8 text-center text-slate-400 text-sm flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-[#38BDF8]" />
              Searching database...
            </div>
          ) : results.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-sm">
              {query ? 'No users found matching query' : 'Type a name or phone number to search live!'}
            </div>
          ) : (
            results.map((u) => {
              const isOnline = onlineUsers.some((id) => id === u._id || id === u.phone);

              return (
                <div
                  key={u._id}
                  className="flex items-center justify-between p-3 rounded-xl bg-[#0F172A] hover:bg-[#1E293B] transition-colors border border-[#334155]"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative shrink-0">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#0284C7] to-[#38BDF8] flex items-center justify-center font-bold text-sm shadow-md text-white">
                        {u.name?.[0]?.toUpperCase() || '?'}
                      </div>
                      <span
                        className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#0F172A] ${
                          isOnline ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50' : 'bg-slate-500'
                        }`}
                        title={isOnline ? 'Online' : 'Offline'}
                      />
                    </div>

                    <div>
                      <h3 className="font-semibold text-sm text-slate-100 flex items-center gap-1.5">
                        <span>{u.name}</span>
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded-full font-normal ${
                            isOnline
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-slate-700/50 text-slate-400'
                          }`}
                        >
                          {isOnline ? 'Online' : 'Offline'}
                        </span>
                      </h3>
                      <p className="text-xs text-slate-400">{u.phone}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleStartChat(u._id)}
                    disabled={startingUser === u._id}
                    className="px-3.5 py-1.5 rounded-lg bg-[#FFB03A] hover:bg-[#FF9800] text-[#0F172A] font-bold text-xs shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    {startingUser === u._id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-[#0F172A]" />
                    ) : (
                      'Chat'
                    )}
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}