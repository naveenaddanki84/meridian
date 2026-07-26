"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Check, FileUp, Lock, Sparkles } from "lucide-react";
import { api } from "@/lib/api";
import { useQuery } from "@/lib/use-query";
import { updateProgress, useClientProgress } from "@/lib/client-progress";
import { DAVE_RETURN_ID } from "@/data/hero";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CardSkeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";

/**
 * Day one, document one (Challenge 03). A first-time business client gets
 * a list of asks in his own words — what each thing is and where to find
 * it — never a folder named after the form it feeds. Nothing is uploaded
 * yet, and the screen says what that means rather than sitting empty.
 */

/** Where a coffee-shop owner actually finds each of these. */
const WHERE_TO_FIND: Record<string, string> = {
  "dave-doc-pl": "Your bookkeeping app can export this — Xero, QuickBooks, or Wave.",
  "dave-doc-balance": "Same place as the P&L, dated December 31.",
  "dave-doc-bank": "All twelve months, downloaded as PDFs from your bank.",
  "dave-doc-payroll": "Gusto calls this the annual payroll register.",
  "dave-doc-1099": "Only if you paid a contractor $600 or more — skip if you didn't.",
  "dave-doc-equipment": "Espresso machine, grinders, fit-out — receipts or invoices.",
  "dave-doc-lease": "The signed lease for the shop.",
  "dave-doc-prior": "Last year's 1120-S, if the business filed one.",
};

/** What we tell him we pulled out, once a document lands. */
const AFTER_READ = "We've read it and pulled out what your return needs.";

export function DaveDocuments({ firstName }: { firstName: string }) {
  const progress = useClientProgress();
  const { data: documents, loading } = useQuery(
    () => api.getDocumentsForReturn(DAVE_RETURN_ID),
    [],
  );
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const { notify } = useToast();

  const docs = documents ?? [];
  const uploaded = progress.daveUploadedDocIds;
  const isUploaded = (id: string) => uploaded.includes(id);

  // The read finishes a beat after the upload bar, so the sequence reads
  // as "received, then understood" rather than one instant jump.
  useEffect(() => {
    if (!uploadingId) return;
    const done = window.setTimeout(() => {
      updateProgress({ daveUploadedDocIds: [...uploaded, uploadingId] });
      setUploadingId(null);
      notify("Got it — we've read it already");
    }, 1400);
    return () => window.clearTimeout(done);
  }, [uploadingId, uploaded, notify]);

  // Documents are the step after the questions, and saying so beats a
  // silent empty list.
  if (!progress.daveQuestionnaireDone) {
    return (
      <div className="mx-auto max-w-xl">
        <div className="rounded-2xl border border-dashed border-line-strong bg-card/60 p-6 text-center">
          <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-locked-soft">
            <Lock className="h-4 w-4 text-locked" />
          </span>
          <h1 className="mt-3 font-display text-2xl text-ink">
            First, tell us about your business
          </h1>
          <p className="mx-auto mt-2 max-w-sm text-[13px] leading-relaxed text-ink-soft">
            Six quick questions decide which documents an 1120-S actually needs
            from you. Answer those and this list fills itself in — we&apos;d
            rather ask for eight things than eighty.
          </p>
          <Link href="/client/questionnaire" className="mt-4 inline-block">
            <Button variant="primary">Answer the questions</Button>
          </Link>
        </div>
      </div>
    );
  }

  const inCount = uploaded.length;

  return (
    <div className="mx-auto max-w-xl">
      <header className="mb-6">
        <h1 className="font-display text-3xl tracking-tight text-ink">Your documents</h1>
        <p className="mt-1 text-[13px] leading-relaxed text-ink-soft">
          {inCount === 0
            ? `Eight things for Peterson Coffee, ${firstName}. Send what you have — we'll read each one as it arrives and chase the rest.`
            : `${inCount} of ${docs.length} in. We read each one as it arrives; Mike checks every number before it counts.`}
        </p>
      </header>

      {loading && <CardSkeleton rows={5} />}

      <ul className="space-y-2">
        {docs.map((doc) => {
          const done = isUploaded(doc.id);
          const busy = uploadingId === doc.id;

          return (
            <li
              key={doc.id}
              className={`rounded-2xl border bg-card shadow-lift transition-colors ${
                done ? "border-line" : "border-attention/40"
              }`}
            >
              <div className="flex items-center gap-3 px-4 py-3">
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[14px] font-semibold text-ink">
                    {doc.title}
                  </span>
                  <span className="block text-[12px] leading-relaxed text-ink-faint">
                    {done ? AFTER_READ : WHERE_TO_FIND[doc.id]}
                  </span>
                </span>

                <Badge tone={done ? "verified" : "attention"}>
                  {done && <Check className="h-3 w-3" />}
                  {done ? "We read it" : "Still needed"}
                </Badge>

                {!done && !busy && (
                  <Button size="sm" variant="primary" onClick={() => setUploadingId(doc.id)}>
                    <FileUp className="h-3.5 w-3.5" />
                    Upload
                  </Button>
                )}
              </div>

              {busy && (
                <div className="rise-in border-t border-line px-4 py-3">
                  <p className="flex items-center gap-2 text-[13px] font-semibold text-ai">
                    <Sparkles className="h-4 w-4 animate-pulse" />
                    Reading it now…
                  </p>
                  <div
                    className="mt-2 h-1.5 overflow-hidden rounded-full bg-line"
                    role="progressbar"
                    aria-label={`Uploading ${doc.title}`}
                  >
                    <div className="progress-indeterminate h-full w-1/4 rounded-full bg-spruce" />
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>

      <p className="mt-4 text-center text-[12px] leading-relaxed text-ink-faint">
        Missing something? Send what you have — Mike will ask for anything else
        he needs, one question at a time. This upload is simulated.
      </p>
    </div>
  );
}
