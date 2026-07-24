"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
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
  priya:
    "First tax season with the firm. Sees a calm home, plain-English status, and exactly what to do next.",
  marcus:
    "Owns dozens of returns mid-season. Sees a prioritized queue and the deep review workspace.",
  dana: "Second set of eyes. Same product, review-first lens.",
  ruth: "Watches deadlines and workload across the whole firm.",
  ben: "Business owner. Same client experience, different return.",
  kim: "Seasonal staff. Sees only the returns assigned to her.",
};

/**
 * Demo entry: pick a hat. This page replaces login for the prototype
 * (Challenge 05 — one product, many roles).
 */
export default function RolePicker() {
  const featured = PERSONAS.filter((p) => p.id === "priya" || p.id === "marcus");
  const others = PERSONAS.filter((p) => p.id !== "priya" && p.id !== "marcus");

  return (
    <div className="mx-auto flex min-h-dvh max-w-3xl flex-col px-6 py-10">
      <header className="flex items-baseline gap-1.5">
        <span className="font-display text-2xl font-semibold tracking-tight">Meridian</span>
        <span className="h-1.5 w-1.5 rounded-full bg-spruce" aria-hidden="true" />
      </header>

      <main className="my-auto py-12">
        <h1 className="font-display text-4xl leading-tight tracking-tight text-ink sm:text-5xl">
          Every number
          <br />
          has a receipt.
        </h1>
        <p className="mt-4 max-w-md text-[15px] leading-relaxed text-ink-soft">
          A working prototype of an AI-powered tax platform for clients and the
          CPA firms who serve them. Pick a person to see the product through
          their eyes — you can switch anytime from the top-right menu.
        </p>

        <div className="mt-10 grid gap-3 sm:grid-cols-2">
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
              <p className="mt-1.5 min-h-16 text-[13px] leading-relaxed text-ink-soft">
                {PERSONA_BLURB[p.id]}
              </p>
              <span className="mt-3 inline-flex items-center gap-1 text-[13px] font-semibold text-spruce">
                Enter as {p.name.split(" ")[0]}
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
        </div>

        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {others.map((p) => (
            <Link
              key={p.id}
              href={SHELL_HOME[p.role]}
              onClick={() => rememberPersona(p.id)}
              className="group flex items-center gap-3 rounded-2xl border border-line bg-card/60 px-5 py-3.5 transition-colors hover:border-spruce/40 hover:bg-card"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-paper text-[11px] font-bold text-ink-soft">
                {p.initials}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[13px] font-semibold text-ink">{p.name}</span>
                <span className="block truncate text-[11px] text-ink-faint">
                  {PERSONA_BLURB[p.id]}
                </span>
              </span>
              <Badge>{ROLE_LABEL[p.role]}</Badge>
            </Link>
          ))}
        </div>
      </main>

      <footer className="text-[11px] leading-relaxed text-ink-faint">
        Built for the AI Engineer case study. Every name, number, and AI output
        is fabricated; the interactions are real. No real tax advice lives here.
      </footer>
    </div>
  );
}
