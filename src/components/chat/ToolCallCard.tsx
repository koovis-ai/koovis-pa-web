'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronRight, Wrench, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import type { ToolCall } from '@/types';

interface ToolCallCardProps {
  toolCall: ToolCall;
}

export function ToolCallCard({ toolCall }: ToolCallCardProps) {
  const [expanded, setExpanded] = useState(false);

  const statusIcon = {
    pending: <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />,
    running: <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-500" />,
    complete: <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />,
    error: <XCircle className="h-3.5 w-3.5 text-destructive" />,
  };

  return (
    <Card className="my-2 overflow-hidden border-border/50">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-muted/50 transition-colors"
      >
        {expanded ? (
          <ChevronDown className="h-3.5 w-3.5 shrink-0" />
        ) : (
          <ChevronRight className="h-3.5 w-3.5 shrink-0" />
        )}
        <Wrench className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        <span className="font-mono text-xs truncate">{toolCall.name}</span>
        <span className="ml-auto">{statusIcon[toolCall.status]}</span>
      </button>

      {expanded && (
        <div className="border-t border-border/50 px-3 py-2 space-y-2">
          {toolCall.args && Object.keys(toolCall.args).length > 0 && (
            <div>
              <Badge variant="outline" className="text-[10px] mb-1">
                Args
              </Badge>
              <pre className="text-xs font-mono bg-muted/50 rounded p-2 overflow-x-auto max-h-32">
                {JSON.stringify(toolCall.args, null, 2)}
              </pre>
            </div>
          )}
          {toolCall.result && (
            <div>
              <Badge variant="outline" className="text-[10px] mb-1">
                Result
              </Badge>
              <pre className="text-xs font-mono bg-muted/50 rounded p-2 overflow-x-auto max-h-48 whitespace-pre-wrap">
                {toolCall.result}
              </pre>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
