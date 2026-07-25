"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ChevronRight } from "lucide-react";
import { api } from "@/lib/api";
import { useQuery } from "@/lib/use-query";
import { deadlineLabel, daysUntil, relativeLabel } from "@/lib/format";
import { STAGES, stageById } from "@/data/statuses";
import type { StageId } from "@/data/types";
import { Badge } from "@/components/ui/badge";
import { CardSkeleton } from "@/components/ui/skeleton";

/**
 * Every return, grouped by where it is in the pipeline. Summary view —
 * one click deeper is the full workspace (Challenge 09's summary/detail).
 */
export default function ReturnsList() {
  const { data: returns, loading } = useQuery(() => api.getReturns(), []);
  const [stageFilter, setStageFilter] = useState<StageId | "all">("all");

  const LIST_CAP = 60;

  const filteredCount = useMemo(() => {
    const list = returns ?? [];
    return stageFilter === "all"
      ? list.length
      : list.filter((r) => r.stage === stageFilter).length;
  }, [returns, stageFilter]);

  const visible = useMemo(() => {
    const list = returns ?? [];
    const filtered =
      stageFilter === "all" ? list : list.filter((r) => r.stage === stageFilter);
    return [...filtered]
      .sort((a, b) => daysUntil(a.deadline) - daysUntil(b.deadline))
      .slice(0, LIST_CAP);
  }, [returns, stageFilter]);

  return (
    <div className="mx-auto max-w-3xl">
      <header className="mb-5">
        <h1 className="font-display text-3xl tracking-tight text-ink">Returns</h1>
        <p className="mt-1 text-[13px] text-ink-soft">
          {returns ? returns.length.toLocaleString("en-US") : "…"} returns this season, sorted by deadline.
        </p>
      </header>

      <div className="mb-4 flex flex-wrap gap-1.5">
        <StagePill
          label="All"
          count={returns?.length ?? 0}
          active={stageFilter === "all"}
          onClick={() => setStageFilter("all")}
        />
        {STAGES.map((stage) => {
          const count = (returns ?? []).filter((r) => r.stage === stage.id).length;
          return (
            <StagePill
              key={stage.id}
              label={stage.staffLabel}
              count={count}
              active={stageFilter === stage.id}
              onClick={() => setStageFilter(stage.id)}
            />
          );
        })}
      </div>

      {loading && (
        <div className="space-y-2">
          <CardSkeleton rows={3} />
          <CardSkeleton rows={3} />
        </div>
      )}

      <ul className="overflow-hidden rounded-xl border border-line bg-card">
        {visible.map((ret) => {
          const stage = stageById(ret.stage);
          return (
            <li key={ret.id} className="border-b border-line last:border-b-0">
              <Link
                href={`/staff/returns/${ret.id}`}
                className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-spruce-wash/60"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-spruce-soft text-[12px] font-bold text-spruce">
                  {ret.clientInitials}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-semibold text-ink">
                    {ret.clientName}
                    <span className="ml-2 font-mono text-[12px] font-normal text-ink-faint">
                      {ret.year} {ret.form}
                    </span>
                  </span>
                  <span className="block text-[12px] text-ink-faint">
                    {ret.docsReceived}/{ret.docsExpected} docs · last activity{" "}
                    {relativeLabel(ret.lastActivity)}
                  </span>
                </span>
                {ret.blockedOn === "client" && (
                  <Badge tone="attention">waiting {ret.blockedDays}d</Badge>
                )}
                <Badge tone={ret.stage === "filed" ? "verified" : "neutral"}>
                  {stage.staffLabel}
                </Badge>
                <Badge tone={daysUntil(ret.deadline) < 0 ? "danger" : "neutral"}>
                  {deadlineLabel(ret.deadline)}
                </Badge>
                <ChevronRight className="h-4 w-4 shrink-0 text-ink-faint" />
              </Link>
            </li>
          );
        })}
      </ul>

      {filteredCount > visible.length && (
        <p className="mt-3 rounded-xl border border-dashed border-line-strong bg-card/60 px-4 py-3 text-center text-[12px] text-ink-soft">
          Showing the {visible.length} most urgent of {filteredCount.toLocaleString("en-US")} — pick a
          stage above or use ⌘K to find a specific client.
        </p>
      )}

      {!loading && visible.length === 0 && (
        <p className="rounded-xl border border-dashed border-line-strong bg-card/60 px-4 py-8 text-center text-[13px] text-ink-soft">
          No returns in this stage right now.
        </p>
      )}
    </div>
  );
}

function StagePill({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-[12px] font-semibold transition-colors ${
        active
          ? "border-spruce bg-spruce text-white"
          : "border-line bg-card text-ink-soft hover:border-line-strong hover:text-ink"
      }`}
    >
      {label}
      <span className={active ? "text-white/70" : "text-ink-faint"}>{count}</span>
    </button>
  );
}
