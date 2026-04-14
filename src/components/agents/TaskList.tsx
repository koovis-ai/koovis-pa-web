'use client';

import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import type { AgentTask } from '@/types';

interface TaskListProps {
  tasks: AgentTask[];
  isLoading: boolean;
  selectedTaskId: string | null;
  onSelectTask: (taskId: string) => void;
}

const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  agent_ready: 'default',
  in_progress: 'default',
  agent_done: 'secondary',
  done: 'secondary',
  todo: 'outline',
  blocked: 'destructive',
};

const STATUS_LABEL: Record<string, string> = {
  agent_ready: 'Queued',
  in_progress: 'Running',
  agent_done: 'Done',
  done: 'Done',
  todo: 'Todo',
  blocked: 'Blocked',
};

const PRIORITY_COLORS: Record<string, string> = {
  P0: 'text-red-600 dark:text-red-400',
  P1: 'text-orange-600 dark:text-orange-400',
  P2: 'text-blue-600 dark:text-blue-400',
  P3: 'text-gray-500 dark:text-gray-400',
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function TaskList({ tasks, isLoading, selectedTaskId, onSelectTask }: TaskListProps) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-16 animate-pulse rounded-lg border border-border bg-muted/50" />
        ))}
      </div>
    );
  }

  if (tasks.length === 0) {
    return <p className="py-8 text-center text-sm text-muted-foreground">No tasks found.</p>;
  }

  return (
    <div className="space-y-1.5">
      {tasks.map((task) => (
        <button
          key={task.id}
          onClick={() => onSelectTask(task.id)}
          className={cn(
            'w-full rounded-lg border p-3 text-left transition-colors',
            selectedTaskId === task.id
              ? 'border-primary bg-primary/5'
              : 'border-border bg-card hover:bg-accent/50'
          )}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className={cn('text-xs font-bold', PRIORITY_COLORS[task.priority] || '')}>
                  {task.priority}
                </span>
                <span className="truncate text-sm font-medium">{task.title}</span>
              </div>
              <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                <span className="font-mono">{task.id}</span>
                {task.squad_id && <span>{task.squad_id}</span>}
                {task.updated_at && <span>{timeAgo(task.updated_at)}</span>}
              </div>
            </div>
            <Badge
              variant={STATUS_VARIANT[task.status] || 'outline'}
              className={cn(
                'shrink-0 text-[10px]',
                task.status === 'in_progress' && 'animate-pulse bg-blue-600'
              )}
            >
              {STATUS_LABEL[task.status] || task.status}
            </Badge>
          </div>

          {task.last_cost != null && task.last_cost > 0 && (
            <div className="mt-1 text-xs text-muted-foreground">
              Last run: ${task.last_cost.toFixed(3)} ({task.last_model || 'unknown'})
            </div>
          )}
        </button>
      ))}
    </div>
  );
}
