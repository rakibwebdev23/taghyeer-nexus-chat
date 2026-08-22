'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useChat } from '@/context/ChatContext';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { User } from '@/types/chat';
import { Users, X, Search, Check, Loader2, UserCheck } from 'lucide-react';

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateGroupModal({ isOpen, onClose }: CreateGroupModalProps) {
  const { user: currentUser } = useAuth();
  const { createGroup, conversations, onlineUsers } = useChat();

  const [groupName, setGroupName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [searching, setSearching] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchDebounceRef = useRef<NodeJS.Timeout | null>(null);

  const defaultContacts = useMemo(() => {
    const contactMap = new Map<string, User>();
    if (!currentUser) return [];

    conversations.forEach((conv) => {
      if (conv.type === 'direct' && conv.participant) {
        if (conv.participant._id !== currentUser._id) {
          contactMap.set(conv.participant._id, {
            _id: conv.participant._id,
            name: conv.participant.name,
            phone: conv.participant.phone,
          });
        }
      } else if (conv.type === 'group' && conv.participants) {
        conv.participants.forEach((p) => {
          if (p._id !== currentUser._id) {
            contactMap.set(p._id, p);
          }
        });
      }
    });

    return Array.from(contactMap.values());
  }, [conversations, currentUser]);

  const resetForm = () => {
    setGroupName('');
    setSearchQuery('');
    setSearchResults([]);
    setSelectedUsers([]);
    setError(null);
    setSearching(false);
    setSubmitting(false);
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }
  };

  useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSearchChange = (q: string) => {
    setSearchQuery(q);
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }

    if (!q.trim()) {
      setSearchResults([]);
      setSearching(false);
      return;
    }

    setSearching(true);
    searchDebounceRef.current = setTimeout(async () => {
      try {
        const users = await api.searchUsers(q.trim());
        setSearchResults(users);
      } catch (err) {
        console.error('Group member search failed:', err);
      } finally {
        setSearching(false);
      }
    }, 300);
  };

  const toggleUserSelect = (user: User) => {
    if (selectedUsers.some((u) => u._id === user._id)) {
      setSelectedUsers(selectedUsers.filter((u) => u._id !== user._id));
    } else {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  const handleCreate = async () => {
    if (!groupName.trim()) {
      setError('Please enter a group name');
      return;
    }
    if (selectedUsers.length === 0) {
      setError('Please select at least 1 other participant for the group');
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      const participantIds = selectedUsers.map((u) => u._id);
      await createGroup(groupName.trim(), participantIds);
      handleClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create group');
    } finally {
      setSubmitting(false);
    }
  };

  const displayUsers = searchQuery.trim() ? searchResults : defaultContacts;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in text-white">
      <div className="w-full max-w-lg bg-[#1E293B] border border-[#334155] rounded-2xl p-6 shadow-2xl overflow-y-auto flex flex-col max-h-[90vh] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#FFB03A]/15 text-[#FFB03A] border border-[#FFB03A]/30">
              <Users className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-100">Create Group Conversation</h2>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-medium">
            {error}
          </div>
        )}

        <div className="space-y-4 mb-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Group Name
            </label>
            <input
              type="text"
              placeholder="e.g. Engineering & Design"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[#0F172A] border border-[#334155] text-slate-100 placeholder-slate-400 focus:outline-none focus:border-[#38BDF8] text-sm"
              autoFocus
            />
          </div>

          {/* selected members badges */}
          {selectedUsers.length > 0 && (
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Selected Participants ({selectedUsers.length}):
              </label>
              <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto p-2 bg-[#0F172A] rounded-xl border border-[#334155] custom-scrollbar">
                {selectedUsers.map((u) => (
                  <span
                    key={u._id}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#FFB03A] text-[#0F172A] text-xs font-bold shadow-sm"
                  >
                    <span>{u.name}</span>
                    <button
                      onClick={() => toggleUserSelect(u)}
                      className="hover:text-black text-[#0F172A] transition-colors cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                Add Members
              </label>
              <span className="text-[11px] text-[#38BDF8] font-bold">
                {searchQuery.trim() ? 'Search Results' : 'Recent Contacts'}
              </span>
            </div>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Type to search name or phone number..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#0F172A] border border-[#334155] text-slate-100 placeholder-slate-400 focus:outline-none focus:border-[#38BDF8] text-sm"
              />
              {searching && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Loader2 className="w-4 h-4 animate-spin text-[#38BDF8]" />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto min-h-[160px] space-y-2 pr-1 custom-scrollbar">
          {searching ? (
            <div className="py-8 text-center text-slate-400 text-sm flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-[#38BDF8]" />
              Searching members...
            </div>
          ) : displayUsers.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              {searchQuery ? 'No matching users found' : 'No previous contacts found. Type a name or phone above!'}
            </div>
          ) : (
            displayUsers.map((u) => {
              const isSelected = selectedUsers.some((sel) => sel._id === u._id);
              const isOnline = onlineUsers.some((id) => id === u._id || id === u.phone);

              return (
                <div
                  key={u._id}
                  onClick={() => toggleUserSelect(u)}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#FFB03A]/20 border-[#FFB03A] text-white'
                      : 'bg-[#0F172A] hover:bg-[#1E293B] border-[#334155] text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative shrink-0">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#0284C7] to-[#38BDF8] flex items-center justify-center font-bold text-xs shadow-md text-white">
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
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-sm text-slate-100">{u.name}</h4>
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded-full font-normal ${
                            isOnline
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-slate-700/50 text-slate-400'
                          }`}
                        >
                          {isOnline ? 'Online' : 'Offline'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">{u.phone}</p>
                    </div>
                  </div>
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center border ${
                      isSelected
                        ? 'bg-[#FFB03A] border-[#FFB03A] text-[#0F172A]'
                        : 'border-slate-500 text-transparent'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* footer actions */}
        <div className="pt-4 mt-4 border-t border-[#334155] flex items-center justify-end gap-3">
          <button
            onClick={handleClose}
            className="px-4 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 text-sm font-medium transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={submitting}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#FFB03A] to-[#FF9800] hover:from-[#FFC670] hover:to-[#FFA726] text-[#0F172A] font-bold text-sm shadow-lg shadow-[#FFB03A]/25 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin text-[#0F172A]" />
            ) : (
              'Create Group'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
