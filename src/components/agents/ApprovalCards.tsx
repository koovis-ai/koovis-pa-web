'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { apiFetch } from '@/lib/api';
import type { Approval } from '@/types';

interface ApprovalCardsProps {
  approvals: Approval[];
  isLoading: boolean;
  onRefresh: () => void;
}

const URGENCY_VARIANT: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  critical: 'destructive',
  high: 'default',
  medium: 'secondary',
  low: 'outline',
};

export function ApprovalCards({ approvals, isLoading, onRefresh }: ApprovalCardsProps) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="h-20 animate-pulse rounded-lg border border-border bg-muted/50" />
        ))}
      </div>
    );
  }

  if (approvals.length === 0) {
    return (
      <p className="py-4 text-center text-sm text-muted-foreground">
        No pending approvals.
      </p>
    );
  }

  const handleResolve = async (id: number, decision: 'approved' | 'rejected') => {
    try {
      await apiFetch(`/agents/approvals/${id}/resolve?decision=${decision}`, {
        method: 'POST',
      });
      toast.success(`Approval ${decision}`);
      onRefresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to resolve');
    }
  };

  return (
    <div className="space-y-2">
      {approvals.map((approval) => (
        <div
          key={approval.id}
          className="rounded-lg border border-border bg-card p-3"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <Badge
                  variant={URGENCY_VARIANT[approval.urgency] || 'outline'}
                  className="text-[10px]"
                >
                  {approval.urgency}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {approval.approval_type}
                </span>
              </div>
              <h4 className="mt-1 text-sm font-medium">{approval.title}</h4>
              <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                {approval.context}
              </p>
            </div>
          </div>

          <div className="mt-2 flex gap-2">
            <Button
              size="sm"
              variant="default"
              onClick={() => handleResolve(approval.id, 'approved')}
            >
              Approve
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleResolve(approval.id, 'rejected')}
            >
              Reject
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
