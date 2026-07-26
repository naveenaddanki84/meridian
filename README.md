# Meridian — every number has a receipt

A working prototype of an AI-powered tax platform for clients and the CPA firms
who serve them, built for the **AI Engineer case study** ("Designing an
AI-Powered Tax Platform From Scratch"). One cohesive product, two lenses: a calm,
plain-English experience for clients, and a deep, traceable workspace for
preparers. All ten challenges are covered.

**Live demo:** <https://meridian-gilt-ten.vercel.app> · **Video walkthrough:**
`TODO — paste recording link before submitting`

![Review workspace — tracing a wage figure back to Box 1 of the W-2](docs/screenshots/review-trace-w2.jpeg)

## The 60-second tour

1. **Pick a hat** on the landing page — six people, one product.
2. **As Mike (preparer):** the *Today* queue says what to work on and *why* →
   open Emily Carter → click **Wages and salary** → a thread draws from the
   field to Box 1 of her W-2, with a receipt-style card: what the AI read, how
   sure it is, and what to do about it → open **Charitable contributions**
   (amber, 62% confident, handwritten receipt) → *Fix it* → the correction is
   recorded, the AI's original stays on file, and there's an Undo.
3. **As Emily (client):** "2 things need you · about 4 min" → upload the missing
   K-1 and watch it get read → answer Mike's question about the donation with
   one tap. She never sees confidence scores, substages, or internal notes.
4. **As Dave (day one):** an account created this morning, nothing done yet.
   Answer six plain-language questions, one at a time, watch the home screen
   change as onboarding completes, then open **Your documents**: eight asks in
   his words, each with where to find it, unlocked only once the questions are
   answered.
5. **As Katie (seasonal):** open a return that isn't hers and the door is
   locked, with a working request-access flow to the firm admin — and her
   documents list and search are scoped the same way.

## Challenges covered → where to look

| # | Challenge | Where it lives | The one-line decision |
|---|-----------|----------------|----------------------|
| 01 | Source traceability | Review workspace | Click any value → a drawn thread + a highlight landing on the exact box of the **real PDF** (pdf.js, with the provenance overlay in the document's own coordinate space); calculations chain (click an input to keep tracing), and the receipt says when there's *no* AI involved |
| 02 | Client & CPA collaboration | Conversations panel · client "Questions for you" | Threads pin to fields/documents, are marked *Firm only* vs *Client can see*, and outstanding requests are tracked — grouped by whose move it is, with age |
| 03 | Where to start | Client home | One card: what needs you, how long it takes, in minutes — and the interface visibly changes as onboarding completes (finish everything and the checklist gives way to status) |
| 04 | Getting lost | Everywhere | URL-deep-linkable state, breadcrumbs, thread→field jumps, and a "Back to Emily's return" chip that survives any detour |
| 05 | Role-aware experiences | Role picker · persona menu · access control | Six personas, three genuinely different staff surfaces: preparers get a ranked queue, the reviewer a risk-first sign-off queue, the admin capacity and deadline operations. Seasonal staff are scoped to assigned returns across the workspace, the documents list, and search. A client hitting a firm URL gets a plain explanation, not a 404; Mike wears his client hat for his own return and the firm tools genuinely disappear |
| 06 | Status & progress | Client journey card · staff stage badges | One state machine, two renderings: five plain-English steps for clients, substages for staff |
| 07 | Actionable dashboard | Staff *Today* | Real ranking logic (deadlines, unread replies, AI flags, blocked days) over 503 returns (Mike owns 198 of them, 184 still open) — every card shows its reasons and one next action, and firm scope adds a workload-by-preparer strip for managers |
| 08 | Clickable vs. editable | The affordance system (Legend, top right) | Six states — AI·unverified / Check this / Needs approval / Verified / Edited / Locked — same marks on every screen; pencils appear only where editing is allowed; locks explain themselves |
| 09 | Complexity made navigable | Documents (4,028 seeded) · ⌘K search | Fold by client, cap what renders, cut with filters, narrow by typing; summary lists one click above full detail |
| 10 | Trustworthy AI | AI review notes · provenance cards · client copy | Recommendations and warnings with the why, evidence chips that highlight the exact box, and uncertainty in words; corrections are validated and keep the AI's original on record; clients get plain words, never percentages |

## What's real vs. simulated

**Real (working code):**
- Every interaction above: tracing, correction/verify/approve flows, threads and
  visibility rules, prioritization scoring, search, filters, deep links, role
  switching, the upload state machine
- **Real PDF rendering.** The source documents are actual PDFs in
  `public/documents/`, painted by pdf.js, with the provenance highlight as an
  overlay positioned in the document's coordinate space — the same architecture
  production uses, where the PDF is a stored artifact and extraction returns box
  coordinates. The artwork is generated from the app's own `/print/[docId]`
  route (`pnpm make-pdfs`), so the printed page and the overlay are laid out
  from one set of coordinates and cannot drift apart
- The dataset: 503 returns and 4,028 documents generated deterministically
  (seeded PRNG) so edge cases are guaranteed present — a 62%-confidence
  extraction, a client-reported value awaiting approval, locked fields, a filed
  and locked return, returns blocked on clients for days, overdue deadlines,
  empty states
- Onboarding progress is shared across pages: uploading the K-1 or answering a
  question updates the home checklist, the nav badge, and "what's next" — all
  three read the same counter, so they can't disagree
- The message loop crosses roles: answer as Emily and her reply appears in
  Mike's conversation panel with ownership flipped to "Firm's move", and his
  dashboard flags "Client replied — unread"; a question he raises shows up in
  her home checklist, her nav badge, and her questions page (localStorage
  stands in for the realtime backend)
- Two client states, deliberately: Emily is mid-season (so the review workspace
  has something to trace), Dave is on day one (so first-run can be shown from
  zero) — his six-question onboarding and his eight-document request list are
  real, and both drive his home screen, nav, and status
- Row-level permissions: seasonal staff are scoped to assigned returns; the
  check runs before any return data renders, the documents list and ⌘K search
  are filtered in the API layer the same way, and the request-access flow names
  the admin who owns the decision
- Input validation where a human types into the return: corrections must be a
  number, are normalised to currency, and refuse empty with the reason inline
- A typed mock-API layer (`src/lib/api.ts`) with simulated latency — screens
  render real loading skeletons and a shared error surface if a fetch fails

**Simulated (by design — the brief asks for it):**
- OCR/document parsing: the PDFs are fabricated and their box coordinates are
  hand-authored, so "the AI read Box 1" is fabricated provenance data. The
  *rendering and overlay path* is real; the extraction that would produce those
  coordinates is not
- AI confidence scores and notes: hand-authored to exercise the trust UI
- Auth: the persona switcher stands in for login; permissions are enforced in
  the API layer (clients never receive internal threads), not by real auth
- Persistence: field corrections live in React state (refresh resets them);
  messages and onboarding progress persist in localStorage — the "Reset demo"
  button in the landing page's role section starts everything over
- The clock: the app lives on a fixed "today" (March 2, 2026) so deadlines read
  realistically

## Key design decisions (and why)

- **"Every number has a receipt."** Trust in AI output is the product's core
  problem, so provenance is the hero interaction, not a tooltip. The trace
  thread makes the connection literal.
- **Clients never see confidence scores.** A percentage creates doubt without
  giving a client any action. They see "we read this from your W-2 — does this
  look right?"; the 62% lives on the preparer's side, where someone can act on
  it.
- **One state machine, two vocabularies.** Status confusion comes from showing
  everyone the same words. The data model stores one state; the client and
  staff views render it differently on purpose.
- **The dashboard ranks, and says why.** Reason chips ("Deadline in 4 days",
  "Client replied — unread") are the anti-spreadsheet: a queue you can trust
  without rebuilding it yourself.
- **Affordance states are data, not styling.** `ai_generated | needs_review |
  needs_approval | verified | edited | locked` live on the field model; the UI
  renders them identically everywhere, and the Legend documents the language
  in-product.
- **Corrections don't argue.** Fixing an AI value takes one input; the original
  extraction stays visible on the record. The AI never defends itself — but the
  input is still validated, because a tax figure that isn't a number is a bug,
  not a preference.
- **The shell wins over the role.** Inside `/client`, a preparer wearing their
  client hat loses the firm rail *and* firm-wide search. A banner promising
  "firm tools are hidden here" has to be true, not reassuring.
- **Counts come from one source.** The unverified-value count on the dashboard
  is derived from the same predicate the workspace queue uses; open client
  questions are counted once and read by three surfaces. Two screens
  disagreeing about the same number is the fastest way to lose a reviewer's
  trust.
- **Nothing changes silently.** Verifying, approving, correcting, or sending a
  message raises a confirmation in a polite `aria-live` region — with Undo on
  anything that altered a number, so review never feels risky.

## How I verified it

Behaviour is checked by scripted browser runs against the real app rather than
by clicking around — **228 assertions across six suites**, all passing:

```bash
pnpm dev --port 3111           # then, in another shell:
node docs/demo-verify.mjs      # 57 · the core client ↔ preparer demo path
node docs/roles-verify.mjs     # 46 · Dave, Katie, Sarah, Linda role surfaces
node docs/roundtrip-verify.mjs # 16 · messages crossing roles in both directions
node docs/progress-verify.mjs  # 18 · onboarding progress, resume, and skip
node docs/fixes-verify.mjs     # 33 · permission scope, validation, PDF overlay alignment
node docs/script-verify.mjs    # 58 · the walkthrough's exact click path, in order
node docs/a11y-audit.mjs       # contrast/labels/scroll on 9 routes × 2 viewports
```

They drive local Chrome against `localhost:3111`. The last one is worth calling
out: it walks the recorded demo end to end, so the walkthrough script can't
drift away from the product — writing it is how I found that a preparer wearing
their client hat could still search the whole firm.

## Accessibility

Audited programmatically, not by eye: every text/background pair on all 9
routes was measured at both 1440px and 390px.

- **WCAG AA contrast** everywhere — the audit initially failed (the muted text
  token was 2.90:1), so the palette was corrected to pass at 4.5:1+
- **No text below 12px**, tabular figures for all money
- **Every control has an accessible name**; icon-only buttons carry `aria-label`
- **Keyboard**: visible focus rings (never removed), logical tab order, Escape
  closes overlays, ⌘K opens search
- **No horizontal scroll** at any tested viewport; 44px touch targets on coarse
  pointers
- **`prefers-reduced-motion`** honored; all transitions 150–300ms

## Where things live

```
src/data/        types.ts · statuses.ts (the state machine) · people.ts
                 hero.ts (Emily's fully-traced return) · seed.ts (the 503/4,028 generator)
src/lib/         api.ts (the only file production replaces) · priority.ts (ranking)
                 access.ts · field-state.ts · money.ts · client-questions.ts
                 pdf.ts (lazy pdf.js) · doc-geometry.ts (the shared box coordinates)
src/components/  review/ (the hero workspace + PDF viewer) · client/ · dashboard/
                 shell/ · ui/
src/app/         client/ and staff/ shells, the landing page, the role picker
                 print/[docId] — document artwork, printed to PDF by tooling
public/documents/ the generated source PDFs the workspace renders
docs/            verification suites · make-pdfs.mjs · screenshots
```

## Run locally

```bash
pnpm install
pnpm build && pnpm start   # or: pnpm dev
```

Node 20+. No environment variables, no database — everything is seeded. The
pdf.js worker is copied into `public/` automatically before dev and build.

The source PDFs are committed, so nothing needs regenerating to run the app. If
you change a document's box coordinates, re-print them with the dev server up:

```bash
pnpm make-pdfs   # drives /print/[docId] in headless Chrome → public/documents/
```

## Deploy

Push to GitHub and import into Vercel (zero config), or:

```bash
npx vercel --prod
```

## Path to production

The mock layer is shaped like the real thing so the swap is mechanical:

```
Next.js (unchanged UI)
   │  src/lib/api.ts  ←— the only file that changes
   ▼
FastAPI on Cloud Run ── Pydantic models mirroring src/data/types.ts
   ├── Supabase Postgres  · returns, fields+provenance, threads, tasks
   │     └── RLS policies  · internal-vs-client visibility enforced in the DB
   ├── Supabase Storage / GCS · original documents
   └── Extraction workers (Cloud Run jobs) · OCR + LLM extraction writing
         {value, source box, confidence} — the exact provenance shape the UI
         already renders
```

Auth becomes Supabase Auth (client magic links, firm SSO); the persona switcher
disappears; row-level security replaces the API-layer filtering — the
`assignedTo` scoping in `api.ts` is already written as the policy it would
become. The prioritization scorer moves server-side unchanged.

## With another week

Notifications and nudges, e-sign for client approval, a proper audit-log page
built on the provenance data, text-layer selection and search inside the PDF
viewer, and the second client (Dave) traceable end-to-end the way Emily
already is.

---

*All names, numbers, firms, and AI output are fabricated. Built with Next.js,
Tailwind, and TypeScript; typography is Fraunces, Public Sans, and IBM Plex
Mono.*
