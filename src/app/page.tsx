import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  BrainCircuit,
  FileCheck2,
  LockKeyhole,
  MessagesSquare,
  ShieldCheck,
  Sparkles,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import { HeroTrace } from "@/components/marketing/hero-trace";
import { LandingHeroActions, LandingPersonaPanel } from "@/components/marketing/landing-actions";

const proofStats = [
  { value: "500", label: "seeded returns" },
  { value: "4k", label: "source documents" },
  { value: "6", label: "role lenses" },
];

const trustSignals = [
  "Field-level provenance",
  "Client-safe language",
  "Scoped staff access",
];

const capabilityCards: {
  title: string;
  copy: string;
  icon: LucideIcon;
}[] = [
  {
    title: "Trace every AI value",
    copy:
      "Click a number and Meridian shows the return field, source document, exact box, confidence, and review history together.",
    icon: FileCheck2,
  },
  {
    title: "Keep clients calm",
    copy:
      "Clients see plain-language progress and short requests instead of internal substages, risk scores, and preparer jargon.",
    icon: MessagesSquare,
  },
  {
    title: "Rank the firm queue",
    copy:
      "Preparers get a reasoned Today list driven by deadlines, blocked days, unread replies, and AI review flags.",
    icon: BrainCircuit,
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-dvh overflow-hidden bg-paper text-ink">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-card focus:px-4 focus:py-3 focus:text-sm focus:font-semibold focus:text-ink focus:shadow-pop"
      >
        Skip to main content
      </a>

      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
        <Link href="/" className="flex min-h-11 items-center gap-2" aria-label="Meridian home">
          <span className="font-display text-2xl font-semibold tracking-tight">Meridian</span>
          <span className="h-2 w-2 rounded-full bg-spruce" aria-hidden="true" />
        </Link>
        <nav aria-label="Landing page" className="hidden items-center gap-2 md:flex">
          <a
            href="#demo"
            className="inline-flex min-h-11 items-center rounded-lg px-3 text-sm font-semibold text-ink-soft transition-colors hover:bg-card hover:text-ink"
          >
            Role paths
          </a>
          <a
            href="#proof"
            className="inline-flex min-h-11 items-center rounded-lg px-3 text-sm font-semibold text-ink-soft transition-colors hover:bg-card hover:text-ink"
          >
            Proof
          </a>
          <Link
            href="/demo"
            className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-line bg-card px-3 text-sm font-semibold text-ink transition-colors hover:border-line-strong"
          >
            Case study
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </nav>
      </header>

      <main id="main-content">
        <section className="mx-auto max-w-6xl px-4 pb-10 pt-7 sm:px-6 sm:pt-12 lg:px-8">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 rounded-lg border border-line bg-card px-3 py-2 text-[12px] font-bold uppercase tracking-[0.18em] text-spruce shadow-lift">
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
              AI tax platform for CPA firms
            </div>
            <h1 className="mt-6 font-display text-6xl leading-none tracking-tight text-ink sm:text-7xl lg:text-8xl">
              Meridian
            </h1>
            <p className="mt-5 max-w-3xl font-display text-3xl leading-tight text-spruce-deep sm:text-4xl">
              Every number has a receipt.
            </p>
            <p className="mt-5 max-w-3xl text-base leading-8 text-ink-soft sm:text-lg">
              A working prototype for AI-assisted tax preparation: client requests,
              firm queues, document evidence, role permissions, and field-level
              provenance in one product model.
            </p>
            <LandingHeroActions />
          </div>

          <div className="mt-10 grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.6fr)]">
            <HeroTrace />
            <aside className="grid gap-3" aria-label="Meridian proof points">
              {proofStats.map((item) => (
                <div key={item.label} className="rounded-lg border border-line bg-card p-4 shadow-lift">
                  <p className="font-display text-3xl text-ink">{item.value}</p>
                  <p className="mt-1 text-sm font-semibold text-ink-soft">{item.label}</p>
                </div>
              ))}
              <div className="rounded-lg border border-spruce/30 bg-spruce-soft p-4">
                <p className="flex items-center gap-2 text-sm font-bold text-spruce">
                  <BadgeCheck className="h-4 w-4" aria-hidden="true" />
                  Trust language
                </p>
                <ul className="mt-3 space-y-2 text-sm leading-relaxed text-ink-soft">
                  {trustSignals.map((signal) => (
                    <li key={signal} className="flex gap-2">
                      <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-ai" aria-hidden="true" />
                      <span>{signal}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          </div>
        </section>

        <LandingPersonaPanel />

        <section id="proof" className="border-t border-line bg-card/55">
          <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-spruce">
                Product proof
              </p>
              <h2 className="mt-2 font-display text-3xl leading-tight text-ink sm:text-4xl">
                Built around the audit trail, not a black box.
              </h2>
            </div>
            <div className="mt-8 grid gap-3 md:grid-cols-3">
              {capabilityCards.map((card) => {
                const Icon = card.icon;
                return (
                  <article key={card.title} className="rounded-lg border border-line bg-card p-5 shadow-lift">
                    <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-ai-soft text-ai">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <h3 className="mt-4 font-display text-xl text-ink">{card.title}</h3>
                    <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">{card.copy}</p>
                  </article>
                );
              })}
            </div>
            <div className="mt-3 rounded-lg border border-line bg-paper p-5">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="flex gap-3">
                  <LockKeyhole className="mt-1 h-5 w-5 shrink-0 text-spruce" aria-hidden="true" />
                  <div>
                    <p className="font-semibold text-ink">Permissions first</p>
                    <p className="mt-1 text-sm leading-relaxed text-ink-soft">
                      Seasonal staff, reviewers, admins, clients, and preparers see the same return through scoped access.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <UsersRound className="mt-1 h-5 w-5 shrink-0 text-attention" aria-hidden="true" />
                  <div>
                    <p className="font-semibold text-ink">Collaboration pinned to work</p>
                    <p className="mt-1 text-sm leading-relaxed text-ink-soft">
                      Threads attach to fields and documents so ownership never drifts away from the evidence.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <FileCheck2 className="mt-1 h-5 w-5 shrink-0 text-verified" aria-hidden="true" />
                  <div>
                    <p className="font-semibold text-ink">Corrections stay on record</p>
                    <p className="mt-1 text-sm leading-relaxed text-ink-soft">
                      Fixes preserve the AI original, the human edit, and the source path that justified the change.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-6 text-[13px] leading-relaxed text-ink-faint sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <span>Built for the AI Engineer case study. All names, numbers, and AI output are fabricated.</span>
          <span>No real tax advice lives here.</span>
        </div>
      </footer>
    </div>
  );
}
