import type { TaxReturn } from "@/data/types";
import { daysUntil } from "./format";

/**
 * Real prioritization logic over the fake dataset (Challenge 07).
 * Every score comes with human-readable reasons so the dashboard can
 * always answer "why this one first?".
 */

export interface PriorityReason {
  text: string;
  weight: number;
  tone: "danger" | "attention" | "ai" | "neutral";
}

export interface RankedReturn {
  ret: TaxReturn;
  score: number;
  reasons: readonly PriorityReason[];
  /** The single next action a preparer should take. */
  action: string;
}

function nextAction(ret: TaxReturn): string {
  if (ret.unreadClientReply) return "Read client reply";
  if (ret.stage === "internal_review") return "Review return";
  if (ret.aiFlags > 0) return "Verify AI flags";
  if (ret.blockedOn === "client" && ret.blockedDays >= 7) return "Nudge client";
  if (ret.stage === "docs_needed") return "Check missing docs";
  if (ret.stage === "client_approval") return "Follow up on signature";
  if (ret.stage === "getting_started") return "Send questionnaire";
  return "Continue preparing";
}

export function rankReturn(ret: TaxReturn): RankedReturn {
  const reasons: PriorityReason[] = [];
  const deadlineDays = daysUntil(ret.deadline);

  if (deadlineDays < 0) {
    reasons.push({ text: `${Math.abs(deadlineDays)} days overdue`, weight: 60, tone: "danger" });
  } else if (deadlineDays <= 7) {
    reasons.push({ text: `Deadline in ${deadlineDays} days`, weight: 40, tone: "danger" });
  } else if (deadlineDays <= 21) {
    reasons.push({ text: `Deadline in ${deadlineDays} days`, weight: 18, tone: "attention" });
  }

  if (ret.unreadClientReply) {
    reasons.push({ text: "Client replied — unread", weight: 30, tone: "attention" });
  }
  if (ret.aiFlags > 0) {
    reasons.push({
      text: `${ret.aiFlags} AI ${ret.aiFlags === 1 ? "value" : "values"} to verify`,
      weight: 6 * ret.aiFlags,
      tone: "ai",
    });
  }
  if (ret.blockedOn === "client" && ret.blockedDays >= 7) {
    reasons.push({
      text: `Waiting on client ${ret.blockedDays} days`,
      weight: Math.min(24, ret.blockedDays * 2),
      tone: "attention",
    });
  }
  if (ret.stage === "internal_review") {
    reasons.push({ text: "Ready for review", weight: 14, tone: "neutral" });
  }
  if (ret.openQuestions > 0) {
    reasons.push({
      text: `${ret.openQuestions} open ${ret.openQuestions === 1 ? "question" : "questions"}`,
      weight: 4 * ret.openQuestions,
      tone: "neutral",
    });
  }

  const score = ret.locked ? 0 : reasons.reduce((sum, r) => sum + r.weight, 0);
  const topReasons = [...reasons].sort((a, b) => b.weight - a.weight).slice(0, 3);

  return { ret, score, reasons: topReasons, action: nextAction(ret) };
}

export function rankReturns(returns: readonly TaxReturn[]): readonly RankedReturn[] {
  return returns
    .map(rankReturn)
    .filter((r) => !r.ret.locked)
    .sort((a, b) => b.score - a.score);
}
