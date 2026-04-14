'use client';

import { useState, useCallback } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { StatusOverview } from '@/components/agents/StatusOverview';
import { SquadCards } from '@/components/agents/SquadCards';
import { TaskList } from '@/components/agents/TaskList';
import { TaskDetail } from '@/components/agents/TaskDetail';
import { TaskFilters } from '@/components/agents/TaskFilters';
import { ActivityFeed } from '@/components/agents/ActivityFeed';
import { ApprovalCards } from '@/components/agents/ApprovalCards';
import {
  useAgentStatus,
  useAgentTasks,
  useAgentTaskDetail,
  useSquads,
  useActivityFeed,
  useApprovals,
} from '@/hooks/useAgents';
import { useAgentEvents } from '@/hooks/useAgentEvents';

export default function AgentsPage() {
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const { status, isLoading: statusLoading } = useAgentStatus();
  const { data: tasksData, isLoading: tasksLoading, refresh: refreshTasks } = useAgentTasks(
    statusFilter ? { status: statusFilter } : undefined
  );
  const { data: taskDetail, isLoading: detailLoading, refresh: refreshDetail } =
    useAgentTaskDetail(selectedTaskId);
  const { squads, isLoading: squadsLoading } = useSquads();
  const { activity, isLoading: activityLoading } = useActivityFeed();
  const { approvals, isLoading: approvalsLoading, refresh: refreshApprovals } = useApprovals();

  // SSE for real-time events — triggers refreshes on lifecycle changes
  useAgentEvents({
    onTaskStarted: () => { refreshTasks(); },
    onTaskCompleted: () => { refreshTasks(); },
    onTaskFailed: () => { refreshTasks(); },
    onApprovalRequested: () => { refreshApprovals(); },
  });

  const handleSelectTask = useCallback((taskId: string) => {
    setSelectedTaskId((prev) => (prev === taskId ? null : taskId));
  }, []);

  const handleCloseDetail = useCallback(() => {
    setSelectedTaskId(null);
  }, []);

  const handleRefreshDetail = useCallback(() => {
    refreshDetail();
    refreshTasks();
  }, [refreshDetail, refreshTasks]);

  return (
    <div className="flex h-full">
      {/* Main content */}
      <ScrollArea className="flex-1 p-4 lg:p-6">
        <div className="mx-auto max-w-4xl space-y-6">
          {/* Status Overview */}
          <section>
            <h2 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Overview
            </h2>
            <StatusOverview status={status} isLoading={statusLoading} />
          </section>

          {/* Pending Approvals */}
          {(approvalsLoading || approvals.length > 0) && (
            <section>
              <h2 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Pending Approvals ({approvals.length})
              </h2>
              <ApprovalCards
                approvals={approvals}
                isLoading={approvalsLoading}
                onRefresh={refreshApprovals}
              />
            </section>
          )}

          {/* Squads */}
          <section>
            <h2 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Squads
            </h2>
            <SquadCards squads={squads} isLoading={squadsLoading} />
          </section>

          <Separator />

          {/* Tasks */}
          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Tasks {tasksData ? `(${tasksData.total})` : ''}
              </h2>
            </div>
            <TaskFilters statusFilter={statusFilter} onStatusChange={setStatusFilter} />
            <div className="mt-3">
              <TaskList
                tasks={tasksData?.tasks || []}
                isLoading={tasksLoading}
                selectedTaskId={selectedTaskId}
                onSelectTask={handleSelectTask}
              />
            </div>
          </section>

          <Separator />

          {/* Activity Feed */}
          <section>
            <h2 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Recent Activity
            </h2>
            <ActivityFeed activity={activity} isLoading={activityLoading} />
          </section>
        </div>
      </ScrollArea>

      {/* Task Detail Panel */}
      {selectedTaskId && (
        <div className="hidden w-[400px] shrink-0 border-l border-border lg:block">
          <TaskDetail
            data={taskDetail}
            isLoading={detailLoading}
            onClose={handleCloseDetail}
            onRefresh={handleRefreshDetail}
          />
        </div>
      )}
    </div>
  );
}
