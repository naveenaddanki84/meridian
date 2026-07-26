"use client";

import { useState } from "react";
import {
  Calculator,
  Check,
  FileText,
  Lock,
  MessageCircle,
  PencilLine,
  Scale,
  Sparkles,
  UserRound,
} from "lucide-react";
import type { ReturnField, TaxDocument } from "@/data/types";
import { confidenceLabel } from "@/lib/format";
import { validateCorrection } from "@/lib/money";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

/**
 * The receipt (Challenges 01 + 10): what the AI did, the evidence, how
 * sure it is, and what to do about it — in that order, in plain words.
 */
export function ProvenanceCard({
  field,
  sourceDoc,
  onVerify,
  onCorrect,
  onSelectField,
  onAskClient,
}: {
  field: ReturnField;
  sourceDoc: TaxDocument | null;
  onVerify: () => void;
  onCorrect: (value: string) => void;
  onSelectField: (fieldId: string) => void;
  onAskClient: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(field.value);
  const [draftError, setDraftError] = useState<string | null>(null);

  const submitCorrection = () => {
    const result = validateCorrection(draft, field.value);
    if (!result.ok || !result.value) {
      setDraftError(result.error ?? "That value can't be used.");
      return;
    }
    onCorrect(result.value);
    setDraftError(null);
    setEditing(false);
  };

  const { source, ai } = field;
  const box = sourceDoc?.boxes.find((b) => b.id === source.boxId) ?? null;
  const needsApproval = field.state === "needs_approval";
  const canAct =
    field.state === "ai_generated" || field.state === "needs_review" || needsApproval;
  const wasCorrected =
    field.state === "edited" && ai && ai.extractedValue !== field.value;

  return (
    <div className="receipt-edge rise-in mx-2 mb-2 rounded-b-xl border border-t-0 border-line bg-card px-4 pb-4 pt-4 shadow-lift">
      {/* What happened */}
      {source.kind === "document" && ai && (
        <div className="flex items-start gap-2.5">
          <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-ai" />
          <div>
            <p className="text-[13px] font-semibold text-ink">
              Read from {box ? `“${box.label}”` : "the document"}
            </p>
            <p className="mt-0.5 text-[12px] leading-relaxed text-ink-soft">
              The AI read <span className="font-mono">{ai.extractedValue}</span>{" "}
              from {sourceDoc?.title ?? "the source document"} and is{" "}
              <span className="font-semibold">
                {confidenceLabel(ai.confidence).toLowerCase()}
              </span>{" "}
              ({Math.round(ai.confidence * 100)}%).
            </p>
            {ai.note && (
              <p className="mt-1.5 rounded-lg bg-attention-soft px-2.5 py-1.5 text-[12px] leading-relaxed text-attention">
                {ai.note}
              </p>
            )}
          </div>
        </div>
      )}

      {source.kind === "document" && !ai && (
        <div className="flex items-start gap-2.5">
          <FileText className="mt-0.5 h-4 w-4 shrink-0 text-ink-faint" />
          <p className="text-[12px] leading-relaxed text-ink-soft">
            Taken directly from {sourceDoc?.title ?? "the source document"}.
          </p>
        </div>
      )}

      {source.kind === "calculation" && (
        <div className="flex items-start gap-2.5">
          <Calculator className="mt-0.5 h-4 w-4 shrink-0 text-ink-faint" />
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-semibold text-ink">Plain arithmetic — no AI here</p>
            <p className="mt-0.5 font-mono text-[12px] text-ink-soft">{source.formula}</p>
            <ul className="mt-2 space-y-1">
              {source.inputs?.map((input) => (
                <li key={input.label} className="flex items-center justify-between gap-2 text-[12px]">
                  {input.fieldId ? (
                    <button
                      type="button"
                      onClick={() => onSelectField(input.fieldId!)}
                      className="font-semibold text-spruce underline-offset-2 hover:underline"
                    >
                      {input.label}
                    </button>
                  ) : (
                    <span className="text-ink-soft">{input.label}</span>
                  )}
                  <span className="tnum font-mono text-ink">{input.value}</span>
                </li>
              ))}
            </ul>
            <p className="mt-1.5 text-[12px] text-ink-faint">
              Click an input to keep tracing — every part has its own receipt.
            </p>
          </div>
        </div>
      )}

      {source.kind === "rule" && (
        <div className="flex items-start gap-2.5">
          <Scale className="mt-0.5 h-4 w-4 shrink-0 text-ink-faint" />
          <div>
            <p className="text-[13px] font-semibold text-ink">Set by tax rules</p>
            <p className="mt-0.5 text-[12px] leading-relaxed text-ink-soft">{source.ruleNote}</p>
          </div>
        </div>
      )}

      {source.kind === "client_answer" && (
        <div className="flex items-start gap-2.5">
          <UserRound className="mt-0.5 h-4 w-4 shrink-0 text-ink-faint" />
          <div>
            <p className="text-[13px] font-semibold text-ink">From the client&apos;s own answers</p>
            <p className="mt-0.5 text-[12px] leading-relaxed text-ink-soft">{source.clientNote}</p>
          </div>
        </div>
      )}

      {/* History */}
      {wasCorrected && (
        <p className="mt-3 flex items-center gap-1.5 text-[12px] text-ink-soft">
          <PencilLine className="h-3.5 w-3.5" />
          Corrected from <span className="font-mono">{ai.extractedValue}</span> by{" "}
          {field.editedBy}. The AI&apos;s original stays on record.
        </p>
      )}
      {field.state === "verified" && (
        <p className="mt-3 flex items-center gap-1.5 text-[12px] text-verified">
          <Check className="h-3.5 w-3.5" />
          Checked against the source by {field.verifiedBy}.
        </p>
      )}
      {field.state === "locked" && field.lockedReason && (
        <p className="mt-3 flex items-start gap-1.5 text-[12px] leading-relaxed text-locked">
          <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {field.lockedReason}
        </p>
      )}

      {/* Actions */}
      {editing ? (
        <form
          className="mt-3"
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            submitCorrection();
          }}
        >
          <div className="flex items-center gap-2">
            <input
              autoFocus
              value={draft}
              onChange={(e) => {
                setDraft(e.target.value);
                setDraftError(null);
              }}
              className={`h-8 w-32 rounded-lg border bg-white px-2 font-mono text-[13px] outline-none focus:border-spruce ${
                draftError ? "border-danger" : "border-line-strong"
              }`}
              aria-label={`Correct value for ${field.label}`}
              aria-invalid={draftError ? true : undefined}
              aria-describedby={draftError ? `${field.id}-correction-error` : undefined}
            />
            <Button size="sm" variant="primary" type="submit">
              Save correction
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setDraftError(null);
                setEditing(false);
              }}
            >
              Cancel
            </Button>
          </div>
          {draftError && (
            <p
              id={`${field.id}-correction-error`}
              role="alert"
              className="mt-1.5 text-[12px] font-semibold text-danger"
            >
              {draftError}
            </p>
          )}
        </form>
      ) : (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {canAct && (
            <>
              <Button size="sm" variant="primary" onClick={onVerify}>
                <Check className="h-3.5 w-3.5" />
                {needsApproval ? "Approve" : "Looks right"}
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  setDraft(field.value);
                  setDraftError(null);
                  setEditing(true);
                }}
              >
                <PencilLine className="h-3.5 w-3.5" />
                Fix it
              </Button>
            </>
          )}
          {field.state !== "locked" && (
            <Button size="sm" variant="ghost" onClick={onAskClient}>
              <MessageCircle className="h-3.5 w-3.5" />
              Ask the client
            </Button>
          )}
          {source.kind === "document" && (
            <Badge tone="neutral" className="ml-auto">
              <FileText className="h-3 w-3" />
              {sourceDoc?.kind} · p.{source.page}
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
