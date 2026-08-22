export interface User {
  _id: string;
  name: string;
  phone: string;
  createdAt?: string;
  avatar?: string;
  isOnline?: boolean;
  lastSeen?: string;
}

export interface DirectParticipant {
  _id: string;
  name: string;
  phone: string;
  avatar?: string;
  isOnline?: boolean;
  lastSeen?: string;
}

export interface LastMessage {
  _id?: string;
  text?: string;
  sender?: string | User;
  senderId?: string;
  createdAt?: string;
  status?: 'sending' | 'sent' | 'delivered' | 'seen' | 'error';
}

export interface Conversation {
  _id: string;
  type: 'direct' | 'group';
  name?: string;
  participant?: DirectParticipant; // for direct chats
  participants?: User[];           // for group chats
  admins?: string[];               // user IDs for group admins
  createdBy?: string;              // creator user ID
  lastMessage?: LastMessage;
  updatedAt?: string;
  createdAt?: string;
  unreadCount?: number;
}

export interface Message {
  _id: string;
  conversationId: string;
  sender: User | string;
  text: string;
  createdAt: string;
  status?: 'sending' | 'sent' | 'delivered' | 'seen' | 'error';
  seenBy?: string[];
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface SearchUsersResponse {
  data: User[];
}

export interface ConversationsListResponse {
  data: Conversation[];
}

export interface MessagesHistoryResponse {
  data: Message[];
  hasMore?: boolean;
  nextCursor?: string;
}

export interface StartConversationResponse {
  data?: Conversation;
  _id?: string;
  type?: string;
  participant?: DirectParticipant;
}

export interface CreateGroupResponse {
  data?: Conversation;
  _id?: string;
  type?: string;
  name?: string;
  admins?: string[];
  participants?: User[];
}
