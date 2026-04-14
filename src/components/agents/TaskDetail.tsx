'use client';

import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X, RotateCcw, Ban, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { apiFetch } from '@/lib/api';
import type { AgentTaskDetail, AgentSession } from '@/types';

interface TaskDetailProps {
  data: AgentTaskDetail | null;
  isLoading: boolean;
  onClose: () => void;
  onRefresh: () => void;
}

function formatDuration(sec: number | null): string {
  if (sec == null || sec <= 0) return '-';
  if (sec < 60) return `${sec}s`;
  const mins = Math.floor(sec / 60);
  const secs = sec % 60;
  if (mins < 60) return `${mins}m ${secs}s`;
  const hrs = Math.floor(mins / 60);
  return `${hrs}h ${mins % 60}m`;
}

function SessionRow({ session }: { session: AgentSession }) {
  return (
    <div className="rounded-md border border-border bg-muted/30 p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge
            variant={
              session.status === 'completed' ? 'secondary' :
              session.status === 'running' ? 'default' :
              'destructive'
            }
            className="text-[10px]"
          >
            {session.status}
          </Badge>
          <span className="text-xs text-muted-foreground">#{session.id}</span>
          <span className="text-xs">{session.model}</span>
        </div>
        <span className="text-xs text-muted-foreground">
          {session.started_at ? new Date(session.started_at).toLocaleString() : ''}
        </span>
      </div>

      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <span>Cost: ${session.cost_usd.toFixed(3)}</span>
        <span>Duration: {formatDuration(session.duration_sec)}</span>
        <span>Tokens: {(session.tokens_input + session.tokens_output).toLocaleString()}</span>
        {session.squad_id && <span>Squad: {session.squad_id}</span>}
        {session.outcome_quality !== 'unrated' && (
          <span>Quality: {session.outcome_quality}</span>
        )}
      </div>

      {session.output_summary && (
        <div className="mt-2 max-h-32 overflow-y-auto rounded bg-muted/50 p-2 text-xs whitespace-pre-wrap">
          {session.output_summary.slice(0, 500)}
          {session.output_summary.length > 500 && '...'}
        </div>
      )}

      <div className="mt-2 flex flex-wrap gap-2">
        {session.branch_name && (
          <Badge variant="outline" className="text-[10px]">
            {session.branch_name}
          </Badge>
        )}
        {session.pr_url && (
          <a
            href={session.pr_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[10px] text-blue-600 hover:underline dark:text-blue-400"
          >
            <ExternalLink className="h-3 w-3" />
            PR
          </a>
        )}
        {session.files_changed && session.files_changed !== '[]' && (
          <span className="text-[10px] text-muted-foreground">
            {JSON.parse(session.files_changed).length} files changed
          </span>
        )}
      </div>
    </div>
  );
}

export function TaskDetail({ data, isLoading, onClose, onRefresh }: TaskDetailProps) {
  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!data) return null;

  const { task, sessions } = data;

  const handleCancel = async () => {
    try {
      await apiFetch(`/agents/tasks/${task.id}/cancel`, { method: 'POST' });
      toast.success(`Task ${task.id} cancelled`);
      onRefresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to cancel');
    }
  };

  const handleRetry = async () => {
    try {
      await apiFetch(`/agents/tasks/${task.id}/retry`, { method: 'POST' });
      toast.success(`Task ${task.id} re-queued`);
      onRefresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to retry');
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-start justify-between border-b border-border p-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm text-muted-foreground">{task.id}</span>
            <Badge variant="outline" className="text-[10px]">{task.priority}</Badge>
            <Badge variant="outline" className="text-[10px]">{task.status}</Badge>
          </div>
          <h2 className="mt-1 text-base font-semibold">{task.title}</h2>
          {task.squad_id && (
            <span className="text-xs text-muted-foreground">{task.squad_id}</span>
          )}
        </div>
        <Button variant="ghost" size="icon-sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1 p-4">
        {/* Description */}
        {task.description && (
          <div className="mb-4">
            <h3 className="mb-1 text-xs font-medium text-muted-foreground">Description</h3>
            <p className="text-sm whitespace-pre-wrap">{task.description}</p>
          </div>
        )}

        {/* Agent Notes */}
        {task.agent_notes && (
          <div className="mb-4">
            <h3 className="mb-1 text-xs font-medium text-muted-foreground">Agent Notes</h3>
            <div className="rounded bg-muted/50 p-2 text-sm whitespace-pre-wrap">
              {task.agent_notes}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="mb-4 flex gap-2">
          {(task.status === 'agent_ready' || task.status === 'in_progress') && (
            <Button variant="destructive" size="sm" onClick={handleCancel}>
              <Ban className="mr-1 h-3 w-3" />
              Cancel
            </Button>
          )}
          {(task.status === 'agent_done' || task.status === 'done' || task.status === 'todo') && (
            <Button variant="outline" size="sm" onClick={handleRetry}>
              <RotateCcw className="mr-1 h-3 w-3" />
              Retry
            </Button>
          )}
        </div>

        <Separator className="my-4" />

        {/* Sessions */}
        <h3 className="mb-2 text-xs font-medium text-muted-foreground">
          Sessions ({sessions.length})
        </h3>
        {sessions.length === 0 ? (
          <p className="text-sm text-muted-foreground">No agent sessions yet.</p>
        ) : (
          <div className="space-y-2">
            {sessions.map((session) => (
              <SessionRow key={session.id} session={session} />
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
