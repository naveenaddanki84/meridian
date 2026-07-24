"use client";

import { Lock, MessageCircle, PencilLine } from "lucide-react";
import type { ReturnField, TaxDocument, Thread } from "@/data/types";
import { StateBadge } from "@/components/ui/badge";
import { ProvenanceCard } from "./provenance-card";

/**
 * The return, line by line. Rows follow the affordance system
 * (Challenge 08): everything is clickable to trace; the pencil appears
 * only where editing is allowed; locks explain themselves on hover.
 */
export function FieldList({
  fields,
  threads,
  documents,
  selectedFieldId,
  onSelectField,
  onVerify,
  onCorrect,
  onAskClient,
  registerRow,
}: {
  fields: readonly ReturnField[];
  threads: readonly Thread[];
  documents: readonly TaxDocument[];
  selectedFieldId: string | null;
  onSelectField: (id: string | null) => void;
  onVerify: (id: string) => void;
  onCorrect: (id: string, value: string) => void;
  onAskClient: (fieldId: string) => void;
  registerRow: (id: string, el: HTMLElement | null) => void;
}) {
  const sections = [...new Set(fields.map((f) => f.section))];

  return (
    <div className="min-h-0 flex-1 overflow-y-auto pr-1" data-pane="fields">
      {sections.map((section) => (
        <section key={section} className="mb-5">
          <h3 className="mb-1.5 px-2 text-[11px] font-bold uppercase tracking-wider text-ink-faint">
            {section}
          </h3>
          <div className="rounded-xl border border-line bg-card/70">
            {fields
              .filter((f) => f.section === section)
              .map((field) => {
                const selected = field.id === selectedFieldId;
                const editable =
                  field.state === "ai_generated" ||
                  field.state === "needs_review" ||
                  field.state === "needs_approval";
                const threadCount = threads.filter(
                  (t) => t.anchor.type === "field" && t.anchor.id === field.id,
                ).length;
                const sourceDoc =
                  documents.find((d) => d.id === field.source.documentId) ?? null;

                return (
                  <div key={field.id} className="border-b border-line last:border-b-0">
                    <button
                      type="button"
                      ref={(el) => registerRow(field.id, el)}
                      onClick={() => onSelectField(selected ? null : field.id)}
                      title={
                        field.state === "locked" ? field.lockedReason : undefined
                      }
                      className={`group flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                        selected ? "bg-white" : "hover:bg-white/70"
                      } ${
                        field.state === "needs_review"
                          ? "border-l-2 border-l-attention"
                          : "border-l-2 border-l-transparent"
                      }`}
                      aria-expanded={selected}
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13px] font-semibold text-ink">
                          {field.label}
                        </span>
                        <span className="block font-mono text-[10px] uppercase tracking-wide text-ink-faint">
                          {field.formRef}
                        </span>
                      </span>

                      {threadCount > 0 && (
                        <span className="flex items-center gap-0.5 text-[11px] font-semibold text-ink-faint">
                          <MessageCircle className="h-3.5 w-3.5" />
                          {threadCount}
                        </span>
                      )}

                      <StateBadge state={field.state} />

                      <span
                        className={`tnum w-28 text-right font-mono text-[13px] font-medium ${
                          field.state === "locked" ? "text-locked" : "text-ink"
                        } ${
                          field.state === "ai_generated" || field.state === "needs_review"
                            ? "underline decoration-dotted underline-offset-4 decoration-ai-line"
                            : ""
                        }`}
                      >
                        {field.value}
                      </span>

                      <span className="w-4 shrink-0 text-ink-faint">
                        {field.state === "locked" ? (
                          <Lock className="h-3.5 w-3.5" />
                        ) : editable ? (
                          <PencilLine className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
                        ) : null}
                      </span>
                    </button>

                    {selected && (
                      <ProvenanceCard
                        field={field}
                        sourceDoc={sourceDoc}
                        onVerify={() => onVerify(field.id)}
                        onCorrect={(value) => onCorrect(field.id, value)}
                        onSelectField={onSelectField}
                        onAskClient={() => onAskClient(field.id)}
                      />
                    )}
                  </div>
                );
              })}
          </div>
        </section>
      ))}
    </div>
  );
}
