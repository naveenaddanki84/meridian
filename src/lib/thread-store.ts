"use client";

import { useEffect, useState } from "react";
import type { Message } from "@/data/types";

/**
 * Shared message store (Challenge 02): replies written in one role's view
 * appear in the other's — Emily's answer lands in Mike's conversation
 * panel and vice versa. localStorage stands in for the realtime backend.
 */

type ExtraMessages = Readonly<Record<string, readonly Message[]>>;

const KEY = "meridian.thread-messages.v2";
const EVENT = "meridian-threads-change";

export function readExtraMessages(): ExtraMessages {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as ExtraMessages;
    return typeof parsed === "object" && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

export function addSharedMessage(threadId: string, message: Message): void {
  try {
    const current = readExtraMessages();
    const next = {
      ...current,
      [threadId]: [...(current[threadId] ?? []), message],
    };
    window.localStorage.setItem(KEY, JSON.stringify(next));
    window.dispatchEvent(new Event(EVENT));
  } catch {
    // Storage unavailable — the reply stays local to this page.
  }
}

export function useExtraMessages(): ExtraMessages {
  const [extras, setExtras] = useState<ExtraMessages>({});

  useEffect(() => {
    const sync = () => setExtras(readExtraMessages());
    sync();
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return extras;
}

/** True when the client has replied on any thread of this return. */
export function hasClientReply(extras: ExtraMessages, clientId: string): boolean {
  return Object.values(extras).some((messages) =>
    messages.some((m) => m.authorId === clientId),
  );
}
