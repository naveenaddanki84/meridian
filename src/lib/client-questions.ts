import type { Message, Thread } from "@/data/types";
import type { ClientProgress } from "@/lib/client-progress";

/**
 * How many things still need the client (Challenge 03). The nav badge and
 * the "Questions for you" header both read this, so a question the
 * preparer sends mid-demo shows up in both places at once.
 *
 * The two seeded threads are tracked through the progress flags they set
 * (answering the receipt question, uploading the K-1); anything raised
 * during the demo is counted from the shared thread store.
 */

type ExtraMessages = Readonly<Record<string, readonly Message[]>>;

const SEEDED_OPEN = 2;

export function isThreadAnsweredBy(
  thread: Thread,
  extras: ExtraMessages,
  clientId: string,
): boolean {
  const replies = [...thread.messages, ...(extras[thread.id] ?? [])];
  return replies.some((m) => m.authorId === clientId);
}

export function countOpenClientQuestions({
  progress,
  extras,
  sharedThreads,
  returnId,
  clientId,
}: {
  progress: ClientProgress;
  extras: ExtraMessages;
  sharedThreads: readonly Thread[];
  returnId: string;
  clientId: string;
}): number {
  const seededDone =
    (progress.questionAnswered ? 1 : 0) + (progress.k1Uploaded ? 1 : 0);

  const raisedDuringDemo = sharedThreads.filter(
    (t) =>
      t.returnId === returnId &&
      t.visibility === "client" &&
      t.status !== "resolved" &&
      !isThreadAnsweredBy(t, extras, clientId),
  ).length;

  return SEEDED_OPEN - seededDone + raisedDuringDemo;
}
