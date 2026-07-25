"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, UserRound } from "lucide-react";
import { PERSONAS } from "@/data/people";
import { useRole } from "@/lib/role";
import { Popover } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";

const ROLE_LABEL: Record<string, string> = {
  client: "Client",
  preparer: "Preparer",
  reviewer: "Reviewer",
  admin: "Firm admin",
};

const SHELL_HOME: Record<string, string> = {
  client: "/client",
  preparer: "/staff",
  reviewer: "/staff",
  admin: "/staff",
};

/**
 * Demo stand-in for login: switch personas to see how one product adapts
 * per role (Challenge 05). Mike can also open his own personal return —
 * same person, different hat.
 */
export function PersonaMenu() {
  const [open, setOpen] = useState(false);
  const { persona, switchPersona } = useRole();
  const router = useRouter();

  const choose = (id: string) => {
    switchPersona(id);
    setOpen(false);
    const target = PERSONAS.find((p) => p.id === id);
    router.push(SHELL_HOME[target?.role ?? "client"]);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-9 items-center gap-2 rounded-lg pl-1.5 pr-2 transition-colors hover:bg-spruce-wash"
        aria-expanded={open}
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-spruce text-[12px] font-bold text-white">
          {persona.initials}
        </span>
        <span className="hidden text-left leading-tight md:block">
          <span className="block text-[13px] font-semibold text-ink">{persona.name}</span>
          <span className="block text-[12px] text-ink-faint">{ROLE_LABEL[persona.role]}</span>
        </span>
        <ChevronDown className="h-3.5 w-3.5 text-ink-faint" />
      </button>

      <Popover open={open} onClose={() => setOpen(false)} className="w-72 p-2">
        <p className="px-2 pb-1 pt-1.5 text-[12px] font-bold uppercase tracking-wide text-ink-faint">
          Demo · view as
        </p>
        {PERSONAS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => choose(p.id)}
            className={`flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left transition-colors hover:bg-spruce-wash ${
              p.id === persona.id ? "bg-spruce-wash" : ""
            }`}
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-paper text-[12px] font-bold text-ink-soft">
              {p.initials}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[13px] font-semibold text-ink">
                {p.name}
              </span>
              <span className="block truncate text-[12px] text-ink-faint">{p.title}</span>
            </span>
            <Badge tone={p.role === "client" ? "brand" : "neutral"}>
              {ROLE_LABEL[p.role]}
            </Badge>
          </button>
        ))}

        {persona.alsoClientOfReturnId && (
          <>
            <div className="mx-2 my-1.5 border-t border-line" />
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                router.push("/client");
              }}
              className="flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left transition-colors hover:bg-spruce-wash"
            >
              <UserRound className="h-4 w-4 shrink-0 text-ink-faint" />
              <span className="min-w-0 flex-1">
                <span className="block text-[13px] font-semibold text-ink">
                  My own 2025 return
                </span>
                <span className="block text-[12px] text-ink-faint">
                  Same login, client hat on — firm tools hidden
                </span>
              </span>
            </button>
          </>
        )}
      </Popover>
    </div>
  );
}
