"use client";

import { Check } from "lucide-react";
import { CLIENT_JOURNEY, stageById } from "@/data/statuses";
import type { TaxReturn } from "@/data/types";
import { shortDate } from "@/lib/format";

/**
 * The client's view of status (Challenge 06): the same underlying state
 * machine staff see, rendered as five plain-English steps — where you
 * are, what happened, what's next, and who's on it.
 */
export function JourneyCard({
  ret,
  preparerName,
  nextUp,
}: {
  ret: TaxReturn;
  preparerName: string;
  nextUp: string;
}) {
  const stage = stageById(ret.stage);
  const currentStep = CLIENT_JOURNEY.findIndex((step) =>
    step.stages.includes(ret.stage),
  );

  return (
    <section className="rounded-2xl border border-line bg-card p-5 shadow-lift">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="font-display text-xl text-ink">{stage.clientLabel}</h2>
        <p className="text-[12px] text-ink-faint">
          Filing deadline {shortDate(ret.deadline)}
        </p>
      </div>
      <p className="mt-1 text-[13px] leading-relaxed text-ink-soft">
        {stage.clientDescription}
      </p>

      {/* Five steps, no jargon */}
      <ol className="mt-5 flex items-start" aria-label="Progress">
        {CLIENT_JOURNEY.map((step, index) => {
          const done = index < currentStep;
          const current = index === currentStep;
          return (
            <li key={step.label} className="flex flex-1 flex-col items-center gap-1.5">
              <div className="flex w-full items-center">
                <div
                  className={`h-0.5 flex-1 ${index === 0 ? "invisible" : done || current ? "bg-spruce" : "bg-line"}`}
                />
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 text-[12px] font-bold transition-colors ${
                    done
                      ? "border-spruce bg-spruce text-white"
                      : current
                        ? "border-spruce bg-card text-spruce"
                        : "border-line bg-card text-ink-faint"
                  }`}
                >
                  {done ? <Check className="h-3.5 w-3.5" /> : index + 1}
                </span>
                <div
                  className={`h-0.5 flex-1 ${index === CLIENT_JOURNEY.length - 1 ? "invisible" : done ? "bg-spruce" : "bg-line"}`}
                />
              </div>
              <span
                className={`px-1 text-center text-[12px] leading-tight ${
                  current ? "font-bold text-ink" : "font-medium text-ink-faint"
                }`}
              >
                {step.label}
              </span>
            </li>
          );
        })}
      </ol>

      <dl className="mt-5 grid gap-3 border-t border-line pt-4 sm:grid-cols-2">
        <div>
          <dt className="text-[12px] font-bold uppercase tracking-wide text-ink-faint">
            Who&apos;s on it
          </dt>
          <dd className="mt-0.5 text-[13px] font-semibold text-ink">{preparerName}</dd>
        </div>
        <div>
          <dt className="text-[12px] font-bold uppercase tracking-wide text-ink-faint">
            What&apos;s next
          </dt>
          <dd className="mt-0.5 text-[13px] leading-relaxed text-ink-soft">{nextUp}</dd>
        </div>
      </dl>
    </section>
  );
}
