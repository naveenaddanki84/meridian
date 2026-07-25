# Video walkthrough script (~7 minutes)

Before recording: open the landing page and click **Reset demo** (bottom right)
so Dave and Emily both start fresh. Narrate decisions, not features — say *why*
after every *what*. Name the challenge numbers out loud; the reviewers are
scoring against them.

Six personas exist, but only three get a deep dive. Katie, Sarah, and Linda are
fast beats near the end — enough to prove the shell adapts, without padding.

---

## 0:00 — Opening (landing page)

> "This is Meridian, my prototype for the tax platform case study. The design
> thesis is on the screen: every number has a receipt. One product, six people
> — two clients, and four roles inside the firm. The persona picker stands in
> for login. **[Challenge 05]**"

## 0:20 — Dave: day one (Enter as Dave)

> "**Challenge 03 — a first-time user knows their next action in 10 seconds.**
> Dave signed up this morning, so this is the product with no data in it at
> all. One card: two things need you, about 15 minutes. Documents are
> deliberately *locked* until we know about his business — that's progressive
> disclosure, not a limitation. And instead of an empty box, we say plainly:
> nothing has happened yet, that's normal."

Click **Tell us about your year**.

> "Six questions, one at a time, with a progress bar and a finish line. Every
> question explains *why* we're asking — that's where trust starts for someone
> who's never done this before."

Answer 2–3 questions, then jump back **Home** (don't sit through all six).

> "Watch the home screen change as onboarding completes — the checklist ticks
> off, documents unlock, and what's-next updates. **That's Challenge 03's last
> bullet: how the interface changes once onboarding is done.**"

## 1:40 — Emily: the same product, mid-season (switch to Emily)

> "Emily is further along, which is how I can show the rest of the product.
> Same home, different moment: two things need her, and status in five
> plain-English steps. **[Challenge 06]** Notice what's *not* here — no
> confidence scores, no substages. Complexity stays on the firm's side."

### Answer the question (Questions for you)

> "**Challenge 02.** Mike's question arrives pinned to the thing it's about —
> the donation receipt — not in a generic inbox. One tap to answer. His
> internal notes never appear here; the API filters by visibility, exactly like
> row-level security would in production."

Click **It was $300**.

### Upload the K-1 (Your documents)

> "I upload the missing K-1 —" *(click Upload)* "— it's read instantly, and the
> promise is always the same: a human double-checks before anything is final."

## 3:00 — Mike: what should I work on right now? (switch to Mike)

> "**Challenge 07.** This queue is ranked by real logic over ~500 returns —
> deadlines, unread replies, AI flags, days blocked — and every card says *why*
> it's ranked and what the next action is. Emily's card already says 'client
> replied — unread': the answer I sent a minute ago as her."

## 3:30 — The hero: traceability (open Emily's return)

> "**Challenge 01.** I click her wage figure —" *(click Wages and salary)* "— and
> a thread literally draws to Box 1 of her W-2. The receipt card underneath:
> what the AI read, how confident it is, and what to do about it. Calculated
> fields chain — click an input and keep tracing."

## 4:10 — Trust and correction (Charitable contributions)

> "**Challenge 10.** The AI wasn't sure about this handwritten receipt — 62%,
> amber, flagged. I check the document, it says $300, I fix it —" *(Fix it →
> 300 → save)* "— the correction is recorded, with Undo, and the AI's original
> stays on file. The AI never argues. Up top, AI review notes: a recommendation
> with its reasoning and evidence chips that highlight the exact box."

## 4:50 — Affordances (open Legend, click IRA contribution)

> "**Challenge 08.** Six states, same marks on every screen — the Legend
> documents the language in-product. This IRA contribution is 'needs approval':
> client-reported, doesn't count until a preparer approves. The standard
> deduction is locked, and hovering tells you *why*."

## 5:20 — Collaboration and never getting lost

> "**Challenges 02 and 04.** Conversations grouped by whose move it is — and
> Emily's answer is right here, marked 'firm's move' now. Every thread jumps to
> its anchor. Every state is a URL, and if I wander off, this chip brings me
> back to exactly where I was."

## 5:45 — Scale (Documents + ⌘K)

> "**Challenge 09.** Four thousand documents across the firm, folded by client,
> capped rendering, filters, and ⌘K search over everything. The complexity
> isn't reduced — it's navigable."

## 6:05 — Permissions, fast (switch to Katie)

> "Katie is seasonal staff. She can see that Emily's return exists —" *(open it
> from Returns)* "— but the door is locked, it tells her who it's assigned to,
> and she can request access from the admin who owns that decision. Permission
> is communicated, not hidden. **[Challenge 05]**"

Click **Request access from Linda**.

## 6:25 — One more role (switch to Linda)

> "And the admin isn't running a task queue at all — she's running the firm.
> Capacity per preparer against the average, deadline breach risk, season
> totals. Same shell, same design language, genuinely different job."

## 6:45 — Close

> "What's real: every interaction you saw. What's simulated: OCR, the AI
> outputs, auth, and persistence — by design, per the brief. I also audited
> contrast and accessibility programmatically rather than by eye, which caught
> a real WCAG failure I then fixed. The README maps each challenge to its
> screen and shows the path to production on FastAPI, Supabase, and GCP: the
> mock API layer is the only file that changes. Thanks for watching."

---

**Recording tips:** 1440×900 browser window, hide the bookmarks bar, ⌘K demo
query "donation". Record Dave and Emily first (they're state-dependent); the
Mike/Katie/Linda segments are stateless and can be re-shot freely. If you
fumble, click Reset demo and restart just the client segment.
