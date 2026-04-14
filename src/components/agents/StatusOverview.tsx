'use client';

import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import type { OrchestratorStatus } from '@/types';

interface StatusOverviewProps {
  status: OrchestratorStatus | null;
  isLoading: boolean;
}

export function StatusOverview({ status, isLoading }: StatusOverviewProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-20 animate-pulse rounded-lg border border-border bg-muted/50" />
        ))}
      </div>
    );
  }

  if (!status) return null;

  const orchestratorUp = !!status.orchestrator;
  const successRate = status.kpis.success_rate_7d;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {/* Orchestrator Status */}
      <div className="rounded-lg border border-border bg-card p-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Orchestrator</span>
          <Badge variant={orchestratorUp ? 'default' : 'destructive'} className="text-[10px]">
            {orchestratorUp ? 'UP' : 'DOWN'}
          </Badge>
        </div>
        <div className="mt-1 text-lg font-semibold">
          {status.running_count} <span className="text-sm font-normal text-muted-foreground">running</span>
        </div>
      </div>

      {/* Queue Depth */}
      <div className="rounded-lg border border-border bg-card p-3">
        <span className="text-xs text-muted-foreground">Queue</span>
        <div className="mt-1 text-lg font-semibold">
          {status.queue_size} <span className="text-sm font-normal text-muted-foreground">tasks</span>
        </div>
      </div>

      {/* Today's Cost */}
      <div className="rounded-lg border border-border bg-card p-3">
        <span className="text-xs text-muted-foreground">Today</span>
        <div className="mt-1 text-lg font-semibold">
          ${status.today.cost_usd.toFixed(2)}
        </div>
        <span className="text-xs text-muted-foreground">
          {status.today.sessions} sessions
        </span>
      </div>

      {/* Success Rate */}
      <div className="rounded-lg border border-border bg-card p-3">
        <span className="text-xs text-muted-foreground">Success (7d)</span>
        <div className={cn(
          "mt-1 text-lg font-semibold",
          successRate.rate >= 0.8 ? "text-green-600 dark:text-green-400" :
          successRate.rate >= 0.5 ? "text-yellow-600 dark:text-yellow-400" :
          "text-red-600 dark:text-red-400"
        )}>
          {successRate.total > 0 ? `${(successRate.rate * 100).toFixed(0)}%` : 'N/A'}
        </div>
        <span className="text-xs text-muted-foreground">
          {successRate.completed}/{successRate.total}
        </span>
      </div>
    </div>
  );
}
