"use client";

import { useEffect, useState } from "react";

/**
 * Shared client onboarding progress (Challenge 03): finishing a task on
 * one page updates the checklist, the nav badge, and the home screen —
 * so the interface visibly changes as onboarding completes.
 */

export interface ClientProgress {
  k1Uploaded: boolean;
  questionAnswered: boolean;
  /**
   * Dave's day-one questionnaire. The answers themselves are the source
   * of truth — a separate count drifts out of sync the moment someone
   * leaves the page and comes back.
   */
  daveAnswers: Readonly<Record<string, string>>;
  daveQuestionnaireDone: boolean;
  daveDocsStarted: boolean;
}

const KEY = "meridian.client-progress";
const EVENT = "meridian-progress-change";

const DEFAULT_PROGRESS: ClientProgress = {
  k1Uploaded: false,
  questionAnswered: false,
  daveAnswers: {},
  daveQuestionnaireDone: false,
  daveDocsStarted: false,
};

export function readProgress(): ClientProgress {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return DEFAULT_PROGRESS;
    const parsed = JSON.parse(raw) as Partial<ClientProgress>;
    return {
      k1Uploaded: parsed.k1Uploaded === true,
      questionAnswered: parsed.questionAnswered === true,
      daveAnswers:
        parsed.daveAnswers && typeof parsed.daveAnswers === "object"
          ? parsed.daveAnswers
          : {},
      daveQuestionnaireDone: parsed.daveQuestionnaireDone === true,
      daveDocsStarted: parsed.daveDocsStarted === true,
    };
  } catch {
    return DEFAULT_PROGRESS;
  }
}

export function updateProgress(patch: Partial<ClientProgress>): void {
  try {
    const next = { ...readProgress(), ...patch };
    window.localStorage.setItem(KEY, JSON.stringify(next));
    window.dispatchEvent(new Event(EVENT));
  } catch {
    // Storage unavailable — progress just won't persist.
  }
}

export function useClientProgress(): ClientProgress {
  const [progress, setProgress] = useState<ClientProgress>(DEFAULT_PROGRESS);

  useEffect(() => {
    const sync = () => setProgress(readProgress());
    sync();
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return progress;
}
