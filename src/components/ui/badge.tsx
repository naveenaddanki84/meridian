import { Check, Lock, PencilLine, Sparkles, Stamp, TriangleAlert } from "lucide-react";
import type { FieldState } from "@/data/types";

export type Tone = "ai" | "verified" | "attention" | "danger" | "locked" | "neutral" | "brand";

const TONE_CLASSES: Record<Tone, string> = {
  ai: "bg-ai-soft text-ai",
  verified: "bg-verified-soft text-verified",
  attention: "bg-attention-soft text-attention",
  danger: "bg-danger-soft text-danger",
  locked: "bg-locked-soft text-locked",
  neutral: "bg-paper text-ink-soft",
  brand: "bg-spruce-soft text-spruce",
};

export function Badge({
  tone = "neutral",
  children,
  className = "",
}: {
  tone?: Tone;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[12px] font-semibold ${TONE_CLASSES[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

interface StateStyle {
  tone: Tone;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

/**
 * The affordance language (Challenge 08): one visual vocabulary for data
 * states, used identically on every screen.
 */
export const FIELD_STATE_STYLE: Record<FieldState, StateStyle> = {
  ai_generated: { tone: "ai", label: "AI · unverified", icon: Sparkles },
  needs_review: { tone: "attention", label: "Check this", icon: TriangleAlert },
  needs_approval: { tone: "brand", label: "Needs approval", icon: Stamp },
  verified: { tone: "verified", label: "Verified", icon: Check },
  edited: { tone: "neutral", label: "Edited", icon: PencilLine },
  locked: { tone: "locked", label: "Locked", icon: Lock },
};

export function StateBadge({ state }: { state: FieldState }) {
  const style = FIELD_STATE_STYLE[state];
  const Icon = style.icon;
  return (
    <Badge tone={style.tone}>
      <Icon className="h-3 w-3" />
      {style.label}
    </Badge>
  );
}
