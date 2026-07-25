"use client";

import Link from "next/link";
import { ArrowLeft, Check } from "lucide-react";
import { useRole } from "@/lib/role";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";

interface Answer {
  question: string;
  answer: string;
  /** Set when this answer literally became a number on the return. */
  usedOnReturn?: string;
}

/**
 * The onboarding questionnaire, answered (Challenge 03). Read-only on
 * purpose: answers feed the return, so changes go through the preparer —
 * and two of these answers carry "from your answers" receipts in the
 * review workspace (Challenge 01).
 */
const ANSWERS: readonly Answer[] = [
  { question: "What's your filing status?", answer: "Single", usedOnReturn: "Filing status" },
  { question: "Any dependents?", answer: "No" },
  { question: "How many employers did you have in 2025?", answer: "One — Lumen Health Systems" },
  { question: "Did you make estimated tax payments?", answer: "No", usedOnReturn: "Line 26 · $0.00" },
  { question: "Did you contribute to an IRA?", answer: "Yes — $2,400", usedOnReturn: "Awaiting preparer approval" },
  { question: "Any charitable donations?", answer: "Yes — Bright Futures Fund" },
  { question: "Bank accounts that earn interest?", answer: "Yes — First Harbor Bank" },
  { question: "Investment or brokerage accounts?", answer: "Yes — Vanguard" },
  { question: "Any partnership or business income?", answer: "Yes — Redwood Partners (K-1 on its way)" },
  { question: "Did you buy or sell a home?", answer: "No" },
  { question: "Big life changes this year?", answer: "None" },
  { question: "Refund by direct deposit?", answer: "Yes" },
] as const;

export default function ClientQuestionnaire() {
  const { persona } = useRole();

  if (persona.id !== "priya") {
    return (
      <div className="mx-auto max-w-xl">
        <EmptyState
          title="Getting-started answers live here"
          detail="In this prototype only Priya's questionnaire is wired up. Switch to Priya from the top-right menu to see it."
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl">
      <Link
        href="/client"
        className="mb-4 inline-flex items-center gap-1 text-[12px] font-semibold text-ink-faint hover:text-spruce"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Home
      </Link>

      <header className="mb-6">
        <div className="flex items-center gap-2.5">
          <h1 className="font-display text-3xl tracking-tight text-ink">Your answers</h1>
          <Badge tone="verified">
            <Check className="h-3 w-3" />
            Done Feb 12
          </Badge>
        </div>
        <p className="mt-1 text-[13px] leading-relaxed text-ink-soft">
          12 getting-started questions, answered in about 5 minutes. Some of
          these became numbers on your return — those carry a receipt your
          preparer can trace.
        </p>
      </header>

      <ul className="overflow-hidden rounded-2xl border border-line bg-card shadow-lift">
        {ANSWERS.map((item) => (
          <li
            key={item.question}
            className="flex items-start justify-between gap-4 border-b border-line px-4 py-3 last:border-b-0"
          >
            <div className="min-w-0">
              <p className="text-[13px] font-semibold text-ink">{item.question}</p>
              <p className="mt-0.5 text-[13px] text-ink-soft">{item.answer}</p>
            </div>
            {item.usedOnReturn && (
              <Badge tone="brand" className="mt-0.5 shrink-0">
                On your return · {item.usedOnReturn}
              </Badge>
            )}
          </li>
        ))}
      </ul>

      <p className="mt-4 text-center text-[12px] leading-relaxed text-ink-faint">
        Need to change an answer? Because these feed your return,{" "}
        <Link href="/client/questions" className="font-semibold text-spruce hover:underline">
          tell Marcus
        </Link>{" "}
        and he&apos;ll update it — nothing changes silently.
      </p>
    </div>
  );
}
