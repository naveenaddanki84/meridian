/**
 * The prototype lives on a fixed "today" in the middle of tax season so
 * deadlines, ages, and urgency read realistically in the demo.
 */
export const DEMO_TODAY = new Date("2026-03-02T09:00:00");

const DAY_MS = 24 * 60 * 60 * 1000;

/** Date-only strings parse as UTC midnight; anchor them to local noon instead. */
function parseLocal(iso: string): Date {
  return new Date(iso.includes("T") ? iso : `${iso}T12:00:00`);
}

export function daysUntil(iso: string): number {
  return Math.round((parseLocal(iso).getTime() - DEMO_TODAY.getTime()) / DAY_MS);
}

export function daysSince(iso: string): number {
  return Math.max(0, Math.round((DEMO_TODAY.getTime() - parseLocal(iso).getTime()) / DAY_MS));
}

export function shortDate(iso: string): string {
  return parseLocal(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function relativeLabel(iso: string): string {
  const days = daysSince(iso);
  if (days === 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 7) return `${days} days ago`;
  return shortDate(iso);
}

export function deadlineLabel(iso: string): string {
  const days = daysUntil(iso);
  if (days < 0) return `${Math.abs(days)}d overdue`;
  if (days === 0) return "due today";
  return `due in ${days}d`;
}

export function usd(value: number): string {
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
}

export function confidenceLabel(confidence: number): string {
  if (confidence >= 0.95) return "Very confident";
  if (confidence >= 0.85) return "Confident";
  if (confidence >= 0.7) return "Somewhat confident";
  return "Not confident";
}
