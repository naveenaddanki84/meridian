# Video walkthrough script (~6 minutes)

Before recording: open the landing page and click **Reset demo** (bottom right)
so Emily starts fresh. Narrate decisions, not features — say *why* after every
*what*. Name the challenge numbers out loud; the reviewers are scoring against
them.

---

## 0:00 — Opening (landing page)

> "This is Meridian, my prototype for the tax platform case study. The design
> thesis is on the screen: every number has a receipt. One product, two lenses —
> I'll start as a brand-new client, then switch to her CPA. The persona picker
> stands in for login. **[Challenge 05]**"

## 0:30 — Emily, first login (Enter as Emily)

> "**Challenge 03 — a first-time user knows their next action in 10 seconds.**
> One card: '2 things need you, about 4 minutes.' Time estimates, not vague
> tasks. Onboarding started with 12 plain-language questions — already done,
> and clickable —" *(click 'Tell us about your year')* "— here are her
> answers, and notice: two of them literally became numbers on the return,
> with receipts her preparer can trace. Back home: status in plain English —
> five steps, no jargon, who's on it, what's next. **[Challenge 06]** Notice
> what's *not* here: no confidence scores, no substages. Complexity stays on
> the firm's side."

## 1:15 — Answer the question (Questions for you)

> "**Challenge 02.** Mike's question arrives pinned to the thing it's about —
> the donation receipt — not in a generic inbox. One tap to answer. His
> internal notes never appear here; the API filters by visibility, exactly
> like row-level security would in production."

Click **It was $300**.

## 1:45 — Upload the K-1 (Your documents)

> "Documents in client language: 'We read it', 'Still needed'. I upload the
> missing K-1 —" *(click Upload)* "— it's read instantly, and the promise is
> always the same: a human double-checks before anything is final.
> **[Challenge 10, the client half: AI magic, human accountability.]**"

## 2:15 — Home again: the interface changed

> "Back home: the checklist is gone — 'You're all caught up.' The badge
> cleared, 'what's next' updated. **That's Challenge 03's last bullet: the
> interface changes once onboarding is done.** Progress is shared across
> every page."

## 2:40 — Switch to Mike (persona menu → Mike)

> "Now the CPA. **Challenge 07 — 'what should I work on right now?'** This
> queue is ranked by real logic over ~120 seeded returns — deadlines, unread
> replies, AI flags, days blocked — and every card says *why* it's ranked
> and what the next action is. Emily's card already says 'Client replied —
> unread': the answer I sent a minute ago as her. Toggle to Whole firm: a
> manager sees workload per preparer, overdue and blocked at a glance."

## 3:20 — The hero: Emily's return (open from queue)

> "**Challenge 01 — traceability.** I click her wage figure —" *(click Wages
> and salary)* "— and a thread literally draws to Box 1 of her W-2. The
> receipt card underneath: what the AI read, how confident it is, and what
> to do about it. Calculated fields chain — click an input and keep tracing.
> Every number has a receipt."

## 4:00 — Trust and correction (Charitable contributions)

> "**Challenge 10.** The AI wasn't sure about this handwritten receipt — 62%,
> amber, flagged. I check the document, it says $300, I fix it —" *(Fix it →
> 300 → save)* "— the correction is on record and the AI's original stays
> visible. The AI never argues. Up top, AI review notes: a recommendation
> with its reasoning and evidence chips that highlight the exact box, and a
> warning that explains itself. Transparency without overload."

## 4:40 — The affordance system (open Legend, click IRA contribution)

> "**Challenge 08.** Six states, same marks on every screen — the Legend
> documents the language in-product. This IRA contribution is 'Needs
> approval': client-reported, doesn't count until a preparer approves. The
> standard deduction is locked, and hovering tells you *why* it can't
> change."

## 5:10 — Collaboration + never getting lost

> "**Challenges 02 and 04.** Conversations grouped by whose move it is, with
> age — and Emily's answer is right here in the thread, marked 'Firm's
> move' now. The message loop works across roles. Every thread jumps to its
> anchor. And every state here is a URL — if I wander off to Documents, this
> chip brings me straight back to where I was."

## 5:30 — Scale (Documents + ⌘K)

> "**Challenge 09.** Nearly a thousand documents across the firm, folded by
> client, capped rendering, filters, and ⌘K search over everything. The
> complexity isn't reduced — it's navigable."

## 5:50 — Close

> "What's real: every interaction you saw. What's simulated: OCR, the AI
> outputs, auth, and persistence — by design, per the brief. The README maps
> each challenge to its screen and shows the path to production on FastAPI,
> Supabase, and GCP: the mock API layer is the only file that changes.
> Thanks for watching."

---

**Recording tips:** 1440×900 browser window, hide bookmarks bar, ⌘K demo query
"donation". If you fumble a segment, pause and redo it — editors trim silence
easily. Loom or QuickTime + screen recording is fine.
