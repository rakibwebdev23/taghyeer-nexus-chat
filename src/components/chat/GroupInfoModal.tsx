'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useChat } from '@/context/ChatContext';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { User, Conversation } from '@/types/chat';
import { GroupInfoHeader } from './group-info/GroupInfoHeader';
import { GroupInfoRenameSection } from './group-info/GroupInfoRenameSection';
import { GroupInfoAddMemberSection } from './group-info/GroupInfoAddMemberSection';
import { GroupInfoMemberList } from './group-info/GroupInfoMemberList';
import { GroupInfoFooter } from './group-info/GroupInfoFooter';
import { LeaveGroupConfirmModal } from './group-info/LeaveGroupConfirmModal';

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

  // leave group confirmation modal state
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);

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
          <GroupInfoHeader
            conversationName={conversation.name || 'Group Chat'}
            participantsCount={participants.length}
            onlineCount={onlineCount}
            onClose={onClose}
          />

          {error && (
            <div className="mt-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-medium">
              {error}
            </div>
          )}

          <GroupInfoRenameSection
            isAdmin={isAdmin}
            isRenaming={isRenaming}
            setIsRenaming={setIsRenaming}
            newGroupName={newGroupName}
            setNewGroupName={setNewGroupName}
            handleRename={handleRename}
            actionLoading={actionLoading}
            conversationName={conversation.name || 'Group Chat'}
          />

          <GroupInfoAddMemberSection
            isAdmin={isAdmin}
            isAddingMember={isAddingMember}
            setIsAddingMember={setIsAddingMember}
            searchQuery={searchQuery}
            handleSearchChange={handleSearchChange}
            searching={searching}
            displayCandidates={displayCandidates}
            selectedNewUsers={selectedNewUsers}
            toggleSelectNewUser={toggleSelectNewUser}
            handleAddSelectedMembers={handleAddSelectedMembers}
            actionLoading={actionLoading}
            error={error}
            isUserOnline={isUserOnline}
          />

          <GroupInfoMemberList
            participants={participants}
            conversation={conversation}
            currentUser={currentUser}
            isUserOnline={isUserOnline}
            isAdmin={isAdmin}
            actionLoading={actionLoading}
            handleOpenDirectChat={handleOpenDirectChat}
            handlePromote={handlePromote}
            handleRemove={handleRemove}
          />

          <GroupInfoFooter
            onClose={onClose}
            onLeaveGroup={() => setShowLeaveConfirm(true)}
          />
        </div>
      </div>

      <LeaveGroupConfirmModal
        isOpen={showLeaveConfirm}
        conversationName={conversation.name || 'this group'}
        onCancel={() => setShowLeaveConfirm(false)}
        onConfirm={handleConfirmLeaveGroup}
        actionLoading={actionLoading}
      />
    </>
  );
}
