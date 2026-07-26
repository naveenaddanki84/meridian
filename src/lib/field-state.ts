import type { FieldState, ReturnField } from "@/data/types";

/**
 * One definition of "the AI put this here and no human has signed off".
 * The queue count in the review workspace and the `aiFlags` badge on the
 * dashboard both derive from this, so they can never drift apart.
 */
const UNVERIFIED_STATES: readonly FieldState[] = [
  "ai_generated",
  "needs_review",
  "needs_approval",
];

export function isUnverified(field: ReturnField): boolean {
  return UNVERIFIED_STATES.includes(field.state);
}

export function countUnverified(fields: readonly ReturnField[]): number {
  return fields.filter(isUnverified).length;
}
