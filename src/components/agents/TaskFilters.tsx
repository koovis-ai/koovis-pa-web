'use client';

import { cn } from '@/lib/utils';

interface TaskFiltersProps {
  statusFilter: string;
  onStatusChange: (status: string) => void;
}

const STATUSES = [
  { value: '', label: 'All' },
  { value: 'agent_ready', label: 'Queued' },
  { value: 'in_progress', label: 'Running' },
  { value: 'agent_done', label: 'Agent Done' },
  { value: 'todo', label: 'Todo' },
  { value: 'done', label: 'Done' },
  { value: 'blocked', label: 'Blocked' },
];

export function TaskFilters({ statusFilter, onStatusChange }: TaskFiltersProps) {
  return (
    <div className="flex flex-wrap gap-1">
      {STATUSES.map(({ value, label }) => (
        <button
          key={value}
          onClick={() => onStatusChange(value)}
          className={cn(
            'rounded-full px-2.5 py-1 text-xs transition-colors',
            statusFilter === value
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:bg-accent'
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
