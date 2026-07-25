import { chromium } from '/tmp/node_modules/playwright-core/index.mjs';
const pages=["/","/client","/client/documents","/client/questions","/client/questionnaire","/staff","/staff/returns","/staff/documents","/staff/returns/ret-emily"];
function audit(){
  function lum(c){const m=c.match(/\d+/g).map(Number).slice(0,3).map(v=>v/255).map(v=>v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4));return 0.2126*m[0]+0.7152*m[1]+0.0722*m[2];}
  function bgOf(el){let n=el;while(n){const b=getComputedStyle(n).backgroundColor;if(b&&!b.includes("rgba(0, 0, 0, 0)"))return b;n=n.parentElement;}return "rgb(255,255,255)";}
  const bad=[],unl=[],tiny=[];
  document.querySelectorAll("p,span,a,button,li,h1,h2,h3,div,label,kbd,dt,dd").forEach(el=>{
    if(!el.textContent.trim()||el.children.length>0)return;
    const cs=getComputedStyle(el),fs=parseFloat(cs.fontSize);
    const a=lum(cs.color),b=lum(bgOf(el));const r=(Math.max(a,b)+0.05)/(Math.min(a,b)+0.05);
    const large=fs>=24||(fs>=18.66&&parseInt(cs.fontWeight)>=700);
    if(r<(large?3:4.5))bad.push(el.textContent.trim().slice(0,24)+" @"+r.toFixed(2));
    if(fs<12)tiny.push(el.textContent.trim().slice(0,18));
  });
  document.querySelectorAll("button,a[href]").forEach(el=>{if(!((el.getAttribute("aria-label")||el.textContent||"").trim()))unl.push(el.className.slice(0,40));});
  const hscroll = document.documentElement.scrollWidth > window.innerWidth + 1;
  return {bad:[...new Set(bad)],unl:[...new Set(unl)],tiny:[...new Set(tiny)],hscroll};
}
const b=await chromium.launch({executablePath:"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"});
let fails=0;
for (const vp of [{w:1440,h:900,n:"desktop"},{w:390,h:844,n:"mobile "}]) {
  const ctx=await b.newContext({viewport:{width:vp.w,height:vp.h}});
  const p=await ctx.newPage();
  console.log(`\n===== ${vp.n} =====`);
  for (const path of pages) {
    try { await p.goto("http://localhost:3111"+path,{waitUntil:"networkidle",timeout:15000}); } catch(e){}
    await p.waitForTimeout(600);
    const r=await p.evaluate(audit);
    const issues=[];
    if(r.bad.length)issues.push(`contrast:${r.bad.length} ${JSON.stringify(r.bad.slice(0,2))}`);
    if(r.unl.length)issues.push(`unlabeled:${r.unl.length}`);
    if(r.tiny.length)issues.push(`tiny:${r.tiny.length} ${JSON.stringify(r.tiny.slice(0,2))}`);
    if(r.hscroll)issues.push("HORIZONTAL-SCROLL");
    if(issues.length)fails++;
    console.log(`${issues.length?"FAIL":"ok  "} ${path.padEnd(28)} ${issues.join(" | ")}`);
  }
  await ctx.close();
}
await b.close();
console.log(`\nTotal pages with issues: ${fails}`);
