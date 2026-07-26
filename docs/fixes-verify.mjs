import { chromium } from '/tmp/node_modules/playwright-core/index.mjs';
const B="http://localhost:3111"; let pass=0,fail=0;
const t=(n,c,d="")=>{if(c){pass++;console.log(`  ✓ ${n}`);}else{fail++;console.log(`  ✗ FAIL: ${n} ${d}`);}};
const txt=async p=>(await p.evaluate(()=>document.body.innerText)).replace(/\s+/g," ");
const b=await chromium.launch({executablePath:"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"});
const p=await (await b.newContext({viewport:{width:1440,height:900}})).newPage();
const errs=[]; p.on("pageerror",e=>errs.push(e.message));
const go=async x=>{await p.goto(B+x,{waitUntil:"networkidle"});await p.waitForTimeout(700);};
const click=async s=>{await p.locator(s).first().click();await p.waitForTimeout(600);};
const navBadge=async()=>p.evaluate(()=>{const a=document.querySelector('aside a[href="/client/questions"]');if(!a)return"none";const sp=[...a.querySelectorAll("span")].map(s=>s.textContent.trim());return sp.find(x=>/^\d+$/.test(x))||"none";});

await go("/"); await click('button:has-text("Reset demo")');

console.log("\n━━ DAVE: documents are a real destination, not a dead end ━━");
await click('a:has-text("Dave Peterson")');
await go("/client/documents");
let s=await txt(p);
t("no 'switch to Emily' dead end", !s.includes("Switch to Emily"), s.slice(0,120));
t("gated on the questionnaire first", s.includes("First, tell us about your business"));
t("offers the way forward", s.includes("Answer the questions"));

await go("/client/questionnaire");
for(let i=0;i<6;i++){ await p.locator('div.rise-in button').filter({hasNotText:/Back|Skip/}).first().click(); await p.waitForTimeout(400); }
await go("/client/documents");
s=await txt(p);
t("eight asks listed", s.includes("Eight things for Peterson Coffee"));
t("named in his words", s.includes("Profit & loss statement")&&s.includes("Business bank statements"));
t("says where to find each", s.includes("bookkeeping app")||s.includes("Gusto calls this"));
t("all still needed", (s.match(/Still needed/g)||[]).length===8, String((s.match(/Still needed/g)||[]).length));

await click('button:has-text("Upload")'); await p.waitForTimeout(2200);
s=await txt(p);
t("upload is read", s.includes("We read it"));
t("count moves", s.includes("1 of 8 in"));
await go("/client");
s=await txt(p);
t("home reflects the upload", s.includes("1 of 8 in — send the rest"));

console.log("\n━━ DAVE: questions page is day-one, not someone else's ━━");
await go("/client/questions");
s=await txt(p);
t("no 'switch to Emily' dead end", !s.includes("Switch to Emily"));
t("explains what lands here", s.includes("No questions yet"));

console.log("\n━━ EMILY: nav badge counts a NEW question from Mike ━━");
await go("/"); await click('button:has-text("Reset demo")');
await click('a:has-text("Enter as Mike")');
await go("/staff/returns/ret-emily?field=f-div-qual");
await click('button:has-text("Ask the client")');
await p.locator('textarea').first().fill("Is your Vanguard account still open?");
await p.locator('button[aria-label="Send"]').first().click();
await p.waitForTimeout(800);
await go("/"); await click('a:has-text("Enter as Emily")');
t("badge rises to 3", (await navBadge())==="3", `badge=${await navBadge()}`);
await go("/client/questions");
s=await txt(p);
t("header agrees with badge", s.includes("3 things to answer"), s.slice(0,140));

console.log("\n━━ AI flag count agrees dashboard ↔ workspace ━━");
await go("/"); await click('button:has-text("Reset demo")');
await click('a:has-text("Enter as Mike")');
await click('button:has-text("All open")');
const card=await p.evaluate(()=>document.querySelector('a[href="/staff/returns/ret-emily"]')?.innerText.replace(/\s+/g," ")||"");
const dash=(card.match(/(\d+) AI values to verify/)||[])[1];
await go("/staff/returns/ret-emily");
s=await txt(p);
const ws=(s.match(/Review next flagged value (\d+)/)||[])[1];
t("dashboard count = workspace count", dash===ws&&!!dash, `dashboard=${dash} workspace=${ws}`);

console.log("\n━━ Corrections are validated ━━");
await go("/staff/returns/ret-emily?field=f-charitable");
await click('button:has-text("Fix it")');
await p.locator('input[aria-label^="Correct value"]').first().fill("");
await p.locator('button:has-text("Save correction")').first().click();
await p.waitForTimeout(400);
s=await txt(p);
t("empty value refused", s.includes("can't be left blank"), s.slice(0,120));
await p.locator('input[aria-label^="Correct value"]').first().fill("not a number");
await p.locator('button:has-text("Save correction")').first().click();
await p.waitForTimeout(400);
s=await txt(p);
t("non-numeric refused", s.includes("Use a number"));
await p.locator('input[aria-label^="Correct value"]').first().fill("300");
await p.locator('button:has-text("Save correction")').first().click();
await p.waitForTimeout(600);
s=await txt(p);
t("valid correction lands, normalised", s.includes("$300.00"), s.slice(0,160));

console.log("\n━━ Queue counts respect the mine/firm scope ━━");
await go("/staff");
const mineFiled=await p.evaluate(()=>document.body.innerText.match(/All open \(([\d,]+) filed\)/)?.[1]);
await click('button:has-text("Whole firm")');
const firmFiled=await p.evaluate(()=>document.body.innerText.match(/All open \(([\d,]+) filed\)/)?.[1]);
t("'my returns' filed ≠ firm filed", mineFiled!==firmFiled, `mine=${mineFiled} firm=${firmFiled}`);
t("firm filed is the bigger number", Number(firmFiled)>Number(mineFiled), `mine=${mineFiled} firm=${firmFiled}`);

console.log("\n━━ Staff are named, never raw ids ━━");
s=await txt(p);
t("queue shows full names", s.includes("Mike Sullivan")||s.includes("Rachel Adams"));
t("no bare 'rachel'/'james' ids", !/·\s(rachel|james|katie|mike)\b/.test(s), s.slice(0,200));
await go("/"); await click('a:has-text("Sarah Mitchell")');
s=await txt(p);
t("reviewer names the preparer", !/prepared by (rachel|james|mike|katie)\b/.test(s));

console.log("\n━━ KATIE: scope covers documents and search too ━━");
await go("/"); await click('a:has-text("Katie Brennan")');
await go("/staff/documents");
s=await txt(p);
const clients=Number((s.match(/across ([\d,]+) clients/)||[])[1]?.replace(/,/g,""));
t("not the whole firm's shelf", clients>0&&clients<200, `clients=${clients}`);
t("says why the list is short", s.includes("Seasonal access"));
t("Emily's documents absent", !s.includes("Emily Carter"));
await p.keyboard.press("Meta+k"); await p.waitForTimeout(300);
await p.locator('input[aria-label="Search"]').fill("Emily");
await p.waitForTimeout(900);
s=await txt(p);
t("search can't leak her either", !s.includes("Emily Carter — 2025"), s.slice(0,160));

console.log(`\npage errors: ${errs.length}`); errs.forEach(e=>console.log("  "+e));
console.log(`\n═══ ${pass} passed · ${fail} failed ═══`);
await b.close();
process.exit(fail?1:0);
