import { heroFields, heroInsights, heroThreads, HERO_RETURN_ID } from "@/data/hero";
import { ALL_DOCUMENTS, ALL_RETURNS } from "@/data/seed";
import type {
  ChecklistItem,
  Insight,
  ReturnField,
  TaxDocument,
  TaxReturn,
  Thread,
} from "@/data/types";

/**
 * Typed mock API layer. Every screen talks to these functions — never to
 * raw data — so the whole app swaps to a real FastAPI + Supabase backend
 * by reimplementing this one module (see README "Path to production").
 * Latency is simulated so loading states are real.
 */

const LATENCY_MS = 280;

function respond<T>(data: T): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(data), LATENCY_MS + Math.random() * 120);
  });
}

export interface SearchResult {
  type: "return" | "document" | "thread";
  id: string;
  title: string;
  subtitle: string;
  href: string;
}

export interface DocumentFilters {
  query?: string;
  kind?: string;
  status?: string;
}

export const api = {
  getReturns(): Promise<readonly TaxReturn[]> {
    return respond(ALL_RETURNS);
  },

  getReturn(id: string): Promise<TaxReturn | null> {
    return respond(ALL_RETURNS.find((r) => r.id === id) ?? null);
  },

  getFields(returnId: string): Promise<readonly ReturnField[]> {
    return respond(returnId === HERO_RETURN_ID ? heroFields : []);
  },

  /** Simulated AI recommendations/warnings — a stub returning plausible JSON. */
  getInsights(returnId: string): Promise<readonly Insight[]> {
    return respond(heroInsights.filter((i) => i.returnId === returnId));
  },

  getDocuments(filters: DocumentFilters = {}): Promise<readonly TaxDocument[]> {
    const query = filters.query?.trim().toLowerCase();
    const results = ALL_DOCUMENTS.filter((doc) => {
      if (filters.kind && doc.kind !== filters.kind) return false;
      if (filters.status && doc.status !== filters.status) return false;
      if (query) {
        const haystack = `${doc.title} ${doc.clientName} ${doc.kind} ${doc.issuer}`.toLowerCase();
        if (!haystack.includes(query)) return false;
      }
      return true;
    });
    return respond(results);
  },

  getDocumentsForReturn(returnId: string): Promise<readonly TaxDocument[]> {
    return respond(ALL_DOCUMENTS.filter((d) => d.returnId === returnId));
  },

  getDocument(id: string): Promise<TaxDocument | null> {
    return respond(ALL_DOCUMENTS.find((d) => d.id === id) ?? null);
  },

  /** Clients never receive internal threads — filtered here, as a real API would. */
  getThreads(returnId: string, viewer: "client" | "staff"): Promise<readonly Thread[]> {
    const threads = heroThreads.filter((t) => t.returnId === returnId);
    return respond(viewer === "client" ? threads.filter((t) => t.visibility === "client") : threads);
  },

  getClientChecklist(): Promise<readonly ChecklistItem[]> {
    return respond([
      {
        id: "chk-questions",
        title: "Tell us about your year",
        detail: "12 quick questions — done Feb 12",
        minutes: 5,
        done: true,
        href: "/client",
      },
      {
        id: "chk-docs",
        title: "Share your tax documents",
        detail: "4 of 5 uploaded — your K-1 is still out there",
        minutes: 3,
        done: false,
        href: "/client/documents",
      },
      {
        id: "chk-question",
        title: "Answer Marcus's question",
        detail: "One question about your donation receipt",
        minutes: 1,
        done: false,
        href: "/client/questions",
      },
    ]);
  },

  search(query: string): Promise<readonly SearchResult[]> {
    const q = query.trim().toLowerCase();
    if (!q) return respond([]);

    const returns: SearchResult[] = ALL_RETURNS.filter((r) =>
      `${r.clientName} ${r.form}`.toLowerCase().includes(q),
    ).map((r) => ({
      type: "return",
      id: r.id,
      title: `${r.clientName} — ${r.year} ${r.form}`,
      subtitle: "Tax return",
      href: r.id === HERO_RETURN_ID ? `/staff/returns/${r.id}` : `/staff/returns`,
    }));

    const documents: SearchResult[] = ALL_DOCUMENTS.filter((d) =>
      `${d.title} ${d.clientName}`.toLowerCase().includes(q),
    ).map((d) => ({
      type: "document",
      id: d.id,
      title: d.title,
      subtitle: d.clientName,
      href:
        d.returnId === HERO_RETURN_ID
          ? `/staff/returns/${d.returnId}?doc=${d.id}`
          : "/staff/documents",
    }));

    const threads: SearchResult[] = heroThreads
      .filter((t) => t.subject.toLowerCase().includes(q))
      .map((t) => ({
        type: "thread",
        id: t.id,
        title: t.subject,
        subtitle: `Thread · ${t.anchor.label}`,
        href: `/staff/returns/${t.returnId}?thread=${t.id}`,
      }));

    return respond([...returns, ...documents, ...threads].slice(0, 12));
  },
};
