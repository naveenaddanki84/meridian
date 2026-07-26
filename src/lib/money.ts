/**
 * Correcting an AI value is the one place a human types a number into
 * the return, so it is also the one place that has to be validated.
 * Accepting "" or "abcd" would silently replace a real figure with junk.
 */

/** True when a field's current value reads as a dollar figure. */
export function looksLikeMoney(value: string): boolean {
  return /^-?\$?[\d,]+(\.\d+)?$/.test(value.trim());
}

export function formatMoney(amount: number): string {
  return amount.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
}

export interface CorrectionResult {
  ok: boolean;
  /** Normalised value to store, when ok. */
  value?: string;
  /** Plain-English reason, when not. */
  error?: string;
}

/**
 * Validates a typed correction against the shape of the value it replaces:
 * money stays money, everything else just has to be non-empty.
 */
export function validateCorrection(draft: string, currentValue: string): CorrectionResult {
  const trimmed = draft.trim();

  if (!trimmed) {
    return { ok: false, error: "Enter a value — this can't be left blank." };
  }

  if (!looksLikeMoney(currentValue)) {
    return { ok: true, value: trimmed };
  }

  const numeric = Number(trimmed.replace(/[$,\s]/g, ""));
  if (!Number.isFinite(numeric)) {
    return { ok: false, error: "Use a number, like 300 or 1,250.50." };
  }
  if (numeric < 0) {
    return { ok: false, error: "This figure can't be negative." };
  }

  return { ok: true, value: formatMoney(numeric) };
}
