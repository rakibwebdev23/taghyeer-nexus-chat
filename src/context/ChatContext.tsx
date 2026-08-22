'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useCallback,
  useRef,
} from 'react';
import { Conversation, Message } from '@/types/chat';
import { api } from '@/lib/api';
import { getSocket } from '@/lib/socket';
import { useAuth } from './AuthContext';
import { useAppDispatch, useAppSelector } from '@/store';
import {
  fetchConversations,
  selectConversationThunk,
  loadMoreMessagesThunk,
  sendMessageThunk,
  setActiveConversationId,
  addIncomingSocketMessage,
  setOnlineUsers,
  setUserOnline,
  setUserOffline,
  markMessagesAsSeen,
} from '@/store/slices/chatSlice';

interface ChatContextType {
  conversations: Conversation[];
  activeConversation: Conversation | null;
  messages: Message[];
  isLoadingConversations: boolean;
  isLoadingMessages: boolean;
  hasMoreMessages: boolean;
  isSending: boolean;
  onlineUsers: string[];
  lastSeenMap: Record<string, string>;
  selectConversation: (conversationId: string) => Promise<void>;
  sendMessage: (text: string) => Promise<void>;
  loadMoreMessages: () => Promise<void>;
  startDirectChat: (userId: string) => Promise<Conversation>;
  createGroup: (name: string, participantIds: string[]) => Promise<Conversation>;
  addParticipants: (groupId: string, userIds: string[]) => Promise<void>;
  removeParticipant: (groupId: string, userId: string) => Promise<void>;
  promoteAdmin: (groupId: string, userId: string) => Promise<void>;
  renameGroup: (groupId: string, name: string) => Promise<void>;
  refreshConversations: () => Promise<void>;
  unreads: Record<string, number>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const { user, token } = useAuth();
  const dispatch = useAppDispatch();

  const {
    conversations,
    activeConversationId,
    messages: allMessages,
    isLoadingConversations,
    isLoadingMessages,
    hasMoreMessages,
    isSending,
    unreads,
    onlineUsers,
    lastSeenMap,
  } = useAppSelector((state) => state.chat);

  const activeConversation =
    conversations.find((c) => c._id === activeConversationId) || null;
  const messages = activeConversationId ? allMessages[activeConversationId] || [] : [];

  const activeConvIdRef = useRef<string | null>(null);
  activeConvIdRef.current = activeConversationId;

  // Refresh conversations from Redux
  const refreshConversations = useCallback(async () => {
    if (!token) return;
    await dispatch(fetchConversations());
  }, [token, dispatch]);

  useEffect(() => {
    if (token) {
      refreshConversations();
    }
  }, [token, refreshConversations]);

  // Socket event handler dispatches Redux action & real-time read receipts
  useEffect(() => {
    if (!token) return;

    const socket = getSocket();
    if (!socket) return;

    const handleNewMessage = (newMsg: Message) => {
      console.log('[Socket -> Redux] Received message:new', newMsg);
      dispatch(addIncomingSocketMessage(newMsg));

      const currentActive = activeConvIdRef.current;
      const convId = typeof newMsg.conversationId === 'string'
        ? newMsg.conversationId
        : (newMsg as any).conversation;

      // If active conversation matches receiver, acknowledge read receipt to socket room
      if (currentActive && (currentActive === convId || currentActive === (newMsg as any).conversation?._id)) {
        socket.emit('message:read', { conversationId: currentActive });
        socket.emit('message:seen', { conversationId: currentActive });
      }
    };

    const handleConversationUpdated = (updatedConvData: any) => {
      console.log('[Socket -> Redux] Received conversation:updated', updatedConvData);
      dispatch(fetchConversations());
    };

    const handleMessageRead = (data: any) => {
      const cId = typeof data === 'string' ? data : data?.conversationId || data?.conversation;
      if (cId) {
        dispatch(markMessagesAsSeen({ conversationId: cId }));
      }
    };

    const handleOnlineUsers = (usersList: string[]) => {
      if (Array.isArray(usersList)) {
        dispatch(setOnlineUsers(usersList));
      }
    };

    const handleUserOnline = (data: any) => {
      const uId = typeof data === 'string' ? data : data?.userId || data?._id;
      if (uId) {
        dispatch(setUserOnline(uId));
      }
    };

    const handleUserOffline = (data: any) => {
      const uId = typeof data === 'string' ? data : data?.userId || data?._id;
      if (uId) {
        dispatch(setUserOffline(uId));
      }
    };

    socket.on('message:new', handleNewMessage);
    socket.on('message:read', handleMessageRead);
    socket.on('message:seen', handleMessageRead);
    socket.on('conversation:read', handleMessageRead);
    socket.on('conversation:updated', handleConversationUpdated);
    socket.on('presence:sync', handleOnlineUsers);
    socket.on('users:online', handleOnlineUsers);
    socket.on('user:online', handleUserOnline);
    socket.on('user:offline', handleUserOffline);
    socket.on('user:connect', handleUserOnline);
    socket.on('user:disconnect', handleUserOffline);

    // Request online users list on connection
    socket.emit('getOnlineUsers');

    return () => {
      socket.off('message:new', handleNewMessage);
      socket.off('message:read', handleMessageRead);
      socket.off('message:seen', handleMessageRead);
      socket.off('conversation:read', handleMessageRead);
      socket.off('conversation:updated', handleConversationUpdated);
      socket.off('presence:sync', handleOnlineUsers);
      socket.off('users:online', handleOnlineUsers);
      socket.off('user:online', handleUserOnline);
      socket.off('user:offline', handleUserOffline);
      socket.off('user:connect', handleUserOnline);
      socket.off('user:disconnect', handleUserOffline);
    };
  }, [token, dispatch]);

  const selectConversation = useCallback(
    async (conversationId: string) => {
      dispatch(setActiveConversationId(conversationId));
      if (conversationId) {
        const socket = getSocket();
        if (socket) {
          socket.emit('message:read', { conversationId });
          socket.emit('message:seen', { conversationId });
          socket.emit('conversation:read', { conversationId });
        }
        await dispatch(selectConversationThunk(conversationId));
      }
    },
    [dispatch]
  );

  const loadMoreMessages = useCallback(async () => {
    if (!activeConversationId || messages.length === 0 || isLoadingMessages || !hasMoreMessages) return;

    const oldestMessage = messages[0];
    if (!oldestMessage?._id) return;

    await dispatch(
      loadMoreMessagesThunk({
        conversationId: activeConversationId,
        before: oldestMessage._id,
      })
    );
  }, [activeConversationId, messages, isLoadingMessages, hasMoreMessages, dispatch]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!activeConversationId || !user) return;
      await dispatch(
        sendMessageThunk({ conversationId: activeConversationId, text, currentUser: user })
      );
    },
    [activeConversationId, user, dispatch]
  );

  const startDirectChat = useCallback(
    async (targetUserId: string) => {
      const existing = conversations.find(
        (c) => c.type === 'direct' && c.participant && c.participant._id === targetUserId
      );

      if (existing) {
        dispatch(setActiveConversationId(existing._id));
        await dispatch(selectConversationThunk(existing._id));
        return existing;
      }

      const res = await api.startConversation(targetUserId);
      await dispatch(fetchConversations());
      const convId = res._id || (res as any).data?._id;
      if (convId) {
        dispatch(setActiveConversationId(convId));
        await dispatch(selectConversationThunk(convId));
      }
      return res;
    },
    [conversations, dispatch]
  );

  const createGroup = useCallback(
    async (name: string, participantIds: string[]) => {
      const res = await api.createGroup(name, participantIds);
      await dispatch(fetchConversations());
      const convId = res._id || (res as any).data?._id;
      if (convId) {
        dispatch(setActiveConversationId(convId));
        await dispatch(selectConversationThunk(convId));
      }
      return res;
    },
    [dispatch]
  );

  const addParticipants = useCallback(
    async (groupId: string, userIds: string[]) => {
      await api.addParticipants(groupId, userIds);
      await dispatch(fetchConversations());
      if (activeConversationId === groupId) {
        await dispatch(selectConversationThunk(groupId));
      }
    },
    [activeConversationId, dispatch]
  );

  const removeParticipant = useCallback(
    async (groupId: string, userId: string) => {
      await api.removeParticipant(groupId, userId);
      await dispatch(fetchConversations());
      if (activeConversationId === groupId) {
        await dispatch(selectConversationThunk(groupId));
      }
    },
    [activeConversationId, dispatch]
  );

  const promoteAdmin = useCallback(
    async (groupId: string, userId: string) => {
      await api.promoteAdmin(groupId, userId);
      await dispatch(fetchConversations());
      if (activeConversationId === groupId) {
        await dispatch(selectConversationThunk(groupId));
      }
    },
    [activeConversationId, dispatch]
  );

  const renameGroup = useCallback(
    async (groupId: string, name: string) => {
      await api.renameGroup(groupId, name);
      await dispatch(fetchConversations());
      if (activeConversationId === groupId) {
        await dispatch(selectConversationThunk(groupId));
      }
    },
    [activeConversationId, dispatch]
  );

  return (
    <ChatContext.Provider
      value={{
        conversations,
        activeConversation,
        messages,
        isLoadingConversations,
        isLoadingMessages,
        hasMoreMessages,
        isSending,
        onlineUsers,
        lastSeenMap,
        selectConversation,
        sendMessage,
        loadMoreMessages,
        startDirectChat,
        createGroup,
        addParticipants,
        removeParticipant,
        promoteAdmin,
        renameGroup,
        refreshConversations,
        unreads,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}
