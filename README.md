# Meridian — every number has a receipt

Meridian is a working prototype of an AI tax platform for clients and the CPA
firms who serve them. I built it for the AI Engineer case study, "Designing an
AI-Powered Tax Platform From Scratch." It covers all ten challenges in the
brief.

**Live demo:** <https://meridian-gilt-ten.vercel.app> · **Video walkthrough:**
<https://youtu.be/MlAtiH5tt1w>

![Review workspace — tracing a wage figure back to Box 1 of the W-2](docs/screenshots/review-trace-w2.jpeg)

That screenshot is the whole idea. A preparer clicked the wage figure on the
return, and a line drew from that field to Box 1 of the client's W-2, on the
actual PDF. The card underneath says what the AI read, which document it came
from, and how sure it was.

A CPA can't trust a number they can't check. So provenance isn't a tooltip
here, it's the main interaction, and everything else is built around it.

## Try it in five minutes

The landing page asks you to pick a person. Six are wired up: two clients, two
preparers, a reviewer, and a firm admin.

**Start as Mike, a preparer.** His Today queue is ranked, and every card says
why it's there. Open Emily Carter, click **Wages and salary**, and watch the
trace draw to her W-2. Then open **Charitable contributions**. It's amber and
62% confident, because the donation receipt is handwritten and the AI read a
scrawled 3 as an 8. Hit **Fix it**, type 300, and the correction lands with an
Undo. The AI's original stays on the record.

**Switch to Emily.** Her home says "2 things need you, about 4 min." She
answers Mike's question with one tap and uploads the missing K-1. She never
sees a confidence score, a substage, or an internal note.

**Switch to Dave.** His account was created this morning, so the product has no
data in it at all. Six questions, one at a time, then eight document requests
written in his language with a note on where to find each one. The documents
stay locked until the questions are answered, because you can't ask for the
right eight until you know which eight.

**Switch to Katie, seasonal staff.** Open a return that isn't hers. The door is
locked, it names who it belongs to, and she can request access from the admin.
Her document list and her search results are scoped the same way.

## Where each challenge lives

| # | Challenge | Where to look | The decision |
|---|-----------|---------------|--------------|
| 01 | Source traceability | Review workspace | Click a value, get a drawn line to the exact box on a real PDF. Calculated values show their formula with clickable inputs, so tracing chains until you hit paper. Receipts say when no AI was involved. |
| 02 | Client & CPA collaboration | Conversations panel, client "Questions for you" | Threads pin to a field or document. Each is marked *Firm only* or *Client can see*, grouped by whose move it is, with the age of the last message. |
| 03 | Where to start | Client home | One card: what needs you and how long it takes. The screen visibly changes as onboarding completes. Finish everything and the checklist gives way to status. |
| 04 | Getting lost | Everywhere | Every selection is a URL. Breadcrumbs, thread-to-field jumps, and a "back to where I was" chip that survives any detour. |
| 05 | Role-aware experiences | Role picker, persona menu, access control | Six people, three genuinely different staff surfaces. Seasonal staff are scoped across the workspace, documents, and search. A client who lands on a firm URL gets an explanation, not a 404. Mike wears a client hat for his own return and the firm tools disappear. |
| 06 | Status & progress | Client journey card, staff stage badges | One state machine, two vocabularies. Five plain steps for clients, stages and substages for staff. |
| 07 | Actionable dashboard | Staff *Today* | Real ranking over 503 returns. Mike owns 198 of them, 184 still open. Every card carries its reasons and one next action, and firm scope adds workload per preparer. |
| 08 | Clickable vs. editable | The Legend, top right | Six states, one visual language, used identically everywhere. Pencils appear only where editing is allowed. Locks explain themselves. |
| 09 | Complexity made navigable | Documents (4,028 seeded), ⌘K search | Fold by client, cap what renders, cut with filters, narrow by typing. |
| 10 | Trustworthy AI | Review notes, provenance cards, client copy | Reasoning in words, evidence chips that highlight the exact box, uncertainty stated plainly. Corrections are validated and keep the AI's original. Clients never see percentages. |

## What's real and what's faked

The brief says to keep the backend quick and dirty, so I did. Here's the honest
split.

**Real, working code.** Every interaction above: the tracing, the verify and
correct and approve flows, thread visibility rules, the ranking logic, search,
filters, deep links, role switching, and the upload state machine.

The PDF rendering is real. The source documents are actual PDFs in
`public/documents/`, painted by pdf.js, with the provenance highlight as an
overlay positioned in the document's own coordinate space. That's the shape
production takes, where the PDF is a stored artifact and extraction hands back
box coordinates. The artwork is generated from the app's own `/print/[docId]`
route via `pnpm make-pdfs`, so the printed page and the overlay are laid out
from one set of numbers and can't drift apart.

The dataset is 503 returns and 4,028 documents from a seeded PRNG, so the edge
cases are always present: a 62% extraction, a client-reported value awaiting
approval, locked fields, a filed return, returns blocked on clients for days,
overdue deadlines, empty states.

The message loop genuinely crosses roles. Answer as Emily and her reply shows
up in Mike's panel with ownership flipped to "Firm's move" and his dashboard
flagging "Client replied." Send a question as Mike and it appears in her
checklist, her nav badge, and her questions page. localStorage stands in for
the realtime backend.

Permissions run before data renders. Seasonal staff are scoped to assigned
returns, and the documents list and ⌘K search are filtered in the API layer the
same way. Corrections are validated, since a tax figure that isn't a number is
a bug rather than a preference.

**Simulated, by design.** OCR and document parsing: the PDFs are fabricated and
their box coordinates are hand-authored, so "the AI read Box 1" is invented
provenance. The rendering and overlay path is real; the extraction that would
produce those coordinates is not. Confidence scores and AI notes are
hand-authored to exercise the trust UI. The persona switcher stands in for
auth. Field corrections live in React state, so a refresh resets them, while
messages and onboarding progress persist in localStorage. The app runs on a
fixed today of March 2, 2026, so deadlines read realistically.

## Decisions I'd defend

**Clients never see confidence scores.** A percentage creates doubt without
giving a client anything to do about it. They get "we read this from your W-2,
does this look right?" The 62% lives on the preparer's side, where someone can
act on it.

**One state machine, two vocabularies.** Status confusion comes from showing
everyone the same words. The model stores one state. "Internal review" and "in
preparation" both render to a client as "we're working on it," because the
difference matters to the firm and not to her.

**The dashboard ranks, and says why.** Reason chips like "Deadline in 4 days"
and "Client replied, unread" are the anti-spreadsheet. A ranked list you can't
interrogate is just somebody else's opinion.

**Affordance states are data, not styling.** `ai_generated`, `needs_review`,
`needs_approval`, `verified`, `edited`, and `locked` live on the field model.
The UI renders them the same way everywhere, and the Legend documents the
language inside the product.

**Corrections don't argue.** Fixing an AI value takes one input, and the
original extraction stays visible. The AI never defends itself and never
quietly disappears its own mistake. That record is what makes a firm willing to
let it go first.

**The shell wins over the role.** Inside `/client`, a preparer wearing their
client hat loses the firm rail and firm-wide search. A banner that says "firm
tools are hidden here" has to be true, not reassuring.

**Counts come from one source.** The unverified-value count on the dashboard
uses the same predicate as the workspace queue. Open client questions are
counted once and read by three surfaces. Two screens disagreeing about the same
number is the fastest way to lose a reviewer's trust.

**Nothing changes silently.** Verifying, approving, correcting, or sending a
message raises a confirmation in a polite `aria-live` region, with Undo on
anything that altered a number.

## Accessibility

Audited with a script, not by eye. Every text and background pair on all nine
routes, measured at 1440px and 390px.

The audit failed the first time. The muted text token was 2.90:1, so I fixed
the palette to pass at 4.5:1. Beyond contrast: no text under 12px, tabular
figures for money, an accessible name on every control, visible focus rings,
Escape closes overlays, no horizontal scroll at any tested width, 44px touch
targets on coarse pointers, and `prefers-reduced-motion` honored.

## Where things live

```
src/data/        types.ts · statuses.ts (the state machine) · people.ts
                 hero.ts (Emily's fully-traced return) · seed.ts (503/4,028 generator)
src/lib/         api.ts (the file production replaces) · priority.ts (ranking)
                 access.ts · field-state.ts · money.ts · client-questions.ts
                 pdf.ts (lazy pdf.js) · doc-geometry.ts (shared box coordinates)
src/components/  review/ (workspace + PDF viewer) · client/ · dashboard/
                 shell/ · ui/
src/app/         client/ and staff/ shells, landing page, role picker
                 print/[docId] (document artwork, printed to PDF by tooling)
public/documents/ the generated source PDFs the workspace renders
docs/            verification suites · make-pdfs.mjs · record-demo.mjs · screenshots
```

## Running it

```bash
pnpm install
pnpm build && pnpm start   # or: pnpm dev
```

Node 20 or newer. No environment variables and no database, since everything is
seeded. The pdf.js worker is copied into `public/` as part of dev and build.

The source PDFs are committed, so nothing needs regenerating. If you change a
document's box coordinates, reprint them with the dev server up:

```bash
pnpm make-pdfs   # drives /print/[docId] in headless Chrome
```

To deploy, import the repo into Vercel with zero config, or run
`npx vercel --prod`.

## Path to production

The mock layer is shaped like the real thing, so the swap is mechanical.

```
Next.js (unchanged UI)
   │  src/lib/api.ts  ←— the only file that changes
   ▼
FastAPI on Cloud Run ── Pydantic models mirroring src/data/types.ts
   ├── Supabase Postgres  · returns, fields+provenance, threads, tasks
   │     └── RLS policies  · internal-vs-client visibility enforced in the DB
   ├── Supabase Storage / GCS · original documents
   └── Extraction workers (Cloud Run jobs) · OCR + LLM extraction writing
         {value, source box, confidence} — the shape the UI already renders
```

Auth becomes Supabase Auth with magic links for clients and SSO for the firm,
and the persona switcher disappears. Row-level security replaces the API-layer
filtering; the `assignedTo` scoping in `api.ts` is already written as the policy
it would become. The prioritization scorer moves server-side unchanged.

## What I'd do next

Notifications and nudges. E-sign for client approval. An audit-log page built on
the provenance data that's already there. Text selection and search inside the
PDF viewer. And Dave traced end to end the way Emily is, so first-run and deep
review are the same story rather than two.

---

*Every name, number, firm, and piece of AI output here is fabricated. Built with
Next.js, Tailwind, and TypeScript. Type is Fraunces, Public Sans, and IBM Plex
Mono.*
