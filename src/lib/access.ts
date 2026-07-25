import type { Persona, TaxReturn } from "@/data/types";

/**
 * Who may open which return (Challenge 05). Seasonal staff are scoped to
 * the returns assigned to them; everyone else on staff sees the firm.
 * Clients never reach these screens at all — the shell stops them first.
 */
export function canOpenReturn(persona: Persona, ret: TaxReturn): boolean {
  if (persona.role === "client") return false;
  if (persona.accessScope !== "assigned") return true;
  return ret.assigneeId === persona.id;
}

/** Who a scoped user asks for access. */
export const ACCESS_APPROVER = {
  name: "Linda Brooks",
  role: "Firm admin",
  initials: "LB",
} as const;
