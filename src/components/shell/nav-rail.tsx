"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FileText,
  FolderOpen,
  House,
  MessageCircleQuestion,
  Sunrise,
} from "lucide-react";
import { useRole } from "@/lib/role";
import { useClientProgress } from "@/lib/client-progress";
import type { RoleId } from "@/data/types";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

/**
 * Navigation adapts per role (Challenge 05): clients get three calm
 * destinations, staff get their working surfaces. Same shell, different
 * depth.
 */
const NAV_BY_ROLE: Record<RoleId, readonly NavItem[]> = {
  client: [
    { label: "Home", href: "/client", icon: House },
    { label: "Your documents", href: "/client/documents", icon: FileText },
    { label: "Questions for you", href: "/client/questions", icon: MessageCircleQuestion },
  ],
  preparer: [
    { label: "Today", href: "/staff", icon: Sunrise },
    { label: "Returns", href: "/staff/returns", icon: FolderOpen },
    { label: "Documents", href: "/staff/documents", icon: FileText },
  ],
  reviewer: [
    { label: "Today", href: "/staff", icon: Sunrise },
    { label: "Returns", href: "/staff/returns", icon: FolderOpen },
    { label: "Documents", href: "/staff/documents", icon: FileText },
  ],
  admin: [
    { label: "Today", href: "/staff", icon: Sunrise },
    { label: "Returns", href: "/staff/returns", icon: FolderOpen },
    { label: "Documents", href: "/staff/documents", icon: FileText },
  ],
};

function isActive(pathname: string, href: string): boolean {
  if (href === "/client" || href === "/staff") return pathname === href;
  return pathname.startsWith(href);
}

export function NavItems({ orientation }: { orientation: "vertical" | "horizontal" }) {
  const pathname = usePathname();
  const { persona } = useRole();
  const progress = useClientProgress();
  // The shell wins over the badge: a staff member wearing their client hat
  // inside /client sees client navigation — firm tools stay hidden there.
  const inClientShell = pathname.startsWith("/client");
  const baseItems = inClientShell ? NAV_BY_ROLE.client : NAV_BY_ROLE[persona.role];

  // The badge is live: answering or uploading clears it (Challenge 03).
  const openQuestions =
    persona.id === "emily"
      ? (progress.questionAnswered ? 0 : 1) + (progress.k1Uploaded ? 0 : 1)
      : 0;
  const items = baseItems.map((item) =>
    item.href === "/client/questions" ? { ...item, badge: openQuestions } : item,
  );

  return (
    <nav
      className={
        orientation === "vertical"
          ? "flex flex-col gap-1"
          : "flex items-center gap-1 overflow-x-auto"
      }
      aria-label="Main"
    >
      {items.map((item) => {
        const active = isActive(pathname, item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-semibold transition-colors ${
              active
                ? "bg-spruce text-white"
                : "text-ink-soft hover:bg-spruce-wash hover:text-ink"
            }`}
          >
            <Icon className="h-4 w-4" />
            {item.label}
            {item.badge != null && item.badge > 0 && (
              <span
                className={`ml-auto flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[11px] font-bold ${
                  active ? "bg-white/20 text-white" : "bg-attention-soft text-attention"
                }`}
              >
                {item.badge}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}

export function Wordmark() {
  return (
    <span className="flex items-baseline gap-1.5">
      <span className="font-display text-xl font-semibold tracking-tight text-ink">
        Meridian
      </span>
      <span className="h-1.5 w-1.5 rounded-full bg-spruce" aria-hidden="true" />
    </span>
  );
}
