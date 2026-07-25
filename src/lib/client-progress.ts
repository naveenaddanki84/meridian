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
  /** Dave's day-one questionnaire: how many questions he's answered. */
  daveAnswered: number;
  daveQuestionnaireDone: boolean;
  daveDocsStarted: boolean;
}

const KEY = "meridian.client-progress";
const EVENT = "meridian-progress-change";

const DEFAULT_PROGRESS: ClientProgress = {
  k1Uploaded: false,
  questionAnswered: false,
  daveAnswered: 0,
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
      daveAnswered: typeof parsed.daveAnswered === "number" ? parsed.daveAnswered : 0,
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
