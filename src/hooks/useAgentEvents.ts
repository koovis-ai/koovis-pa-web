'use client';

import { useEffect, useRef, useCallback } from 'react';
import { toast } from 'sonner';
import { API_BASE, STORAGE_KEYS } from '@/lib/constants';
import { parseSSEStream } from '@/lib/sse-parser';

interface AgentEventCallbacks {
  onTaskStarted?: (data: Record<string, unknown>) => void;
  onTaskCompleted?: (data: Record<string, unknown>) => void;
  onTaskFailed?: (data: Record<string, unknown>) => void;
  onApprovalRequested?: (data: Record<string, unknown>) => void;
  onBudgetAlert?: (data: Record<string, unknown>) => void;
}

export function useAgentEvents(callbacks?: AgentEventCallbacks) {
  const abortRef = useRef<AbortController | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const callbacksRef = useRef(callbacks);
  callbacksRef.current = callbacks;

  const connect = useCallback(async () => {
    // Clean up previous connection
    abortRef.current?.abort();

    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    if (!token) return;

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const response = await fetch(`${API_BASE}/agents/events`, {
        headers: { Authorization: `Bearer ${token}` },
        signal: controller.signal,
      });

      if (!response.ok || !response.body) return;

      const reader = response.body.getReader();

      for await (const event of parseSSEStream(reader)) {
        if (event.event === 'heartbeat') continue;

        try {
          const data = JSON.parse(event.data);

          switch (event.event) {
            case 'task_started':
              toast.info(`Agent started: ${data.task_id || 'unknown'}`);
              callbacksRef.current?.onTaskStarted?.(data);
              break;
            case 'task_completed':
              toast.success(`Agent completed: ${data.task_id || 'unknown'} ($${data.cost_usd?.toFixed(3) || '?'})`);
              callbacksRef.current?.onTaskCompleted?.(data);
              break;
            case 'task_failed':
              toast.error(`Agent failed: ${data.task_id || 'unknown'}`);
              callbacksRef.current?.onTaskFailed?.(data);
              break;
            case 'approval_requested':
              toast.warning(`${data.pending_count} approval(s) pending`);
              callbacksRef.current?.onApprovalRequested?.(data);
              break;
            case 'budget_alert':
              toast.warning(`Daily budget alert: $${data.daily_cost?.toFixed(2)} / $50`);
              callbacksRef.current?.onBudgetAlert?.(data);
              break;
          }
        } catch {
          // Ignore parse errors for individual events
        }
      }
    } catch (e) {
      if (e instanceof DOMException && e.name === 'AbortError') return;
      // Reconnect after 10 seconds on error
      reconnectTimeoutRef.current = setTimeout(connect, 10_000);
    }
  }, []);

  useEffect(() => {
    connect();
    return () => {
      abortRef.current?.abort();
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [connect]);
}
