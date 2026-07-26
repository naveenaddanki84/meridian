/**
 * "Return to where I was" support (Challenge 04). When a user leaves the
 * review workspace to follow a related object, we remember the spot so a
 * one-click chip can bring them back.
 */

export interface WorkspaceSpot {
  label: string;
  href: string;
  /**
   * Who left this spot. Switching persona clears it, but the workspace can
   * re-record it on the way out — the outgoing screen re-renders under the
   * incoming persona before the route changes. Stamping the owner means the
   * chip is only ever offered back to the person who actually left it.
   */
  personaId: string;
}

const KEY = "meridian.workspace-spot";

export function rememberSpot(spot: WorkspaceSpot): void {
  try {
    window.sessionStorage.setItem(KEY, JSON.stringify(spot));
  } catch {
    // Storage unavailable (private mode) — the chip simply won't appear.
  }
}

export function recallSpot(): WorkspaceSpot | null {
  try {
    const raw = window.sessionStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<WorkspaceSpot>;
    if (
      typeof parsed.label !== "string" ||
      typeof parsed.href !== "string" ||
      typeof parsed.personaId !== "string"
    ) {
      return null;
    }
    return { label: parsed.label, href: parsed.href, personaId: parsed.personaId };
  } catch {
    return null;
  }
}

export function clearSpot(): void {
  try {
    window.sessionStorage.removeItem(KEY);
  } catch {
    // Ignore — nothing to clear.
  }
}
