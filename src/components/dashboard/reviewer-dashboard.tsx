"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, ShieldCheck, TriangleAlert } from "lucide-react";
import { api } from "@/lib/api";
import { useQuery } from "@/lib/use-query";
import { daysUntil, deadlineLabel } from "@/lib/format";
import { stageById } from "@/data/statuses";
import type { TaxReturn } from "@/data/types";
import { Badge } from "@/components/ui/badge";
import { CardSkeleton } from "@/components/ui/skeleton";

type Lens = "signoff" | "risk" | "approval";

/**
 * The reviewer's job isn't "what's urgent" — it's "what can I sign off,
 * and what would I regret signing" (Challenge 07 for a second role).
 * Everything here is ordered by review risk, not deadline.
 */
export function ReviewerDashboard({ firstName }: { firstName: string }) {
  const { data: returns, loading } = useQuery(() => api.getReturns(), []);
  const [lens, setLens] = useState<Lens>("signoff");

  const inReview = useMemo(
    () => (returns ?? []).filter((r) => r.stage === "internal_review"),
    [returns],
  );
  const awaitingClient = useMemo(
    () => (returns ?? []).filter((r) => r.stage === "client_approval"),
    [returns],
  );

  /** Unverified AI values are the reviewer's real risk signal. */
  const riskScore = (r: TaxReturn) => r.aiFlags * 10 + r.openQuestions * 4;
  const risky = useMemo(
    () => inReview.filter((r) => r.aiFlags > 0).sort((a, b) => riskScore(b) - riskScore(a)),
    [inReview],
  );
  const clean = useMemo(
    () => inReview.filter((r) => r.aiFlags === 0),
    [inReview],
  );

  const list =
    lens === "signoff" ? clean : lens === "risk" ? risky : awaitingClient;

  return (
    <div className="mx-auto max-w-3xl">
      <header className="mb-6">
        <p className="text-[13px] font-semibold text-ink-faint">
          Monday, March 2 · second set of eyes
        </p>
        <h1 className="mt-1 font-display text-3xl tracking-tight text-ink">
          Review queue, {firstName}
        </h1>
        <p className="mt-1 text-[13px] text-ink-soft">
          Ordered by review risk, not deadline — returns where the AI still
          hasn&apos;t been checked come first.
        </p>
      </header>

      <div className="mb-6 grid grid-cols-1 gap-2 sm:grid-cols-3">
        <LensTile
          active={lens === "signoff"}
          onClick={() => setLens("signoff")}
          value={clean.length}
          label="Ready to sign off"
          hint="Every value already verified"
          tone="verified"
        />
        <LensTile
          active={lens === "risk"}
          onClick={() => setLens("risk")}
          value={risky.length}
          label="Check before signing"
          hint="Unverified AI values remain"
          tone="attention"
        />
        <LensTile
          active={lens === "approval"}
          onClick={() => setLens("approval")}
          value={awaitingClient.length}
          label="With the client"
          hint="Signed by you, awaiting them"
          tone="neutral"
        />
      </div>

      {loading && (
        <div className="space-y-2">
          <CardSkeleton rows={2} />
          <CardSkeleton rows={2} />
        </div>
      )}

      <ul className="space-y-2">
        {list.slice(0, 20).map((ret) => {
          const stage = stageById(ret.stage);
          const blocked = ret.aiFlags > 0;
          return (
            <li key={ret.id}>
              <Link
                href={`/staff/returns/${ret.id}`}
                className="group flex items-center gap-3.5 rounded-xl border border-line bg-card px-4 py-3 shadow-lift transition-all hover:-translate-y-px hover:border-spruce/40 hover:shadow-pop"
              >
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                    blocked ? "bg-attention-soft text-attention" : "bg-verified-soft text-verified"
                  }`}
                >
                  {blocked ? (
                    <TriangleAlert className="h-4 w-4" />
                  ) : (
                    <ShieldCheck className="h-4 w-4" />
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-baseline gap-x-2">
                    <span className="text-[14px] font-semibold text-ink">{ret.clientName}</span>
                    <span className="font-mono text-[12px] text-ink-faint">
                      {ret.year} {ret.form}
                    </span>
                    <span className="text-[12px] text-ink-faint">
                      · prepared by {ret.assigneeId}
                    </span>
                  </span>
                  <span className="mt-1 flex flex-wrap items-center gap-1.5">
                    <Badge tone="neutral">{stage.staffLabel}</Badge>
                    {blocked ? (
                      <Badge tone="attention">
                        {ret.aiFlags} value{ret.aiFlags === 1 ? "" : "s"} not yet verified
                      </Badge>
                    ) : (
                      <Badge tone="verified">All values verified</Badge>
                    )}
                    {ret.openQuestions > 0 && (
                      <Badge tone="neutral">{ret.openQuestions} open questions</Badge>
                    )}
                    <Badge tone={daysUntil(ret.deadline) < 0 ? "danger" : "neutral"}>
                      {deadlineLabel(ret.deadline)}
                    </Badge>
                  </span>
                </span>
                <span className="flex shrink-0 items-center gap-1 text-[13px] font-semibold text-spruce">
                  <span className="hidden sm:inline">
                    {blocked ? "Check values" : "Sign off"}
                  </span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            </li>
          );
        })}
      </ul>

      {!loading && list.length === 0 && (
        <p className="rounded-xl border border-dashed border-line-strong bg-card/60 px-4 py-8 text-center text-[13px] text-ink-soft">
          Nothing in this lens right now.
        </p>
      )}
    </div>
  );
}

function LensTile({
  active,
  onClick,
  value,
  label,
  hint,
  tone,
}: {
  active: boolean;
  onClick: () => void;
  value: number;
  label: string;
  hint: string;
  tone: "verified" | "attention" | "neutral";
}) {
  const accent =
    tone === "verified" ? "text-verified" : tone === "attention" ? "text-attention" : "text-ink";
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-xl border px-4 py-3 text-left transition-all ${
        active
          ? "border-spruce bg-spruce text-white shadow-lift"
          : "border-line bg-card hover:border-spruce/40"
      }`}
    >
      <span
        className={`tnum block font-mono text-2xl font-semibold ${active ? "text-white" : accent}`}
      >
        {value}
      </span>
      <span className={`block text-[13px] font-semibold ${active ? "text-white" : "text-ink"}`}>
        {label}
      </span>
      <span className={`block text-[12px] ${active ? "text-white/75" : "text-ink-faint"}`}>
        {hint}
      </span>
    </button>
  );
}
