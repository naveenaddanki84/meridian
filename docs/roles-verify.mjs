import { chromium } from '/tmp/node_modules/playwright-core/index.mjs';
const B="http://localhost:3111"; let pass=0,fail=0;
const t=(n,c,d="")=>{if(c){pass++;console.log(`  ✓ ${n}`);}else{fail++;console.log(`  ✗ FAIL: ${n} ${d}`);}};
const txt=async p=>(await p.evaluate(()=>document.body.innerText)).replace(/\s+/g," ");
const b=await chromium.launch({executablePath:"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"});
const p=await (await b.newContext({viewport:{width:1440,height:900}})).newPage();
const errs=[]; p.on("pageerror",e=>errs.push(e.message));
const go=async x=>{await p.goto(B+x,{waitUntil:"networkidle"});await p.waitForTimeout(700);};
const click=async s=>{await p.locator(s).first().click();await p.waitForTimeout(600);};
await go("/"); await click('button:has-text("Reset demo")');

console.log("\n━━ DAVE: day one ━━");
await click('a:has-text("Dave Peterson")');
let s=await txt(p);
t("welcome banner", s.includes("Welcome to Meridian"));
t("greets with Welcome not Good morning", s.includes("Welcome, Dave"));
t("business context in subhead", s.includes("Peterson Coffee")&&s.includes("1120-S"));
t("2 things need you", s.includes("2 things need you"));
t("questionnaire NOT done", s.includes("6 quick questions"));
t("docs gated until questions done", s.includes("Unlocks once we know"));
t("journey at step 1", s.includes("Getting started"));
t("empty-history explained", s.includes("Nothing has happened yet"));
t("no refund figure yet", !s.includes("Estimated refund"));

console.log("\n━━ DAVE: answers all 6 questions ━━");
await go("/client/questionnaire");
s=await txt(p);
t("starts at question 1 of 6", s.includes("QUESTION 1 OF 6")||s.includes("Question 1 of 6"));
t("explains why asked", s.includes("This decides which tax form"));
t("has progress bar", (await p.locator('[role="progressbar"]').count())>0);
for(let i=0;i<6;i++){
  const opt=p.locator('main button').filter({hasText:/corporation|Yes|One|regularly|just me/}).first();
  const any=p.locator('div.rise-in button').first();
  if(await opt.count()) await opt.click(); else await any.click();
  await p.waitForTimeout(450);
}
s=await txt(p);
t("finishes questionnaire", s.includes("hard part done"), s.slice(0,90));
t("points to next step", s.includes("Share documents"));

console.log("\n━━ DAVE: home reflects progress ━━");
await go("/client");
s=await txt(p);
t("questionnaire now done", s.includes("All 6 answered"));
t("docs now unlocked", s.includes("0 of 8 uploaded"));
t("one thing left", s.includes("One thing needs you"));
t("what's-next updated", s.includes("Share your documents and Mike"));

console.log("\n━━ KATIE: scoped access ━━");
await go("/"); await click('a:has-text("Katie Brennan")');
s=await txt(p);
t("seasonal banner", s.includes("Seasonal access"));
t("no firm toggle", !s.includes("Whole firm"));
await go("/staff/returns");
s=await txt(p);
t("sees locked rows", s.includes("No access"));
await go("/staff/returns/ret-emily");
s=await txt(p);
t("access denied page", s.includes("isn't yours to open"));
t("names the approver", s.includes("Linda Brooks"));
t("no client data leaked", !s.includes("85,200")&&!s.includes("Wages and salary"));
t("no stale back-chip", !s.includes("Back to Noah")&&!s.includes("Back to Emily"));
await click('button:has-text("Request access")');
s=await txt(p);
t("request confirmed", s.includes("Request sent to Linda Brooks"));
t("tells them what happens next", s.includes("email the moment"));
await go("/staff/returns/ret-mike");
s=await txt(p);
t("still blocked on other returns", s.includes("isn't yours to open")||s.includes("wired"));

console.log("\n━━ SARAH (reviewer): risk-first dashboard ━━");
await go("/"); await click('a:has-text("Sarah Mitchell")');
s=await txt(p);
t("review-specific heading", s.includes("Review queue, Sarah"));
t("explains ordering", s.includes("review risk"));
t("sign-off lens", s.includes("Ready to sign off"));
t("risk lens", s.includes("Check before signing"));
t("client-approval lens", s.includes("With the client"));
t("NOT the preparer dashboard", !s.includes("Your queue")&&!s.includes("Need you now"));
await click('button:has-text("Check before signing")');
s=await txt(p);
t("risk list shows unverified counts", s.includes("not yet verified"));

console.log("\n━━ LINDA (admin): operations dashboard ━━");
await go("/"); await click('a:has-text("Linda Brooks")');
s=await txt(p);
t("ops-specific heading", s.includes("Firm operations, Linda"));
t("capacity section", s.includes("Who's carrying what"));
t("shows averages", s.includes("per person on average"));
t("deadline risk section", s.includes("Closest to breaching"));
t("season stats", s.includes("Filed this season")&&s.includes("Overdue"));
t("mentions access requests", s.includes("access requests come to you")||s.includes("access requests"));
t("NOT the reviewer dashboard", !s.includes("Review queue, "));
t("NOT the preparer dashboard", !s.includes("Your queue,"));

console.log("\n━━ MIKE unaffected ━━");
await go("/"); await click('a:has-text("Enter as Mike")');
s=await txt(p);
t("preparer queue intact", s.includes("Your queue, Mike"));
t("can open Emily", true);
await go("/staff/returns/ret-emily");
t("Mike opens Emily fine", (await txt(p)).includes("Emily Carter · 2025"));

console.log(`\npage errors: ${errs.length}`); errs.slice(0,3).forEach(e=>console.log("  "+e.slice(0,100)));
console.log(`\n═══ ${pass} passed · ${fail} failed ═══`);
await b.close();
