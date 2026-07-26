"use client";

import { useEffect, useState } from "react";
import { CircleDashed } from "lucide-react";
import type { PDFDocumentLoadingTask, PDFDocumentProxy } from "pdfjs-dist";
import type { TaxDocument } from "@/data/types";
import { relativeLabel } from "@/lib/format";
import { documentPdfUrl, openPdf } from "@/lib/pdf";
import { CardSkeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/error-state";
import { PdfPage } from "./pdf-page";

/**
 * The source document, as an actual PDF.
 *
 * The files in public/documents are fabricated — printed from the app's own
 * /print route — but the rendering path is the real one: pdf.js paints the
 * page, and the provenance highlight is an overlay positioned in the
 * document's coordinate space. That's the same shape production takes, where
 * the PDF is a stored artifact and extraction returns box coordinates.
 */
export function DocViewer({
  documents,
  activeDocId,
  activeBoxId,
  highlightColor,
  onSelectDoc,
  registerBox,
}: {
  documents: readonly TaxDocument[];
  activeDocId: string | null;
  activeBoxId: string | null;
  highlightColor: string;
  onSelectDoc: (id: string) => void;
  registerBox: (id: string, el: HTMLElement | null) => void;
}) {
  const activeDoc = documents.find((d) => d.id === activeDocId) ?? null;
  /**
   * The result is tagged with the document it belongs to, so switching tabs
   * shows a skeleton rather than the previous document's pages while the
   * next one decodes — and the effect never has to reset state on the way in.
   */
  const [result, setResult] = useState<
    { docId: string; pdf: PDFDocumentProxy } | { docId: string; failed: true } | null
  >(null);

  useEffect(() => {
    if (!activeDoc || activeDoc.pages === 0) return;
    const docId = activeDoc.id;

    let cancelled = false;
    let task: PDFDocumentLoadingTask | null = null;

    openPdf(documentPdfUrl(docId))
      .then(async (loading) => {
        task = loading;
        const pdf: PDFDocumentProxy = await loading.promise;
        if (!cancelled) setResult({ docId, pdf });
      })
      .catch(() => {
        if (!cancelled) setResult({ docId, failed: true });
      });

    return () => {
      cancelled = true;
      void task?.destroy();
    };
  }, [activeDoc]);

  const current = result && activeDoc && result.docId === activeDoc.id ? result : null;
  const pdf = current && "pdf" in current ? current.pdf : null;
  const failed = current !== null && "failed" in current;
  const loading = activeDoc !== null && activeDoc.pages > 0 && !pdf && !failed;

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* Document tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-3">
        {documents.map((doc) => {
          const missing = doc.status === "needed";
          const active = doc.id === activeDocId;
          return (
            <button
              key={doc.id}
              type="button"
              disabled={missing}
              onClick={() => onSelectDoc(doc.id)}
              title={missing ? "Not received yet — the client still needs to upload this" : doc.title}
              className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] font-semibold transition-colors ${
                active
                  ? "border-spruce bg-spruce text-white"
                  : missing
                    ? "border-dashed border-line-strong text-ink-faint"
                    : "border-line bg-card text-ink-soft hover:border-line-strong hover:text-ink"
              }`}
            >
              {missing && <CircleDashed className="h-3 w-3" />}
              {doc.kind}
              {missing && <span className="font-normal">· missing</span>}
            </button>
          );
        })}
      </div>

      {activeDoc ? (
        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1" data-pane="doc">
          <p className="text-[12px] text-ink-soft">
            <span className="font-semibold text-ink">{activeDoc.title}</span>
            {activeDoc.uploadedAt && (
              <span className="text-ink-faint">
                {" "}
                · uploaded {relativeLabel(activeDoc.uploadedAt)} · PDF
              </span>
            )}
          </p>

          {loading && <CardSkeleton rows={8} />}

          {failed && (
            <ErrorState message="The source document didn't load. Refreshing the page usually fixes it." />
          )}

          {pdf &&
            Array.from({ length: activeDoc.pages }, (_, i) => (
              <PdfPage
                key={`${activeDoc.id}-${i}`}
                pdf={pdf}
                pageNumber={i + 1}
                boxes={activeDoc.boxes.filter((b) => b.page === i + 1)}
                activeBoxId={activeBoxId}
                highlightColor={highlightColor}
                registerBox={registerBox}
              />
            ))}
        </div>
      ) : (
        <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-line-strong text-center">
          <p className="max-w-52 text-[13px] text-ink-faint">
            Select a value on the left to see the document it came from.
          </p>
        </div>
      )}
    </div>
  );
}
