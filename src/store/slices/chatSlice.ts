import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Conversation, Message, User } from '@/types/chat';
import { api } from '@/lib/api';

interface ChatState {
  conversations: Conversation[];
  activeConversationId: string | null;
  messages: Record<string, Message[]>; // conversationId -> messages
  isLoadingConversations: boolean;
  isLoadingMessages: boolean;
  hasMoreMessages: boolean;
  isSending: boolean;
  unreads: Record<string, number>;
  onlineUsers: string[]; // List of online user IDs or phones
  lastSeenMap: Record<string, string>; // userId -> ISO timestamp
}

const initialState: ChatState = {
  conversations: [],
  activeConversationId: null,
  messages: {},
  isLoadingConversations: false,
  isLoadingMessages: false,
  hasMoreMessages: false,
  isSending: false,
  unreads: {},
  onlineUsers: [],
  lastSeenMap: {},
};

// Helper to safely extract clean conversation ID string from socket/REST payload
const extractConvId = (payload: any): string | null => {
  if (!payload) return null;
  if (typeof payload.conversationId === 'string') return payload.conversationId;
  if (typeof payload.conversation === 'string') return payload.conversation;
  if (payload.conversation && typeof payload.conversation._id === 'string') return payload.conversation._id;
  if (payload.conversationId && typeof payload.conversationId._id === 'string') return payload.conversationId._id;
  return null;
};

// Helper to extract clean sender ID string from socket/REST payload
const extractSenderId = (sender: any): string => {
  if (!sender) return '';
  if (typeof sender === 'string') return sender;
  if (typeof sender === 'object') return sender._id || sender.phone || sender.name || '';
  return String(sender);
};

// Helper to safely sort and deduplicate messages (preserves distinct messages, purges temporary duplicates)
const sortChronologically = (msgs: Message[]): Message[] => {
  const map = new Map<string, Message>();

  msgs.forEach((m) => {
    if (!m || !m.text) return;

    const senderId = extractSenderId(m.sender);
    const textTrimmed = m.text.trim();
    const isRealMongoId = m._id && !m._id.startsWith('temp-') && !m._id.startsWith('soc_') && !m._id.startsWith('soc-');

    if (isRealMongoId) {
      // 1. Set real MongoDB message in map by its permanent _id
      map.set(m._id, m);

      // 2. Purge any temporary / socket placeholder matching same sender, text, and timestamp window (within 60s)
      const realTime = new Date(m.createdAt || 0).getTime();
      for (const [k, existing] of Array.from(map.entries())) {
        if (k.startsWith('temp-') || k.startsWith('soc_') || k.startsWith('soc-')) {
          const exSenderId = extractSenderId(existing.sender);
          const exTime = new Date(existing.createdAt || 0).getTime();
          const timeDiff = Math.abs(realTime - exTime);

          if (exSenderId === senderId && existing.text.trim() === textTrimmed && timeDiff < 60000) {
            map.delete(k);
          }
        }
      }
    } else {
      // Temporary or socket message: check if real MongoDB message with same content & timestamp window exists
      const timeMs = new Date(m.createdAt || 0).getTime();
      const realAlreadyExists = Array.from(map.values()).some((existing) => {
        if (!existing._id || existing._id.startsWith('temp-') || existing._id.startsWith('soc_') || existing._id.startsWith('soc-')) {
          return false;
        }
        const exSenderId = extractSenderId(existing.sender);
        const exTime = new Date(existing.createdAt || 0).getTime();
        return exSenderId === senderId && existing.text.trim() === textTrimmed && Math.abs(timeMs - exTime) < 60000;
      });

      if (!realAlreadyExists) {
        // Use unique key for temp/socket messages so distinct messages are never lost
        const tempKey = m._id || `temp_${senderId}_${encodeURIComponent(textTrimmed)}_${timeMs}`;
        if (!map.has(tempKey)) {
          map.set(tempKey, m);
        }
      }
    }
  });

  const uniqueMsgs = Array.from(map.values());
  return uniqueMsgs.sort(
    (a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime()
  );
};

// Async Thunks
export const fetchConversations = createAsyncThunk(
  'chat/fetchConversations',
  async () => {
    return await api.getConversations();
  }
);

export const selectConversationThunk = createAsyncThunk(
  'chat/selectConversation',
  async (conversationId: string) => {
    const res = await api.getMessages(conversationId, 100);
    return { conversationId, messages: res.data, hasMore: !!res.hasMore };
  }
);

export const loadMoreMessagesThunk = createAsyncThunk(
  'chat/loadMoreMessages',
  async (
    { conversationId, before }: { conversationId: string; before: string },
    { rejectWithValue }
  ) => {
    try {
      const res = await api.getMessages(conversationId, 100, before);
      return { conversationId, messages: res.data, hasMore: res.data.length === 100 };
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const sendMessageThunk = createAsyncThunk(
  'chat/sendMessage',
  async (
    { conversationId, text, currentUser }: { conversationId: string; text: string; currentUser: User },
    { dispatch }
  ) => {
    const tempId = `temp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const optimisticMsg: Message = {
      _id: tempId,
      conversationId,
      sender: currentUser,
      text: text.trim(),
      createdAt: new Date().toISOString(),
      status: 'sending',
    };

    dispatch(addOptimisticMessage({ conversationId, message: optimisticMsg }));

    try {
      const sentMsg = await api.sendMessage(conversationId, text.trim());
      dispatch(replaceOptimisticMessage({ conversationId, tempId, realMessage: sentMsg }));
      return sentMsg;
    } catch (err: any) {
      dispatch(markMessageError({ conversationId, tempId }));
      throw err;
    }
  }
);

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setActiveConversationId(state, action: PayloadAction<string | null>) {
      state.activeConversationId = action.payload;
      if (action.payload) {
        state.unreads[action.payload] = 0;
      }
    },
    setOnlineUsers(state, action: PayloadAction<string[]>) {
      state.onlineUsers = Array.from(new Set(action.payload));
      action.payload.forEach((id) => {
        state.lastSeenMap[id] = new Date().toISOString();
      });
    },
    setUserOnline(state, action: PayloadAction<string>) {
      if (action.payload) {
        if (!state.onlineUsers.includes(action.payload)) {
          state.onlineUsers.push(action.payload);
        }
        state.lastSeenMap[action.payload] = new Date().toISOString();
      }
    },
    setUserOffline(state, action: PayloadAction<string>) {
      if (action.payload) {
        state.onlineUsers = state.onlineUsers.filter((id) => id !== action.payload);
        state.lastSeenMap[action.payload] = new Date().toISOString();
      }
    },
    markMessagesAsSeen(state, action: PayloadAction<{ conversationId: string }>) {
      const { conversationId } = action.payload;
      if (state.messages[conversationId]) {
        state.messages[conversationId] = state.messages[conversationId].map((m) =>
          m.status === 'sent' ? { ...m, status: 'seen' } : m
        );
      }
    },
    addIncomingSocketMessage(state, action: PayloadAction<Message>) {
      const rawMsg = action.payload;
      const convId = extractConvId(rawMsg);
      if (!convId) return;

      const senderId = extractSenderId(rawMsg.sender);
      const textTrimmed = (rawMsg.text || '').trim();
      const createdAtISO = rawMsg.createdAt || new Date().toISOString();
      const timeBucket = Math.floor(new Date(createdAtISO).getTime() / 5000);

      // Mark sender as online when receiving a real-time message
      if (senderId) {
        if (!state.onlineUsers.includes(senderId)) {
          state.onlineUsers.push(senderId);
        }
        state.lastSeenMap[senderId] = createdAtISO;
      }

      // Incoming socket message: default to 'sent' (Single Tick) unless partner marks as seen
      const isCurrentActive = state.activeConversationId === convId;
      const initialStatus: 'sent' | 'seen' = isCurrentActive ? 'seen' : 'sent';

      // Generate deterministic stable ID for socket events without _id
      const safeId =
        rawMsg._id || `soc_${convId}_${senderId}_${encodeURIComponent(textTrimmed)}_${timeBucket}`;

      const msg: Message = {
        ...rawMsg,
        _id: safeId,
        conversationId: convId,
        createdAt: createdAtISO,
        status: initialStatus,
      };

      if (!state.messages[convId]) {
        state.messages[convId] = [];
      }

      // 1. Check if message already exists by exact _id
      const existingIdx = state.messages[convId].findIndex((m) => m._id === msg._id);

      if (existingIdx !== -1) {
        state.messages[convId][existingIdx] = { ...msg, status: initialStatus };
      } else {
        // 2. Check if there's an optimistic message (status === 'sending') with matching text & sender
        const tempIdx = state.messages[convId].findIndex((m) => {
          if (m.status !== 'sending') return false;
          const mSenderId = extractSenderId(m.sender);
          return m.text.trim() === textTrimmed && mSenderId === senderId;
        });

        if (tempIdx !== -1) {
          state.messages[convId][tempIdx] = { ...msg, status: initialStatus };
        } else {
          state.messages[convId].push(msg);
        }
      }

      // Maintain strict chronological sorting & content deduplication
      state.messages[convId] = sortChronologically(state.messages[convId]);

      if (!isCurrentActive) {
        state.unreads[convId] = (state.unreads[convId] || 0) + 1;
      }

      // Update lastMessage in conversations list & move to top
      const idx = state.conversations.findIndex((c) => c._id === convId);
      if (idx !== -1) {
        const updated = {
          ...state.conversations[idx],
          lastMessage: {
            _id: msg._id,
            text: msg.text,
            sender: msg.sender,
            createdAt: msg.createdAt,
            status: initialStatus,
          },
          updatedAt: msg.createdAt,
        };
        state.conversations.splice(idx, 1);
        state.conversations.unshift(updated);
      }
    },
    addOptimisticMessage(state, action: PayloadAction<{ conversationId: string; message: Message }>) {
      const { conversationId, message } = action.payload;
      const convId = extractConvId({ conversationId }) || conversationId;
      if (!state.messages[convId]) {
        state.messages[convId] = [];
      }
      state.messages[convId].push(message);
      state.messages[convId] = sortChronologically(state.messages[convId]);
    },
    replaceOptimisticMessage(
      state,
      action: PayloadAction<{ conversationId: string; tempId: string; realMessage: Message }>
    ) {
      const { conversationId, tempId, realMessage } = action.payload;
      const convId = extractConvId({ conversationId }) || conversationId;

      // Sent messages ALWAYS start as 'sent' (Single Tick ✓) on the sender's screen until recipient receives/views it
      const targetStatus: 'sent' = 'sent';

      if (state.messages[convId]) {
        state.messages[convId] = state.messages[convId].map((m) =>
          m._id === tempId ? { ...realMessage, status: targetStatus } : m
        );
        state.messages[convId] = sortChronologically(state.messages[convId]);
      }

      const idx = state.conversations.findIndex((c) => c._id === convId);
      if (idx !== -1) {
        const updated = {
          ...state.conversations[idx],
          lastMessage: {
            _id: realMessage._id,
            text: realMessage.text,
            sender: realMessage.sender,
            createdAt: realMessage.createdAt,
            status: targetStatus,
          },
          updatedAt: realMessage.createdAt,
        };
        state.conversations.splice(idx, 1);
        state.conversations.unshift(updated);
      }
    },
    markMessageError(state, action: PayloadAction<{ conversationId: string; tempId: string }>) {
      const { conversationId, tempId } = action.payload;
      const convId = extractConvId({ conversationId }) || conversationId;
      if (state.messages[convId]) {
        state.messages[convId] = state.messages[convId].map((m) =>
          m._id === tempId ? { ...m, status: 'error' } : m
        );
      }
    },
  },
  extraReducers: (builder) => {
    // Fetch Conversations
    builder.addCase(fetchConversations.pending, (state) => {
      state.isLoadingConversations = true;
    });
    builder.addCase(fetchConversations.fulfilled, (state, action: PayloadAction<Conversation[]>) => {
      state.isLoadingConversations = false;
      const rawList = action.payload || [];

      // Deduplicate direct conversations so each target user partner has exactly 1 active conversation
      const deduplicated: Conversation[] = [];
      const seenDirectPartners = new Set<string>();

      rawList.forEach((conv) => {
        if (conv.type === 'direct' && conv.participant?._id) {
          if (!seenDirectPartners.has(conv.participant._id)) {
            seenDirectPartners.add(conv.participant._id);
            deduplicated.push(conv);
          }
          if (conv.updatedAt) {
            state.lastSeenMap[conv.participant._id] = conv.updatedAt;
            if (conv.participant.phone) {
              state.lastSeenMap[conv.participant.phone] = conv.updatedAt;
            }
          }
        } else {
          deduplicated.push(conv);
        }
      });

      state.conversations = deduplicated;
    });
    builder.addCase(fetchConversations.rejected, (state) => {
      state.isLoadingConversations = false;
    });

    // Select Conversation — Merge fetched messages with existing local messages
    builder.addCase(selectConversationThunk.pending, (state) => {
      state.isLoadingMessages = true;
    });
    builder.addCase(selectConversationThunk.fulfilled, (state, action) => {
      state.isLoadingMessages = false;
      const { conversationId, messages } = action.payload;
      const existing = state.messages[conversationId] || [];

      // Default status for fetched messages is 'sent' (Single Tick ✓)
      const processedMessages = messages.map((m) => {
        if (!m.status) {
          return {
            ...m,
            status: 'sent' as const,
          };
        }
        return m;
      });

      const combined = [...existing, ...processedMessages];
      state.messages[conversationId] = sortChronologically(combined);
      state.hasMoreMessages = action.payload.hasMore;
    });
    builder.addCase(selectConversationThunk.rejected, (state) => {
      state.isLoadingMessages = false;
    });

    // Load More Messages
    builder.addCase(loadMoreMessagesThunk.fulfilled, (state, action) => {
      const { conversationId, messages, hasMore } = action.payload;
      const existing = state.messages[conversationId] || [];
      const combined = [...messages, ...existing];
      state.messages[conversationId] = sortChronologically(combined);
      state.hasMoreMessages = hasMore;
    });
  },
});

export const {
  setActiveConversationId,
  setOnlineUsers,
  setUserOnline,
  setUserOffline,
  markMessagesAsSeen,
  addIncomingSocketMessage,
  addOptimisticMessage,
  replaceOptimisticMessage,
  markMessageError,
} = chatSlice.actions;

export default chatSlice.reducer;
