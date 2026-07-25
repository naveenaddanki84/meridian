import { chromium } from '/tmp/node_modules/playwright-core/index.mjs';
const B="http://localhost:3111"; let pass=0,fail=0;
const t=(n,c,d="")=>{if(c){pass++;console.log(`  ✓ ${n}`);}else{fail++;console.log(`  ✗ FAIL: ${n} ${d}`);}};
const b=await chromium.launch({executablePath:"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"});
const p=await (await b.newContext({viewport:{width:1440,height:900}})).newPage();
const go=async x=>{await p.goto(B+x,{waitUntil:"networkidle"});await p.waitForTimeout(650);};
const click=async s=>{await p.locator(s).first().click();await p.waitForTimeout(500);};
const st=async()=>p.evaluate(()=>{
  const bar=document.querySelector('[role="progressbar"]');
  const stored=JSON.parse(localStorage.getItem("meridian.client-progress")||"{}");
  return {aria:bar?.getAttribute("aria-valuenow"), label:(document.body.innerText.match(/Question (\d+) of 6/i)||[])[0],
    answered:Object.keys(stored.daveAnswers||{}).length, done:!!stored.daveQuestionnaireDone};
});
const answer=async()=>{await p.locator('div.rise-in button').filter({hasNotText:/Back|Skip/}).first().click();await p.waitForTimeout(450);};

await go("/"); await click('button:has-text("Reset demo")'); await click('a:has-text("Dave Peterson")');
await go("/client/questionnaire");
console.log("\n━━ straight through ━━");
t("starts at 0%", (await st()).aria==="0");
for(let i=1;i<=5;i++){ await answer(); const s=await st();
  t(`q${i} → ${Math.round(i/6*100)}% & stored ${i}`, s.aria===String(Math.round(i/6*100))&&s.answered===i, JSON.stringify(s)); }
await answer();
t("finishes", (await p.evaluate(()=>document.body.innerText)).includes("hard part done"));
t("stored 6 + done", (await st()).answered===6&&(await st()).done);

console.log("\n━━ RESUME (was broken) ━━");
await go("/"); await click('button:has-text("Reset demo")'); await click('a:has-text("Dave Peterson")');
await go("/client/questionnaire");
await answer(); await answer(); await answer();
t("3 answered", (await st()).answered===3);
await go("/client");
t("home: 3 of 6", (await p.evaluate(()=>document.body.innerText)).includes("3 of 6 answered"));
await go("/client/questionnaire");
let s=await st();
t("resumes on Q4 at 50%", /question 4 of 6/i.test(s.label||"")&&s.aria==="50", JSON.stringify(s));
await answer(); s=await st();
t("4th answer → stored 4 (not 1)", s.answered===4, JSON.stringify(s));
t("bar 67%", s.aria==="67", s.aria);
await go("/client");
t("home: 4 of 6", (await p.evaluate(()=>document.body.innerText)).includes("4 of 6 answered"));

console.log("\n━━ SKIP no longer inflates progress ━━");
await go("/"); await click('button:has-text("Reset demo")'); await click('a:has-text("Dave Peterson")');
await go("/client/questionnaire");
await click('button:has-text("Skip")');
s=await st();
t("skip moves question, not bar", /question 2 of 6/i.test(s.label||"")&&s.aria==="0", JSON.stringify(s));
await answer(); s=await st();
t("answering q2 → 17%", s.aria==="17"&&s.answered===1, JSON.stringify(s));

console.log("\n━━ upload bar animates ━━");
await go("/"); await click('a:has-text("Enter as Emily")'); await go("/client/documents");
await p.locator('button:has-text("Upload")').first().click();
await p.waitForTimeout(350);
const a=await p.evaluate(()=>{const el=document.querySelector('[role="progressbar"] > div');return el?getComputedStyle(el).transform:null;});
await p.waitForTimeout(300);
const bx=await p.evaluate(()=>{const el=document.querySelector('[role="progressbar"] > div');return el?getComputedStyle(el).transform:null;});
t("upload bar has aria label", (await p.evaluate(()=>!!document.querySelector('[role="progressbar"][aria-label]'))));
t("upload bar actually moves", a!==bx, `${a} vs ${bx}`);
console.log(`\n═══ ${pass} passed · ${fail} failed ═══`);
await b.close();
