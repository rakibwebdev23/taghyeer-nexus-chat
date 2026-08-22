'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useChat } from '@/context/ChatContext';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { User, Conversation } from '@/types/chat';
import {
  Users,
  X,
  Shield,
  UserMinus,
  UserPlus,
  Edit2,
  Check,
  LogOut,
  Loader2,
  Search,
  Plus,
  MessageSquare,
  AlertTriangle,
  UserCheck,
} from 'lucide-react';

interface GroupInfoModalProps {
  conversation: Conversation;
  isOpen: boolean;
  onClose: () => void;
}

export function GroupInfoModal({
  conversation,
  isOpen,
  onClose,
}: GroupInfoModalProps) {
  const { user: currentUser } = useAuth();
  const {
    promoteAdmin,
    removeParticipant,
    addParticipants,
    renameGroup,
    startDirectChat,
    conversations,
    onlineUsers,
  } = useChat();

  const [isRenaming, setIsRenaming] = useState(false);
  const [newGroupName, setNewGroupName] = useState(conversation.name || '');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Leave Group Confirmation Modal State
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);

  // Add Member State
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [selectedNewUsers, setSelectedNewUsers] = useState<User[]>([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchDebounceRef = useRef<NodeJS.Timeout | null>(null);

  const participants = conversation.participants || [];
  const existingMemberIds = useMemo(() => new Set(participants.map((p) => p._id)), [participants]);

  const isUserOnline = (p: User) => {
    if (currentUser && (p._id === currentUser._id || p.phone === currentUser.phone)) {
      return true;
    }
    return onlineUsers.some((id) => id === p._id || id === p.phone);
  };

  const onlineCount = useMemo(() => {
    return participants.filter(isUserOnline).length;
  }, [participants, onlineUsers, currentUser]);

  const defaultContacts = useMemo(() => {
    const contactMap = new Map<string, User>();
    if (!currentUser) return [];

    conversations.forEach((conv) => {
      if (conv.type === 'direct' && conv.participant) {
        if (conv.participant._id !== currentUser._id && !existingMemberIds.has(conv.participant._id)) {
          contactMap.set(conv.participant._id, {
            _id: conv.participant._id,
            name: conv.participant.name,
            phone: conv.participant.phone,
          });
        }
      } else if (conv.type === 'group' && conv.participants) {
        conv.participants.forEach((p) => {
          if (p._id !== currentUser._id && !existingMemberIds.has(p._id)) {
            contactMap.set(p._id, p);
          }
        });
      }
    });

    return Array.from(contactMap.values());
  }, [conversations, currentUser, existingMemberIds]);

  useEffect(() => {
    if (isOpen) {
      setNewGroupName(conversation.name || '');
      setIsRenaming(false);
      setIsAddingMember(false);
      setShowLeaveConfirm(false);
      setSearchQuery('');
      setSearchResults([]);
      setSelectedNewUsers([]);
      setError(null);
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
      }
    }
  }, [isOpen, conversation]);

  if (!isOpen) return null;

  const isAdmin =
    currentUser &&
    (conversation.admins?.includes(currentUser._id) ||
      conversation.createdBy === currentUser._id);

  const handleOpenDirectChat = async (memberId: string) => {
    if (!currentUser || memberId === currentUser._id) return;
    setActionLoading(`chat-${memberId}`);
    try {
      await startDirectChat(memberId);
      onClose();
    } catch (err: any) {
      console.error('Failed to start direct chat:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRename = async () => {
    if (!newGroupName.trim()) return;
    setActionLoading('rename');
    try {
      await renameGroup(conversation._id, newGroupName.trim());
      setIsRenaming(false);
    } catch (err: any) {
      console.error('Failed to rename group:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handlePromote = async (memberId: string) => {
    setActionLoading(`promote-${memberId}`);
    try {
      await promoteAdmin(conversation._id, memberId);
    } catch (err: any) {
      console.error('Failed to promote member:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRemove = async (memberId: string) => {
    if (!currentUser) return;
    setActionLoading(`remove-${memberId}`);
    try {
      const member = participants.find((p) => p._id === memberId);
      const adminName = currentUser.name || 'Admin';
      const targetName = member?.name || 'Member';
      
      await api.sendMessage(
        conversation._id,
        `${adminName} removed ${targetName} [u:${currentUser._id}|u:${memberId}]`
      );

      await removeParticipant(conversation._id, memberId);
    } catch (err: any) {
      console.error('Failed to remove member:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleConfirmLeaveGroup = async () => {
    if (!currentUser) return;
    setActionLoading('leave');
    try {
      const userName = currentUser.name || 'User';

      await api.sendMessage(
        conversation._id,
        `${userName} left the group [u:${currentUser._id}]`
      );

      await removeParticipant(conversation._id, currentUser._id);
      setShowLeaveConfirm(false);
      onClose();
    } catch (err: any) {
      console.error('Failed to leave group:', err);
    } finally {
      setActionLoading(null);
    }
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
        const filtered = users.filter((u) => !existingMemberIds.has(u._id));
        setSearchResults(filtered);
      } catch (err) {
        console.error('Search candidate members failed:', err);
      } finally {
        setSearching(false);
      }
    }, 300);
  };

  const toggleSelectNewUser = (user: User) => {
    if (selectedNewUsers.some((u) => u._id === user._id)) {
      setSelectedNewUsers(selectedNewUsers.filter((u) => u._id !== user._id));
    } else {
      setSelectedNewUsers([...selectedNewUsers, user]);
    }
  };

  const handleAddSelectedMembers = async () => {
    if (selectedNewUsers.length === 0 || !currentUser) return;
    setActionLoading('add-members');
    try {
      const userIds = selectedNewUsers.map((u) => u._id);
      const addedNames = selectedNewUsers.map((u) => u.name).join(', ');
      const adminName = currentUser.name || 'Admin';

      await api.sendMessage(
        conversation._id,
        `${adminName} added ${addedNames} [u:${currentUser._id}]`
      );

      await addParticipants(conversation._id, userIds);

      setIsAddingMember(false);
      setSelectedNewUsers([]);
      setSearchQuery('');
      setSearchResults([]);
    } catch (err: any) {
      setError(err.message || 'Failed to add members');
    } finally {
      setActionLoading(null);
    }
  };

  const displayCandidates = searchQuery.trim() ? searchResults : defaultContacts;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in text-white">
        <div className="w-full max-w-md bg-[#1E293B] border border-[#334155] rounded-2xl p-6 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-[#334155]">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#FFB03A] to-[#FF9800] flex items-center justify-center text-[#0F172A] font-bold shadow-md">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h2 className="font-bold text-base text-slate-100 flex items-center gap-2">
                  <span>{conversation.name || 'Group Chat'}</span>
                </h2>
                <p className="text-xs text-slate-400">
                  {participants.length} Members • {onlineCount} Online
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

          {error && (
            <div className="mt-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-medium">
              {error}
            </div>
          )}

          {/* Group Name Edit section for Admins */}
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
                    {conversation.name || 'Group Chat'}
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

          {/* Add Members Button */}
          {isAdmin && (
            <div className="py-3 border-b border-[#334155]/60">
              <button
                onClick={() => setIsAddingMember(!isAddingMember)}
                className="w-full py-2 px-3 rounded-xl bg-[#38BDF8]/15 hover:bg-[#38BDF8]/25 text-[#38BDF8] border border-[#38BDF8]/35 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
              >
                <UserPlus className="w-4 h-4" />
                <span>{isAddingMember ? 'Hide Add Member Form' : 'Add New Members to Group'}</span>
              </button>
            </div>
          )}

          {/* Add Member Panel */}
          {isAddingMember && (
            <div className="p-3 my-2 rounded-xl bg-[#0F172A] border border-[#334155] space-y-3 animate-fade-in">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200">Add Participants</span>
                <span className="text-[10px] text-[#38BDF8] font-bold">
                  {searchQuery.trim() ? 'Search Database' : 'Recent Contacts'}
                </span>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Type to search name or phone number..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full pl-9 pr-10 py-2 rounded-lg bg-[#1E293B] border border-[#334155] text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-[#38BDF8]"
                  autoFocus
                />
                {searching && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-[#38BDF8]" />
                  </div>
                )}
              </div>

              {/* Selected New Members Badges */}
              {selectedNewUsers.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[11px] text-[#FFB03A] font-bold">
                    Selected to Add ({selectedNewUsers.length}):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedNewUsers.map((u) => (
                      <span
                        key={u._id}
                        className="px-2 py-0.5 rounded bg-[#FFB03A] text-[#0F172A] font-bold text-[11px] flex items-center gap-1"
                      >
                        {u.name}
                        <X
                          className="w-3 h-3 cursor-pointer"
                          onClick={() => toggleSelectNewUser(u)}
                        />
                      </span>
                    ))}
                  </div>
                  <button
                    onClick={handleAddSelectedMembers}
                    disabled={actionLoading === 'add-members'}
                    className="w-full py-1.5 rounded-lg bg-[#FFB03A] hover:bg-[#FF9800] text-[#0F172A] text-xs font-bold flex items-center justify-center gap-1 cursor-pointer shadow-sm"
                  >
                    {actionLoading === 'add-members' ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-[#0F172A]" />
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5 text-[#0F172A]" />
                        <span>Confirm & Add Selected Members</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Display Candidates */}
              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
                {searching ? (
                  <div className="py-4 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-[#38BDF8]" />
                    Searching database...
                  </div>
                ) : displayCandidates.length === 0 ? (
                  <div className="py-4 text-center text-slate-400 text-xs">
                    {searchQuery ? 'No matching candidate users found' : 'No available recent contacts to add'}
                  </div>
                ) : (
                  displayCandidates.map((u) => {
                    const isSelected = selectedNewUsers.some((sel) => sel._id === u._id);
                    const isCandidateOnline = isUserOnline(u);

                    return (
                      <div
                        key={u._id}
                        onClick={() => toggleSelectNewUser(u)}
                        className={`flex items-center justify-between p-2 rounded-lg text-xs cursor-pointer border ${
                          isSelected
                            ? 'bg-[#FFB03A]/20 border-[#FFB03A] text-white'
                            : 'bg-[#1E293B] border-[#334155] text-slate-200 hover:bg-[#334155]/50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className="relative shrink-0">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#0284C7] to-[#38BDF8] flex items-center justify-center text-[10px] font-bold text-white">
                              {u.name?.[0]?.toUpperCase() || '?'}
                            </div>
                            <span
                              className={`absolute bottom-0 right-0 w-2 h-2 rounded-full border border-[#1E293B] ${
                                isCandidateOnline ? 'bg-emerald-500' : 'bg-slate-500'
                              }`}
                            />
                          </div>
                          <span>
                            {u.name} ({u.phone})
                          </span>
                          <span
                            className={`text-[9px] px-1.5 py-0.2 rounded-full font-normal ${
                              isCandidateOnline
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : 'bg-slate-700/50 text-slate-400'
                            }`}
                          >
                            {isCandidateOnline ? 'Online' : 'Offline'}
                          </span>
                        </div>
                        <div
                          className={`w-4 h-4 rounded flex items-center justify-center border ${
                            isSelected
                              ? 'bg-[#FFB03A] border-[#FFB03A] text-[#0F172A]'
                              : 'border-slate-500'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3" />}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* Existing Group Members List */}
          <div className="flex-1 overflow-y-auto py-3 space-y-2 pr-1 custom-scrollbar">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Group Members ({participants.length})
            </h3>

            {participants.map((member) => {
              const isMemberAdmin =
                conversation.admins?.includes(member._id) ||
                conversation.createdBy === member._id;
              const isSelf = currentUser?._id === member._id;
              const isMemberOnline = isUserOnline(member);

              return (
                <div
                  key={member._id}
                  className="flex items-center justify-between p-3 rounded-xl bg-[#0F172A] border border-[#334155]"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative shrink-0">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#0284C7] to-[#38BDF8] flex items-center justify-center font-bold text-xs shadow-md text-white">
                        {member.name?.[0]?.toUpperCase() || '?'}
                      </div>
                      <span
                        className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#0F172A] ${
                          isMemberOnline
                            ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50'
                            : 'bg-slate-500/80'
                        }`}
                        title={isMemberOnline ? 'Online' : 'Offline'}
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-slate-100">
                          {member.name} {isSelf && '(You)'}
                        </span>
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded-full font-normal ${
                            isMemberOnline
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-slate-700/50 text-slate-400'
                          }`}
                        >
                          {isMemberOnline ? 'Online' : 'Offline'}
                        </span>
                        {isMemberAdmin && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 text-[10px] font-bold border border-amber-500/20">
                            <Shield className="w-3 h-3" />
                            Admin
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-400">{member.phone}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Start 1-to-1 Direct Chat Button */}
                    {!isSelf && (
                      <button
                        onClick={() => handleOpenDirectChat(member._id)}
                        disabled={actionLoading === `chat-${member._id}`}
                        title={`Start 1-to-1 chat with ${member.name}`}
                        className="p-1.5 rounded-lg bg-[#FFB03A]/15 hover:bg-[#FFB03A]/30 text-[#FFB03A] transition-colors cursor-pointer"
                      >
                        {actionLoading === `chat-${member._id}` ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <MessageSquare className="w-3.5 h-3.5" />
                        )}
                      </button>
                    )}

                    {/* Admin Actions */}
                    {isAdmin && !isSelf && (
                      <>
                        {!isMemberAdmin && (
                          <button
                            onClick={() => handlePromote(member._id)}
                            disabled={actionLoading === `promote-${member._id}`}
                            title="Promote to Admin"
                            className="p-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 transition-colors cursor-pointer"
                          >
                            {actionLoading === `promote-${member._id}` ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Shield className="w-3.5 h-3.5" />
                            )}
                          </button>
                        )}
                        <button
                          onClick={() => handleRemove(member._id)}
                          disabled={actionLoading === `remove-${member._id}`}
                          title="Remove Member"
                          className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors cursor-pointer"
                        >
                          {actionLoading === `remove-${member._id}` ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <UserMinus className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer Actions */}
          <div className="pt-4 mt-2 border-t border-[#334155] flex items-center justify-between">
            <button
              onClick={() => setShowLeaveConfirm(true)}
              className="px-3.5 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Leave Group</span>
            </button>

            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-[#0F172A] hover:bg-[#334155] text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* Leave Group Confirmation Modal */}
      {showLeaveConfirm && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in text-white">
          <div className="w-full max-w-sm bg-[#1E293B] border border-rose-500/30 rounded-2xl p-5 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400 mb-3">
              <div className="p-2 rounded-xl bg-rose-500/15 border border-rose-500/30">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-100">Leave Group</h3>
            </div>
            <p className="text-xs text-slate-300 mb-5 leading-relaxed">
              Are you sure you want to leave <strong className="text-white">{conversation.name || 'this group'}</strong>? You will lose access to future group messages unless an admin adds you back.
            </p>
            <div className="flex items-center justify-end gap-2.5">
              <button
                onClick={() => setShowLeaveConfirm(false)}
                disabled={actionLoading === 'leave'}
                className="px-4 py-2 rounded-xl bg-[#0F172A] hover:bg-[#334155] text-slate-300 text-xs font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmLeaveGroup}
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
      )}
    </>
  );
}
