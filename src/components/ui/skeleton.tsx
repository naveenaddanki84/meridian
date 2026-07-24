export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-line/60 ${className}`}
      aria-hidden="true"
    />
  );
}

export function CardSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="rounded-xl border border-line bg-card p-4">
      <Skeleton className="mb-3 h-4 w-1/3" />
      {Array.from({ length: rows }, (_, i) => (
        <Skeleton key={i} className="mb-2 h-3 w-full last:mb-0" />
      ))}
    </div>
  );
}
