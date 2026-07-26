"use client";

import { useRole } from "@/lib/role";
import { DaveDocuments } from "@/components/client/dave-documents";
import { EmilyDocuments } from "@/components/client/emily-documents";
import { EmptyState } from "@/components/ui/empty-state";

/**
 * Two wired clients, two genuinely different moments: Emily is mid-season
 * with documents already read, Dave is on day one with a list of asks.
 * Each gets its own screen rather than one screen apologising for the
 * other (Challenge 03).
 */
export default function ClientDocuments() {
  const { persona } = useRole();

  if (persona.id === "emily") return <EmilyDocuments />;
  if (persona.id === "dave") {
    return <DaveDocuments firstName={persona.name.split(" ")[0]} />;
  }

  return (
    <div className="mx-auto max-w-xl">
      <EmptyState
        title="Your documents live here"
        detail="In this prototype Emily's and Dave's documents are wired up end-to-end. Switch to either of them from the top-right menu to see the full experience."
      />
    </div>
  );
}
