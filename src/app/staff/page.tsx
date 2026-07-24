"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, ChevronRight } from "lucide-react";
import { api } from "@/lib/api";
import { useQuery } from "@/lib/use-query";
import { useRole } from "@/lib/role";
import { rankReturns, type PriorityReason } from "@/lib/priority";
import { deadlineLabel, daysUntil } from "@/lib/format";
import { stageById } from "@/data/statuses";
import { Badge, type Tone } from "@/components/ui/badge";
import { CardSkeleton } from "@/components/ui/skeleton";

type QueueFilter = "action" | "waiting" | "review" | "all";

const REASON_TONE: Record<PriorityReason["tone"], Tone> = {
  danger: "danger",
  attention: "attention",
  ai: "ai",
  neutral: "neutral",
};

/**
 * "Today" answers one question: what should I work on right now?
 * (Challenge 07). Ranked by real logic — every card says why it's there
 * and what to do about it.
 */
export default function StaffDashboard() {
  const { persona } = useRole();
  const { data: returns, loading } = useQuery(() => api.getReturns(), []);
  const [scope, setScope] = useState<"mine" | "firm">(
    persona.role === "preparer" ? "mine" : "firm",
  );
  const [filter, setFilter] = useState<QueueFilter>("action");

  const ranked = useMemo(() => {
    if (!returns) return [];
    const scoped =
      scope === "mine" ? returns.filter((r) => r.assigneeId === persona.id) : returns;
    return rankReturns(scoped);
  }, [returns, scope, persona.id]);

  const waiting = ranked.filter((r) => r.ret.blockedOn === "client");
  const inReview = ranked.filter((r) => r.ret.stage === "internal_review");
  const needsAction = ranked.filter((r) => r.score >= 20);

  const visible =
    filter === "waiting" ? waiting
    : filter === "review" ? inReview
    : filter === "action" ? needsAction.slice(0, 8)
    : ranked;

  const filedCount = (returns ?? []).filter((r) => r.stage === "filed").length;
  const daysToApril = daysUntil("2026-04-15");

  return (
    <div className="mx-auto max-w-3xl">
      <header className="mb-6">
        <p className="text-[13px] font-semibold text-ink-faint">
          Monday, March 2 · {daysToApril} days until April 15
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-3">
          <h1 className="font-display text-3xl tracking-tight text-ink">
            {scope === "mine" ? `Your queue, ${persona.name.split(" ")[0]}` : "The whole firm"}
          </h1>
          <div className="ml-auto flex rounded-lg border border-line bg-card p-0.5">
            {(["mine", "firm"] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setScope(s)}
                className={`rounded-md px-3 py-1 text-[12px] font-semibold transition-colors ${
                  scope === s ? "bg-spruce text-white" : "text-ink-soft hover:text-ink"
                }`}
              >
                {s === "mine" ? "My returns" : "Whole firm"}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Actionable tiles — each one filters the queue below */}
      <div className="mb-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <FilterTile
          label="Need you now"
          value={needsAction.length}
          active={filter === "action"}
          onClick={() => setFilter("action")}
        />
        <FilterTile
          label="Waiting on clients"
          value={waiting.length}
          active={filter === "waiting"}
          onClick={() => setFilter("waiting")}
        />
        <FilterTile
          label="Ready for review"
          value={inReview.length}
          active={filter === "review"}
          onClick={() => setFilter("review")}
        />
        <FilterTile
          label={`All open (${filedCount} filed)`}
          value={ranked.length}
          active={filter === "all"}
          onClick={() => setFilter("all")}
        />
      </div>

      {loading && (
        <div className="space-y-2">
          <CardSkeleton rows={2} />
          <CardSkeleton rows={2} />
        </div>
      )}

      <ul className="space-y-2">
        {visible.map(({ ret, reasons, action }, index) => {
          const stage = stageById(ret.stage);
          return (
            <li key={ret.id}>
              <Link
                href={`/staff/returns/${ret.id}`}
                className="group flex items-center gap-3.5 rounded-xl border border-line bg-card px-4 py-3 shadow-lift transition-all hover:-translate-y-px hover:border-spruce/40 hover:shadow-pop"
              >
                <span className="hidden w-5 text-center font-mono text-[12px] text-ink-faint sm:block">
                  {index + 1}
                </span>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-spruce-soft text-[11px] font-bold text-spruce">
                  {ret.clientInitials}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-baseline gap-x-2">
                    <span className="text-[14px] font-semibold text-ink">{ret.clientName}</span>
                    <span className="font-mono text-[11px] text-ink-faint">
                      {ret.year} {ret.form}
                    </span>
                    {scope === "firm" && (
                      <span className="text-[11px] text-ink-faint">· {ret.assigneeId}</span>
                    )}
                  </span>
                  <span className="mt-1 flex flex-wrap items-center gap-1.5">
                    <Badge tone="neutral">{stage.staffLabel}</Badge>
                    <Badge tone={daysUntil(ret.deadline) < 0 ? "danger" : "neutral"}>
                      {deadlineLabel(ret.deadline)}
                    </Badge>
                    {reasons.map((reason) => (
                      <Badge key={reason.text} tone={REASON_TONE[reason.tone]}>
                        {reason.text}
                      </Badge>
                    ))}
                  </span>
                </span>
                <span className="flex shrink-0 items-center gap-1 text-[13px] font-semibold text-spruce">
                  <span className="hidden sm:inline">{action}</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            </li>
          );
        })}
      </ul>

      {!loading && visible.length === 0 && (
        <p className="rounded-xl border border-dashed border-line-strong bg-card/60 px-4 py-8 text-center text-[13px] text-ink-soft">
          Nothing here right now — check another tile.
        </p>
      )}

      {filter === "action" && needsAction.length > 8 && (
        <Link
          href="/staff/returns"
          className="mt-3 flex items-center justify-center gap-1 rounded-xl border border-line bg-card/60 py-2.5 text-[13px] font-semibold text-spruce hover:bg-card"
        >
          See all {ranked.length} open returns
          <ChevronRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
}

function FilterTile({
  label,
  value,
  active,
  onClick,
}: {
  label: string;
  value: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-xl border px-3.5 py-3 text-left transition-all ${
        active
          ? "border-spruce bg-spruce text-white shadow-lift"
          : "border-line bg-card text-ink hover:border-spruce/40"
      }`}
    >
      <span className="tnum block font-mono text-2xl font-semibold">{value}</span>
      <span
        className={`block text-[11px] font-semibold ${active ? "text-white/80" : "text-ink-faint"}`}
      >
        {label}
      </span>
    </button>
  );
}
