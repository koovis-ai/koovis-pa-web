'use client';

import { ScrollArea } from '@/components/ui/scroll-area';
import type { ActivityEntry } from '@/types';

interface ActivityFeedProps {
  activity: ActivityEntry[];
  isLoading: boolean;
}

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

const ACTION_ICONS: Record<string, string> = {
  agent: '🤖',
  chain_fallback: '🔄',
  task: '📋',
  health: '💊',
  deploy: '🚀',
  content: '📝',
};

function getIcon(action: string): string {
  for (const [prefix, icon] of Object.entries(ACTION_ICONS)) {
    if (action.startsWith(prefix)) return icon;
  }
  return '📌';
}

export function ActivityFeed({ activity, isLoading }: ActivityFeedProps) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-10 animate-pulse rounded bg-muted/50" />
        ))}
      </div>
    );
  }

  if (activity.length === 0) {
    return <p className="py-4 text-center text-sm text-muted-foreground">No recent activity.</p>;
  }

  return (
    <ScrollArea className="h-[300px]">
      <div className="space-y-1">
        {activity.map((entry, i) => (
          <div
            key={`${entry.created_at}-${i}`}
            className="flex items-start gap-2 rounded px-2 py-1.5 hover:bg-muted/50"
          >
            <span className="mt-0.5 text-sm">{getIcon(entry.action)}</span>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2">
                <span className="truncate text-sm">
                  <span className="font-mono text-xs text-muted-foreground">
                    {entry.action}
                  </span>
                  {entry.project_id && (
                    <span className="ml-1 text-xs text-muted-foreground">
                      [{entry.project_id}]
                    </span>
                  )}
                </span>
                <span className="shrink-0 text-[10px] text-muted-foreground">
                  {timeAgo(entry.created_at)}
                </span>
              </div>
              {entry.details && (
                <p className="truncate text-xs text-muted-foreground">{entry.details}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
