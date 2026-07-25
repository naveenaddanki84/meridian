"use client";

import Link from "next/link";
import { Check, ChevronRight, Clock3 } from "lucide-react";
import { api } from "@/lib/api";
import { useQuery } from "@/lib/use-query";
import { useRole } from "@/lib/role";
import { useClientProgress } from "@/lib/client-progress";
import { HERO_RETURN_ID } from "@/data/hero";
import type { ChecklistItem } from "@/data/types";
import { JourneyCard } from "@/components/client/journey-card";
import { CardSkeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

/**
 * The client's front door (Challenge 03): within ten seconds — a
 * greeting, one card that says exactly what to do next and how long it
 * takes, and status in plain English. Nothing else competes for
 * attention until onboarding is done.
 */

const HAPPENED: readonly { date: string; text: string }[] = [
  { date: "Feb 12", text: "You answered 12 getting-started questions" },
  { date: "Feb 18", text: "We read your W-2 and pre-filled your income" },
  { date: "Feb 24", text: "Marcus started preparing your return" },
];

/** Marcus wearing his client hat sees his own (simpler) to-dos. */
const MARCUS_ITEMS: readonly ChecklistItem[] = [
  {
    id: "m-docs",
    title: "Share your tax documents",
    detail: "2 of 6 uploaded",
    minutes: 5,
    done: false,
    href: "/client/documents",
  },
  {
    id: "m-question",
    title: "Answer Sofia's question",
    detail: "About your home office",
    minutes: 2,
    done: false,
    href: "/client/questions",
  },
];

export default function ClientHome() {
  const { persona } = useRole();
  const progress = useClientProgress();
  const isPriya = persona.id === "priya";
  const returnId = isPriya ? HERO_RETURN_ID : (persona.alsoClientOfReturnId ?? HERO_RETURN_ID);

  const { data: ret, loading } = useQuery(() => api.getReturn(returnId), [returnId]);
  const { data: apiChecklist } = useQuery(
    () => (isPriya ? api.getClientChecklist() : Promise.resolve(MARCUS_ITEMS)),
    [isPriya],
  );

  // Live progress: finishing a task anywhere updates the home checklist.
  const checklist = (apiChecklist ?? []).map((item) => {
    if (!isPriya) return item;
    if (item.id === "chk-docs" && progress.k1Uploaded)
      return { ...item, done: true, detail: "All 5 in — thank you!" };
    if (item.id === "chk-question" && progress.questionAnswered)
      return { ...item, done: true, detail: "Answered — Marcus is on it" };
    return item;
  });
  const openItems = checklist.filter((item) => !item.done);
  const totalMinutes = openItems.reduce((sum, item) => sum + item.minutes, 0);
  const firstName = persona.name.split(" ")[0];
  const preparerName = isPriya ? "Marcus Bell, your preparer" : "Sofia Reyes, your preparer";

  // Only Priya (and Marcus's personal return) are wired end-to-end.
  if (!isPriya && !persona.alsoClientOfReturnId) {
    return (
      <div className="mx-auto max-w-xl">
        <header className="mb-6">
          <h1 className="font-display text-3xl tracking-tight text-ink">
            Good morning, {firstName}
          </h1>
        </header>
        <div className="rounded-2xl border border-dashed border-line-strong bg-card/60 px-6 py-10 text-center">
          <p className="font-semibold text-ink">This account isn&apos;t wired in the prototype</p>
          <p className="mx-auto mt-1 max-w-sm text-sm leading-relaxed text-ink-soft">
            {firstName}&apos;s home would work exactly like Priya&apos;s — switch
            to Priya Sharma from the top-right menu to see the full client
            experience.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl">
      {!isPriya && (
        <div className="mb-4 rounded-xl border border-ai-line bg-ai-soft px-4 py-2.5 text-[13px] text-ink">
          <span className="font-semibold">Client hat on.</span> This is your own
          2025 return — firm tools are hidden here. Switch back anytime from the
          top-right menu.
        </div>
      )}

      <header className="mb-6">
        <h1 className="font-display text-3xl tracking-tight text-ink">
          Good morning, {firstName}
        </h1>
        <p className="mt-1 text-[13px] text-ink-soft">
          Your 2025 tax return · prepared by {preparerName.split(",")[0]}
        </p>
      </header>

      {loading && <CardSkeleton rows={4} />}

      {/* The one card that answers "what do I do?" */}
      {openItems.length > 0 ? (
        <section className="mb-4 rounded-2xl border border-spruce/25 bg-card p-5 shadow-lift">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl text-ink">
              {openItems.length === 1 ? "One thing needs you" : `${openItems.length} things need you`}
            </h2>
            <Badge tone="brand">
              <Clock3 className="h-3 w-3" />
              about {totalMinutes} min
            </Badge>
          </div>

          <ul className="mt-4 space-y-1.5">
            {checklist.map((item) => (
              <li key={item.id}>
                {item.done ? (
                  <Link
                    href={item.href}
                    className="group flex items-center gap-3 rounded-xl px-3 py-2.5 opacity-60 transition-opacity hover:opacity-90"
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-verified text-white">
                      <Check className="h-3.5 w-3.5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[14px] font-semibold text-ink line-through decoration-ink-faint">
                        {item.title}
                      </span>
                      <span className="block text-[12px] text-ink-faint">{item.detail}</span>
                    </span>
                    <ChevronRight className="h-4 w-4 shrink-0 text-ink-faint opacity-0 transition-opacity group-hover:opacity-100" />
                  </Link>
                ) : (
                  <Link
                    href={item.href}
                    className="group flex items-center gap-3 rounded-xl border border-line bg-paper/60 px-3 py-2.5 transition-colors hover:border-spruce/40 hover:bg-card"
                  >
                    <span className="h-6 w-6 shrink-0 rounded-full border-2 border-line-strong transition-colors group-hover:border-spruce" />
                    <span className="min-w-0 flex-1">
                      <span className="block text-[14px] font-semibold text-ink">{item.title}</span>
                      <span className="block text-[12px] text-ink-soft">{item.detail}</span>
                    </span>
                    <span className="text-[11px] font-semibold text-ink-faint">
                      {item.minutes} min
                    </span>
                    <ChevronRight className="h-4 w-4 shrink-0 text-spruce transition-transform group-hover:translate-x-0.5" />
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </section>
      ) : (
        !loading && (
          <section className="mb-4 rounded-2xl border border-verified/30 bg-verified-soft p-5">
            <h2 className="font-display text-xl text-ink">You&apos;re all caught up</h2>
            <p className="mt-1 text-[13px] text-ink-soft">
              Nothing needs you right now — we&apos;ll email you the moment something does.
            </p>
          </section>
        )
      )}

      {ret && (
        <JourneyCard
          ret={ret}
          preparerName={preparerName}
          nextUp={
            !isPriya
              ? "Upload the rest of your documents so Sofia can start preparing."
              : openItems.length === 0
                ? "Marcus double-checks your numbers, then a reviewer signs off. We'll email you when it's your turn to approve."
                : "Once your K-1 arrives and you confirm one donation amount, Marcus finishes preparing and a reviewer double-checks everything."
          }
        />
      )}

      {/* What already happened — quiet, reverse-chronological comfort */}
      {isPriya && (
        <section className="mt-4 rounded-2xl border border-line bg-card/60 p-5">
          <h2 className="text-[11px] font-bold uppercase tracking-wide text-ink-faint">
            What&apos;s already happened
          </h2>
          <ul className="mt-3 space-y-2.5">
            {[...HAPPENED].reverse().map((event) => (
              <li key={event.text} className="flex gap-3 text-[13px]">
                <span className="w-12 shrink-0 font-mono text-[11px] text-ink-faint">
                  {event.date}
                </span>
                <span className="text-ink-soft">{event.text}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 border-t border-line pt-3 text-[12px] leading-relaxed text-ink-faint">
            Estimated refund so far:{" "}
            <span className="tnum font-mono font-semibold text-verified">$508</span> — this
            can change until every number is double-checked by your preparer.
          </p>
        </section>
      )}
    </div>
  );
}
