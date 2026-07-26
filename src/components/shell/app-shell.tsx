"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { CornerUpLeft, Search, X } from "lucide-react";
import { RoleProvider, useRole } from "@/lib/role";
import { clearSpot, recallSpot, type WorkspaceSpot } from "@/lib/workspace-chip";
import { ToastProvider } from "@/components/ui/toast";
import { LegendButton } from "./legend";
import { NavItems, Wordmark } from "./nav-rail";
import { PersonaMenu } from "./persona-menu";
import { SearchOverlay } from "./search-overlay";

/**
 * One shell for every role (Challenge 05): a quiet left rail, a header
 * with the legend and persona switcher, and — for staff — global search.
 * The "back to where I was" chip keeps detours cheap (Challenge 04).
 */

function WorkspaceChip() {
  const pathname = usePathname();
  const { persona } = useRole();
  const [spot, setSpot] = useState<WorkspaceSpot | null>(null);

  useEffect(() => {
    setSpot(recallSpot());
  }, [pathname]);

  if (!spot || pathname === spot.href.split("?")[0]) return null;
  // Nobody inherits someone else's place in the app — a reviewer who just
  // switched in never opened the return the outgoing preparer was reading.
  if (spot.personaId !== persona.id) return null;
  // A client must never be offered a firm URL, even one left over in this
  // browser from another persona (Challenge 05).
  if (persona.role === "client" && spot.href.startsWith("/staff")) return null;

  return (
    <span className="flex items-center overflow-hidden rounded-full border border-spruce/30 bg-spruce-soft text-[12px] font-semibold text-spruce">
      <Link
        href={spot.href}
        className="flex items-center gap-1.5 py-1 pl-2.5 pr-1 hover:bg-spruce/10"
      >
        <CornerUpLeft className="h-3.5 w-3.5" />
        <span className="max-w-40 truncate sm:max-w-64">Back to {spot.label}</span>
      </Link>
      <button
        type="button"
        aria-label="Dismiss"
        onClick={() => {
          clearSpot();
          setSpot(null);
        }}
        className="px-1.5 py-1 hover:bg-spruce/10"
      >
        <X className="h-3 w-3" />
      </button>
    </span>
  );
}

function ShellFrame({ children }: { children: React.ReactNode }) {
  const { persona } = useRole();
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);
  // The shell wins over the role, same rule the nav rail follows: a staff
  // member wearing their client hat gets no firm-wide search, because
  // "firm tools are hidden here" has to be true and not just reassuring.
  const isStaffView = persona.role !== "client" && !pathname.startsWith("/client");

  useEffect(() => {
    if (!isStaffView) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen((v) => !v);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isStaffView]);

  return (
    <div className="flex min-h-dvh">
      {/* Desktop rail */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-56 flex-col border-r border-line bg-card px-4 py-5 md:flex">
        <Link href="/" className="mb-8 block" aria-label="Meridian — back to role picker">
          <Wordmark />
        </Link>
        <NavItems orientation="vertical" />
        <p className="mt-auto text-[12px] leading-relaxed text-ink-faint">
          Prototype — all data is fabricated. Numbers, names, and AI output are
          simulated.
        </p>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col md:pl-56">
        <header className="sticky top-0 z-30 border-b border-line bg-paper/90 backdrop-blur">
          <div className="flex h-14 items-center gap-3 px-4 md:px-8">
            <Link href="/" className="md:hidden" aria-label="Meridian — back to role picker">
              <Wordmark />
            </Link>
            <div className="hidden md:block">
              <WorkspaceChip />
            </div>
            <div className="ml-auto flex items-center gap-1">
              {isStaffView && (
                <button
                  type="button"
                  onClick={() => setSearchOpen(true)}
                  className="flex h-9 items-center gap-2 rounded-lg border border-line bg-card px-2.5 text-[13px] text-ink-faint transition-colors hover:border-line-strong"
                >
                  <Search className="h-4 w-4" />
                  <span className="hidden lg:inline">Search anything…</span>
                  <kbd className="hidden rounded border border-line px-1 text-[12px] lg:inline">
                    ⌘K
                  </kbd>
                </button>
              )}
              <LegendButton />
              <PersonaMenu />
            </div>
          </div>
          {/* Mobile nav */}
          <div className="border-t border-line px-3 py-1.5 md:hidden">
            <NavItems orientation="horizontal" />
          </div>
          <div className="px-4 pb-2 md:hidden">
            <WorkspaceChip />
          </div>
        </header>

        <main className="min-w-0 flex-1 px-4 py-6 md:px-8 md:py-8">{children}</main>
      </div>

      {isStaffView && (
        <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
      )}
    </div>
  );
}

export function AppShell({
  defaultPersonaId,
  children,
}: {
  defaultPersonaId: string;
  children: React.ReactNode;
}) {
  return (
    <RoleProvider defaultPersonaId={defaultPersonaId}>
      <ToastProvider>
        <ShellFrame>{children}</ShellFrame>
      </ToastProvider>
    </RoleProvider>
  );
}
