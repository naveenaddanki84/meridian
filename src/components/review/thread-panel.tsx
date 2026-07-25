"use client";

import { useState } from "react";
import { Globe, Lock, Send, X } from "lucide-react";
import { personaById } from "@/data/people";
import { daysSince } from "@/lib/format";
import type { Thread, ThreadAnchor } from "@/data/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

/**
 * Conversations live on the work, not in an inbox (Challenge 02): every
 * thread is pinned to a field or document, marked internal or
 * client-visible, and names who owes the next move.
 */

function OwnerBadge({ thread }: { thread: Thread }) {
  if (thread.status === "resolved") return <Badge tone="verified">Resolved</Badge>;
  if (thread.nextActionOwner === "client")
    return <Badge tone="attention">Waiting on client</Badge>;
  return <Badge tone="brand">Firm&apos;s move</Badge>;
}

function VisibilityBadge({ visibility }: { visibility: Thread["visibility"] }) {
  return visibility === "internal" ? (
    <Badge tone="locked">
      <Lock className="h-3 w-3" />
      Firm only
    </Badge>
  ) : (
    <Badge tone="brand">
      <Globe className="h-3 w-3" />
      Client can see
    </Badge>
  );
}

export function ThreadPanel({
  threads,
  clientFirstName,
  newAnchor,
  initialThreadId,
  onClose,
  onJumpToAnchor,
  onReply,
  onCreate,
}: {
  threads: readonly Thread[];
  clientFirstName: string;
  /** When set, the panel opens in "new thread" mode pinned to this anchor. */
  newAnchor: ThreadAnchor | null;
  initialThreadId: string | null;
  onClose: () => void;
  onJumpToAnchor: (anchor: ThreadAnchor) => void;
  onReply: (threadId: string, body: string) => void;
  onCreate: (anchor: ThreadAnchor, visibility: Thread["visibility"], body: string) => void;
}) {
  const [expandedId, setExpandedId] = useState<string | null>(initialThreadId);
  const [draft, setDraft] = useState("");
  const [newBody, setNewBody] = useState("");
  const [newVisibility, setNewVisibility] = useState<Thread["visibility"]>("client");

  // Outstanding-request tracking (Challenge 02): group by whose move it
  // is, so open asks never blur into a generic inbox.
  const groups = [
    {
      label: `Waiting on ${clientFirstName}`,
      items: threads.filter((t) => t.status !== "resolved" && t.nextActionOwner === "client"),
    },
    {
      label: "Firm's move",
      items: threads.filter((t) => t.status !== "resolved" && t.nextActionOwner !== "client"),
    },
    {
      label: "Resolved",
      items: threads.filter((t) => t.status === "resolved"),
    },
  ].filter((g) => g.items.length > 0);

  const askedAgo = (thread: Thread): string => {
    const last = thread.messages[thread.messages.length - 1];
    if (!last) return "";
    const days = daysSince(last.sentAt);
    return days === 0 ? "today" : `${days}d ago`;
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center justify-between border-b border-line pb-3">
        <div>
          <h2 className="font-display text-lg text-ink">Conversations</h2>
          <p className="text-[12px] text-ink-faint">
            Pinned to the work — nothing gets lost in email
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close conversations"
          className="rounded-lg p-1.5 text-ink-faint hover:bg-spruce-wash hover:text-ink"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="min-h-0 flex-1 space-y-2.5 overflow-y-auto py-3">
        {/* New thread composer */}
        {newAnchor && (
          <div className="rise-in rounded-xl border border-spruce/40 bg-card p-3">
            <p className="text-[12px] font-semibold text-ink">New conversation about</p>
            <span className="mt-1 inline-block rounded-md bg-spruce-soft px-2 py-0.5 text-[12px] font-semibold text-spruce">
              {newAnchor.label}
            </span>

            <div className="mt-2.5 flex gap-1.5" role="radiogroup" aria-label="Who can see this">
              <button
                type="button"
                role="radio"
                aria-checked={newVisibility === "client"}
                onClick={() => setNewVisibility("client")}
                className={`flex items-center gap-1 rounded-lg border px-2.5 py-1 text-[12px] font-semibold transition-colors ${
                  newVisibility === "client"
                    ? "border-spruce bg-spruce-soft text-spruce"
                    : "border-line text-ink-faint hover:text-ink"
                }`}
              >
                <Globe className="h-3 w-3" />
                Ask {clientFirstName}
              </button>
              <button
                type="button"
                role="radio"
                aria-checked={newVisibility === "internal"}
                onClick={() => setNewVisibility("internal")}
                className={`flex items-center gap-1 rounded-lg border px-2.5 py-1 text-[12px] font-semibold transition-colors ${
                  newVisibility === "internal"
                    ? "border-locked bg-locked-soft text-locked"
                    : "border-line text-ink-faint hover:text-ink"
                }`}
              >
                <Lock className="h-3 w-3" />
                Internal note
              </button>
            </div>
            {newVisibility === "internal" && (
              <p className="mt-1.5 text-[12px] text-ink-faint">
                {clientFirstName} will never see internal notes.
              </p>
            )}

            <form
              className="mt-2 flex items-end gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                if (!newBody.trim()) return;
                onCreate(newAnchor, newVisibility, newBody.trim());
                setNewBody("");
              }}
            >
              <textarea
                autoFocus
                value={newBody}
                onChange={(e) => setNewBody(e.target.value)}
                rows={2}
                placeholder={
                  newVisibility === "client"
                    ? `Write to ${clientFirstName} in plain words…`
                    : "Note for the team…"
                }
                className="w-full resize-none rounded-lg border border-line bg-white px-2.5 py-2 text-[13px] outline-none focus:border-spruce"
              />
              <Button size="sm" variant="primary" type="submit" aria-label="Send">
                <Send className="h-3.5 w-3.5" />
              </Button>
            </form>
          </div>
        )}

        {groups.map((group) => (
          <div key={group.label}>
            <p className="mb-1.5 mt-1 px-0.5 text-[12px] font-bold uppercase tracking-wide text-ink-faint">
              {group.label} · {group.items.length}
            </p>
            <div className="space-y-2.5">
        {group.items.map((thread) => {
          const expanded = expandedId === thread.id;
          return (
            <div
              key={thread.id}
              className={`rounded-xl border bg-card transition-colors ${
                expanded ? "border-line-strong" : "border-line"
              }`}
            >
              <button
                type="button"
                onClick={() => setExpandedId(expanded ? null : thread.id)}
                className="flex w-full flex-col gap-1.5 px-3 py-2.5 text-left"
                aria-expanded={expanded}
              >
                <div className="flex w-full items-center gap-1.5">
                  <VisibilityBadge visibility={thread.visibility} />
                  <span className="ml-auto">
                    <OwnerBadge thread={thread} />
                  </span>
                </div>
                <span className="text-[13px] font-semibold leading-snug text-ink">
                  {thread.subject}
                </span>
                {(() => {
                  const last = thread.messages[thread.messages.length - 1];
                  if (!last) return null;
                  const who = personaById(last.authorId);
                  return (
                    <span className="line-clamp-1 text-[12px] text-ink-soft">
                      <span className="font-semibold">{who.name.split(" ")[0]}:</span>{" "}
                      {last.body}
                    </span>
                  );
                })()}
                <span className="text-[12px] text-ink-faint">
                  last message {askedAgo(thread)}
                </span>
              </button>

              {expanded && (
                <div className="border-t border-line px-3 pb-3 pt-2.5">
                  <button
                    type="button"
                    onClick={() => onJumpToAnchor(thread.anchor)}
                    className="mb-2.5 inline-block rounded-md bg-spruce-soft px-2 py-0.5 text-[12px] font-semibold text-spruce hover:bg-spruce/15"
                  >
                    ↳ {thread.anchor.label}
                  </button>

                  <ul className="space-y-2.5">
                    {thread.messages.map((message) => {
                      const author = personaById(message.authorId);
                      return (
                        <li key={message.id} className="flex gap-2">
                          <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-paper text-[12px] font-bold text-ink-soft">
                            {author.initials}
                          </span>
                          <div>
                            <p className="text-[12px] text-ink-faint">
                              <span className="font-semibold text-ink">{author.name}</span>
                            </p>
                            <p className="text-[13px] leading-relaxed text-ink-soft">
                              {message.body}
                            </p>
                          </div>
                        </li>
                      );
                    })}
                  </ul>

                  {thread.status !== "resolved" && (
                    <form
                      className="mt-3 flex items-end gap-2"
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (!draft.trim()) return;
                        onReply(thread.id, draft.trim());
                        setDraft("");
                      }}
                    >
                      <textarea
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        rows={1}
                        placeholder="Reply…"
                        className="w-full resize-none rounded-lg border border-line bg-white px-2.5 py-1.5 text-[13px] outline-none focus:border-spruce"
                      />
                      <Button size="sm" variant="primary" type="submit" aria-label="Send reply">
                        <Send className="h-3.5 w-3.5" />
                      </Button>
                    </form>
                  )}
                </div>
              )}
            </div>
          );
        })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
