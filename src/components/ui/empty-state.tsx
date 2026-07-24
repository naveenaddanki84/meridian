export function EmptyState({
  icon,
  title,
  detail,
  action,
}: {
  icon?: React.ReactNode;
  title: string;
  detail: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-line-strong bg-card/60 px-6 py-12 text-center">
      {icon && <div className="text-ink-faint">{icon}</div>}
      <p className="font-semibold text-ink">{title}</p>
      <p className="max-w-sm text-sm text-ink-soft">{detail}</p>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
