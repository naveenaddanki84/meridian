"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Check, Info, PartyPopper } from "lucide-react";
import { DAVE_QUESTIONS } from "@/data/questionnaire";
import { readProgress, updateProgress } from "@/lib/client-progress";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

/**
 * Day one, question one (Challenge 03). One question at a time with a
 * visible finish line: a first-time client is never shown a wall of tax
 * jargon, and every question says why it's being asked.
 */
export function QuestionnaireRunner({ firstName }: { firstName: string }) {
  // Answers survive leaving the page, so resuming picks up where it left
  // off instead of restarting the count.
  const [answers, setAnswers] = useState<Readonly<Record<string, string>>>(
    () => readProgress().daveAnswers,
  );
  const [index, setIndex] = useState(() => {
    const stored = readProgress().daveAnswers;
    const firstUnanswered = DAVE_QUESTIONS.findIndex((q) => !stored[q.id]);
    return firstUnanswered === -1 ? DAVE_QUESTIONS.length - 1 : firstUnanswered;
  });
  const [finished, setFinished] = useState(() => readProgress().daveQuestionnaireDone);
  const { notify } = useToast();

  const total = DAVE_QUESTIONS.length;
  const q = DAVE_QUESTIONS[index];
  const answeredCount = Object.keys(answers).length;
  // Progress measures work done, not how far you've scrolled — skipping
  // a question moves you forward without moving the bar.
  const pct = Math.round(((finished ? total : answeredCount) / total) * 100);

  const choose = (value: string) => {
    const next = { ...answers, [q.id]: value };
    setAnswers(next);
    const done = Object.keys(next).length;
    updateProgress({ daveAnswers: next });

    const nextUnanswered = DAVE_QUESTIONS.findIndex((item) => !next[item.id]);
    if (done >= total || nextUnanswered === -1) {
      updateProgress({ daveQuestionnaireDone: true, daveAnswers: next });
      setFinished(true);
      notify("Thanks — that's everything we needed to start");
    } else {
      window.setTimeout(() => setIndex(nextUnanswered), 180);
    }
  };

  if (finished) {
    return (
      <div className="mx-auto max-w-xl">
        <div className="rounded-2xl border border-verified/30 bg-verified-soft p-6 text-center">
          <PartyPopper className="mx-auto h-7 w-7 text-verified" />
          <h1 className="mt-3 font-display text-2xl text-ink">
            That&apos;s the hard part done, {firstName}
          </h1>
          <p className="mx-auto mt-2 max-w-sm text-[13px] leading-relaxed text-ink-soft">
            We know enough to get started. Next, share your documents — we&apos;ll
            read each one as it arrives and tell you if anything&apos;s missing.
          </p>
          <div className="mt-4 flex justify-center gap-2">
            <Link href="/client/documents">
              <Button variant="primary">Share documents</Button>
            </Link>
            <Link href="/client">
              <Button>Back to home</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl">
      <Link
        href="/client"
        className="mb-5 inline-flex items-center gap-1 text-[12px] font-semibold text-ink-faint hover:text-spruce"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Home
      </Link>

      {/* Progress — a visible finish line beats a spinner */}
      <div className="mb-5">
        <div className="mb-1.5 flex items-baseline justify-between">
          <p className="text-[12px] font-semibold uppercase tracking-wide text-ink-faint">
            Question {index + 1} of {total}
          </p>
          <p className="text-[12px] text-ink-faint">
            {answeredCount > 0 && `${answeredCount} answered · `}
            about {Math.max(1, total - answeredCount)} min left
          </p>
        </div>
        <div
          className="h-2 overflow-hidden rounded-full bg-line"
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Questionnaire progress"
        >
          <div
            className="h-full rounded-full bg-spruce transition-all duration-300"
            style={{ width: `${Math.max(pct, 4)}%` }}
          />
        </div>
      </div>

      <div className="rise-in rounded-2xl border border-line bg-card p-6 shadow-lift" key={q.id}>
        <h1 className="font-display text-2xl leading-snug text-ink">{q.prompt}</h1>
        <p className="mt-2 flex items-start gap-1.5 text-[13px] leading-relaxed text-ink-soft">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink-faint" />
          {q.why}
        </p>

        <div className="mt-5 space-y-2">
          {q.options.map((opt) => {
            const selected = answers[q.id] === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => choose(opt.value)}
                className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all ${
                  selected
                    ? "border-spruce bg-spruce-soft"
                    : "border-line hover:border-spruce/50 hover:bg-spruce-wash/60"
                }`}
              >
                <span
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                    selected ? "border-spruce bg-spruce text-white" : "border-line-strong"
                  }`}
                >
                  {selected && <Check className="h-3 w-3" />}
                </span>
                <span className="text-[14px] font-medium text-ink">{opt.label}</span>
              </button>
            );
          })}
        </div>

        <div className="mt-5 flex items-center justify-between border-t border-line pt-4">
          <Button
            variant="ghost"
            disabled={index === 0}
            onClick={() => setIndex((i) => Math.max(0, i - 1))}
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back
          </Button>
          <p className="text-[12px] text-ink-faint">
            {answeredCount > 0
              ? "Your answers save as you go"
              : "Pick an answer to continue"}
          </p>
          <Button
            variant="ghost"
            disabled={index + 1 >= total}
            onClick={() => setIndex((i) => Math.min(total - 1, i + 1))}
          >
            Skip
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <p className="mt-4 text-center text-[12px] leading-relaxed text-ink-faint">
        Not sure about something? Pick your best guess — your preparer checks
        everything and will ask if it matters.
      </p>
    </div>
  );
}
