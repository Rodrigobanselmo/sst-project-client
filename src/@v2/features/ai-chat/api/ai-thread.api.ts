import { api } from 'core/services/apiClient';

// Types
export interface AIThread {
  id: string;
  title: string;
  lastMessageAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AIMessageAttachment {
  id: string;
  fileId: string;
  filename: string;
  mimeType: string;
  size: number;
  key: string;
  bucket: string;
  region: string;
  url?: string | null;
}

export interface AIMessagePendingAction {
  id: string;
  service: string;
  payload: any;
  status: string;
  summary: string | null;
  errorMessage: string | null;
}

export interface AIMessage {
  id: string;
  threadId: string;
  role: string;
  content: string;
  toolName?: string | null;
  toolStatus?: string | null;
  toolDescription?: string | null;
  createdAt: string;
  attachments?: AIMessageAttachment[];
  pendingActions?: AIMessagePendingAction[];
}

export interface AIMessageEdge {
  cursor: string;
  node: AIMessage;
}

export interface AIMessagePageInfo {
  hasNextPage: boolean;
  endCursor: string | null;
}

export interface AIMessageConnection {
  edges: AIMessageEdge[];
  pageInfo: AIMessagePageInfo;
  totalCount: number;
}

export interface AIThreadEdge {
  cursor: string;
  node: AIThread;
}

export interface AIThreadPageInfo {
  hasNextPage: boolean;
  endCursor: string | null;
}

export interface AIThreadConnection {
  edges: AIThreadEdge[];
  pageInfo: AIThreadPageInfo;
  totalCount: number;
}

// API functions

export async function createThread(input?: {
  title?: string;
}): Promise<AIThread> {
  const { data } = await api.post<AIThread>('/ai-chat/threads', input ?? {});
  return data;
}

export async function listThreads(params?: {
  first?: number;
  after?: string | null;
  search?: string | null;
}): Promise<AIThreadConnection> {
  const { data } = await api.get<AIThreadConnection>('/ai-chat/threads', {
    params: {
      first: params?.first ?? 20,
      after: params?.after ?? undefined,
      search: params?.search ?? undefined,
    },
  });
  return data;
}

export async function getThread(id: string): Promise<AIThread> {
  const { data } = await api.get<AIThread>(`/ai-chat/threads/${id}`);
  return data;
}

export async function updateThread(
  id: string,
  input: { title: string },
): Promise<AIThread> {
  const { data } = await api.patch<AIThread>(`/ai-chat/threads/${id}`, input);
  return data;
}

export async function deleteThread(id: string): Promise<void> {
  await api.delete(`/ai-chat/threads/${id}`);
}

export async function getMessages(
  threadId: string,
  params?: { first?: number; before?: string | null },
): Promise<AIMessageConnection> {
  const { data } = await api.get<AIMessageConnection>(
    `/ai-chat/threads/${threadId}/messages`,
    {
      params: {
        first: params?.first ?? 20,
        before: params?.before ?? undefined,
      },
    },
  );
  return data;
}
