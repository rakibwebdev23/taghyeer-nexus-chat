import {
  LoginResponse,
  User,
  Conversation,
  Message,
} from '@/types/chat';
import { redisCache } from './cache';

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL;

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('nexus_chat_token');
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMessage =
      data?.error?.message || data?.message || `Request failed with status ${response.status}`;
    throw new Error(errorMessage);
  }

  return data as T;
}

export const api = {
  // auth
  async login(phone: string, name: string): Promise<LoginResponse> {
    const res = await request<LoginResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ phone, name }),
    });
    await redisCache.flush();
    return res;
  },

  async getMe(): Promise<{ user: User }> {
    const cacheKey = 'auth:me:' + (getToken() || '');
    const cached = await redisCache.get<{ user: User }>(cacheKey);
    if (cached) return cached;

    const res = await request<any>('/api/auth/me');
    const userObj = res.user || (res._id ? res : null);
    const result = { user: userObj };
    if (userObj) {
      await redisCache.set(cacheKey, result, 120);
    }
    return result;
  },

  // users search
  async searchUsers(query: string): Promise<User[]> {
    if (!query.trim()) return [];

    const sanitizedQuery = query
      .trim()
      .replace(/^\+/, '')
      .replace(/[.*+?^${}()|[\]\\]/g, '')
      .trim();

    if (!sanitizedQuery) return [];

    const cacheKey = `search:${sanitizedQuery.toLowerCase()}`;
    const cached = await redisCache.get<User[]>(cacheKey);
    if (cached) {
      console.log(`[Redis Cache HIT] searchUsers("${sanitizedQuery}")`);
      return cached;
    }

    try {
      const res = await request<any>(
        `/api/users/search?q=${encodeURIComponent(sanitizedQuery)}`
      );
      let list: User[] = [];
      if (Array.isArray(res)) list = res;
      else if (res && Array.isArray(res.data)) list = res.data;
      else if (res && Array.isArray(res.users)) list = res.users;

      await redisCache.set(cacheKey, list, 60);
      return list;
    } catch (err: any) {
      console.warn('[Users Search] Safe handling for backend regex error:', err.message);
      return [];
    }
  },

  // conversations
  async getConversations(): Promise<Conversation[]> {
    const token = getToken();
    if (!token) return [];
    const cacheKey = `conversations:${token.slice(-10)}`;
    const cached = await redisCache.get<Conversation[]>(cacheKey);
    if (cached) {
      console.log('[Redis Cache HIT] getConversations()');
      return cached;
    }

    const res = await request<any>('/api/conversations');
    let list: Conversation[] = [];
    if (Array.isArray(res)) list = res;
    else if (res && Array.isArray(res.data)) list = res.data;
    else if (res && Array.isArray(res.conversations)) list = res.conversations;

    await redisCache.set(cacheKey, list, 30);
    return list;
  },

  async startConversation(userId: string): Promise<Conversation> {
    const res = await request<any>('/api/conversations', {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
    await redisCache.invalidatePattern('conversations');
    return res.data || res;
  },

  // messages with chronological sorting
  async getMessages(
    conversationId: string,
    limit: number = 30,
    before?: string
  ): Promise<{ data: Message[]; hasMore?: boolean }> {
    const cacheKey = `messages:${conversationId}:${limit}:${before || 'latest'}`;
    const cached = await redisCache.get<{ data: Message[]; hasMore?: boolean }>(cacheKey);
    if (cached) {
      console.log(`[Redis Cache HIT] getMessages(${conversationId})`);
      return cached;
    }

    let url = `/api/conversations/${conversationId}/messages?limit=${limit}`;
    if (before) {
      url += `&before=${before}`;
    }
    const res = await request<any>(url);
    let messages: Message[] = Array.isArray(res)
      ? res
      : res.messages || res.data || [];

    messages = [...messages].sort(
      (a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime()
    );

    const result = {
      data: messages,
      hasMore: messages.length === limit,
    };

    await redisCache.set(cacheKey, result, 120);
    return result;
  },

  async sendMessage(conversationId: string, text: string): Promise<Message> {
    const res = await request<any>('/api/messages', {
      method: 'POST',
      body: JSON.stringify({ conversationId, text }),
    });
    await redisCache.invalidatePattern(`messages:${conversationId}`);
    await redisCache.invalidatePattern('conversations');
    return res.data || res;
  },

  // groups
  async createGroup(name: string, participantIds: string[]): Promise<Conversation> {
    const res = await request<any>('/api/conversations/group', {
      method: 'POST',
      body: JSON.stringify({ name, participantIds }),
    });
    await redisCache.invalidatePattern('conversations');
    return res.data || res;
  },

  async addParticipants(
    conversationId: string,
    userIds: string[]
  ): Promise<any> {
    const res = await request<any>(`/api/conversations/${conversationId}/participants`, {
      method: 'POST',
      body: JSON.stringify({ userIds }),
    });
    await redisCache.invalidatePattern('conversations');
    return res;
  },

  async removeParticipant(
    conversationId: string,
    userId: string
  ): Promise<any> {
    const res = await request<any>(
      `/api/conversations/${conversationId}/participants/${userId}`,
      {
        method: 'DELETE',
      }
    );
    await redisCache.invalidatePattern('conversations');
    return res;
  },

  async promoteAdmin(conversationId: string, userId: string): Promise<any> {
    const res = await request<any>(`/api/conversations/${conversationId}/admins`, {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
    await redisCache.invalidatePattern('conversations');
    return res;
  },

  async renameGroup(conversationId: string, name: string): Promise<any> {
    const res = await request<any>(`/api/conversations/${conversationId}`, {
      method: 'PATCH',
      body: JSON.stringify({ name }),
    });
    await redisCache.invalidatePattern('conversations');
    return res;
  },
};
