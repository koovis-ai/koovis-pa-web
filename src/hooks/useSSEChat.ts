'use client';

import { useState, useCallback, useRef } from 'react';
import { apiStream } from '@/lib/api';
import { parseSSEStream } from '@/lib/sse-parser';
import type { Message, ToolCall } from '@/types';
import { toast } from 'sonner';

let messageCounter = 0;
function generateId() {
  return `msg-${Date.now()}-${++messageCounter}`;
}

export function useSSEChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(
    async (content: string, sessionId: string | null, fileIds?: string[]) => {
      if (isStreaming) return;

      const userMessage: Message = {
        id: generateId(),
        role: 'user',
        content,
        timestamp: new Date().toISOString(),
      };

      const assistantId = generateId();
      const assistantMessage: Message = {
        id: assistantId,
        role: 'assistant',
        content: '',
        isStreaming: true,
        tool_calls: [],
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, userMessage, assistantMessage]);
      setIsStreaming(true);

      try {
        const body: Record<string, unknown> = { message: content };
        if (sessionId) body.session_id = sessionId;
        if (fileIds?.length) body.file_ids = fileIds;

        const response = await apiStream('/chat', body);

        if (!response.body) {
          throw new Error('No response body');
        }

        const reader = response.body.getReader();

        for await (const event of parseSSEStream(reader)) {
          const parsed = JSON.parse(event.data);

          switch (event.event) {
            case 'token': {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId
                    ? { ...m, content: m.content + (parsed.content || '') }
                    : m
                )
              );
              break;
            }

            case 'tool_start': {
              const toolCall: ToolCall = {
                id: parsed.tool_call_id || generateId(),
                name: parsed.name || 'unknown',
                args: parsed.args,
                status: 'running',
              };
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId
                    ? { ...m, tool_calls: [...(m.tool_calls || []), toolCall] }
                    : m
                )
              );
              break;
            }

            case 'tool_result': {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId
                    ? {
                        ...m,
                        tool_calls: (m.tool_calls || []).map((tc) =>
                          tc.id === parsed.tool_call_id
                            ? { ...tc, result: parsed.result, status: 'complete' as const }
                            : tc
                        ),
                      }
                    : m
                )
              );
              break;
            }

            case 'done': {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId
                    ? {
                        ...m,
                        isStreaming: false,
                        model: parsed.model,
                        cost: parsed.cost,
                      }
                    : m
                )
              );
              break;
            }

            case 'error': {
              toast.error(parsed.message || 'An error occurred');
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId
                    ? {
                        ...m,
                        isStreaming: false,
                        content: m.content || 'An error occurred.',
                      }
                    : m
                )
              );
              break;
            }

            case 'session': {
              // Backend may send session_id for new sessions
              if (parsed.session_id) {
                // Let the parent component handle session_id updates
                window.dispatchEvent(
                  new CustomEvent('koovis:session', { detail: parsed.session_id })
                );
              }
              break;
            }
          }
        }
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          // User cancelled
        } else {
          const message = error instanceof Error ? error.message : 'Stream failed';
          toast.error(message);
        }
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId ? { ...m, isStreaming: false } : m
          )
        );
      } finally {
        setIsStreaming(false);
        abortRef.current = null;
      }
    },
    [isStreaming]
  );

  const stopStreaming = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  const loadMessages = useCallback((msgs: Message[]) => {
    setMessages(msgs);
  }, []);

  return {
    messages,
    isStreaming,
    sendMessage,
    stopStreaming,
    clearMessages,
    loadMessages,
  };
}
