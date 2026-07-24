"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ChevronRight, MessageCircle, ScanSearch } from "lucide-react";
import { api } from "@/lib/api";
import { useQuery } from "@/lib/use-query";
import { useRole } from "@/lib/role";
import { deadlineLabel } from "@/lib/format";
import { rememberSpot } from "@/lib/workspace-chip";
import { stageById } from "@/data/statuses";
import type { ReturnField, Thread, ThreadAnchor } from "@/data/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CardSkeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { DocViewer } from "./doc-viewer";
import { FieldList } from "./field-list";
import { InsightCards } from "./insight-cards";
import { ThreadPanel } from "./thread-panel";
import { TraceThread } from "./trace-thread";

const TRACE_COLOR: Record<string, string> = {
  ai_generated: "#5b5bd6",
  needs_review: "#b45309",
  needs_approval: "#245044",
  verified: "#2e7d4f",
  edited: "#56605b",
  locked: "#6e7674",
};

/**
 * The hero screen: side-by-side return review with source traceability
 * (Ch 01), the shared affordance system (Ch 08), and the AI trust loop —
 * see, check, correct, verify (Ch 10).
 */
export function ReviewWorkspace({ returnId }: { returnId: string }) {
  const searchParams = useSearchParams();
  const { persona } = useRole();

  const { data: ret, loading: retLoading } = useQuery(() => api.getReturn(returnId), [returnId]);
  const { data: apiFields } = useQuery(() => api.getFields(returnId), [returnId]);
  const { data: documents } = useQuery(() => api.getDocumentsForReturn(returnId), [returnId]);
  const { data: apiThreads } = useQuery(() => api.getThreads(returnId, "staff"), [returnId]);
  const { data: insights } = useQuery(() => api.getInsights(returnId), [returnId]);

  // Local, immutable overrides on top of the (read-only) mock API data.
  const [fieldOverrides, setFieldOverrides] = useState<Readonly<Record<string, ReturnField>>>({});
  const [threadOverrides, setThreadOverrides] = useState<Readonly<Record<string, Thread>>>({});
  const [newThreads, setNewThreads] = useState<readonly Thread[]>([]);

  const fields = useMemo(
    () => (apiFields ?? []).map((f) => fieldOverrides[f.id] ?? f),
    [apiFields, fieldOverrides],
  );
  const threads = useMemo(
    () => [...newThreads, ...(apiThreads ?? []).map((t) => threadOverrides[t.id] ?? t)],
    [apiThreads, threadOverrides, newThreads],
  );

  // Selection + deep links (?field= / ?doc= / ?thread=, Challenge 04)
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(
    () => searchParams.get("field"),
  );
  const [activeDocId, setActiveDocId] = useState<string | null>(
    () => searchParams.get("doc"),
  );
  const [panelOpen, setPanelOpen] = useState(() => searchParams.get("thread") !== null);
  const [newAnchor, setNewAnchor] = useState<ThreadAnchor | null>(null);
  /** Evidence focus from an AI insight — highlights a box with no field selected. */
  const [focusBoxId, setFocusBoxId] = useState<string | null>(null);
  const initialThreadId = useRef(searchParams.get("thread")).current;

  const containerRef = useRef<HTMLDivElement | null>(null);
  const rowEls = useRef(new Map<string, HTMLElement>());
  const boxEls = useRef(new Map<string, HTMLElement>());
  const [, forceMeasure] = useState(0);

  const registerRow = useCallback((id: string, el: HTMLElement | null) => {
    if (el) rowEls.current.set(id, el);
    else rowEls.current.delete(id);
  }, []);
  const registerBox = useCallback((id: string, el: HTMLElement | null) => {
    // Inline ref callbacks re-run every render (null + element); only react
    // when the DOM node actually changes, or measurement loops forever.
    if (el && boxEls.current.get(id) !== el) {
      boxEls.current.set(id, el);
      forceMeasure((n) => n + 1);
    }
  }, []);

  const selectedField = fields.find((f) => f.id === selectedFieldId) ?? null;

  // Deep links (?field=…) should open the source document too, like a click would.
  useEffect(() => {
    if (!apiFields || activeDocId) return;
    const field = apiFields.find((f) => f.id === selectedFieldId);
    if (field?.source.kind === "document" && field.source.documentId) {
      setActiveDocId(field.source.documentId);
    }
    if (field) {
      window.setTimeout(() => {
        rowEls.current.get(field.id)?.scrollIntoView({ block: "center" });
      }, 80);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiFields]);

  const syncUrl = useCallback(
    (fieldId: string | null, docId: string | null) => {
      const url = new URL(window.location.href);
      url.searchParams.delete("field");
      url.searchParams.delete("doc");
      if (fieldId) url.searchParams.set("field", fieldId);
      else if (docId) url.searchParams.set("doc", docId);
      window.history.replaceState(null, "", url);
      if (ret) {
        rememberSpot({
          label: `${ret.clientName}'s return`,
          href: `${url.pathname}${url.search}`,
        });
      }
    },
    [ret],
  );

  const showEvidence = useCallback((documentId: string, boxId: string) => {
    setSelectedFieldId(null);
    setActiveDocId(documentId);
    setFocusBoxId(boxId);
    window.setTimeout(() => {
      boxEls.current.get(boxId)?.scrollIntoView({ block: "center", behavior: "smooth" });
    }, 60);
  }, []);

  const selectField = useCallback(
    (id: string | null) => {
      setSelectedFieldId(id);
      setFocusBoxId(null);
      const field = fields.find((f) => f.id === id);
      let docId = activeDocId;
      if (field?.source.kind === "document" && field.source.documentId) {
        docId = field.source.documentId;
        setActiveDocId(docId);
        const boxId = field.source.boxId;
        window.setTimeout(() => {
          const el = boxId ? boxEls.current.get(boxId) : null;
          el?.scrollIntoView({ block: "center", behavior: "smooth" });
        }, 60);
      }
      syncUrl(id, docId);
    },
    [fields, activeDocId, syncUrl],
  );

  const updateField = useCallback(
    (id: string, patch: Partial<ReturnField>) => {
      const current = fields.find((f) => f.id === id);
      if (!current) return;
      setFieldOverrides((prev) => ({ ...prev, [id]: { ...current, ...patch } }));
    },
    [fields],
  );

  const verifyField = (id: string) =>
    updateField(id, { state: "verified", verifiedBy: persona.name });

  const correctField = (id: string, value: string) =>
    updateField(id, { state: "edited", value, editedBy: persona.name });

  const askClient = (fieldId: string) => {
    const field = fields.find((f) => f.id === fieldId);
    if (!field) return;
    setNewAnchor({ type: "field", id: field.id, label: field.label });
    setPanelOpen(true);
  };

  const jumpToAnchor = (anchor: ThreadAnchor) => {
    if (anchor.type === "field") selectField(anchor.id);
    if (anchor.type === "document") setActiveDocId(anchor.id);
  };

  const replyToThread = (threadId: string, body: string) => {
    const thread = threads.find((t) => t.id === threadId);
    if (!thread) return;
    const updated: Thread = {
      ...thread,
      nextActionOwner: thread.visibility === "client" ? "client" : "staff",
      messages: [
        ...thread.messages,
        { id: `m-${Date.now()}`, authorId: persona.id, body, sentAt: new Date().toISOString() },
      ],
    };
    if (newThreads.some((t) => t.id === threadId)) {
      setNewThreads((prev) => prev.map((t) => (t.id === threadId ? updated : t)));
    } else {
      setThreadOverrides((prev) => ({ ...prev, [threadId]: updated }));
    }
  };

  const createThread = (anchor: ThreadAnchor, visibility: Thread["visibility"], body: string) => {
    const thread: Thread = {
      id: `t-${Date.now()}`,
      returnId,
      anchor,
      visibility,
      subject: visibility === "client" ? `Question about ${anchor.label.toLowerCase()}` : `Note: ${anchor.label}`,
      nextActionOwner: visibility === "client" ? "client" : "staff",
      status: visibility === "client" ? "waiting_client" : "open",
      messages: [
        { id: `m-${Date.now()}`, authorId: persona.id, body, sentAt: new Date().toISOString() },
      ],
    };
    setNewThreads((prev) => [thread, ...prev]);
    setNewAnchor(null);
  };

  // The verification workflow (Ch 10): everything awaiting a human forms a queue.
  const uncheckedFields = fields.filter(
    (f) =>
      f.state === "ai_generated" ||
      f.state === "needs_review" ||
      f.state === "needs_approval",
  );
  const stepToNextUnchecked = () => {
    if (uncheckedFields.length === 0) return;
    const currentIndex = uncheckedFields.findIndex((f) => f.id === selectedFieldId);
    const next = uncheckedFields[(currentIndex + 1) % uncheckedFields.length];
    selectField(next.id);
  };

  if (retLoading) {
    return (
      <div className="space-y-3">
        <CardSkeleton rows={2} />
        <CardSkeleton rows={6} />
      </div>
    );
  }

  if (!ret) {
    return (
      <EmptyState
        title="This return doesn't exist"
        detail="The link may be old. Head back to the returns list to find what you need."
        action={
          <Link href="/staff/returns">
            <Button variant="primary">All returns</Button>
          </Link>
        }
      />
    );
  }

  if ((apiFields ?? []).length === 0 && apiFields !== null) {
    return (
      <div className="space-y-4">
        <Breadcrumbs clientName={ret.clientName} />
        <EmptyState
          title={`${ret.clientName}'s workspace isn't wired in this prototype`}
          detail="To keep the demo honest, only Priya Sharma's return is fully traceable end-to-end. Open hers to see the review experience."
          action={
            <Link href="/staff/returns/ret-priya">
              <Button variant="primary">Open Priya's return</Button>
            </Link>
          }
        />
      </div>
    );
  }

  const stage = stageById(ret.stage);
  const refund = fields.find((f) => f.id === "f-refund");
  const traceBox =
    selectedField?.source.kind === "document" && selectedField.source.boxId
      ? boxEls.current.get(selectedField.source.boxId) ?? null
      : null;

  return (
    <div className="flex h-[calc(100dvh-7.5rem)] min-h-0 flex-col md:h-[calc(100dvh-6.5rem)]">
      <Breadcrumbs clientName={ret.clientName} />

      {/* Return summary strip */}
      <div className="mb-4 mt-2 flex flex-wrap items-center gap-x-4 gap-y-2">
        <h1 className="font-display text-2xl tracking-tight text-ink">
          {ret.clientName} <span className="text-ink-faint">· {ret.year} {ret.form}</span>
        </h1>
        <Badge tone="brand">
          {stage.staffLabel} — {stage.staffSubstages[ret.substageIndex]}
        </Badge>
        <Badge tone="neutral">{deadlineLabel(ret.deadline)}</Badge>
        {refund && (
          <span className="text-[13px] text-ink-soft">
            Est. refund <span className="tnum font-mono font-semibold text-verified">{refund.value}</span>
          </span>
        )}

        <div className="ml-auto flex items-center gap-2">
          {uncheckedFields.length > 0 ? (
            <Button size="sm" onClick={stepToNextUnchecked}>
              <ScanSearch className="h-3.5 w-3.5 text-ai" />
              Review next flagged value
              <span className="rounded-full bg-ai-soft px-1.5 text-[11px] font-bold text-ai">
                {uncheckedFields.length}
              </span>
            </Button>
          ) : (
            <Badge tone="verified">All values checked ✓</Badge>
          )}
          <Button size="sm" onClick={() => setPanelOpen((v) => !v)}>
            <MessageCircle className="h-3.5 w-3.5" />
            Conversations
            <span className="rounded-full bg-paper px-1.5 text-[11px] font-bold text-ink-soft">
              {threads.length}
            </span>
          </Button>
        </div>
      </div>

      <InsightCards insights={insights ?? []} onShowEvidence={showEvidence} />

      {/* Workspace body */}
      <div ref={containerRef} className="relative flex min-h-0 flex-1 gap-6">
        <div className="flex min-h-0 flex-1 flex-col lg:max-w-[46%]">
          <FieldList
            fields={fields}
            threads={threads}
            documents={documents ?? []}
            selectedFieldId={selectedFieldId}
            onSelectField={selectField}
            onVerify={verifyField}
            onCorrect={correctField}
            onAskClient={askClient}
            registerRow={registerRow}
          />
        </div>

        <div className="hidden min-h-0 flex-1 lg:block">
          <DocViewer
            documents={documents ?? []}
            activeDocId={activeDocId}
            activeBoxId={
              selectedField?.source.kind === "document"
                ? selectedField.source.boxId ?? null
                : focusBoxId
            }
            highlightColor={TRACE_COLOR[selectedField?.state ?? "ai_generated"]}
            onSelectDoc={(id) => {
              setActiveDocId(id);
              syncUrl(selectedFieldId, id);
            }}
            registerBox={registerBox}
          />
        </div>

        <TraceThread
          container={containerRef.current}
          from={selectedFieldId ? rowEls.current.get(selectedFieldId) ?? null : null}
          to={traceBox}
          color={TRACE_COLOR[selectedField?.state ?? "ai_generated"]}
        />

        {/* Conversations drawer */}
        {panelOpen && (
          <div className="rise-in absolute inset-y-0 right-0 z-30 w-full max-w-sm rounded-xl border border-line bg-paper p-4 shadow-pop">
            <ThreadPanel
              threads={threads}
              clientFirstName={ret.clientName.split(" ")[0]}
              newAnchor={newAnchor}
              initialThreadId={initialThreadId}
              onClose={() => {
                setPanelOpen(false);
                setNewAnchor(null);
              }}
              onJumpToAnchor={jumpToAnchor}
              onReply={replyToThread}
              onCreate={createThread}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function Breadcrumbs({ clientName }: { clientName: string }) {
  return (
    <nav className="flex items-center gap-1 text-[12px] text-ink-faint" aria-label="Breadcrumb">
      <Link href="/staff" className="flex items-center gap-1 font-semibold hover:text-spruce">
        <ArrowLeft className="h-3.5 w-3.5" />
        Today
      </Link>
      <ChevronRight className="h-3 w-3" />
      <Link href="/staff/returns" className="font-semibold hover:text-spruce">
        Returns
      </Link>
      <ChevronRight className="h-3 w-3" />
      <span className="text-ink-soft">{clientName}</span>
    </nav>
  );
}
