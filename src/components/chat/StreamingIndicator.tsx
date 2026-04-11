'use client';

export function StreamingIndicator() {
  return (
    <span className="inline-flex items-center gap-0.5 ml-1">
      <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
      <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
      <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce" />
    </span>
  );
}
