/**
 * "Return to where I was" support (Challenge 04). When a user leaves the
 * review workspace to follow a related object, we remember the spot so a
 * one-click chip can bring them back.
 */

export interface WorkspaceSpot {
  label: string;
  href: string;
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
    if (typeof parsed.label !== "string" || typeof parsed.href !== "string") return null;
    return { label: parsed.label, href: parsed.href };
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
