'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { apiFetch } from '@/lib/api';
import type {
  AgentTasksResponse,
  AgentTaskDetail,
  OrchestratorStatus,
  Squad,
  ActivityEntry,
  Approval,
} from '@/types';

const POLL_INTERVAL = 10_000; // 10 seconds

export function useAgentStatus() {
  const [status, setStatus] = useState<OrchestratorStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    try {
      const data = await apiFetch<OrchestratorStatus>('/agents/status');
      setStatus(data);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to fetch status');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
    const interval = setInterval(fetch, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetch]);

  return { status, isLoading, error, refresh: fetch };
}

export function useAgentTasks(filters?: {
  status?: string;
  squad?: string;
  priority?: string;
  project?: string;
}) {
  const [data, setData] = useState<AgentTasksResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const filtersRef = useRef(filters);
  filtersRef.current = filters;

  const fetch = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      const f = filtersRef.current;
      if (f?.status) params.set('status', f.status);
      if (f?.squad) params.set('squad', f.squad);
      if (f?.priority) params.set('priority', f.priority);
      if (f?.project) params.set('project', f.project);
      const qs = params.toString();
      const path = `/agents/tasks${qs ? `?${qs}` : ''}`;
      const result = await apiFetch<AgentTasksResponse>(path);
      setData(result);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to fetch tasks');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    setIsLoading(true);
    fetch();
    const interval = setInterval(fetch, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetch, filters?.status, filters?.squad, filters?.priority, filters?.project]);

  return { data, isLoading, error, refresh: fetch };
}

export function useAgentTaskDetail(taskId: string | null) {
  const [data, setData] = useState<AgentTaskDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      const result = await apiFetch<AgentTaskDetail>(`/agents/tasks/${id}`);
      setData(result);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to fetch task');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (taskId) {
      fetch(taskId);
    } else {
      setData(null);
    }
  }, [taskId, fetch]);

  return { data, isLoading, error, refresh: () => taskId && fetch(taskId) };
}

export function useSquads() {
  const [squads, setSquads] = useState<Squad[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetch = useCallback(async () => {
    try {
      const result = await apiFetch<{ squads: Squad[]; date: string }>('/agents/squads');
      setSquads(result.squads);
    } catch {
      // Silently fail
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
    const interval = setInterval(fetch, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetch]);

  return { squads, isLoading, refresh: fetch };
}

export function useActivityFeed(limit = 30) {
  const [activity, setActivity] = useState<ActivityEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetch = useCallback(async () => {
    try {
      const result = await apiFetch<{ activity: ActivityEntry[] }>(
        `/agents/activity?limit=${limit}`
      );
      setActivity(result.activity);
    } catch {
      // Silently fail
    } finally {
      setIsLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetch();
    const interval = setInterval(fetch, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetch]);

  return { activity, isLoading, refresh: fetch };
}

export function useApprovals() {
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetch = useCallback(async () => {
    try {
      const result = await apiFetch<{ approvals: Approval[] }>(
        '/agents/approvals?status=pending'
      );
      setApprovals(result.approvals);
    } catch {
      // Silently fail
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
    const interval = setInterval(fetch, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetch]);

  return { approvals, isLoading, refresh: fetch };
}
