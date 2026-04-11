'use client';

import { useState, useCallback, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { STORAGE_KEYS } from '@/lib/constants';
import type { Session, Message } from '@/types';
import { toast } from 'sonner';

/** Map a backend message row to the frontend Message shape. */
function toFrontendMessage(raw: Record<string, unknown>): Message | null {
  const role = raw.role as string;
  // Skip tool rows and empty assistant rows (intermediate tool-call turns)
  if (role === 'tool' || role === 'system') return null;
  if (role === 'assistant' && !raw.content) return null;

  return {
    id: (raw.message_id as string) || String(raw.id ?? ''),
    role: role as 'user' | 'assistant',
    content: (raw.content as string) || '',
    model: (raw.model as string) || undefined,
    cost: (raw.cost_usd as number) || undefined,
    timestamp: (raw.created_at as string) || undefined,
  };
}

export function useSessions() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  const fetchSessions = useCallback(async () => {
    try {
      // Backend returns a raw array, not { sessions: [...] }
      const data = await apiFetch<Session[]>('/sessions');
      const list = Array.isArray(data) ? data : [];
      setSessions(list);
    } catch {
      // Silently fail — user may not have sessions yet
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.SESSION_ID);
    if (stored) setActiveSessionId(stored);
  }, []);

  const selectSession = useCallback(
    async (
      sessionId: string,
      onLoad: (messages: Message[]) => void
    ) => {
      setActiveSessionId(sessionId);
      localStorage.setItem(STORAGE_KEYS.SESSION_ID, sessionId);

      try {
        const data = await apiFetch<{ session: unknown; messages: Record<string, unknown>[] }>(
          `/sessions/${sessionId}`
        );
        const rawMessages = data.messages || [];
        const messages = rawMessages
          .map(toFrontendMessage)
          .filter((m): m is Message => m !== null);
        onLoad(messages);
      } catch {
        toast.error('Failed to load session history');
      }
    },
    []
  );

  const createSession = useCallback(() => {
    setActiveSessionId(null);
    localStorage.removeItem(STORAGE_KEYS.SESSION_ID);
  }, []);

  const deleteSession = useCallback(
    async (sessionId: string) => {
      try {
        await apiFetch(`/sessions/${sessionId}`, { method: 'DELETE' });
        setSessions((prev) => prev.filter((s) => s.session_id !== sessionId));
        if (activeSessionId === sessionId) {
          setActiveSessionId(null);
          localStorage.removeItem(STORAGE_KEYS.SESSION_ID);
        }
      } catch {
        toast.error('Failed to delete session');
      }
    },
    [activeSessionId]
  );

  const refreshSessions = fetchSessions;

  return {
    sessions,
    isLoading,
    activeSessionId,
    setActiveSessionId,
    selectSession,
    createSession,
    deleteSession,
    refreshSessions,
  };
}
