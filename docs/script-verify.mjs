import { chromium } from '/tmp/node_modules/playwright-core/index.mjs';
// Walks the exact click path in docs/VIDEO_SCRIPT.md, in order, so the script
// can't drift from the app. Every step is a thing the narrator does on camera.
const B="http://localhost:3111"; let pass=0,fail=0;
const t=(n,c,d="")=>{if(c){pass++;console.log(`  ✓ ${n}`);}else{fail++;console.log(`  ✗ FAIL: ${n} ${d}`);}};
const b=await chromium.launch({executablePath:"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"});
const p=await (await b.newContext({viewport:{width:1440,height:900}})).newPage();
const errs=[]; p.on("pageerror",e=>errs.push(e.message));
const txt=async()=>(await p.evaluate(()=>document.body.innerText)).replace(/\s+/g," ");
const go=async x=>{await p.goto(B+x,{waitUntil:"networkidle"});await p.waitForTimeout(700);};
const click=async(s,ms=600)=>{await p.locator(s).first().click();await p.waitForTimeout(ms);};
const persona=async name=>{await click('button[aria-expanded]:has-text("Preparer"), button[aria-expanded]:has-text("Client"), button[aria-expanded]:has-text("Reviewer"), button[aria-expanded]:has-text("Firm admin")');await click(`button:has-text("${name}")`,900);};

console.log("\n━━ 0:00 Opening ━━");
await go("/");
let s=await txt();
t("thesis on screen", s.includes("Every number has a receipt"));
t("six lenses framing", s.includes("six working lenses"));
await click('button:has-text("Reset demo")');
t("Reset demo confirms", (await txt()).includes("Fresh start ready"));

console.log("\n━━ 0:35 Dave, day one ━━");
await click('a:has-text("Dave Peterson")',1200);
s=await txt();
t("welcome banner", s.includes("Welcome, Dave"));
t("2 things · 15 min", s.includes("2 things need you")&&s.includes("about 15 min"));
t("docs deliberately locked", s.includes("Unlocks once we know"));
t("empty history explained", s.includes("Nothing has happened yet"));
await click('a:has-text("Tell us about your year")',900);
t("questionnaire says why", /question 1 of 6/i.test(await txt()));
for(let i=0;i<3;i++){await click('div.rise-in button:not(:has-text("Back")):not(:has-text("Skip"))',450);}
await click('a:has-text("Home")',900);
t("home shows resume state", (await txt()).includes("3 of 6 answered"));

console.log("\n━━ 1:45 Documents unlock ━━");
await go("/client/questionnaire");
for(let i=0;i<3;i++){await click('div.rise-in button:not(:has-text("Back")):not(:has-text("Skip"))',450);}
t("finish screen", (await txt()).includes("hard part done"));
await click('a:has-text("Share documents")',900);
s=await txt();
t("eight asks, his language", s.includes("Payroll summary for the year")&&s.includes("annual payroll register"));
t("permission to skip", s.includes("skip if you didn't"));
await click('button:has-text("Upload")',2200);
t("read on arrival", (await txt()).includes("We read it"));
await click('a:has-text("Home")',900);
t("home moved with it", (await txt()).includes("1 of 8 in"));

console.log("\n━━ 2:25 Emily, mid-season ━━");
await persona("Emily Carter");
s=await txt();
t("2 things · 4 min", s.includes("2 things need you")&&s.includes("about 4 min"));
t("five plain steps", s.includes("We prepare")&&s.includes("You approve"));
t("no confidence scores", !s.includes("%"));
await click('a:has-text("Questions for you")',900);
s=await txt();
t("anchored to the receipt", s.includes("About: Charitable contributions"));
t("internal note absent", !s.includes("401(k)"));
await click('button:has-text("It was $300")',900);
t("one-tap answer lands", (await txt()).includes("Answered"));
await click('a:has-text("Your documents")',900);
await click('button:has-text("Upload")',3200);
t("K-1 read", (await txt()).includes("already read it"));
await click('a:has-text("Home")',900);
t("all caught up", (await txt()).includes("all caught up"));

console.log("\n━━ 3:20 Mike's dashboard ━━");
await persona("Mike Sullivan");
await go("/staff");
s=await txt();
t("ranked queue with reasons", s.includes("Need you now")&&s.includes("Client replied — unread"));
t("Emily flagged from her reply", s.includes("Read client reply"));
await click('button:has-text("Whole firm")',900);
t("manager workload strip", (await txt()).includes("Mike Sullivan"));
await click('button:has-text("My returns")',900);

console.log("\n━━ 4:05 Traceability ━━");
await go("/staff/returns/ret-emily");
s=await txt();
t("workspace loaded", s.includes("Review next flagged value"));
await click('button:has-text("Wages and salary")',900);
s=await txt();
t("receipt names the box", s.includes("Read from")&&s.includes("Wages, tips"));
t("confidence in words before the number", /is very confident \(98%\)/i.test(s), s.slice(0,120));
t("trace thread drawn", await p.evaluate(()=>!!document.querySelector('svg path, svg line')));
await click('button:has-text("Total income")',900);
s=await txt();
t("calculation receipt", s.includes("Plain arithmetic — no AI here"));
t("inputs are clickable", s.includes("Click an input to keep tracing"));

console.log("\n━━ 5:30 Trust and correction ━━");
await click('button:has-text("Charitable contributions")',900);
s=await txt();
t("amber + why unsure", s.includes("Check this")&&s.includes("handwritten"));
t("62% shown to staff", s.includes("62%"));
await click('button:has-text("Fix it")');
await p.locator('input[aria-label^="Correct value"]').first().fill("abc");
await click('button:has-text("Save correction")',400);
t("validation refuses junk", (await txt()).includes("Use a number"));
await p.locator('input[aria-label^="Correct value"]').first().fill("300");
await click('button:has-text("Save correction")',700);
s=await txt();
t("correction normalised", s.includes("$300.00"));
t("undo offered", s.includes("Undo"));
t("AI original kept", s.includes("Corrected from"));
t("AI notes with reasoning", s.includes("Keep the standard deduction")&&s.includes("15,000"));
t("warning explains itself", s.includes("W-2 boxes don't match"));

console.log("\n━━ 6:30 Affordances ━━");
await click('button:has-text("Legend")',500);
s=await txt();
t("six states documented", ["AI · unverified","Check this","Needs approval","Verified","Edited","Locked"].every(x=>s.includes(x)));
await p.keyboard.press("Escape"); await p.waitForTimeout(300);
await click('button:has-text("IRA contribution")',900);
s=await txt();
t("needs approval → Approve", s.includes("Needs approval")&&s.includes("Approve"));
await click('button:has-text("Standard deduction")',900);
t("lock explains why", (await txt()).includes("Set by IRS rules"));

console.log("\n━━ 7:10 Collaboration + orientation ━━");
await click('button:has-text("Conversations")',700);
s=await txt();
t("grouped by whose move", s.includes("Waiting on Emily")||s.includes("Firm's move"));
t("internal thread marked", s.includes("Firm only"));
await click('button[aria-label="Close conversations"]',400);
await click('button:has-text("Qualified dividends")',900);
await click('button:has-text("Ask the client")',700);
s=await txt();
t("composer anchored", s.includes("New conversation about"));
t("visibility choice", s.includes("Internal note")&&s.includes("Ask Emily"));
t("URL carries the field", p.url().includes("field=f-div-qual"));

console.log("\n━━ 8:00 Scale ━━");
await go("/staff/documents");
s=await txt();
t("real volume", /[\d,]{5} documents across \d+ clients/.test(s), s.slice(0,80));
t("missing count is a button", s.includes("still missing"));
await p.keyboard.press("Meta+k"); await p.waitForTimeout(400);
await p.locator('input[aria-label="Search"]').fill("donation");
await p.waitForTimeout(900);
t("⌘K finds the conversation", (await txt()).includes("Can you confirm your donation"));
await p.keyboard.press("Escape");

console.log("\n━━ 8:40 The other roles ━━");
await persona("Katie Brennan");
await go("/staff/returns/ret-emily");
s=await txt();
t("door is locked", s.includes("isn't yours to open"));
t("names the assignee", s.includes("Mike Sullivan"));
t("names the approver", s.includes("Linda Brooks"));
await click('button:has-text("Request access from Linda")',700);
t("request confirmed", (await txt()).includes("Request sent"));
await persona("Sarah Mitchell");
t("risk-first queue", (await txt()).includes("Ordered by review risk"));
await persona("Linda Brooks");
s=await txt();
t("firm operations view", s.includes("Firm operations")&&s.includes("Who's carrying what"));
await persona("Mike Sullivan");
// Switching closes the menu — reopening it is a real step on camera.
await click('button[aria-expanded]:has-text("Preparer")');
await click('button:has-text("My own 2025 return")',1200);
t("client hat on", (await txt()).includes("Client hat on"));
t("firm tools hidden", !(await txt()).includes("Search anything"));

console.log(`\npage errors: ${errs.length}`); errs.forEach(e=>console.log("  "+e));
console.log(`\n═══ ${pass} passed · ${fail} failed ═══`);
await b.close();
process.exit(fail?1:0);
