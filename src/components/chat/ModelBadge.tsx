'use client';

import { Badge } from '@/components/ui/badge';

interface ModelBadgeProps {
  model?: string;
  cost?: number;
}

export function ModelBadge({ model, cost }: ModelBadgeProps) {
  if (!model) return null;

  return (
    <div className="flex items-center gap-2 mt-1">
      <Badge variant="secondary" className="text-[10px] font-mono">
        {model}
      </Badge>
      {cost !== undefined && cost > 0 && (
        <span className="text-[10px] text-muted-foreground">
          ${cost.toFixed(4)}
        </span>
      )}
    </div>
  );
}
