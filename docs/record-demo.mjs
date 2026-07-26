import { chromium } from '/tmp/node_modules/playwright-core/index.mjs';
import { mkdir, rename, writeFile, readdir } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

/**
 * Records the 10-minute walkthrough as a silent screen capture, paced to the
 * narration in VIDEO_SCRIPT.md, so the voiceover can be laid over it in one
 * pass without racing the visuals.
 *
 * Playwright doesn't draw a pointer into the video, so a synthetic cursor is
 * injected and animated to each target before it clicks — otherwise things
 * happen on screen with no visible cause, which reads as a bug rather than a
 * demo.
 *
 *   pnpm build && pnpm start --port 3111     (production build, like the live site)
 *   node docs/record-demo.mjs
 *
 * Output: docs/demo/meridian-walkthrough.mp4 + docs/demo/cues.md
 */

const exec = promisify(execFile);
const BASE = process.env.MERIDIAN_URL ?? 'http://localhost:3111';
const OUT = join(dirname(fileURLToPath(import.meta.url)), 'demo');
const W = 1440;
const H = 900;

await mkdir(OUT, { recursive: true });

const browser = await chromium.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  args: [`--window-size=${W},${H}`],
});
const context = await browser.newContext({
  viewport: { width: W, height: H },
  deviceScaleFactor: 2,
  recordVideo: { dir: OUT, size: { width: W, height: H } },
});

/** A visible pointer, plus a pulse on click. Survives navigation. */
await context.addInitScript(() => {
  const install = () => {
    if (document.getElementById('__demo_cursor')) return;
    const dot = document.createElement('div');
    dot.id = '__demo_cursor';
    dot.style.cssText = [
      'position:fixed', 'left:0', 'top:0', 'width:22px', 'height:22px',
      'margin:-11px 0 0 -11px', 'border-radius:9999px', 'z-index:2147483647',
      'pointer-events:none', 'background:rgba(28,35,33,.82)',
      'box-shadow:0 0 0 2px rgba(255,255,255,.9), 0 4px 14px rgba(0,0,0,.35)',
      'transition:transform .55s cubic-bezier(.33,1,.68,1)',
      'transform:translate3d(-100px,-100px,0)',
    ].join(';');
    document.body.appendChild(dot);

    const style = document.createElement('style');
    style.textContent = `@keyframes __demo_ping{0%{transform:scale(.4);opacity:.75}100%{transform:scale(2.6);opacity:0}}`;
    document.head.appendChild(style);

    window.__cursorTo = (x, y) => {
      dot.style.transform = `translate3d(${x}px,${y}px,0)`;
    };
    window.__cursorPing = (x, y) => {
      const ring = document.createElement('div');
      ring.style.cssText = [
        'position:fixed', `left:${x}px`, `top:${y}px`, 'width:34px', 'height:34px',
        'margin:-17px 0 0 -17px', 'border-radius:9999px', 'z-index:2147483646',
        'pointer-events:none', 'border:2.5px solid rgba(36,80,68,.9)',
        'animation:__demo_ping .6s ease-out forwards',
      ].join(';');
      document.body.appendChild(ring);
      setTimeout(() => ring.remove(), 700);
    };
  };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', install);
  } else {
    install();
  }
});

const page = await context.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));

const t0 = Date.now();
const elapsed = () => (Date.now() - t0) / 1000;
const stamp = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
const cues = [];

const wait = (ms) => page.waitForTimeout(ms);

/** Hold the current frame until the script's clock reaches `target` seconds. */
async function padTo(target) {
  const remaining = target - elapsed();
  if (remaining > 0) await wait(remaining * 1000);
}

function section(title, at) {
  cues.push({ at: elapsed(), title, planned: at });
  console.log(`  ${stamp(elapsed())}  ${title}`);
}

async function go(path) {
  await page.goto(BASE + path, { waitUntil: 'networkidle' });
  await wait(500);
}

/** Move the pointer onto a target and click it, so the video shows cause. */
async function point(selector, { settle = 700 } = {}) {
  const el = page.locator(selector).first();
  await el.scrollIntoViewIfNeeded();
  await wait(250);
  const box = await el.boundingBox();
  if (!box) throw new Error(`no box for ${selector}`);
  const x = Math.round(box.x + box.width / 2);
  const y = Math.round(box.y + box.height / 2);
  await page.evaluate(([x, y]) => window.__cursorTo?.(x, y), [x, y]);
  await wait(600);
  await page.evaluate(([x, y]) => window.__cursorPing?.(x, y), [x, y]);
  await el.click();
  await wait(settle);
}

/** Drift the pointer somewhere without clicking — used to draw the eye. */
async function hover(selector) {
  const el = page.locator(selector).first();
  await el.scrollIntoViewIfNeeded();
  const box = await el.boundingBox();
  if (!box) return;
  await page.evaluate(
    ([x, y]) => window.__cursorTo?.(x, y),
    [Math.round(box.x + box.width / 2), Math.round(box.y + box.height / 2)],
  );
  await wait(700);
}

async function smoothScroll(px) {
  await page.evaluate((d) => window.scrollBy({ top: d, behavior: 'smooth' }), px);
  await wait(900);
}

console.log('\nRecording — do not touch the machine until it finishes.\n');

let failedAt = null;
try {

// ── 0:00 Opening ────────────────────────────────────────────────────────────
section('Opening — the thesis and six lenses', '0:00');
await go('/');
await wait(2500);
await smoothScroll(420);
await wait(2500);
await point('button:has-text("Reset demo")');
await smoothScroll(260);
await padTo(33);

// ── 0:35 Dave, day one ──────────────────────────────────────────────────────
section('Dave — day one', '0:35');
await point('a:has-text("Dave Peterson")', { settle: 2200 });
await wait(4000);
await hover('a:has-text("Share your business documents")');
await wait(3500);
await smoothScroll(320);
await wait(3000);
await smoothScroll(-320);
await point('a:has-text("Tell us about your year")', { settle: 2500 });
await wait(3500);
for (let i = 0; i < 3; i++) {
  await point('div.rise-in button:not(:has-text("Back")):not(:has-text("Skip"))', { settle: 1400 });
}
await wait(1500);
await point('a:has-text("Home")', { settle: 2000 });
await hover('a:has-text("Tell us about your year")');
await padTo(103);

// ── 1:45 Documents unlock ───────────────────────────────────────────────────
section('Dave — documents unlock', '1:45');
await go('/client/questionnaire');
for (let i = 0; i < 3; i++) {
  await point('div.rise-in button:not(:has-text("Back")):not(:has-text("Skip"))', { settle: 1300 });
}
await wait(2000);
await point('a:has-text("Share documents")', { settle: 2500 });
await wait(3500);
await smoothScroll(300);
await wait(2500);
await smoothScroll(-300);
await point('button:has-text("Upload")', { settle: 2600 });
await point('a:has-text("Home")', { settle: 2000 });
await padTo(143);

// ── 2:25 Emily, mid-season ──────────────────────────────────────────────────
section('Emily — mid-season client', '2:25');
await point('button[aria-expanded]:has-text("Client")');
await point('button:has-text("Emily Carter")', { settle: 2500 });
await wait(3500);
await smoothScroll(340);
await wait(3500);
await smoothScroll(-340);
await point('a:has-text("Questions for you")', { settle: 2500 });
await wait(4000);
await point('button:has-text("It was $300")', { settle: 2500 });
await point('a:has-text("Your documents")', { settle: 2000 });
await point('button:has-text("Upload")', { settle: 4000 });
await point('a:has-text("Home")', { settle: 2500 });
await padTo(198);

// ── 3:20 Mike's dashboard ───────────────────────────────────────────────────
section("Mike — the actionable dashboard", '3:20');
await point('button[aria-expanded]:has-text("Client")');
await point('button:has-text("Mike Sullivan")', { settle: 2500 });
await go('/staff');
await wait(3500);
await hover('button:has-text("Need you now")');
await wait(2000);
await smoothScroll(280);
await wait(3000);
await smoothScroll(-280);
await point('button:has-text("Whole firm")', { settle: 2500 });
await wait(2500);
await point('button:has-text("My returns")', { settle: 1500 });
await padTo(243);

// ── 4:05 Traceability ───────────────────────────────────────────────────────
section('The hero — source traceability', '4:05');
await go('/staff/returns/ret-emily');
await wait(2500);
await point('button:has-text("Wages and salary")', { settle: 3000 });
await wait(6000);
await hover('[data-box-id="w2-box1"]');
await wait(4000);
await point('button:has-text("Total income")', { settle: 3000 });
await wait(6000);
await point('button:has-text("Wages (Line 1a)")', { settle: 3000 });
await padTo(328);

// ── 5:30 Trust and correction ───────────────────────────────────────────────
section('Trustworthy AI — correction with a receipt', '5:30');
await point('button:has-text("Charitable contributions")', { settle: 3000 });
await wait(6000);
await hover('[data-box-id="rc-amount"]');
await wait(3000);
await point('button:has-text("Fix it")', { settle: 1200 });
await page.locator('input[aria-label^="Correct value"]').first().fill('abc');
await wait(1200);
await point('button:has-text("Save correction")', { settle: 2200 });
await page.locator('input[aria-label^="Correct value"]').first().fill('300');
await wait(1000);
await point('button:has-text("Save correction")', { settle: 3500 });
await wait(2500);
await smoothScroll(-400);
await wait(3000);
await point('button:has-text("Box 3 · 92,100")', { settle: 3500 });
await padTo(388);

// ── 6:30 Affordances ────────────────────────────────────────────────────────
section('Clickable vs editable — the affordance system', '6:30');
await point('button:has-text("Legend")', { settle: 3000 });
await wait(5000);
await page.keyboard.press('Escape');
await wait(800);
await point('button:has-text("IRA contribution")', { settle: 3000 });
await wait(4000);
await point('button:has-text("Standard deduction")', { settle: 3000 });
await wait(3000);
await padTo(428);

// ── 7:10 Collaboration + orientation ────────────────────────────────────────
section('Collaboration and never getting lost', '7:10');
await point('button:has-text("Conversations")', { settle: 2500 });
await wait(4000);
await point('button:has-text("401(k) box 12")', { settle: 3000 });
await wait(3500);
await point('button[aria-label="Close conversations"]', { settle: 1200 });
await point('button:has-text("Qualified dividends")', { settle: 2000 });
await point('button:has-text("Ask the client")', { settle: 2500 });
await page.locator('textarea').first().fill('Is your Vanguard account still open?');
await wait(2000);
await point('button[aria-label="Send"]', { settle: 3000 });
await padTo(478);

// ── 8:00 Scale ──────────────────────────────────────────────────────────────
section('Complexity made navigable', '8:00');
await go('/staff/documents');
await wait(3500);
await hover('button:has-text("still missing")');
await wait(2500);
await smoothScroll(320);
await wait(2500);
await smoothScroll(-320);
await page.keyboard.press('Meta+k');
await wait(1200);
await page.locator('input[aria-label="Search"]').type('donation', { delay: 110 });
await wait(3000);
await padTo(518);

// ── 8:40 The other roles ────────────────────────────────────────────────────
section('Role-aware — Katie, Sarah, Linda, and the client hat', '8:40');
await page.keyboard.press('Escape');
await wait(600);
await point('button[aria-expanded]:has-text("Preparer")');
await point('button:has-text("Katie Brennan")', { settle: 2000 });
await go('/staff/returns/ret-emily');
await wait(4000);
await point('button:has-text("Request access from Linda")', { settle: 3000 });
await point('button[aria-expanded]:has-text("Preparer")');
await point('button:has-text("Sarah Mitchell")', { settle: 3500 });
await wait(2500);
await point('button[aria-expanded]:has-text("Reviewer")');
await point('button:has-text("Linda Brooks")', { settle: 3500 });
await wait(3000);
await point('button[aria-expanded]:has-text("Firm admin")');
await point('button:has-text("Mike Sullivan")', { settle: 2000 });
await point('button[aria-expanded]:has-text("Preparer")');
await point('button:has-text("My own 2025 return")', { settle: 3000 });
await padTo(563);

// ── 9:25 Close ──────────────────────────────────────────────────────────────
section('Close — real vs simulated, path to production', '9:25');
await go('/');
await wait(4000);
await smoothScroll(500);
await wait(4000);
await smoothScroll(700);
await wait(4000);
await padTo(600);

} catch (err) {
  // Ten minutes of footage is too expensive to throw away over one selector.
  failedAt = `${stamp(elapsed())} — ${err.message.split('\n')[0]}`;
  console.log(`\n✗ Stopped at ${failedAt}`);
  console.log('  Saving the partial recording anyway.');
}

console.log(`\nFinished at ${stamp(elapsed())}. Page errors: ${errors.length}`);
errors.forEach((e) => console.log('  ' + e));

const video = page.video();
await context.close();
const raw = await video.path();
const webm = join(OUT, 'walkthrough.webm');
await rename(raw, webm).catch(() => {});
await browser.close();

// Strip stray .webm files Playwright may have left from earlier pages.
for (const f of await readdir(OUT)) {
  if (f.endsWith('.webm') && f !== 'walkthrough.webm') {
    console.log(`  (ignoring stray ${f})`);
  }
}

console.log('\nTranscoding to MP4…');
const mp4 = join(OUT, 'meridian-walkthrough.mp4');
await exec('ffmpeg', [
  '-y', '-i', webm,
  '-c:v', 'libx264', '-preset', 'slow', '-crf', '20',
  '-pix_fmt', 'yuv420p', '-movflags', '+faststart',
  '-r', '30',
  mp4,
]);

const lines = [
  '# Voiceover cue sheet',
  '',
  'Timestamps are where each section **actually starts** in',
  '`meridian-walkthrough.mp4`. Read the matching section of `VIDEO_SCRIPT.md`',
  'from each cue. The visuals hold long enough for the narration at a normal',
  'speaking pace (~145 wpm) — if you finish a section early, pause; the video',
  'waits for you.',
  '',
  '| Cue | Section | Script says |',
  '|-----|---------|-------------|',
  ...cues.map((c) => `| **${stamp(c.at)}** | ${c.title} | ${c.planned} |`),
  '',
  `Total runtime: **${stamp(600)}**`,
];
await writeFile(join(OUT, 'cues.md'), lines.join('\n') + '\n');

console.log(`\n✓ ${mp4}`);
console.log(`✓ ${join(OUT, 'cues.md')}`);
if (failedAt) {
  console.log(`\n⚠ Recording is incomplete — it stopped at ${failedAt}`);
  process.exit(1);
}
