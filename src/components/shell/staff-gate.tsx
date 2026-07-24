"use client";

import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { useRole } from "@/lib/role";
import { Button } from "@/components/ui/button";

/**
 * Permissions, communicated instead of hidden (Challenge 05): a client
 * who lands on a firm URL is told plainly what their login includes —
 * no mystery 404s.
 */
export function StaffGate({ children }: { children: React.ReactNode }) {
  const { persona } = useRole();

  if (persona.role !== "client") return <>{children}</>;

  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-3 py-24 text-center">
      <ShieldAlert className="h-8 w-8 text-ink-faint" />
      <h1 className="font-display text-2xl text-ink">This part is for the firm</h1>
      <p className="text-sm leading-relaxed text-ink-soft">
        {persona.name.split(" ")[0]}, your login covers your own tax return —
        firm tools like other clients&apos; returns aren&apos;t part of it.
        Everything you need lives on your home page.
      </p>
      <Link href="/client" className="mt-2">
        <Button variant="primary">Go to your home</Button>
      </Link>
    </div>
  );
}
