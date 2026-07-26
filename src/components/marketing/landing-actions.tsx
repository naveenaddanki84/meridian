"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight,
  BriefcaseBusiness,
  Check,
  FileSearch,
  RotateCcw,
  UserRound,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
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

const ROLE_ICON: Record<string, LucideIcon> = {
  client: UserRound,
  preparer: BriefcaseBusiness,
  reviewer: FileSearch,
  admin: UsersRound,
};

const PERSONA_BLURB: Record<string, string> = {
  emily:
    "A calm client home with plain-English status, source-backed numbers, and the next task only.",
  mike:
    "A ranked firm queue, traceable fields, AI review notes, and client threads in one workspace.",
  sarah: "A review-first queue for risk, unresolved questions, and final sign-off.",
  linda: "A firm-wide view of deadlines, staffing pressure, and blocked work.",
  dave: "A first-run client journey that starts from zero documents and no tax context.",
  katie: "A scoped seasonal preparer view with assigned-return permissions enforced.",
};

export function LandingHeroActions() {
  return (
    <div className="mt-8 flex flex-col gap-3 sm:flex-row">
      <Link
        href="/client"
        onClick={() => rememberPersona("emily")}
        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-spruce px-5 py-3 text-sm font-semibold text-white shadow-lift transition-colors hover:bg-spruce-deep"
      >
        Enter client demo
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </Link>
      <Link
        href="/staff"
        onClick={() => rememberPersona("mike")}
        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-line-strong bg-card px-5 py-3 text-sm font-semibold text-ink transition-colors hover:border-spruce/40 hover:bg-spruce-wash"
      >
        Open firm workspace
        <BriefcaseBusiness className="h-4 w-4" aria-hidden="true" />
      </Link>
    </div>
  );
}

export function LandingPersonaPanel() {
  const featured = PERSONAS.filter((p) => p.id === "emily" || p.id === "mike");
  const others = PERSONAS.filter((p) => p.id !== "emily" && p.id !== "mike");
  const [resetDone, setResetDone] = useState(false);

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
      // Storage can be unavailable in hardened browser contexts.
    }
  };

  return (
    <section id="demo" className="mx-auto max-w-6xl border-t border-line px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-spruce">
            Role-aware demo
          </p>
          <h2 className="mt-2 font-display text-3xl leading-tight text-ink sm:text-4xl">
            One platform, six working lenses.
          </h2>
          <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-ink-soft">
            Each entry path lands in the same product model with different permissions,
            vocabulary, queues, and evidence surfaces.
          </p>
        </div>
        <button
          type="button"
          onClick={resetDemo}
          className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-lg border border-line bg-card px-4 py-2.5 text-sm font-semibold text-ink-soft transition-colors hover:border-line-strong hover:text-ink"
        >
          {resetDone ? (
            <>
              <Check className="h-4 w-4 text-verified" aria-hidden="true" />
              Fresh start ready
            </>
          ) : (
            <>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset demo
            </>
          )}
        </button>
      </div>

      <div className="mt-8 grid gap-3 md:grid-cols-2">
        {featured.map((persona) => {
          const Icon = ROLE_ICON[persona.role];
          return (
            <Link
              key={persona.id}
              href={SHELL_HOME[persona.role]}
              onClick={() => rememberPersona(persona.id)}
              className="group flex min-h-48 flex-col rounded-lg border border-line bg-card p-5 shadow-lift transition-all duration-200 hover:-translate-y-0.5 hover:border-spruce/40 hover:shadow-pop"
            >
              <div className="flex items-start justify-between gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-spruce text-sm font-bold text-white">
                  {persona.initials}
                </span>
                <Badge tone="brand" className="rounded-lg">
                  <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                  {ROLE_LABEL[persona.role]}
                </Badge>
              </div>
              <div className="mt-5">
                <p className="font-display text-2xl text-ink">{persona.name}</p>
                <p className="mt-1 text-sm font-semibold text-ink-soft">{persona.title}</p>
                <p className="mt-3 text-[14px] leading-relaxed text-ink-soft">
                  {PERSONA_BLURB[persona.id]}
                </p>
              </div>
              <span className="mt-auto inline-flex items-center gap-1 pt-5 text-sm font-semibold text-spruce">
                Enter as {persona.name.split(" ")[0]}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
              </span>
            </Link>
          );
        })}
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {others.map((persona) => {
          const Icon = ROLE_ICON[persona.role];
          return (
            <Link
              key={persona.id}
              href={SHELL_HOME[persona.role]}
              onClick={() => rememberPersona(persona.id)}
              className="group flex min-h-32 flex-col rounded-lg border border-line bg-card/75 p-4 transition-colors hover:border-spruce/40 hover:bg-card"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-paper text-[13px] font-bold text-ink-soft">
                  {persona.initials}
                </span>
                <Badge className="rounded-lg">
                  <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                  {ROLE_LABEL[persona.role]}
                </Badge>
              </div>
              <p className="mt-4 font-semibold text-ink">{persona.name}</p>
              <p className="mt-1 line-clamp-2 text-[13px] leading-relaxed text-ink-soft">
                {PERSONA_BLURB[persona.id]}
              </p>
              <span className="mt-auto inline-flex items-center gap-1 pt-4 text-[13px] font-semibold text-spruce">
                Open view
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
