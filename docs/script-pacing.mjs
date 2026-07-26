import { readFileSync } from 'node:fs';

/**
 * Checks the narration fits the capture.
 *
 * Each section of VIDEO_SCRIPT.md is held on screen for a fixed number of
 * seconds by docs/record-demo.mjs. If the words take longer to say than the
 * shot lasts, the narrator falls behind the visuals and never catches up —
 * which is invisible until you try to record, and was true of eight sections
 * on the first pass.
 *
 *   node docs/script-pacing.mjs ../VIDEO_SCRIPT.md
 */

const WPM = 145; // an unhurried speaking pace
const md = readFileSync(process.argv[2] ?? '../VIDEO_SCRIPT.md','utf8');
// Section headings look like "## 0:33 — 1:35 · Title"
const secs = [...md.matchAll(/^## (\d+):(\d\d) — (\d+):(\d\d) · (.+)$/gm)];
const toS = (m,s)=>+m*60+ +s;
console.log('sec  window  words  needs   fits?  title');
for (let i=0;i<secs.length;i++){
  const m=secs[i];
  const start=toS(m[1],m[2]), end=toS(m[3],m[4]);
  const body = md.slice(m.index+m[0].length, i+1<secs.length ? secs[i+1].index : md.length);
  // only the quoted narration counts
  const spoken = body.split('\n').filter(l=>l.trimStart().startsWith('>')).join(' ')
    .replace(/[>*_`#|]/g,' ').replace(/\s+/g,' ').trim();
  const words = spoken ? spoken.split(' ').filter(Boolean).length : 0;
  const needs = Math.round(words/WPM*60);
  const window = end-start;
  const ok = needs <= window;
  console.log(
    String(start).padStart(4),
    String(window).padStart(6),
    String(words).padStart(6),
    String(needs).padStart(6),
    (ok?'  ok  ':' OVER ').padStart(7),
    m[5].slice(0,42)
  );
}
