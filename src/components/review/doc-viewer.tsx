"use client";

import { CircleDashed } from "lucide-react";
import type { TaxDocument } from "@/data/types";
import { relativeLabel } from "@/lib/format";

/**
 * Fabricated source documents rendered as crisp HTML "pages" so boxes can
 * be highlighted and traced. Real OCR/PDF rendering is out of scope by
 * design — the interaction model is what's being proven.
 */

function FormPage({
  doc,
  page,
  activeBoxId,
  highlightColor,
  registerBox,
}: {
  doc: TaxDocument;
  page: number;
  activeBoxId: string | null;
  highlightColor: string;
  registerBox: (id: string, el: HTMLElement | null) => void;
}) {
  const boxes = doc.boxes.filter((b) => b.page === page);
  const isReceipt = doc.kind === "Receipt";

  return (
    <div className="relative aspect-[8.5/9] w-full rounded-lg border border-line-strong bg-white shadow-lift">
      {/* Form header */}
      <div className="flex items-start justify-between border-b border-line px-4 py-2.5">
        <div>
          <p className="font-mono text-[12px] font-semibold uppercase tracking-wide text-ink">
            {doc.kind}
          </p>
          <p className="text-[12px] text-ink-faint">{doc.issuer}</p>
        </div>
        <p className="font-mono text-[12px] text-ink-faint">
          Tax year 2025 · p.{page}/{doc.pages}
        </p>
      </div>

      {/* Boxes */}
      <div className="absolute inset-x-0 bottom-0 top-14">
        {boxes.map((box) => {
          const active = box.id === activeBoxId;
          return (
            <div
              key={box.id}
              ref={(el) => registerBox(box.id, el)}
              className={`absolute rounded-sm border px-1.5 py-1 transition-all duration-200 ${
                active
                  ? "z-10 border-transparent shadow-pop"
                  : "border-line bg-white"
              }`}
              style={{
                left: `${box.x}%`,
                top: `${box.y}%`,
                width: `${box.w}%`,
                minHeight: `${box.h}%`,
                ...(active
                  ? {
                      boxShadow: `0 0 0 2px ${highlightColor}, 0 8px 24px rgb(28 35 33 / 0.18)`,
                      backgroundColor: "#fffef8",
                    }
                  : {}),
              }}
            >
              <p className="truncate text-[12px] font-medium uppercase tracking-wide text-ink-faint">
                {box.label}
              </p>
              <p
                className={`whitespace-pre-line text-[12px] leading-snug ${
                  isReceipt
                    ? "font-display italic text-ink"
                    : "font-mono text-ink"
                } ${active ? "font-semibold" : ""}`}
              >
                {box.value}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

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
                · uploaded {relativeLabel(activeDoc.uploadedAt)}
              </span>
            )}
          </p>
          {Array.from({ length: activeDoc.pages }, (_, i) => (
            <FormPage
              key={i}
              doc={activeDoc}
              page={i + 1}
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
