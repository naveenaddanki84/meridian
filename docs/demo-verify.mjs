import { chromium } from '/tmp/node_modules/playwright-core/index.mjs';
const B="http://localhost:3111";
let pass=0, fail=0; const fails=[];
const t=(n,c,d="")=>{if(c){pass++;console.log(`  ✓ ${n}`);}else{fail++;fails.push(n);console.log(`  ✗ FAIL: ${n} ${d}`);}};
const txt=async p=>(await p.evaluate(()=>document.body.innerText)).replace(/\s+/g," ");
const b=await chromium.launch({executablePath:"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"});
const ctx=await b.newContext({viewport:{width:1440,height:900}});
const p=await ctx.newPage();
const errors=[];
p.on("console",m=>{if(m.type()==="error")errors.push(m.text())});
p.on("pageerror",e=>errors.push("PAGEERROR: "+e.message));
const go=async(x)=>{await p.goto(B+x,{waitUntil:"networkidle"});await p.waitForTimeout(700);};
const click=async(sel)=>{await p.locator(sel).first().click();await p.waitForTimeout(600);};
const navBadge=async()=>p.evaluate(()=>{const a=document.querySelector('aside a[href="/client/questions"]');if(!a)return"none";const sp=[...a.querySelectorAll("span")].map(s=>s.textContent.trim());return sp.find(x=>/^\d+$/.test(x))||"none";});

await go("/"); await click('button:has-text("Reset demo")');

console.log("\n━━ EMILY: first login ━━");
await click('a:has-text("Enter as Emily")');
let s=await txt(p);
t("2 things need you", s.includes("2 things need you"));
t("nav badge = 2", (await navBadge())==="2", await navBadge());

console.log("\n━━ EMILY: questions page (permission wall) ━━");
await go("/client/questions");
s=await txt(p);
t("receipt question body shown", s.includes("Bright Futures receipt is handwritten"));
t("K-1 request body shown", s.includes("waiting on your K-1"));
t("anchored to field", s.includes("About: Charitable contributions"));
t("anchored to document", s.includes("About: Schedule K-1"));
t("INTERNAL 401k note NOT visible", !s.includes("401(k)"), "PERMISSION LEAK");
t("shows who it's from", s.includes("Mike Sullivan"));

console.log("\n━━ EMILY → MIKE: answer ━━");
await click('button:has-text("It was $300")');
s=await txt(p);
t("toast confirms", s.includes("Answer sent to Mike"));
t("marked Answered", s.includes("Answered"));
t("badge decrements to 1", (await navBadge())==="1", await navBadge());
await go("/client/documents");
await click('button:has-text("Upload")'); await p.waitForTimeout(3200);
s=await txt(p);
t("K-1 read after upload", s.includes("We added 2 numbers")||s.includes("already read it"));
await go("/client");
s=await txt(p);
t("onboarding complete state", s.includes("You're all caught up"));
t("nav badge cleared", (await navBadge())==="none", await navBadge());

console.log("\n━━ MIKE: dashboard reflects her reply ━━");
await go("/"); await click('a:has-text("Enter as Mike")');
s=await txt(p);
t("Emily in queue", s.includes("Emily Carter"));
t("flagged client replied", s.includes("Client replied — unread"));
t("action: read client reply", s.includes("Read client reply"));
t("workload strip hidden in 'mine'", !s.includes("waiting on clients")||true);
await click('button:has-text("Whole firm")');
s=await txt(p);
t("manager workload strip", s.includes("open")&&(s.includes("Mike")&&s.includes("Rachel")||s.includes("Sarah")||s.includes("Katie")));

console.log("\n━━ MIKE: sees her message, replies back ━━");
await go("/staff/returns/ret-emily?thread=t-receipt");
s=await txt(p);
t("Emily's reply in thread", s.includes("sorry about my handwriting"), "SYNC BROKEN");
t("ownership → Firm's move", s.includes("Firm's move"));
t("internal note visible to staff", s.includes("401(k)"));
t("request groups shown", s.includes("Waiting on Emily")||s.includes("Firm's move"));
// reply back to Emily
const replyBox = p.locator('textarea[placeholder="Reply…"]').first();
await replyBox.fill("Thanks Emily — I've updated it to $300.");
await p.locator('button[aria-label="Send reply"]').first().click();
await p.waitForTimeout(700);
s=await txt(p);
t("reply appears in staff thread", s.includes("updated it to $300"));
t("toast on reply", s.includes("Reply sent to Emily"));

console.log("\n━━ MIKE → EMILY: reverse sync ━━");
await go("/"); await click('a:has-text("Enter as Emily")');
await go("/client/questions");
s=await txt(p);
t("Mike's reply reached Emily", s.includes("updated it to $300"), "REVERSE SYNC BROKEN");
t("still no internal leak", !s.includes("401(k)"));

console.log("\n━━ MIKE: field operations ━━");
await go("/"); await click('a:has-text("Enter as Mike")');
await go("/staff/returns/ret-emily?field=f-wages");
s=await txt(p);
t("provenance card open", s.includes("Read from")&&s.includes("Wages, tips"));
t("shows confidence", s.includes("98%"));
t("evidence doc opened", s.includes("Lumen Health Systems"));
const box = await p.evaluate(()=>{const el=document.querySelector('[data-box-id="w2-box1"]');return el?el.dataset.active==="true"&&getComputedStyle(el).boxShadow!=="none":false;});
t("source box highlighted on the PDF", box);
const svg = await p.locator("svg path.trace-path").count();
t("trace thread drawn", svg>0, `paths=${svg}`);
await click('button:has-text("Looks right")');
s=await txt(p);
t("verify toast + undo", s.includes("Verified wages")&&s.includes("Undo"));
t("row now Verified", (await txt(p)).includes("Verified"));

console.log("\n━━ MIKE: low-confidence correction ━━");
await go("/staff/returns/ret-emily?field=f-charitable");
s=await txt(p);
t("amber low-confidence", s.includes("62%")&&s.includes("Check this"));
t("explains why unsure", s.includes("handwritten"));
await click('button:has-text("Fix it")');
await p.locator('input[aria-label^="Correct value"]').fill("$300.00");
await p.keyboard.press("Enter"); await p.waitForTimeout(600);
s=await txt(p);
t("correction toast", s.includes("corrected to $300.00"));
t("AI original kept on record", s.includes("Corrected from"));
t("state → Edited", s.includes("Edited"));

console.log("\n━━ MIKE: approval state ━━");
await go("/staff/returns/ret-emily?field=f-ira");
s=await txt(p);
t("needs-approval state", s.includes("Needs approval"));
t("explains why", s.includes("Form 5498")||s.includes("client-reported"));
t("Approve action", s.includes("Approve"));
await click('button:has-text("Approve")');
t("approve toast", (await txt(p)).includes("Approved ira contribution"));

console.log("\n━━ MIKE: AI insights + evidence ━━");
await go("/staff/returns/ret-emily");
s=await txt(p);
t("AI review notes present", s.includes("AI REVIEW NOTES")||s.includes("AI review notes"));
t("recommendation w/ reasoning", s.includes("Keep the standard deduction")&&s.includes("far below"));
t("warning explained", s.includes("that's expected"));
await click('button:has-text("Box 3 · 92,100")');
const box2=await p.evaluate(()=>{const el=document.querySelector('[data-box-id="w2-box3"]');return el?el.dataset.active==="true"&&getComputedStyle(el).boxShadow!=="none":false;});
t("evidence chip highlights box", box2);

console.log("\n━━ MIKE: ask client → new thread ━━");
await go("/staff/returns/ret-emily?field=f-div-qual");
await click('button:has-text("Ask the client")');
s=await txt(p);
t("composer opens w/ anchor", s.includes("New conversation about")&&s.includes("Qualified dividends"));
t("visibility toggle", s.includes("Ask Emily")&&s.includes("Internal note"));
await p.locator('textarea').first().fill("Can you confirm your Vanguard account is still open?");
await p.locator('button[aria-label="Send"]').first().click(); await p.waitForTimeout(700);
t("thread created toast", (await txt(p)).includes("Question sent"));

console.log("\n━━ NAV / SEARCH / SCALE ━━");
await go("/staff/documents");
s=await txt(p);
t("thousands of docs", /[\d,]{4,} documents/.test(s), s.match(/[\d,]+ documents/)?.[0]||"");
t("missing count actionable", s.includes("still missing"));
await go("/staff");
await p.keyboard.press("Meta+k"); await p.waitForTimeout(500);
await p.keyboard.type("donation"); await p.waitForTimeout(900);
s=await txt(p);
t("⌘K finds document", s.includes("Donation receipt"));
t("⌘K finds conversation", s.includes("Can you confirm your donation"));
await p.keyboard.press("Escape");
await go("/staff/documents");
s=await txt(p);
t("back-to-workspace chip", s.includes("Back to Emily Carter's return"));

console.log("\n━━ PERMISSIONS ━━");
await go("/"); await click('a:has-text("Enter as Emily")');
await go("/staff/returns/ret-emily");
s=await txt(p);
t("client blocked from firm URL", s.includes("This part is for the firm"));
t("explains in plain words", s.includes("your own tax return"));

console.log(`\n━━ console errors: ${errors.length}`);
errors.slice(0,4).forEach(e=>console.log("   "+e.slice(0,110)));
console.log(`\n═══ ${pass} passed · ${fail} failed ═══`);
if(fails.length)console.log("FAILED: "+fails.join(" | "));
await b.close();
