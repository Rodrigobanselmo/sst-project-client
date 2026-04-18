import { useState, useRef } from 'react';
import { parseCookies } from 'nookies';
import type { PageContext } from './use-page-context';

type AIMode = 'fast' | 'smarter';
const DEFAULT_AI_MODE: AIMode = 'smarter';

export interface ChatMessageAttachment {
  id: string;
  fileId: string;
  filename: string;
  mimeType: string;
  size: number;
  url: string | null;
}

export interface NavigationData {
  kind: 'route' | 'modal';
  target: string;
  label: string;
  description?: string;
  params: Record<string, string>;
  icon?: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'tool' | 'agent' | 'action' | 'navigation';
  content: string;
  toolName?: string;
  toolStatus?: 'running' | 'success' | 'error';
  toolDescription?: string;
  agentName?: string;
  timestamp: Date;
  files?: ChatMessageAttachment[];
  actionData?: {
    actionId: string;
    summary: string;
    details: Record<string, unknown>;
    status: 'pending' | 'executing' | 'completed' | 'failed' | 'cancelled';
  };
  navigationData?: NavigationData;
}

// Stream event types from the backend
type StreamEvent =
  | { type: 'content'; content: string }
  | {
      type: 'tool_start';
      tool: string;
      args: Record<string, unknown>;
      description: string;
    }
  | { type: 'tool_end'; tool: string; result: string; success: boolean }
  | { type: 'agent_start'; agent: string; name: string; description: string }
  | { type: 'agent_end'; agent: string; success: boolean }
  | {
      type: 'action_card';
      actionId: string;
      summary: string;
      details: Record<string, unknown>;
    }
  | {
      type: 'navigation_card';
      kind: 'route' | 'modal';
      target: string;
      label: string;
      description?: string;
      params: Record<string, string>;
      icon?: string;
    }
  | { type: 'error'; message: string };

export interface SendMessageOptions {
  message: string;
  threadId?: string | null;
  mode?: AIMode;
  fileIds?: string[];
  attachments?: ChatMessageAttachment[];
  pageContext?: PageContext;
}

interface UseAIChatStreamReturn {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  sendMessage: (options: SendMessageOptions) => Promise<void>;
  clearMessages: () => void;
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  interrupt: () => void;
}

export { DEFAULT_AI_MODE };
export type { AIMode };

export function useAIChatStream(): UseAIChatStreamReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const sendMessage = async (options: SendMessageOptions) => {
    const {
      message,
      threadId,
      mode = DEFAULT_AI_MODE,
      fileIds,
      attachments,
      pageContext,
    } = options;
    if (!message.trim() || isLoading) return;

    setError(null);
    setIsLoading(true);

    // Add user message
    const userMessage: ChatMessage = {
      role: 'user',
      content: message,
      timestamp: new Date(),
      files: attachments,
    };
    setMessages((prev) => [...prev, userMessage]);

    // Prepare history (only user/assistant messages, not tool messages)
    const history = messages
      .filter((msg) => msg.role !== 'tool')
      .map((msg) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      }));

    try {
      abortControllerRef.current = new AbortController();

      const cookies = parseCookies();
      const token = cookies['nextauth.token'];
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';

      // Use the REST streaming endpoint
      const streamUrl = threadId
        ? `${baseUrl}/ai-chat/threads/${threadId}/messages/stream`
        : `${baseUrl}/ai-chat/threads/stream`;

      const response = await fetch(streamUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message,
          history,
          mode,
          ...(fileIds && fileIds.length > 0 ? { fileIds } : {}),
          ...(pageContext ? { pageContext } : {}),
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();
      let assistantContent = ''; // Accumulates content for CURRENT text block
      let navigationEmittedThisTurn = false; // Suppress duplicate post-card text
      let lastChunkTime = Date.now();
      const CHUNK_TIMEOUT = 120000; // 2 minutes without receiving data = connection lost

      while (true) {
        // Check if we've been waiting too long for data
        if (Date.now() - lastChunkTime > CHUNK_TIMEOUT) {
          console.error(
            '[AI Chat] Stream timeout - no data received for 2 minutes',
          );
          setError(
            'Conexão perdida (timeout). As mensagens foram salvas e aparecerão após recarregar.',
          );
          break;
        }

        const { done, value } = await reader.read();
        if (done) {
          console.log(
            '[AI Chat] Stream done, accumulated content:',
            assistantContent.length,
          );
          break;
        }

        // Reset timeout on each chunk received
        lastChunkTime = Date.now();

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              console.log('[AI Chat] Received [DONE] marker');
              continue;
            }

            try {
              const event = JSON.parse(data) as StreamEvent;

              if (event.type === 'agent_start') {
                // Any text accumulated so far is sealed in a previous assistant
                // message. Clear the buffer so the post-stream final-update
                // doesn't re-create a duplicate.
                assistantContent = '';
                setMessages((prev) => [
                  ...prev,
                  {
                    role: 'agent',
                    content: event.description,
                    agentName: event.name,
                    timestamp: new Date(),
                  },
                  // Add automatic "preparing" indicator
                  {
                    role: 'tool',
                    content: 'Preparando resposta...',
                    toolName: `${event.agent}_preparing`,
                    toolStatus: 'running',
                    toolDescription: 'Preparando resposta...',
                    timestamp: new Date(),
                  },
                ]);
              } else if (event.type === 'agent_end') {
                // Agent finished - mark preparing as complete
                setMessages((prev) => {
                  const updated = [...prev];
                  for (let i = updated.length - 1; i >= 0; i--) {
                    const msg = updated[i];
                    if (
                      msg?.role === 'tool' &&
                      msg.toolName?.endsWith('_preparing') &&
                      msg.toolStatus === 'running'
                    ) {
                      updated[i] = {
                        role: 'tool',
                        content: '\u2713 Preparando resposta...',
                        toolName: msg.toolName,
                        toolStatus: 'success',
                        toolDescription: msg.toolDescription,
                        timestamp: msg.timestamp,
                      };
                      break;
                    }
                  }
                  return updated;
                });
              } else if (event.type === 'tool_start') {
                // Seal any pending assistant text in the previous message.
                assistantContent = '';
                const displayName = event.description;
                setMessages((prev) => [
                  ...prev,
                  {
                    role: 'tool',
                    content: displayName,
                    toolName: event.tool,
                    toolStatus: 'running',
                    toolDescription: displayName,
                    timestamp: new Date(),
                  },
                ]);
              } else if (event.type === 'tool_end') {
                setMessages((prev) => {
                  const updated = [...prev];
                  for (let i = updated.length - 1; i >= 0; i--) {
                    const msg = updated[i];
                    if (
                      msg?.role === 'tool' &&
                      msg.toolName === event.tool &&
                      msg.toolStatus === 'running'
                    ) {
                      const displayName = msg.toolDescription ?? event.tool;
                      updated[i] = {
                        role: 'tool',
                        content: event.success
                          ? `\u2713 ${displayName}`
                          : `\u2717 ${displayName}: ${event.result}`,
                        toolName: msg.toolName,
                        toolStatus: event.success ? 'success' : 'error',
                        toolDescription: msg.toolDescription,
                        timestamp: msg.timestamp,
                      };
                      break;
                    }
                  }
                  return updated;
                });
              } else if (event.type === 'action_card') {
                // Seal any pending assistant text.
                assistantContent = '';
                // Add action card message
                setMessages((prev) => [
                  ...prev,
                  {
                    role: 'action',
                    content: '', // Content will be rendered by ActionCard component
                    timestamp: new Date(),
                    actionData: {
                      actionId: event.actionId,
                      summary: event.summary,
                      details: event.details,
                      status: 'pending',
                    },
                  },
                ]);
              } else if (event.type === 'navigation_card') {
                // Seal any pending assistant text. The card itself is the
                // final response — no further text should be appended.
                assistantContent = '';
                navigationEmittedThisTurn = true;
                setMessages((prev) => [
                  ...prev,
                  {
                    role: 'navigation',
                    content: '', // Content will be rendered by NavigationCard component
                    timestamp: new Date(),
                    navigationData: {
                      kind: event.kind,
                      target: event.target,
                      label: event.label,
                      description: event.description,
                      params: event.params,
                      icon: event.icon,
                    },
                  },
                ]);
              } else if (event.type === 'content') {
                // After a navigation card was emitted in this turn, ignore
                // any further assistant text — Gemini sometimes re-narrates
                // the same explanation after the tool call.
                if (navigationEmittedThisTurn) {
                  console.log(
                    '[AI Chat] Skipping post-navigation content chunk:',
                    event.content.substring(0, 60),
                  );
                  continue;
                }

                console.log(
                  `[AI Chat] Content received: +${event.content.length} chars`,
                );

                // Strategy: Always append or update the LAST assistant message
                // This keeps content in order with tools
                setMessages((prev) => {
                  const updated = [...prev];

                  // Check if last message is already an assistant message
                  const lastIndex = updated.length - 1;
                  if (
                    lastIndex >= 0 &&
                    updated[lastIndex]?.role === 'assistant'
                  ) {
                    // Update existing last assistant message - append new content
                    const currentContent = updated[lastIndex].content || '';
                    updated[lastIndex] = {
                      role: 'assistant',
                      content: currentContent + event.content,
                      timestamp: updated[lastIndex].timestamp,
                    };
                    // Update accumulator to match
                    assistantContent = currentContent + event.content;
                  } else {
                    // Last message is NOT assistant (might be tool, agent, etc.)
                    // Create NEW assistant message with ONLY this content (reset accumulator)
                    assistantContent = event.content;
                    updated.push({
                      role: 'assistant',
                      content: event.content,
                      timestamp: new Date(),
                    });
                  }

                  return updated;
                });
              } else if (event.type === 'error') {
                setError(event.message);
              }
            } catch {
              // Skip invalid JSON
            }
          }
        }
      }

      // Final update: ensure last accumulated content is saved
      if (assistantContent) {
        console.log(
          `[AI Chat] Final update - content length: ${assistantContent.length}`,
        );

        // Always update or create the last assistant message
        setMessages((prev) => {
          const updated = [...prev];
          const lastIndex = updated.length - 1;

          if (lastIndex >= 0 && updated[lastIndex]?.role === 'assistant') {
            // Update last assistant message with final content
            console.log(
              `[AI Chat] Final update to assistant at index ${lastIndex}`,
            );
            updated[lastIndex] = {
              role: 'assistant',
              content: assistantContent,
              timestamp: updated[lastIndex].timestamp,
            };
          } else {
            // No assistant message at end, create one
            console.warn('[AI Chat] Creating final assistant message');
            updated.push({
              role: 'assistant',
              content: assistantContent,
              timestamp: new Date(),
            });
          }

          return updated;
        });
      } else {
        console.warn('[AI Chat] Stream ended with no content accumulated');
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        const error = err as Error;
        console.error('[AI Chat] Stream error:', error);

        // Provide more specific error messages
        if (
          error.message?.includes('fetch') ||
          error.message?.includes('network')
        ) {
          setError(
            'Conexão perdida. As mensagens foram salvas e aparecerão após recarregar a página.',
          );
        } else if (error.message?.includes('timeout')) {
          setError(
            'Tempo de resposta excedido. Recarregue a página para ver as mensagens.',
          );
        } else {
          setError(
            'Erro ao receber resposta. As mensagens foram salvas no servidor.',
          );
        }
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const clearMessages = () => {
    abortControllerRef.current?.abort();
    setMessages([]);
    setError(null);
  };

  const interrupt = () => {
    abortControllerRef.current?.abort();
  };

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
    setMessages,
    interrupt,
  };
}
