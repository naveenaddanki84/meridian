import { TriangleAlert } from "lucide-react";

/**
 * A failed load is a state the product has to have an answer for, not a
 * blank screen. One shared surface so every screen fails the same way,
 * in words a client could read without alarm.
 */
export function ErrorState({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="flex items-start gap-3 rounded-xl border border-danger/30 bg-danger-soft px-4 py-3.5"
    >
      <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-danger" aria-hidden="true" />
      <div>
        <p className="text-[13px] font-semibold text-ink">We couldn&apos;t load this</p>
        <p className="mt-0.5 text-[12px] leading-relaxed text-ink-soft">{message}</p>
      </div>
    </div>
  );
}
