import type { Persona } from "./types";

/**
 * Demo personas (Challenge 05). Priya and Marcus are fully wired;
 * the others exist to show the role architecture without splintering
 * the product into six apps.
 */
export const PERSONAS: readonly Persona[] = [
  {
    id: "priya",
    name: "Priya Sharma",
    role: "client",
    title: "Client · first tax season with the firm",
    initials: "PS",
  },
  {
    id: "marcus",
    name: "Marcus Bell",
    role: "preparer",
    title: "Senior preparer · deep in the season",
    initials: "MB",
    alsoClientOfReturnId: "ret-marcus",
  },
  {
    id: "dana",
    name: "Dana Okafor",
    role: "reviewer",
    title: "Reviewer · signs off before filing",
    initials: "DO",
  },
  {
    id: "ruth",
    name: "Ruth Alvarez",
    role: "admin",
    title: "Firm admin · staffing and deadlines",
    initials: "RA",
  },
  {
    id: "ben",
    name: "Ben Carver",
    role: "client",
    title: "Business owner · 1120-S for Carver Coffee",
    initials: "BC",
  },
  {
    id: "kim",
    name: "Kim Falk",
    role: "preparer",
    title: "Seasonal staff · only assigned returns",
    initials: "KF",
  },
] as const;

export const personaById = (id: string): Persona => {
  const persona = PERSONAS.find((p) => p.id === id);
  if (!persona) throw new Error(`Unknown persona: ${id}`);
  return persona;
};
