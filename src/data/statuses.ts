import type { StageDef, StageId } from "./types";

/**
 * One canonical state machine. Clients and staff see the SAME state
 * rendered in two vocabularies (Challenge 06): staff get substages,
 * clients get plain English and a five-step journey.
 */
export const STAGES: readonly StageDef[] = [
  {
    id: "getting_started",
    order: 0,
    staffLabel: "Intake",
    clientLabel: "Getting started",
    clientDescription: "Tell us about your year and share your documents.",
    staffSubstages: ["Engagement letter", "Questionnaire sent", "Questionnaire returned"],
  },
  {
    id: "docs_needed",
    order: 1,
    staffLabel: "Docs needed",
    clientLabel: "We need a few things",
    clientDescription: "We're waiting on one or more documents from you.",
    staffSubstages: ["Request sent", "Partial docs in", "Reminder sent"],
  },
  {
    id: "in_preparation",
    order: 2,
    staffLabel: "In preparation",
    clientLabel: "We're working on it",
    clientDescription: "Your preparer is building your return. Nothing needed from you right now.",
    staffSubstages: ["AI extraction", "Preparer review", "Open questions resolved"],
  },
  {
    id: "internal_review",
    order: 3,
    staffLabel: "Internal review",
    clientLabel: "We're working on it",
    clientDescription: "A second set of eyes is double-checking every number.",
    staffSubstages: ["Assigned to reviewer", "Changes requested", "Reviewer sign-off"],
  },
  {
    id: "client_approval",
    order: 4,
    staffLabel: "Client approval",
    clientLabel: "Your turn to review",
    clientDescription: "Your return is ready. Review it and sign so we can file.",
    staffSubstages: ["Sent for signature", "Viewed by client", "Signed"],
  },
  {
    id: "filed",
    order: 5,
    staffLabel: "Filed",
    clientLabel: "Filed",
    clientDescription: "Your return has been filed with the IRS. You're done for the year.",
    staffSubstages: ["E-filed", "IRS accepted"],
  },
] as const;

export const stageById = (id: StageId): StageDef => {
  const stage = STAGES.find((s) => s.id === id);
  if (!stage) throw new Error(`Unknown stage: ${id}`);
  return stage;
};

/** The client journey collapses six internal stages into five friendly steps. */
export const CLIENT_JOURNEY: readonly { label: string; stages: readonly StageId[] }[] = [
  { label: "Getting started", stages: ["getting_started"] },
  { label: "Your documents", stages: ["docs_needed"] },
  { label: "We prepare", stages: ["in_preparation", "internal_review"] },
  { label: "You approve", stages: ["client_approval"] },
  { label: "Filed", stages: ["filed"] },
] as const;
