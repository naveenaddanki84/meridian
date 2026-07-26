"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, FolderOpen, MessageCircle, Search } from "lucide-react";
import { api, type SearchResult } from "@/lib/api";
import { useRole } from "@/lib/role";

const TYPE_ICON = {
  return: FolderOpen,
  document: FileText,
  thread: MessageCircle,
} as const;

const TYPE_LABEL = {
  return: "Returns",
  document: "Documents",
  thread: "Conversations",
} as const;

/**
 * Global search (Challenge 09): hundreds of objects reachable by typing,
 * grouped by kind. Opens with ⌘K or the header button.
 */
export function SearchOverlay({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<readonly SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { persona } = useRole();
  // Search can't be a side door around row-level access.
  const assignedTo = persona.accessScope === "assigned" ? persona.id : undefined;

  useEffect(() => {
    if (open) {
      setQuery("");
      setResults([]);
      const t = setTimeout(() => inputRef.current?.focus(), 30);
      return () => clearTimeout(t);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    setSearching(true);
    const t = setTimeout(() => {
      api.search(query, { assignedTo }).then((r) => {
        setResults(r);
        setSearching(false);
      });
    }, 150);
    return () => clearTimeout(t);
  }, [query, assignedTo]);

  if (!open) return null;

  const grouped = (["return", "document", "thread"] as const)
    .map((type) => ({ type, items: results.filter((r) => r.type === type) }))
    .filter((g) => g.items.length > 0);

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-ink/30 px-4 pt-[12vh]"
      onPointerDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="rise-in w-full max-w-xl overflow-hidden rounded-2xl border border-line bg-card shadow-pop">
        <div className="flex items-center gap-3 border-b border-line px-4">
          <Search className="h-4 w-4 shrink-0 text-ink-faint" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search clients, documents, conversations…"
            className="h-12 w-full bg-transparent text-sm outline-none placeholder:text-ink-faint"
            aria-label="Search"
          />
          <kbd className="hidden rounded border border-line px-1.5 py-0.5 text-[12px] text-ink-faint sm:block">
            esc
          </kbd>
        </div>

        <div className="max-h-[50vh] overflow-y-auto p-2">
          {query.trim() === "" && (
            <p className="px-3 py-6 text-center text-[13px] text-ink-faint">
              Try a client name (&ldquo;Chen&rdquo;), a form (&ldquo;W-2&rdquo;), or a topic
              (&ldquo;donation&rdquo;).
            </p>
          )}

          {query.trim() !== "" && !searching && results.length === 0 && (
            <p className="px-3 py-6 text-center text-[13px] text-ink-faint">
              Nothing matches &ldquo;{query}&rdquo;. Check the spelling or try a
              shorter word.
            </p>
          )}

          {grouped.map((group) => (
            <div key={group.type} className="mb-1">
              <p className="px-3 pb-1 pt-2 text-[12px] font-bold uppercase tracking-wide text-ink-faint">
                {TYPE_LABEL[group.type]}
              </p>
              {group.items.map((item) => {
                const Icon = TYPE_ICON[item.type];
                return (
                  <button
                    key={`${item.type}-${item.id}`}
                    type="button"
                    onClick={() => {
                      onClose();
                      router.push(item.href);
                    }}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors hover:bg-spruce-wash"
                  >
                    <Icon className="h-4 w-4 shrink-0 text-ink-faint" />
                    <span className="min-w-0">
                      <span className="block truncate text-[13px] font-semibold text-ink">
                        {item.title}
                      </span>
                      <span className="block truncate text-[12px] text-ink-faint">
                        {item.subtitle}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
