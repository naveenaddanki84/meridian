"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Check, RotateCcw } from "lucide-react";
import { PERSONAS } from "@/data/people";
import { rememberPersona } from "@/lib/role";
import { Badge } from "@/components/ui/badge";

const SHELL_HOME: Record<string, string> = {
  client: "/client",
  preparer: "/staff",
  reviewer: "/staff",
  admin: "/staff",
};

const ROLE_LABEL: Record<string, string> = {
  client: "Client",
  preparer: "Preparer",
  reviewer: "Reviewer",
  admin: "Firm admin",
};

const PERSONA_BLURB: Record<string, string> = {
  emily:
    "Mid-season client. Documents are in, the AI has read them, and one question is waiting for her.",
  mike:
    "Owns 198 returns. Sees a prioritized queue and the deep review workspace where every number traces.",
  dave: "Brand-new client — signed up this morning. Start here to see onboarding from zero.",
  sarah: "Signs off before filing. Same product, ordered by review risk instead of deadline.",
  linda: "Runs the firm: capacity per preparer, deadline risk, and access requests.",
  katie: "Seasonal staff, scoped to her own returns. Try opening someone else's.",
};

const ORDER = ["dave", "emily", "mike", "sarah", "linda", "katie"];

/**
 * The demo's front door: pick a hat. This page replaces login for the
 * prototype (Challenge 05 — one product, many roles).
 */
export default function DemoPicker() {
  const [resetDone, setResetDone] = useState(false);
  const personas = [...PERSONAS].sort(
    (a, b) => ORDER.indexOf(a.id) - ORDER.indexOf(b.id),
  );
  const featured = personas.filter((p) => ["dave", "emily", "mike"].includes(p.id));
  const rest = personas.filter((p) => !["dave", "emily", "mike"].includes(p.id));

  const resetDemo = () => {
    try {
      window.localStorage.removeItem("meridian.persona");
      window.localStorage.removeItem("meridian.client-progress");
      window.localStorage.removeItem("meridian.thread-messages");
      window.localStorage.removeItem("meridian.thread-messages.v2");
      window.localStorage.removeItem("meridian.threads.v2");
      window.sessionStorage.removeItem("meridian.workspace-spot");
      setResetDone(true);
      window.setTimeout(() => setResetDone(false), 2000);
    } catch {
      // Storage unavailable — nothing to reset.
    }
  };

  return (
    <div className="mx-auto flex min-h-dvh max-w-4xl flex-col px-6 py-10">
      <header className="flex items-center justify-between">
        <Link href="/" className="flex items-baseline gap-1.5">
          <span className="font-display text-2xl font-semibold tracking-tight">Meridian</span>
          <span className="h-1.5 w-1.5 rounded-full bg-spruce" aria-hidden="true" />
        </Link>
        <Link
          href="/"
          className="flex items-center gap-1 text-[13px] font-semibold text-ink-faint hover:text-spruce"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Overview
        </Link>
      </header>

      <main className="my-auto py-10">
        <h1 className="font-display text-3xl tracking-tight text-ink sm:text-4xl">
          Who would you like to be?
        </h1>
        <p className="mt-2 max-w-lg text-[15px] leading-relaxed text-ink-soft">
          One product, six people. Switch anytime from the top-right menu — the
          shell, the permissions, and the vocabulary adapt to each of them.
        </p>

        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          {featured.map((p) => (
            <Link
              key={p.id}
              href={SHELL_HOME[p.role]}
              onClick={() => rememberPersona(p.id)}
              className="group rounded-2xl border border-line bg-card p-5 shadow-lift transition-all hover:-translate-y-0.5 hover:border-spruce/40 hover:shadow-pop"
            >
              <div className="flex items-center justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-spruce text-[13px] font-bold text-white">
                  {p.initials}
                </span>
                <Badge tone="brand">{ROLE_LABEL[p.role]}</Badge>
              </div>
              <p className="mt-4 font-display text-xl text-ink">{p.name}</p>
              <p className="mt-1.5 min-h-20 text-[13px] leading-relaxed text-ink-soft">
                {PERSONA_BLURB[p.id]}
              </p>
              <span className="mt-2 inline-flex items-center gap-1 text-[13px] font-semibold text-spruce">
                Enter as {p.name.split(" ")[0]}
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
        </div>

        <p className="mt-8 text-[12px] font-bold uppercase tracking-wider text-ink-faint">
          Also inside the firm
        </p>
        <div className="mt-2 grid gap-3 sm:grid-cols-3">
          {rest.map((p) => (
            <Link
              key={p.id}
              href={SHELL_HOME[p.role]}
              onClick={() => rememberPersona(p.id)}
              className="group flex min-w-0 items-start gap-3 rounded-2xl border border-line bg-card/60 px-4 py-3.5 transition-colors hover:border-spruce/40 hover:bg-card"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-paper text-[12px] font-bold text-ink-soft">
                {p.initials}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[13px] font-semibold text-ink">{p.name}</span>
                <span className="mt-0.5 block text-[12px] leading-relaxed text-ink-faint">
                  {PERSONA_BLURB[p.id]}
                </span>
              </span>
            </Link>
          ))}
        </div>
      </main>

      <footer className="flex flex-wrap items-center justify-between gap-3 text-[12px] leading-relaxed text-ink-faint">
        <span className="max-w-md">
          Every name, number, and AI output is fabricated; the interactions are
          real. No real tax advice lives here.
        </span>
        <button
          type="button"
          onClick={resetDemo}
          className="flex shrink-0 items-center gap-1.5 rounded-lg border border-line bg-card px-2.5 py-1.5 font-semibold text-ink-soft transition-colors hover:border-line-strong hover:text-ink"
        >
          {resetDone ? (
            <>
              <Check className="h-3.5 w-3.5 text-verified" />
              Fresh start ready
            </>
          ) : (
            <>
              <RotateCcw className="h-3.5 w-3.5" />
              Reset demo
            </>
          )}
        </button>
      </footer>
    </div>
  );
}
