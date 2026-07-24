"use client";

import { useState } from "react";
import { BookOpenText } from "lucide-react";
import { StateBadge } from "@/components/ui/badge";
import { Popover } from "@/components/ui/popover";

/**
 * The interaction legend (Challenge 08): the affordance system explained
 * in one place, reachable from every screen.
 */
export function LegendButton() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-[13px] font-semibold text-ink-soft transition-colors hover:bg-spruce-wash hover:text-ink"
        aria-expanded={open}
      >
        <BookOpenText className="h-4 w-4" />
        <span className="hidden sm:inline">Legend</span>
      </button>

      <Popover open={open} onClose={() => setOpen(false)} className="w-80 p-4">
        <p className="font-display text-lg text-ink">How to read this screen</p>
        <p className="mt-1 text-[13px] leading-relaxed text-ink-soft">
          Every value carries its state. The same marks mean the same thing on
          every screen.
        </p>

        <ul className="mt-3 space-y-2.5 text-[13px] text-ink-soft">
          <li className="flex items-center justify-between gap-3">
            <StateBadge state="ai_generated" />
            <span className="text-right">Read by AI, not yet checked by a person</span>
          </li>
          <li className="flex items-center justify-between gap-3">
            <StateBadge state="needs_review" />
            <span className="text-right">The AI isn&apos;t sure — look before trusting</span>
          </li>
          <li className="flex items-center justify-between gap-3">
            <StateBadge state="verified" />
            <span className="text-right">A person confirmed it against the source</span>
          </li>
          <li className="flex items-center justify-between gap-3">
            <StateBadge state="edited" />
            <span className="text-right">Changed by hand — the edit is on record</span>
          </li>
          <li className="flex items-center justify-between gap-3">
            <StateBadge state="locked" />
            <span className="text-right">Can&apos;t be changed — hover tells you why</span>
          </li>
        </ul>

        <div className="mt-4 border-t border-line pt-3 text-[13px] leading-relaxed text-ink-soft">
          <p>
            <span className="font-semibold text-spruce">Green text</span> is a
            link — it always goes somewhere.
          </p>
          <p className="mt-1">
            Fields with a <span className="font-semibold text-ink">pencil on hover</span>{" "}
            can be edited in place. Everything else is read-only.
          </p>
        </div>
      </Popover>
    </div>
  );
}
