export interface LoginResponse {
  token: string;
  expires_in: number;
}

export interface JwtPayload {
  sub: string;
  exp: number;
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  model?: string;
  cost?: number;
  tool_calls?: ToolCall[];
  isStreaming?: boolean;
  timestamp?: string;
}

export interface ToolCall {
  id: string;
  name: string;
  args?: Record<string, unknown>;
  result?: string;
  status: "pending" | "running" | "complete" | "error";
}

export interface Session {
  session_id: string;
  model: string;
  status: string;
  message_count: number;
  total_cost_usd: number;
  started_at: string;
  last_active_at: string;
}

export interface SSEEvent {
  event: string;
  data: string;
}

export interface StatusResponse {
  status: string;
  version: string;
  uptime: number;
  models: Record<string, boolean>;
}

export interface UploadResponse {
  file_id: string;
  filename: string;
  mime_type: string;
  size: number;
}

// Agent orchestration types

export interface AgentTask {
  id: string;
  project_id: string;
  title: string;
  status: string;
  priority: string;
  sort_order: number;
  agent_notes: string | null;
  squad_id: string | null;
  reserved_by: string | null;
  reserved_at: string | null;
  created_at: string;
  updated_at: string;
  // Joined from latest session
  last_session_id: number | null;
  last_session_status: string | null;
  last_model: string | null;
  last_cost: number | null;
  last_session_started: string | null;
  last_session_ended: string | null;
  last_output_summary: string | null;
}

export interface AgentTasksResponse {
  tasks: AgentTask[];
  total: number;
  limit: number;
  offset: number;
}

export interface AgentTaskDetail {
  task: {
    id: string;
    project_id: string;
    title: string;
    description: string | null;
    status: string;
    priority: string;
    sort_order: number;
    agent_notes: string | null;
    squad_id: string | null;
    reserved_by: string | null;
    reserved_at: string | null;
    created_at: string;
    updated_at: string;
  };
  sessions: AgentSession[];
  session_count: number;
}

export interface AgentSession {
  id: number;
  task_id: string | null;
  project_id: string;
  agent_profile: string;
  model: string;
  status: string;
  prompt_summary: string | null;
  output_summary: string | null;
  files_changed: string | null;
  tokens_input: number;
  tokens_output: number;
  cost_usd: number;
  started_at: string;
  ended_at: string | null;
  duration_sec: number | null;
  branch_name: string | null;
  pr_url: string | null;
  squad_id: string | null;
  outcome_quality: string;
}

export interface Squad {
  squad_id: string;
  squad_type: string;
  name: string;
  description: string | null;
  models: string;
  max_concurrent: number;
  daily_budget: number;
  status: string;
  today_cost: number;
  today_sessions: number;
  budget_remaining: number;
  budget_pct: number;
}

export interface OrchestratorStatus {
  orchestrator: Record<string, unknown> | null;
  running_tasks: Array<{
    id: number;
    task_id: string;
    project_id: string;
    model: string;
    started_at: string;
  }>;
  running_count: number;
  queue: Array<{
    id: string;
    title: string;
    project_id: string;
    priority: string;
    agent_notes: string | null;
  }>;
  queue_size: number;
  today: {
    date: string;
    sessions: number;
    cost_usd: number;
  };
  kpis: {
    success_rate_7d: {
      completed: number;
      failed: number;
      killed: number;
      total: number;
      rate: number;
    };
    cost_per_task_7d: {
      total_cost: number;
      completed_count: number;
      cost_per_task: number;
    };
  };
}

export interface ActivityEntry {
  action: string;
  entity_type: string;
  details: string | null;
  project_id: string | null;
  created_at: string;
}

export interface Approval {
  id: number;
  project_id: string | null;
  approval_type: string;
  title: string;
  context: string;
  urgency: string;
  status: string;
  requested_at: string;
  decided_at: string | null;
  decided_by: string | null;
  decision_note: string | null;
  expires_at: string | null;
}
