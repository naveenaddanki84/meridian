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

console.log("\n━━ MIKE asks a NEW question (client-visible) ━━");
await click('a:has-text("Enter as Mike")');
await go("/staff/returns/ret-emily?field=f-div-qual");
await click('button:has-text("Ask the client")');
await p.locator('textarea').first().fill("Is your Vanguard account still open?");
await p.locator('button[aria-label="Send"]').first().click();
await p.waitForTimeout(800);
let s=await txt(p);
t("toast: question sent", s.includes("Question sent"));
t("thread appears for staff", s.includes("Question about qualified dividends"));
const persisted=await p.evaluate(()=>localStorage.getItem("meridian.threads.v2"));
t("persisted to shared store", !!persisted&&persisted.includes("Vanguard"));

console.log("\n━━ EMILY receives it ━━");
await go("/"); await click('a:has-text("Enter as Emily")');
s=await txt(p);
const badge=await p.evaluate(()=>{const a=document.querySelector('aside a[href="/client/questions"]');return a?[...a.querySelectorAll("span")].map(x=>x.textContent.trim()).find(x=>/^\d+$/.test(x))||"none":"none"});
t("nav badge counts it", badge==="3"||badge==="2", `badge=${badge}`);
await go("/client/questions");
s=await txt(p);
t("EMILY SEES the new question", s.includes("Is your Vanguard account still open?"), "BROKEN");
t("anchored to the field", s.includes("About: Qualified dividends"));
t("marked as her turn", s.includes("Your turn"));

console.log("\n━━ EMILY answers it ━━");
const box=p.locator('textarea').first();
const hasFree=await box.count();
if(hasFree){ await box.fill("Yes, still open."); await p.locator('button[aria-label="Send answer"]').first().click(); }
else { await click('button:has-text("Something else")'); await p.locator('textarea').first().fill("Yes, still open."); await p.locator('button[aria-label="Send answer"]').first().click(); }
await p.waitForTimeout(800);
s=await txt(p);
t("her answer shows", s.includes("Yes, still open"));

console.log("\n━━ MIKE sees her answer on the NEW thread ━━");
await go("/"); await click('a:has-text("Enter as Mike")');
s=await txt(p);
t("dashboard flags unread reply", s.includes("Client replied — unread"));
await go("/staff/returns/ret-emily");
await click('button:has-text("Conversations")');
s=await txt(p);
t("new thread listed for staff", s.includes("Question about qualified dividends"));
const expand=p.locator('button:has-text("Question about qualified dividends")').first();
if(await expand.count()){await expand.click();await p.waitForTimeout(500);s=await txt(p);}
t("HER ANSWER reached Mike", s.includes("Yes, still open"), "ROUND TRIP BROKEN");

console.log("\n━━ INTERNAL note stays internal ━━");
await go("/staff/returns/ret-emily?field=f-wages");
await click('button:has-text("Ask the client")');
await click('button:has-text("Internal note")');
await p.locator('textarea').first().fill("SECRET-INTERNAL-XYZ do not show client");
await p.locator('button[aria-label="Send"]').first().click();
await p.waitForTimeout(800);
t("internal note saved (staff sees)", (await txt(p)).includes("SECRET-INTERNAL-XYZ")||(await txt(p)).includes("Note: Wages and salary"));
await go("/"); await click('a:has-text("Enter as Emily")');
await go("/client/questions");
s=await txt(p);
t("CLIENT CANNOT SEE internal note", !s.includes("SECRET-INTERNAL-XYZ"), "PERMISSION LEAK!!");

console.log("\n━━ RESET clears everything ━━");
await go("/"); await click('button:has-text("Reset demo")');
await click('a:has-text("Enter as Emily")');
s=await txt(p);
t("back to 2 things need you", s.includes("2 things need you"));
await go("/client/questions");
s=await txt(p);
t("demo threads cleared", !s.includes("Vanguard account still open"));
t("original questions restored", s.includes("Bright Futures receipt"));

console.log(`\npage errors: ${errs.length}`);
console.log(`\n═══ ${pass} passed · ${fail} failed ═══`);
await b.close();
