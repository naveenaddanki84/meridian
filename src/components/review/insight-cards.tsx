"use client";

import { useState } from "react";
import { Check, ChevronDown, Lightbulb, TriangleAlert } from "lucide-react";
import type { Insight } from "@/data/types";
import { Button } from "@/components/ui/button";

/**
 * Simulated AI recommendations and warnings (Challenge 10): what the AI
 * noticed, why, the evidence behind it, and one clear action — collapsed
 * until wanted, never in the way.
 */
export function InsightCards({
  insights,
  onShowEvidence,
}: {
  insights: readonly Insight[];
  onShowEvidence: (documentId: string, boxId: string) => void;
}) {
  const [open, setOpen] = useState(true);
  const [resolved, setResolved] = useState<ReadonlySet<string>>(new Set());

  const pending = insights.filter((i) => !resolved.has(i.id));
  if (insights.length === 0) return null;

  const resolve = (id: string) =>
    setResolved((prev) => new Set([...prev, id]));

  return (
    <div className="mb-4">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wide text-ink-faint hover:text-ink"
      >
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "" : "-rotate-90"}`} />
        AI review notes
        {pending.length > 0 && (
          <span className="rounded-full bg-ai-soft px-1.5 text-[11px] font-bold text-ai">
            {pending.length}
          </span>
        )}
      </button>

      {open && (
        <div className="mt-2 grid gap-2 lg:grid-cols-2">
          {insights.map((insight) => {
            const done = resolved.has(insight.id);
            const Icon = insight.kind === "warning" ? TriangleAlert : Lightbulb;
            return (
              <div
                key={insight.id}
                className={`rounded-xl border bg-card px-3.5 py-3 transition-opacity ${
                  done ? "border-line opacity-55" : "border-ai-line"
                }`}
              >
                <div className="flex items-start gap-2">
                  <Icon
                    className={`mt-0.5 h-4 w-4 shrink-0 ${
                      insight.kind === "warning" ? "text-attention" : "text-ai"
                    }`}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-semibold leading-snug text-ink">
                      {insight.title}
                    </p>
                    <p className="mt-1 text-[12px] leading-relaxed text-ink-soft">
                      {insight.why}
                    </p>

                    <div className="mt-2 flex flex-wrap items-center gap-1.5">
                      {insight.evidence.map((ev) => (
                        <button
                          key={ev.label}
                          type="button"
                          disabled={!ev.documentId || !ev.boxId}
                          onClick={() =>
                            ev.documentId && ev.boxId && onShowEvidence(ev.documentId, ev.boxId)
                          }
                          className="rounded-md bg-spruce-soft px-2 py-0.5 font-mono text-[11px] font-semibold text-spruce hover:bg-spruce/15 disabled:pointer-events-none"
                          title="Show on the document"
                        >
                          {ev.label}
                        </button>
                      ))}
                    </div>

                    {insight.caveat && (
                      <p className="mt-1.5 text-[11px] italic text-ink-faint">{insight.caveat}</p>
                    )}

                    <div className="mt-2">
                      {done ? (
                        <p className="flex items-center gap-1 text-[12px] font-semibold text-verified">
                          <Check className="h-3.5 w-3.5" />
                          Decision recorded
                        </p>
                      ) : (
                        <Button size="sm" onClick={() => resolve(insight.id)}>
                          <Check className="h-3.5 w-3.5" />
                          {insight.suggestedAction}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
