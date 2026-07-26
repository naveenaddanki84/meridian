# Video walkthrough — 10 minutes

Everything below is verified against the running app. Numbers in brackets are
what the screen actually shows, so you can confirm you're in the right state.

## Before you hit record

1. `pnpm build && pnpm start` (or `pnpm dev`) and open the app at **1440×900**.
2. On the landing page, scroll to the **Role-aware demo** section and click
   **Reset demo** (top-right of that section, next to the heading). This clears
   Dave's and Emily's progress and any threads from a previous take.
3. Hide the bookmarks bar. Close other tabs — you'll use ⌘K inside the app.
4. Zoom at 100%. The workspace is a two-pane layout; it needs the width.

**Recording order:** the Dave and Emily segments depend on saved progress, so
record 0:00–4:05 in one pass. Everything after Mike opens the return is
stateless — you can re-shoot any of it without resetting.

**Narration rule:** say the decision, not the feature. Every *what* gets a
*why* in the same breath. Name the challenge numbers out loud — the reviewers
are scoring against them.

---

## 0:00 — 0:35 · Opening (landing page)

**On screen:** the landing page, top of the hero.

> "This is Meridian — my prototype for the tax platform case study. The whole
> product hangs off one sentence, and it's on the screen: **every number has a
> receipt.** A CPA can't trust AI output they can't trace, so I made provenance
> the hero interaction rather than a tooltip somewhere.
>
> It's one product with six lenses — two clients and four roles inside the
> firm. This picker stands in for login, which is the only honest way to show
> role architecture in a prototype. **That's Challenge 05**, and you'll see it
> in the permissions later, not just the navigation.
>
> Everything is fabricated: the names, the numbers, the AI output. The
> interactions are real. Let me start where a real client starts — day one."

**Do:** scroll to the role panel. Click the **Dave Peterson** card.

---

## 0:35 — 1:45 · Dave, day one *(Challenge 03)*

**On screen:** `/client` as Dave. Banner: "Welcome to Meridian." Card:
*2 things need you · about 15 min*.

> "**Challenge 03 — a first-time user knows their next action within ten
> seconds.** Dave signed up this morning, so this is the product with no data
> in it. He gets a greeting, one card, and nothing else competing for
> attention: two things need him, about fifteen minutes.
>
> Two decisions here. First, documents are deliberately *locked* — 'unlocks
> once we know about your business.' That's not a limitation, it's sequencing:
> asking for eight documents is only possible after six questions tell us which
> eight. Second, instead of an empty activity box, we say it out loud —
> 'nothing has happened yet, that's normal.' An empty state that explains
> itself beats a blank panel."

**Do:** click **Tell us about your year**.

> "One question at a time, with a finish line. Every question says *why* we're
> asking — that's where trust starts for someone who's never filed a business
> return."

**Do:** answer three questions, then click **Home** (top-left).

> "The bar measures work done, not distance scrolled — skipping a question
> moves you forward without moving the bar. And it saves as you go, so leaving
> and coming back resumes where you were, not at question one."

**Do:** back on Home, point at the checklist: *"3 of 6 answered — pick up where
you left off."*

> "The home screen already changed. **That's the last bullet of Challenge 03:
> how the interface changes as onboarding completes.**"

---

## 1:45 — 2:25 · Dave finishes, documents unlock *(Challenge 03 continued)*

**Do:** click the questionnaire item, answer the remaining three, land on the
"That's the hard part done" screen, then click **Share documents**.

> "Now the documents unlock — eight asks, in his language, not named after the
> forms they feed. 'Payroll summary for the year — Gusto calls this the annual
> payroll register.' Telling someone *where to find it* is most of the work of
> asking for it.
>
> One of these says 'only if you paid a contractor six hundred dollars or
> more — skip if you didn't.' Permission to skip is part of a good ask."

**Do:** click **Upload** on the first row, wait for "We read it", then click
**Home**.

> "It's read on arrival, and the home checklist moves with it. Same shared
> progress store driving the card, the nav badge, and what's-next."

---

## 2:25 — 3:20 · Emily, mid-season *(Challenges 06 + 02, client side)*

**Do:** persona menu, top right → **Emily Carter**.

**On screen:** `/client` as Emily. *2 things need you · about 4 min*.

> "Emily is further along — same product, different moment. Her status is five
> plain-English steps: getting started, your documents, we prepare, you
> approve, filed. **That's Challenge 06.** Underneath it's one state machine
> with six stages and internal substages; the client just never sees them.
> 'Internal review' and 'in preparation' both render as 'we're working on it,'
> because the difference matters to the firm and not to her.
>
> Notice what's missing: no confidence scores, no substages, no jargon. The
> complexity stays on the firm's side of the wall."

**Do:** click **Questions for you** (badge shows 2).

> "**Challenge 02.** Mike's question arrives pinned to the thing it's about —
> the donation receipt — not in a generic inbox. And her preparer's internal
> note about her 401(k) is *not* here. The API filters by visibility before the
> data ever reaches this screen, exactly the way row-level security would in
> production."

**Do:** click **It was $300**.

> "One tap. She never types a number into a tax form."

**Do:** **Your documents** → **Upload** on the K-1 → wait for "Got it — and
we've already read it" → click **Home**.

> "The last thing she owed us. Watch the home screen: checklist gone, badge
> cleared, 'you're all caught up.' The interface got quieter as she finished."

---

## 3:20 — 4:05 · Mike's dashboard *(Challenge 07)*

**Do:** persona menu → **Mike Sullivan**.

**On screen:** *Your queue, Mike* · tiles **122 / 61 / 37 / 184**.

> "**Challenge 07 — a dashboard organised around decisions, not reporting.**
> Mike owns a hundred and eighty-four open returns out of five hundred, so a
> list sorted by name is useless to him. This is ranked by real logic running
> over the whole dataset: days to deadline, unread client replies, unverified
> AI values, days blocked, open questions.
>
> The important part is that every card says *why* it's ranked there — 'four
> days overdue,' 'client replied — unread,' 'three AI values to verify' — and
> ends with one next action. A ranked list you can't interrogate is just
> somebody else's opinion. And the tiles aren't decoration: each one filters
> the queue below it.
>
> Emily's card already says 'client replied, unread' — that's the answer I sent
> sixty seconds ago as her. The loop is real."

**Do:** click **Whole firm**.

> "Same screen serves the manager: workload per preparer, who's overdue, who's
> waiting on clients. **Both audiences the challenge asks for, one surface.**"

**Do:** switch back to **My returns**, then open **Emily Carter**.

---

## 4:05 — 5:30 · The hero: traceability *(Challenge 01)*

**On screen:** the review workspace. *Review next flagged value 10 ·
Conversations 3.*

> "This is the screen the whole thesis lives on. **Challenge 01 — trace every
> number on the return back to its source.**"

**Do:** click **Wages and salary** (`1040 · Line 1a`, $85,200.00).

> "I click the wage figure and a thread physically draws from the return field
> to Box 1 of her W-2 — the exact box, highlighted, on the document itself. Not
> 'from your W-2.' *That box.*
>
> Underneath is the receipt: what the AI read, from which document, and how
> confident it is — in words first, 'very confident,' with the number after it.
> Five things the challenge asks to connect: the field, the value, the
> document, the exact place on it, and any transformation."

**Do:** scroll the field list and click **Total income** (`1040 · Line 9`).

> "And that last one is where most tools stop. This value came from arithmetic,
> not a document — so the receipt shows the formula and its inputs, and **each
> input is clickable.** I can keep tracing down the chain until I land on a box
> on a piece of paper. Every part has its own receipt.
>
> Notice it says 'plain arithmetic — no AI here.' Being explicit about where
> the AI *isn't* involved is as important as flagging where it is."

**Do:** click one of the inputs to jump to that field.

> "Every one of these states is a URL, by the way — I'll come back to that."

---

## 5:30 — 6:30 · Trust and correction *(Challenge 10)*

**Do:** click **Charitable contributions** (amber, `$800.00`).

> "**Challenge 10.** The AI wasn't sure about this one. It's amber, it says
> 'check this,' it's sixty-two percent confident, and — crucially — it says
> *why* it's unsure: the receipt amount is handwritten. Look at the document on
> the right: the AI transcribed a scrawled three as an eight. That's a
> realistic failure, and the interface is honest about it rather than
> presenting eight hundred dollars as fact."

**Do:** click **Fix it**, type `abc`, hit **Save correction**.

> "Corrections are validated — this is a number on a tax return, so it has to
> be a number."

**Do:** clear it, type `300`, **Save correction**.

> "Now: the correction is recorded, it's normalised to currency, there's an
> **Undo** in the toast, and the receipt keeps the AI's original on file —
> 'corrected from eight hundred by Mike Sullivan.' The AI never argues, never
> re-asserts itself, and never quietly disappears its own mistake. That
> audit trail is what makes a firm willing to let the AI go first."

**Do:** scroll up to the **AI review notes** cards.

> "Above the return, the AI's recommendations. Not 'confidence: 0.62' — actual
> reasoning: 'her itemizable expenses come to about five thousand two hundred,
> far below the fifteen-thousand standard deduction, so itemizing would cost
> her money.' A recommendation, the why, and a caveat about what would change
> its mind."

**Do:** click an **evidence chip** on the warning card.

> "And the evidence chips are live — clicking one highlights the exact box it's
> reasoning from. The second note is my favourite: it flags that two W-2 boxes
> disagree, then explains the gap is exactly the 401(k) deferral, so nothing is
> wrong. **Telling someone what *isn't* a problem is a trust feature.**"

---

## 6:30 — 7:10 · Affordances *(Challenge 08)*

**Do:** open the **Legend** (top right).

> "**Challenge 08 — clickable versus editable.** Six states, one visual
> language, documented in-product: AI-unverified, check this, needs approval,
> verified, edited, locked. Green text is always a link. A pencil on hover
> means editable. Everything else is read-only.
>
> These aren't styling — they're on the data model, so the same value renders
> identically wherever it appears."

**Do:** close the legend. Click **IRA contribution** (`Sch 1 · Line 20`).

> "'Needs approval' — this came from Emily's own answers, not a document.
> Client-reported, so it doesn't count until a preparer approves it. Different
> state, different action: the button says **Approve**, not 'looks right.'"

**Do:** click **Standard deduction** (locked), then hover the row.

> "And locked values explain themselves: 'set by IRS rules for single filers in
> 2025.' Her Social Security number is locked too, for a different reason.
> **'What can't be changed, and why' — the challenge asks for the why, and a
> lock icon on its own isn't an answer.**"

---

## 7:10 — 8:00 · Collaboration and never getting lost *(Challenges 02 + 04)*

**Do:** click **Conversations** (3).

> "**Challenge 02 from the firm's side.** Threads are grouped by *whose move it
> is* — waiting on Emily, firm's move, resolved — with the age of the last
> message. That's how you track outstanding requests without building an inbox.
> Emily's answer flipped this one to 'firm's move' automatically when she
> replied."

**Do:** expand the **401(k) box 12** thread.

> "This one is marked **Firm only** — an internal note between Mike and the
> reviewer. Emily's screen, which you just saw, doesn't have it."

**Do:** close the panel. Click **Qualified dividends** → **Ask the client**.

> "Starting a new question happens *from* the value it's about, so it's
> anchored automatically. And the visibility choice is right there in the
> composer — ask the client, or leave an internal note — with the consequence
> spelled out underneath."

**Do:** type a question, send it, then click the thread's **anchor chip**.

> "**Challenge 04.** The anchor chip jumps me straight back to the field. Every
> selection is in the URL — field, document, thread — so any state here is
> shareable and survives a refresh. Breadcrumbs up top. And if I wander off
> anywhere in the app, this chip brings me back to exactly where I was in
> Emily's return, down to the selected field."

---

## 8:00 — 8:40 · Scale *(Challenge 09)*

**Do:** click **Documents** in the left rail.

> "**Challenge 09.** Four thousand documents across five hundred clients — the
> challenge asks for a real dataset, so the search and hierarchy get tested
> against volume rather than six demo rows.
>
> The strategy is: never render everything. Folded by client, capped with a
> line that says what's hidden, filters by form type and status, and 'one
> thousand still missing' is a button, not a statistic — it filters to exactly
> the work it describes."

**Do:** press **⌘K**, type `donation`.

> "And global search across returns, documents, and conversations, grouped by
> kind, every result a deep link into the workspace. The complexity isn't
> reduced — it's navigable."

**Do:** click the conversation result.

---

## 8:40 — 9:25 · The other three roles *(Challenge 05)*

**Do:** persona menu → **Katie Brennan**. Go to **Returns**, click a locked row
(any row with a padlock).

> "Katie is seasonal staff, and this is where role-awareness stops being
> cosmetic. She can see that other returns exist — but the door is locked, it
> names who it's assigned to, and she can request access from the admin who
> owns that decision. **Permission communicated, not a mystery 404.**
>
> And the scope holds everywhere: her documents list only contains her own
> clients, and searching for Emily returns nothing. A permission that only
> guards the front door isn't a permission."

**Do:** click **Request access from Linda**. Then persona menu → **Sarah
Mitchell**.

> "Sarah reviews. Her job isn't 'what's urgent' — it's 'what can I sign off,
> and what would I regret signing.' So her queue is ordered by *review risk*:
> returns where the AI still hasn't been checked come first."

**Do:** persona menu → **Linda Brooks**.

> "And Linda runs the firm, so she gets capacity against the average, deadline
> breach risk, and season totals. Three genuinely different jobs, one shell,
> one design language — **not six products.**
>
> One more: Mike is a preparer who's also a client of his own firm."

**Do:** persona menu → **Mike Sullivan**. Then *reopen* the persona menu (it
closes on switch) and click **My own 2025 return** at the bottom.

> "Same login, client hat on, firm tools genuinely hidden. **The challenge asks
> for that case specifically.**"

---

## 9:25 — 10:00 · Close

**Do:** return to the landing page.

> "To close, the honest part. What's real: everything you just clicked —
> tracing, corrections, the visibility rules, the ranking logic, search,
> permissions, the cross-role message loop. What's simulated: OCR, the AI
> outputs, auth, and persistence — all four by design, per the brief.
>
> The mock API is shaped like the real one, so the path to production is
> mechanical: `src/lib/api.ts` is the only file that changes — FastAPI on Cloud
> Run, Supabase Postgres with the visibility rules moved into row-level
> security, and extraction workers writing back the same value-plus-source-box
> shape this UI already renders.
>
> Two things I'd flag as decisions rather than features. I audited contrast
> programmatically instead of by eye, which caught a real WCAG failure I then
> fixed. And clients never see a confidence score — a percentage creates doubt
> without giving them an action they can take. The sixty-two percent lives on
> the preparer's side, where someone can actually do something about it.
>
> Thanks for watching."

---

## Cheat sheet

| Segment | Persona | Challenge | Screen state to confirm |
|---|---|---|---|
| 0:35 | Dave | 03 | *2 things need you · about 15 min* |
| 2:25 | Emily | 06, 02 | *2 things need you · about 4 min* |
| 3:20 | Mike | 07 | tiles 122 / 61 / 37 / 184 |
| 4:05 | Mike | 01 | *Review next flagged value 10* |
| 5:30 | Mike | 10 | Charitable contributions, amber, 62% |
| 6:30 | Mike | 08 | Legend open, six states |
| 7:10 | Mike | 02, 04 | *Conversations 3* |
| 8:00 | Mike | 09 | *4,028 documents across 502 clients* |
| 8:40 | Katie/Sarah/Linda | 05 | locked row → access denied |

**If you fumble:** click Reset demo on the landing page and restart from 0:35.
Anything from 4:05 onward can be re-shot on its own.

**If you run long:** cut the Total income calculation chain (5:00–5:30) and
Sarah's queue (9:00). Do not cut the correction flow or the locked-value
explanation — those are the two most-scored moments in the brief.
