"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ArrowRight, CalendarClock, TriangleAlert, Users } from "lucide-react";
import { api } from "@/lib/api";
import { useQuery } from "@/lib/use-query";
import { daysUntil, deadlineLabel } from "@/lib/format";
import type { TaxReturn } from "@/data/types";
import { Badge } from "@/components/ui/badge";
import { CardSkeleton } from "@/components/ui/skeleton";

const STAFF_NAME: Record<string, string> = {
  mike: "Mike Sullivan",
  rachel: "Rachel Adams",
  james: "James Osei",
  katie: "Katie Brennan",
};

const STAFF_ROLE: Record<string, string> = {
  mike: "Senior preparer",
  rachel: "Preparer",
  james: "Preparer",
  katie: "Seasonal",
};

/**
 * The admin doesn't work returns — she works the firm (Challenge 07 for
 * a third role). This is a capacity and deadline view: who is carrying
 * too much, what is about to breach, and where the season stands.
 */
export function AdminDashboard({ firstName }: { firstName: string }) {
  const { data: returns, loading } = useQuery(() => api.getReturns(), []);

  const open = useMemo(() => (returns ?? []).filter((r) => !r.locked), [returns]);
  const filed = useMemo(
    () => (returns ?? []).filter((r) => r.stage === "filed").length,
    [returns],
  );
  const overdue = useMemo(() => open.filter((r) => daysUntil(r.deadline) < 0), [open]);
  const dueSoon = useMemo(
    () => open.filter((r) => daysUntil(r.deadline) >= 0 && daysUntil(r.deadline) <= 7),
    [open],
  );
  const stalled = useMemo(
    () => open.filter((r) => r.blockedOn === "client" && r.blockedDays >= 10),
    [open],
  );

  const workload = useMemo(() => {
    const map = new Map<string, { open: number; overdue: number; blocked: number }>();
    for (const r of open) {
      const e = map.get(r.assigneeId) ?? { open: 0, overdue: 0, blocked: 0 };
      map.set(r.assigneeId, {
        open: e.open + 1,
        overdue: e.overdue + (daysUntil(r.deadline) < 0 ? 1 : 0),
        blocked: e.blocked + (r.blockedOn === "client" ? 1 : 0),
      });
    }
    return [...map.entries()].sort((a, b) => b[1].open - a[1].open);
  }, [open]);

  const heaviest = workload[0]?.[1].open ?? 1;
  const average = workload.length
    ? Math.round(workload.reduce((s, [, v]) => s + v.open, 0) / workload.length)
    : 0;

  const atRisk: readonly TaxReturn[] = useMemo(
    () =>
      [...overdue, ...dueSoon]
        .sort((a, b) => daysUntil(a.deadline) - daysUntil(b.deadline))
        .slice(0, 8),
    [overdue, dueSoon],
  );

  return (
    <div className="mx-auto max-w-3xl">
      <header className="mb-6">
        <p className="text-[13px] font-semibold text-ink-faint">
          Monday, March 2 · {daysUntil("2026-04-15")} days until April 15
        </p>
        <h1 className="mt-1 font-display text-3xl tracking-tight text-ink">
          Firm operations, {firstName}
        </h1>
        <p className="mt-1 text-[13px] text-ink-soft">
          Where the season stands — capacity, deadlines, and anything stuck.
        </p>
      </header>

      {loading && <CardSkeleton rows={4} />}

      {/* Season at a glance — reporting is fine HERE, because this role
          really is accountable for the aggregate. */}
      <div className="mb-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <StatTile value={overdue.length} label="Overdue" tone="danger" />
        <StatTile value={dueSoon.length} label="Due within 7 days" tone="attention" />
        <StatTile value={stalled.length} label="Stalled 10+ days" tone="attention" />
        <StatTile value={filed} label="Filed this season" tone="verified" />
      </div>

      {/* Capacity — the admin's actual lever */}
      <section className="mb-6 rounded-2xl border border-line bg-card p-5 shadow-lift">
        <div className="mb-3 flex items-center gap-2">
          <Users className="h-4 w-4 text-ink-faint" />
          <h2 className="font-display text-lg text-ink">Who&apos;s carrying what</h2>
          <span className="ml-auto text-[12px] text-ink-faint">
            {average} returns per person on average
          </span>
        </div>

        <ul className="space-y-2.5">
          {workload.map(([id, stats]) => {
            const pct = Math.round((stats.open / heaviest) * 100);
            const heavy = stats.open > average * 1.3;
            return (
              <li key={id}>
                <div className="flex items-center gap-3">
                  <span className="w-32 shrink-0">
                    <span className="block truncate text-[13px] font-semibold text-ink">
                      {STAFF_NAME[id] ?? id}
                    </span>
                    <span className="block text-[12px] text-ink-faint">
                      {STAFF_ROLE[id] ?? "Staff"}
                    </span>
                  </span>
                  <span className="h-2.5 flex-1 overflow-hidden rounded-full bg-paper">
                    <span
                      className={`block h-full rounded-full ${heavy ? "bg-attention" : "bg-spruce"}`}
                      style={{ width: `${pct}%` }}
                    />
                  </span>
                  <span className="tnum w-10 shrink-0 text-right font-mono text-[13px] text-ink">
                    {stats.open}
                  </span>
                  <span className="flex w-32 shrink-0 justify-end gap-1">
                    {stats.overdue > 0 && <Badge tone="danger">{stats.overdue} late</Badge>}
                    {heavy && <Badge tone="attention">over average</Badge>}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>

        <p className="mt-3 border-t border-line pt-3 text-[12px] leading-relaxed text-ink-faint">
          Seasonal staff only see returns assigned to them — access requests
          come to you.
        </p>
      </section>

      {/* Deadline risk */}
      <section>
        <div className="mb-2 flex items-center gap-2">
          <CalendarClock className="h-4 w-4 text-ink-faint" />
          <h2 className="font-display text-lg text-ink">Closest to breaching</h2>
        </div>
        <ul className="space-y-2">
          {atRisk.map((ret) => {
            const late = daysUntil(ret.deadline) < 0;
            return (
              <li key={ret.id}>
                <Link
                  href={`/staff/returns/${ret.id}`}
                  className="group flex items-center gap-3 rounded-xl border border-line bg-card px-4 py-2.5 transition-colors hover:border-spruce/40"
                >
                  {late && <TriangleAlert className="h-4 w-4 shrink-0 text-danger" />}
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-semibold text-ink">
                      {ret.clientName}
                      <span className="ml-2 font-mono text-[12px] font-normal text-ink-faint">
                        {ret.year} {ret.form}
                      </span>
                    </span>
                    <span className="block text-[12px] text-ink-faint">
                      {STAFF_NAME[ret.assigneeId] ?? ret.assigneeId}
                      {ret.blockedOn === "client" && ` · waiting on client ${ret.blockedDays}d`}
                    </span>
                  </span>
                  <Badge tone={late ? "danger" : "attention"}>{deadlineLabel(ret.deadline)}</Badge>
                  <ArrowRight className="h-4 w-4 shrink-0 text-ink-faint transition-transform group-hover:translate-x-0.5" />
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}

function StatTile({
  value,
  label,
  tone,
}: {
  value: number;
  label: string;
  tone: "danger" | "attention" | "verified";
}) {
  const color =
    tone === "danger" ? "text-danger" : tone === "attention" ? "text-attention" : "text-verified";
  return (
    <div className="rounded-xl border border-line bg-card px-3.5 py-3">
      <span className={`tnum block font-mono text-2xl font-semibold ${color}`}>{value}</span>
      <span className="block text-[12px] font-semibold text-ink-faint">{label}</span>
    </div>
  );
}
