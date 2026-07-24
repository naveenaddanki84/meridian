"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Check, Send } from "lucide-react";
import { api } from "@/lib/api";
import { useQuery } from "@/lib/use-query";
import { useRole } from "@/lib/role";
import { readProgress, updateProgress, useClientProgress } from "@/lib/client-progress";
import { HERO_RETURN_ID } from "@/data/hero";
import { personaById } from "@/data/people";
import type { Thread } from "@/data/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CardSkeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";

/**
 * The client side of collaboration (Challenge 02): only client-visible
 * threads arrive here (the API filters internal ones out, like real
 * permissions would), each pinned to the thing it's about, each clear
 * about whose move it is.
 */
export default function ClientQuestions() {
  const { persona } = useRole();
  const isPriya = persona.id === "priya";
  const progress = useClientProgress();
  const { data: apiThreads, loading } = useQuery(
    () => api.getThreads(HERO_RETURN_ID, "client"),
    [],
  );

  const [answered, setAnswered] = useState<Readonly<Record<string, string>>>({});
  const [draft, setDraft] = useState("");
  const [draftThreadId, setDraftThreadId] = useState<string | null>(null);

  // An answer given on a previous visit stays answered.
  useEffect(() => {
    if (readProgress().questionAnswered) {
      setAnswered((prev) =>
        prev["t-receipt"] ? prev : { ...prev, "t-receipt": "It was $300 — sorry about my handwriting!" },
      );
    }
  }, []);

  if (!isPriya) {
    return (
      <div className="mx-auto max-w-xl">
        <EmptyState
          title="Questions from your preparer land here"
          detail="In this prototype only Priya's conversations are wired up. Switch to Priya from the top-right menu to see them."
        />
      </div>
    );
  }

  const threads = apiThreads ?? [];
  const isDone = (threadId: string) =>
    Boolean(answered[threadId]) || (threadId === "t-k1" && progress.k1Uploaded);
  const openCount = threads.filter((t) => !isDone(t.id) && t.status !== "resolved").length;

  const answer = (thread: Thread, text: string) => {
    setAnswered((prev) => ({ ...prev, [thread.id]: text }));
    setDraft("");
    setDraftThreadId(null);
    if (thread.id === "t-receipt") updateProgress({ questionAnswered: true });
  };

  return (
    <div className="mx-auto max-w-xl">
      <header className="mb-6">
        <h1 className="font-display text-3xl tracking-tight text-ink">Questions for you</h1>
        <p className="mt-1 text-[13px] text-ink-soft">
          {openCount === 0
            ? "All answered — nothing needs you right now."
            : `${openCount} ${openCount === 1 ? "thing" : "things"} to answer. Each one is attached to the part of your return it's about.`}
        </p>
      </header>

      {loading && <CardSkeleton rows={4} />}

      <ul className="space-y-3">
        {threads.map((thread) => {
          const reply = answered[thread.id];
          const isReceiptQuestion = thread.id === "t-receipt";
          const isDocRequest = thread.anchor.type === "document";
          const docUploaded = isDocRequest && progress.k1Uploaded;

          return (
            <li key={thread.id} className="rounded-2xl border border-line bg-card p-4 shadow-lift">
              <div className="flex items-center gap-2">
                <Badge tone="brand">About: {thread.anchor.label}</Badge>
                {reply || docUploaded ? (
                  <Badge tone="verified">
                    <Check className="h-3 w-3" />
                    {docUploaded && !reply ? "Done" : "Answered"}
                  </Badge>
                ) : (
                  <Badge tone="attention">Your turn</Badge>
                )}
              </div>

              <ul className="mt-3 space-y-2.5">
                {thread.messages.map((message) => {
                  const author = personaById(message.authorId);
                  return (
                    <li key={message.id} className="flex gap-2.5">
                      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-spruce text-[10px] font-bold text-white">
                        {author.initials}
                      </span>
                      <div>
                        <p className="text-[11px] text-ink-faint">{author.name}</p>
                        <p className="text-[13px] leading-relaxed text-ink-soft">{message.body}</p>
                      </div>
                    </li>
                  );
                })}

                {reply && (
                  <li className="flex flex-row-reverse gap-2.5">
                    <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-paper text-[10px] font-bold text-ink-soft">
                      {persona.initials}
                    </span>
                    <div className="rounded-xl bg-spruce-soft px-3 py-2">
                      <p className="text-[13px] text-ink">{reply}</p>
                    </div>
                  </li>
                )}
              </ul>

              {reply && (
                <p className="mt-3 text-[12px] text-ink-faint">
                  Sent — Marcus will update your return with this.
                </p>
              )}

              {!reply && isReceiptQuestion && (
                <div className="mt-3">
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant="primary" onClick={() => answer(thread, "It was $300 — sorry about my handwriting!")}>
                      It was $300
                    </Button>
                    <Button size="sm" onClick={() => answer(thread, "It was $800.")}>
                      It was $800
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setDraftThreadId(thread.id)}>
                      Something else…
                    </Button>
                  </div>

                  {draftThreadId === thread.id && (
                    <form
                      className="rise-in mt-2 flex items-end gap-2"
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (draft.trim()) answer(thread, draft.trim());
                      }}
                    >
                      <textarea
                        autoFocus
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        rows={2}
                        placeholder="Type your answer…"
                        className="w-full resize-none rounded-lg border border-line bg-white px-2.5 py-2 text-[13px] outline-none focus:border-spruce"
                      />
                      <Button size="sm" variant="primary" type="submit" aria-label="Send answer">
                        <Send className="h-3.5 w-3.5" />
                      </Button>
                    </form>
                  )}
                </div>
              )}

              {!reply && isDocRequest && !docUploaded && (
                <div className="mt-3">
                  <Link href="/client/documents">
                    <Button size="sm" variant="primary">Upload it now</Button>
                  </Link>
                </div>
              )}

              {docUploaded && !reply && (
                <p className="mt-3 flex items-center gap-1.5 text-[12px] font-semibold text-verified">
                  <Check className="h-3.5 w-3.5" />
                  You uploaded it — we&apos;ve read it already. Nothing else needed.
                </p>
              )}
            </li>
          );
        })}
      </ul>

      <p className="mt-4 text-center text-[11px] leading-relaxed text-ink-faint">
        Your preparer&apos;s internal notes never appear here — you only see
        what&apos;s addressed to you.
      </p>
    </div>
  );
}
