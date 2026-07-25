"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ChevronDown, ChevronRight, Search } from "lucide-react";
import { api } from "@/lib/api";
import { useQuery } from "@/lib/use-query";
import { relativeLabel } from "@/lib/format";
import { HERO_RETURN_ID } from "@/data/hero";
import type { TaxDocument } from "@/data/types";
import { Badge } from "@/components/ui/badge";
import { CardSkeleton } from "@/components/ui/skeleton";

const KIND_FILTERS = ["W-2", "1099-INT", "1099-DIV", "1099-B", "K-1", "Receipt"] as const;

const STATUS_META = {
  processed: { label: "Read by AI", tone: "ai" as const },
  uploaded: { label: "Awaiting read", tone: "neutral" as const },
  needed: { label: "Missing", tone: "attention" as const },
};

/**
 * Hundreds of documents, still navigable (Challenge 09): search narrows,
 * filters cut, and everything else stays folded by client until needed.
 */
export default function StaffDocuments() {
  const { data: documents, loading } = useQuery(() => api.getDocuments(), []);
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [openClients, setOpenClients] = useState<ReadonlySet<string>>(new Set());

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (documents ?? []).filter((doc) => {
      if (kind && doc.kind !== kind) return false;
      if (status && doc.status !== status) return false;
      if (q && !`${doc.title} ${doc.clientName} ${doc.issuer}`.toLowerCase().includes(q))
        return false;
      return true;
    });
  }, [documents, query, kind, status]);

  const groups = useMemo(() => {
    const byClient = new Map<string, TaxDocument[]>();
    for (const doc of filtered) {
      const list = byClient.get(doc.clientName) ?? [];
      byClient.set(doc.clientName, [...list, doc]);
    }
    return [...byClient.entries()].sort((a, b) => b[1].length - a[1].length);
  }, [filtered]);

  const missingCount = filtered.filter((d) => d.status === "needed").length;
  const searching = query.trim() !== "" || kind !== null || status !== null;

  // Progressive disclosure at scale: never render hundreds of groups at
  // once — search and filters are the way in (Challenge 09).
  const GROUP_CAP = 40;
  const visibleGroups = groups.slice(0, GROUP_CAP);

  const toggleClient = (name: string) => {
    setOpenClients((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  return (
    <div className="mx-auto max-w-3xl">
      <header className="mb-5">
        <h1 className="font-display text-3xl tracking-tight text-ink">Documents</h1>
        <p className="mt-1 text-[13px] text-ink-soft">
          {documents?.length ?? "…"} documents across {groups.length || "…"} clients ·{" "}
          <button
            type="button"
            onClick={() => setStatus(status === "needed" ? null : "needed")}
            className="font-semibold text-attention underline-offset-2 hover:underline"
          >
            {missingCount} still missing
          </button>
        </p>
      </header>

      {/* Search + filters */}
      <div className="mb-4 space-y-2.5">
        <div className="flex items-center gap-2.5 rounded-xl border border-line bg-card px-3.5 shadow-lift focus-within:border-spruce">
          <Search className="h-4 w-4 shrink-0 text-ink-faint" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by client, form, or issuer…"
            className="h-11 w-full bg-transparent text-sm outline-none placeholder:text-ink-faint"
            aria-label="Search documents"
          />
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {KIND_FILTERS.map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setKind(kind === k ? null : k)}
              aria-pressed={kind === k}
              className={`rounded-full border px-3 py-1 font-mono text-[12px] font-semibold transition-colors ${
                kind === k
                  ? "border-spruce bg-spruce text-white"
                  : "border-line bg-card text-ink-soft hover:border-line-strong"
              }`}
            >
              {k}
            </button>
          ))}
          <span className="mx-1 h-4 w-px bg-line-strong" aria-hidden="true" />
          {(Object.keys(STATUS_META) as (keyof typeof STATUS_META)[]).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatus(status === s ? null : s)}
              aria-pressed={status === s}
              className={`rounded-full border px-3 py-1 text-[12px] font-semibold transition-colors ${
                status === s
                  ? "border-spruce bg-spruce text-white"
                  : "border-line bg-card text-ink-soft hover:border-line-strong"
              }`}
            >
              {STATUS_META[s].label}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div className="space-y-2">
          <CardSkeleton rows={2} />
          <CardSkeleton rows={2} />
        </div>
      )}

      {/* Grouped by client; folded until relevant */}
      <ul className="space-y-1.5">
        {visibleGroups.map(([clientName, docs]) => {
          const open = searching || openClients.has(clientName);
          const missing = docs.filter((d) => d.status === "needed").length;
          return (
            <li key={clientName} className="overflow-hidden rounded-xl border border-line bg-card">
              <button
                type="button"
                onClick={() => toggleClient(clientName)}
                aria-expanded={open}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-spruce-wash/60"
              >
                {open ? (
                  <ChevronDown className="h-4 w-4 shrink-0 text-ink-faint" />
                ) : (
                  <ChevronRight className="h-4 w-4 shrink-0 text-ink-faint" />
                )}
                <span className="flex-1 text-[13px] font-semibold text-ink">{clientName}</span>
                {missing > 0 && <Badge tone="attention">{missing} missing</Badge>}
                <span className="font-mono text-[12px] text-ink-faint">{docs.length} docs</span>
              </button>

              {open && (
                <ul className="border-t border-line">
                  {docs.map((doc) => {
                    const meta = STATUS_META[doc.status];
                    const isHeroDoc = doc.returnId === HERO_RETURN_ID;
                    const row = (
                      <>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[13px] text-ink">{doc.title}</span>
                          <span className="block text-[12px] text-ink-faint">
                            {doc.uploadedAt
                              ? `Uploaded ${relativeLabel(doc.uploadedAt)} · ${doc.pages} page${doc.pages > 1 ? "s" : ""}`
                              : "Not received"}
                          </span>
                        </span>
                        <Badge tone={meta.tone}>{meta.label}</Badge>
                      </>
                    );
                    return (
                      <li key={doc.id} className="border-b border-line/70 last:border-b-0">
                        {isHeroDoc ? (
                          <Link
                            href={`/staff/returns/${doc.returnId}?doc=${doc.id}`}
                            className="flex items-center gap-3 py-2 pl-11 pr-4 transition-colors hover:bg-spruce-wash/60"
                            title="Open in the review workspace"
                          >
                            {row}
                          </Link>
                        ) : (
                          <div className="flex items-center gap-3 py-2 pl-11 pr-4">{row}</div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </li>
          );
        })}
      </ul>

      {groups.length > GROUP_CAP && (
        <p className="mt-3 rounded-xl border border-dashed border-line-strong bg-card/60 px-4 py-3 text-center text-[12px] text-ink-soft">
          Showing {GROUP_CAP} of {groups.length} clients — search or filter to
          narrow the rest.
        </p>
      )}

      {!loading && filtered.length === 0 && (
        <p className="rounded-xl border border-dashed border-line-strong bg-card/60 px-4 py-8 text-center text-[13px] text-ink-soft">
          Nothing matches. Clear a filter or try a shorter search.
        </p>
      )}
    </div>
  );
}
