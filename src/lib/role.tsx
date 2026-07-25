"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { PERSONAS, personaById } from "@/data/people";
import { clearSpot } from "@/lib/workspace-chip";
import type { Persona } from "@/data/types";

interface RoleContextValue {
  persona: Persona;
  switchPersona: (id: string) => void;
}

const RoleContext = createContext<RoleContextValue | null>(null);

const STORAGE_KEY = "meridian.persona";

/**
 * Demo stand-in for authentication: the active persona drives navigation,
 * permissions, and copy (Challenge 05). Defaults per shell so deep links
 * still land somewhere sensible.
 */
export function RoleProvider({
  defaultPersonaId,
  children,
}: {
  defaultPersonaId: string;
  children: React.ReactNode;
}) {
  const [personaId, setPersonaId] = useState(defaultPersonaId);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored && PERSONAS.some((p) => p.id === stored)) {
      setPersonaId(stored);
    }
  }, []);

  const switchPersona = useCallback((id: string) => {
    if (!PERSONAS.some((p) => p.id === id)) return;
    window.localStorage.setItem(STORAGE_KEY, id);
    // "Back to where I was" belongs to a person, not a browser tab.
    clearSpot();
    setPersonaId(id);
  }, []);

  return (
    <RoleContext.Provider value={{ persona: personaById(personaId), switchPersona }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole(): RoleContextValue {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error("useRole must be used inside a RoleProvider");
  return ctx;
}

export function rememberPersona(id: string) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, id);
    clearSpot();
  }
}
