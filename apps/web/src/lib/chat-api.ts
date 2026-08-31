import { api } from './api-client';

export interface ChatThreadSummary {
  id: string;
  otherUser: { id: string; name: string; avatar: string | null };
  lastMessage: string | null;
  lastMessageAt: string;
}

export interface ChatMessage {
  id: string;
  threadId: string;
  senderId: string;
  content: string;
  createdAt: string;
}

export const chatApi = {
  createThread: (otherUserId: string, jobPostId?: string) =>
    api.post<{ id: string }>('/chat/threads', { otherUserId, jobPostId }).then((r) => r.data),
  listMine: () => api.get<ChatThreadSummary[]>('/chat/threads/mine').then((r) => r.data),
  listMessages: (threadId: string) => api.get<ChatMessage[]>(`/chat/threads/${threadId}/messages`).then((r) => r.data),
  sendMessage: (threadId: string, content: string) =>
    api.post<ChatMessage>(`/chat/threads/${threadId}/messages`, { content }).then((r) => r.data),
};