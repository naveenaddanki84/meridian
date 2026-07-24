/**
 * Core entity types for the Meridian prototype.
 * All data is fabricated; shapes mirror what a real FastAPI + Supabase
 * backend would serve (see README "Path to production").
 */

export type RoleId = "client" | "preparer" | "reviewer" | "admin";

export interface Persona {
  id: string;
  name: string;
  role: RoleId;
  title: string;
  initials: string;
  /** A second role this person can switch into (Challenge 05). */
  alsoClientOfReturnId?: string;
}

export type StageId =
  | "getting_started"
  | "docs_needed"
  | "in_preparation"
  | "internal_review"
  | "client_approval"
  | "filed";

export interface StageDef {
  id: StageId;
  order: number;
  staffLabel: string;
  clientLabel: string;
  /** Plain-English sentence a client sees. */
  clientDescription: string;
  staffSubstages: readonly string[];
}

export interface TaxReturn {
  id: string;
  clientName: string;
  clientInitials: string;
  year: number;
  form: string;
  stage: StageId;
  substageIndex: number;
  /** ISO date the return must be filed by. */
  deadline: string;
  assigneeId: string;
  blockedOn: "client" | "staff" | null;
  blockedDays: number;
  docsReceived: number;
  docsExpected: number;
  openQuestions: number;
  /** AI-extracted fields still awaiting human verification. */
  aiFlags: number;
  /** True when the client replied and staff hasn't read it. */
  unreadClientReply: boolean;
  lastActivity: string;
  locked: boolean;
}

export type DocumentStatus = "needed" | "uploaded" | "processed";

export interface SourceBox {
  id: string;
  /** Form box label, e.g. "Box 1 — Wages". */
  label: string;
  page: number;
  /** Position as % of the rendered page. */
  x: number;
  y: number;
  w: number;
  h: number;
  value: string;
}

export interface TaxDocument {
  id: string;
  returnId: string;
  clientName: string;
  title: string;
  kind: string;
  issuer: string;
  status: DocumentStatus;
  uploadedAt: string | null;
  pages: number;
  boxes: readonly SourceBox[];
}

export type FieldState =
  | "ai_generated"
  | "needs_review"
  | "verified"
  | "edited"
  | "locked";

export interface FieldSource {
  kind: "document" | "calculation" | "rule" | "client_answer";
  documentId?: string;
  boxId?: string;
  page?: number;
  /** For calculations: human-readable formula and its inputs. */
  formula?: string;
  inputs?: readonly { label: string; value: string; fieldId?: string }[];
  /** For rule-based values, why it is what it is. */
  ruleNote?: string;
  /** For client answers, where the answer came from. */
  clientNote?: string;
}

export interface AiMeta {
  /** 0..1 — how sure the (simulated) model is. */
  confidence: number;
  extractedValue: string;
  note?: string;
}

export interface ReturnField {
  id: string;
  returnId: string;
  section: string;
  label: string;
  /** Where it lives on the form, e.g. "1040 · Line 1a". */
  formRef: string;
  value: string;
  state: FieldState;
  source: FieldSource;
  ai?: AiMeta;
  verifiedBy?: string;
  editedBy?: string;
  lockedReason?: string;
}

export type ThreadStatus = "open" | "waiting_client" | "resolved";

export interface ThreadAnchor {
  type: "field" | "document" | "return";
  id: string;
  label: string;
}

export interface Message {
  id: string;
  authorId: string;
  body: string;
  sentAt: string;
}

export interface Thread {
  id: string;
  returnId: string;
  anchor: ThreadAnchor;
  visibility: "internal" | "client";
  subject: string;
  nextActionOwner: "client" | "staff" | "done";
  status: ThreadStatus;
  messages: readonly Message[];
}

export interface ChecklistItem {
  id: string;
  title: string;
  detail: string;
  minutes: number;
  done: boolean;
  href: string;
}
