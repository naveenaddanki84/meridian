import type { StageId, TaxDocument, TaxReturn } from "./types";
import { daveDocuments, daveReturn, heroDocuments, heroReturn } from "./hero";

/**
 * Deterministic fake-data generator. Seeded PRNG so the server and client
 * always render the identical dataset (no hydration drift) and the demo
 * is repeatable. Volume exists to prove Challenge 09 at ~4,000 documents.
 */
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(20260302);

const pick = <T,>(arr: readonly T[]): T => arr[Math.floor(rand() * arr.length)];
const randInt = (min: number, max: number) => min + Math.floor(rand() * (max - min + 1));

const FIRST = ["Alex", "Jordan", "Sam", "Wei", "Elena", "Noah", "Grace", "Omar", "Lucía", "Ken", "Maya", "Tom", "Ana", "Raj", "June", "Leo", "Ivy", "Hugo", "Nina", "Cole", "Rosa", "Finn", "Zoe"] as const;
const LAST = ["Chen", "Alvarez", "Kim", "Okafor", "Rossi", "Novak", "Patel", "Berg", "Silva", "Moreau", "Tanaka", "Ford", "Haddad", "Klein", "Osei", "Vargas", "Lund", "Bishop", "Nguyen", "Castro", "Duarte", "Reyes", "Malik"] as const;
const FORMS = ["1040", "1040", "1040", "1120-S", "1065", "1040 + Sch C"] as const;
const DOC_KINDS = ["W-2", "1099-INT", "1099-DIV", "1099-B", "1099-NEC", "1098", "K-1", "Receipt", "Bank statement", "Prior return"] as const;
const ISSUERS = ["First Harbor Bank", "Vanguard", "Fidelity", "Chase", "Northline Mortgage", "Gusto Payroll", "Redwood Partners", "Stripe", "Cedar Point HOA", "Self-prepared"] as const;

const STAGE_POOL: readonly StageId[] = [
  "getting_started",
  "docs_needed", "docs_needed", "docs_needed",
  "in_preparation", "in_preparation", "in_preparation", "in_preparation",
  "internal_review", "internal_review",
  "client_approval",
  "filed",
];

const PREPARERS = ["mike", "mike", "mike", "rachel", "rachel", "james", "katie"] as const;

function isoDay(monthIndex: number, day: number, year = 2026): string {
  const mm = String(monthIndex).padStart(2, "0");
  const dd = String(day).padStart(2, "0");
  return `${year}-${mm}-${dd}`;
}

/**
 * Volume matters (Ch 07/09): the brief asks for a dashboard that stays
 * usable when one person owns HUNDREDS of returns — so Mike owns ~200
 * of ~500, and the documents list runs to several thousand.
 */
const RETURN_COUNT = 500;

function buildReturns(): readonly TaxReturn[] {
  const generated = Array.from({ length: RETURN_COUNT }, (_, i): TaxReturn => {
    const first = FIRST[i % FIRST.length];
    // Decorrelate so name pairs don't repeat in lockstep.
    const last = LAST[(i * 7 + Math.floor(i / FIRST.length)) % LAST.length];
    const stage = STAGE_POOL[i % STAGE_POOL.length];
    const blockedOnClient = stage === "docs_needed" || (stage === "client_approval" && rand() > 0.4);
    const docsExpected = randInt(4, 12);
    const docsReceived = stage === "getting_started" ? 0 : blockedOnClient ? randInt(1, docsExpected - 1) : docsExpected;
    // A few returns are genuinely overdue — the edge case must exist.
    const deadline =
      i % 23 === 5
        ? isoDay(2, randInt(20, 27))
        : i % 7 === 3
          ? isoDay(3, randInt(3, 14))
          : isoDay(4, randInt(1, 15));
    return {
      id: `ret-${i + 1}`,
      clientName: `${first} ${last}`,
      clientInitials: `${first[0]}${last[0]}`,
      year: 2025,
      form: pick(FORMS),
      stage,
      substageIndex: randInt(0, 2),
      deadline,
      assigneeId: pick(PREPARERS),
      blockedOn: blockedOnClient ? "client" : stage === "internal_review" ? "staff" : null,
      blockedDays: blockedOnClient ? randInt(1, 16) : 0,
      docsReceived,
      docsExpected,
      openQuestions: stage === "getting_started" ? 0 : randInt(0, 3),
      aiFlags: stage === "in_preparation" || stage === "internal_review" ? randInt(0, 5) : 0,
      unreadClientReply: !blockedOnClient && rand() > 0.78,
      lastActivity: isoDay(2, randInt(18, 28)),
      locked: stage === "filed",
    };
  });

  const mikePersonal: TaxReturn = {
    id: "ret-mike",
    clientName: "Mike Sullivan",
    clientInitials: "MS",
    year: 2025,
    form: "1040",
    stage: "docs_needed",
    substageIndex: 1,
    deadline: isoDay(4, 15),
    assigneeId: "rachel",
    blockedOn: "client",
    blockedDays: 4,
    docsReceived: 2,
    docsExpected: 6,
    openQuestions: 1,
    aiFlags: 0,
    unreadClientReply: false,
    lastActivity: isoDay(2, 26),
    locked: false,
  };

  return [heroReturn, daveReturn, ...generated, mikePersonal];
}

function buildDocuments(returns: readonly TaxReturn[]): readonly TaxDocument[] {
  const generated = returns
    .filter((r) => r.id !== heroReturn.id && r.id !== "ret-mike" && r.id !== daveReturn.id)
    .flatMap((r) => {
      const count = randInt(5, 11);
      return Array.from({ length: count }, (_, j): TaxDocument => {
        const kind = pick(DOC_KINDS);
        const issuer = pick(ISSUERS);
        const received = j < r.docsReceived || r.docsReceived >= r.docsExpected;
        return {
          id: `${r.id}-doc-${j + 1}`,
          returnId: r.id,
          clientName: r.clientName,
          title: `${kind} — ${issuer}`,
          kind,
          issuer,
          status: !received ? "needed" : rand() > 0.25 ? "processed" : "uploaded",
          uploadedAt: received ? isoDay(2, randInt(1, 28)) : null,
          pages: received ? randInt(1, 6) : 0,
          boxes: [],
        };
      });
    });

  return [...heroDocuments, ...daveDocuments, ...generated];
}

export const ALL_RETURNS: readonly TaxReturn[] = buildReturns();
export const ALL_DOCUMENTS: readonly TaxDocument[] = buildDocuments(ALL_RETURNS);
