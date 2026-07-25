import type { Persona } from "./types";

/**
 * Demo personas (Challenge 05). Emily and Mike are fully wired;
 * the others exist to show the role architecture without splintering
 * the product into six apps.
 */
export const PERSONAS: readonly Persona[] = [
  {
    id: "emily",
    name: "Emily Carter",
    role: "client",
    title: "Client · first tax season with the firm",
    initials: "EC",
  },
  {
    id: "mike",
    name: "Mike Sullivan",
    role: "preparer",
    title: "Senior preparer · deep in the season",
    initials: "MS",
    alsoClientOfReturnId: "ret-mike",
  },
  {
    id: "sarah",
    name: "Sarah Mitchell",
    role: "reviewer",
    title: "Reviewer · signs off before filing",
    initials: "SM",
  },
  {
    id: "linda",
    name: "Linda Brooks",
    role: "admin",
    title: "Firm admin · staffing and deadlines",
    initials: "LB",
  },
  {
    id: "dave",
    name: "Dave Peterson",
    role: "client",
    title: "Business owner · 1120-S for Peterson Coffee",
    initials: "DP",
  },
  {
    id: "katie",
    name: "Katie Brennan",
    role: "preparer",
    title: "Seasonal staff · only assigned returns",
    initials: "KB",
  },
] as const;

export const personaById = (id: string): Persona => {
  const persona = PERSONAS.find((p) => p.id === id);
  if (!persona) throw new Error(`Unknown persona: ${id}`);
  return persona;
};
