'use client';

import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import type { Squad } from '@/types';

interface SquadCardsProps {
  squads: Squad[];
  isLoading: boolean;
}

const STATUS_COLORS: Record<string, string> = {
  idle: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  running: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  paused: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
  disabled: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
};

export function SquadCards({ squads, isLoading }: SquadCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-28 animate-pulse rounded-lg border border-border bg-muted/50" />
        ))}
      </div>
    );
  }

  if (squads.length === 0) {
    return <p className="text-sm text-muted-foreground">No squads configured.</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {squads.map((squad) => (
        <div key={squad.squad_id} className="rounded-lg border border-border bg-card p-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{squad.name}</span>
            <Badge
              variant="outline"
              className={cn('text-[10px]', STATUS_COLORS[squad.status] || '')}
            >
              {squad.status}
            </Badge>
          </div>

          {/* Budget bar */}
          <div className="mt-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>${squad.today_cost.toFixed(2)} / ${squad.daily_budget.toFixed(0)}</span>
              <span>{squad.budget_pct.toFixed(0)}%</span>
            </div>
            <div className="mt-1 h-1.5 w-full rounded-full bg-muted">
              <div
                className={cn(
                  'h-full rounded-full transition-all',
                  squad.budget_pct >= 90
                    ? 'bg-red-500'
                    : squad.budget_pct >= 70
                    ? 'bg-yellow-500'
                    : 'bg-green-500'
                )}
                style={{ width: `${Math.min(squad.budget_pct, 100)}%` }}
              />
            </div>
          </div>

          <div className="mt-2 flex gap-3 text-xs text-muted-foreground">
            <span>{squad.today_sessions} runs today</span>
            <span>max {squad.max_concurrent} concurrent</span>
          </div>
        </div>
      ))}
    </div>
  );
}
