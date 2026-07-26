"use client";

import { useEffect, useState } from "react";
import { Check, FileUp, Sparkles } from "lucide-react";
import { api } from "@/lib/api";
import { useQuery } from "@/lib/use-query";
import { readProgress, updateProgress } from "@/lib/client-progress";
import { relativeLabel } from "@/lib/format";
import { HERO_RETURN_ID } from "@/data/hero";
import type { TaxDocument } from "@/data/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CardSkeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";

/**
 * Documents in client language (Challenges 03 + 10): what we have, what
 * we still need, and what the AI read — in plain words, no confidence
 * scores, with the human check always promised.
 */

type UploadPhase = "idle" | "uploading" | "reading" | "done";

const FRIENDLY_READS: Record<string, readonly string[]> = {
  "doc-w2": ["Your pay this year: $85,200", "Tax your employer already sent in: $11,430"],
  "doc-1099int": ["Interest your bank paid you: $412.88"],
  "doc-1099div": ["Dividends from your investments: $1,235.10"],
  "doc-receipt": ["Your donation to Bright Futures Fund (Mike is confirming the amount)"],
  "doc-prior": ["Last year's numbers, used to double-check this year's"],
};

function clientStatus(doc: TaxDocument): { label: string; tone: "verified" | "neutral" | "attention" } {
  if (doc.status === "processed") return { label: "We read it", tone: "verified" };
  if (doc.status === "uploaded") return { label: "Received — reading it now", tone: "neutral" };
  return { label: "Still needed", tone: "attention" };
}

export function EmilyDocuments() {
  const { data: documents, loading } = useQuery(
    () => api.getDocumentsForReturn(HERO_RETURN_ID),
    [],
  );
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [uploadPhase, setUploadPhase] = useState<UploadPhase>("idle");
  const { notify } = useToast();

  // If the K-1 was uploaded on a previous visit, keep it uploaded.
  useEffect(() => {
    if (readProgress().k1Uploaded) setUploadPhase("done");
  }, []);

  // Timers are cleared on unmount so a quick navigation away never lands
  // a toast on a screen the client already left.
  useEffect(() => {
    if (uploadPhase !== "uploading") return;
    const toReading = window.setTimeout(() => setUploadPhase("reading"), 900);
    return () => window.clearTimeout(toReading);
  }, [uploadPhase]);

  useEffect(() => {
    if (uploadPhase !== "reading") return;
    const toDone = window.setTimeout(() => {
      setUploadPhase("done");
      updateProgress({ k1Uploaded: true });
      notify("K-1 uploaded and read — nothing else needed");
    }, 1500);
    return () => window.clearTimeout(toDone);
  }, [uploadPhase, notify]);

  const docs = documents ?? [];
  const received = docs.filter((d) => d.status !== "needed").length + (uploadPhase === "done" ? 1 : 0);

  return (
    <div className="mx-auto max-w-xl">
      <header className="mb-6">
        <h1 className="font-display text-3xl tracking-tight text-ink">Your documents</h1>
        <p className="mt-1 text-[13px] text-ink-soft">
          {received} of {docs.length} in. When one arrives, we read it and fill
          in your return — your preparer checks everything before it counts.
        </p>
      </header>

      {loading && <CardSkeleton rows={5} />}

      <ul className="space-y-2">
        {docs.map((doc) => {
          const isK1 = doc.id === "doc-k1";
          const status =
            isK1 && uploadPhase === "done"
              ? { label: "We read it", tone: "verified" as const }
              : clientStatus(doc);
          const reads = FRIENDLY_READS[doc.id];
          const expanded = expandedId === doc.id;

          return (
            <li
              key={doc.id}
              className={`rounded-2xl border bg-card shadow-lift transition-colors ${
                status.tone === "attention" && uploadPhase === "idle"
                  ? "border-attention/40"
                  : "border-line"
              }`}
            >
              <div className="flex items-center gap-3 px-4 py-3">
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[14px] font-semibold text-ink">
                    {doc.title}
                  </span>
                  <span className="block text-[12px] text-ink-faint">
                    {doc.status === "needed" && !isK1
                      ? "We'll remind you"
                      : isK1 && uploadPhase !== "done" && doc.status === "needed"
                        ? "Partnership form — usually arrives by mid-March"
                        : `Uploaded ${doc.uploadedAt ? relativeLabel(doc.uploadedAt) : "just now"} · ${doc.pages || 1} page${(doc.pages || 1) > 1 ? "s" : ""}`}
                  </span>
                </span>

                <Badge tone={status.tone}>
                  {status.tone === "verified" && <Check className="h-3 w-3" />}
                  {status.label}
                </Badge>

                {reads && doc.status === "processed" && (
                  <Button size="sm" variant="ghost" onClick={() => setExpandedId(expanded ? null : doc.id)}>
                    {expanded ? "Hide" : "What we read"}
                  </Button>
                )}

                {isK1 && uploadPhase === "idle" && (
                  <Button size="sm" variant="primary" onClick={() => setUploadPhase("uploading")}>
                    <FileUp className="h-3.5 w-3.5" />
                    Upload
                  </Button>
                )}
              </div>

              {/* What the AI read — plain words, no percentages */}
              {expanded && reads && (
                <div className="rise-in border-t border-line px-4 py-3">
                  <ul className="space-y-1.5">
                    {reads.map((line) => (
                      <li key={line} className="flex items-start gap-2 text-[13px] text-ink-soft">
                        <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ai" />
                        {line}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-2 text-[12px] text-ink-faint">
                    Read automatically — Mike double-checks every number before your return is final.
                  </p>
                </div>
              )}

              {/* Upload simulation */}
              {isK1 && uploadPhase !== "idle" && (
                <div className="rise-in border-t border-line px-4 py-3">
                  {uploadPhase === "uploading" && (
                    <div>
                      <p className="text-[13px] font-semibold text-ink">Uploading…</p>
                      <div
                        className="mt-2 h-1.5 overflow-hidden rounded-full bg-line"
                        role="progressbar"
                        aria-label="Uploading your document"
                      >
                        <div className="progress-indeterminate h-full w-1/4 rounded-full bg-spruce" />
                      </div>
                    </div>
                  )}
                  {uploadPhase === "reading" && (
                    <p className="flex items-center gap-2 text-[13px] font-semibold text-ai">
                      <Sparkles className="h-4 w-4 animate-pulse" />
                      Reading your K-1…
                    </p>
                  )}
                  {uploadPhase === "done" && (
                    <div>
                      <p className="flex items-center gap-2 text-[13px] font-semibold text-verified">
                        <Check className="h-4 w-4" />
                        Got it — and we&apos;ve already read it
                      </p>
                      <p className="mt-1 text-[12px] leading-relaxed text-ink-soft">
                        We added 2 numbers from your K-1 to your return. Mike
                        will double-check them before anything is final — nothing
                        else is needed from you.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>

      <p className="mt-4 text-center text-[12px] text-ink-faint">
        In the real product you&apos;d drag files here or snap a photo from your
        phone. This upload is simulated.
      </p>
    </div>
  );
}
