"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, Check, Clock3, Lock, Send } from "lucide-react";
import type { Persona, TaxReturn } from "@/data/types";
import { ACCESS_APPROVER } from "@/lib/access";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

/**
 * A locked door with a doorbell (Challenge 05): scoped staff are told
 * plainly why they can't open a return, who owns that decision, and can
 * request access without leaving the page.
 */
export function AccessDenied({
  persona,
  ret,
}: {
  persona: Persona;
  ret: TaxReturn;
}) {
  const [requested, setRequested] = useState(false);
  const [reason, setReason] = useState("");
  const { notify } = useToast();

  const request = () => {
    setRequested(true);
    notify(`Access request sent to ${ACCESS_APPROVER.name}`, { tone: "info" });
  };

  return (
    <div className="mx-auto max-w-lg py-10">
      <Link
        href="/staff"
        className="mb-6 inline-flex items-center gap-1 text-[12px] font-semibold text-ink-faint hover:text-spruce"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to your queue
      </Link>

      <div className="rounded-2xl border border-line bg-card p-6 shadow-lift">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-locked-soft">
            <Lock className="h-5 w-5 text-locked" />
          </span>
          <div>
            <h1 className="font-display text-xl text-ink">
              {ret.clientName}&apos;s return isn&apos;t yours to open
            </h1>
            <p className="text-[12px] text-ink-faint">
              {ret.year} {ret.form} · assigned to {ret.assigneeId === "mike" ? "Mike Sullivan" : ret.assigneeId}
            </p>
          </div>
        </div>

        <p className="mt-4 text-[13px] leading-relaxed text-ink-soft">
          Your seasonal account covers only the returns assigned to you, so
          client records stay closed by default. If you need this one — to cover
          a deadline or pick up someone&apos;s work — ask{" "}
          {ACCESS_APPROVER.name}, who manages assignments.
        </p>

        {requested ? (
          <div className="mt-5 rounded-xl border border-verified/30 bg-verified-soft p-4">
            <p className="flex items-center gap-2 text-[13px] font-semibold text-verified">
              <Check className="h-4 w-4" />
              Request sent to {ACCESS_APPROVER.name}
            </p>
            <p className="mt-1 flex items-center gap-1.5 text-[12px] text-ink-soft">
              <Clock3 className="h-3.5 w-3.5" />
              You&apos;ll get an email the moment she approves it. Nothing else
              to do.
            </p>
          </div>
        ) : (
          <div className="mt-5">
            <label
              htmlFor="access-reason"
              className="mb-1.5 block text-[12px] font-semibold text-ink"
            >
              Why do you need it? <span className="font-normal text-ink-faint">(optional)</span>
            </label>
            <textarea
              id="access-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={2}
              placeholder="Covering for Mike while he's out this week"
              className="w-full resize-none rounded-lg border border-line bg-white px-3 py-2 text-[13px] outline-none focus:border-spruce"
            />
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Button variant="primary" onClick={request}>
                <Send className="h-3.5 w-3.5" />
                Request access from {ACCESS_APPROVER.name.split(" ")[0]}
              </Button>
              <Link href="/staff">
                <Button variant="ghost">Back to your queue</Button>
              </Link>
            </div>
          </div>
        )}

        <p className="mt-5 border-t border-line pt-4 text-[12px] leading-relaxed text-ink-faint">
          Signed in as {persona.name} · {persona.title}
        </p>
      </div>
    </div>
  );
}
