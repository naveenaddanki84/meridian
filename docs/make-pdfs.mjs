import { chromium } from '/tmp/node_modules/playwright-core/index.mjs';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

/**
 * Prints the fabricated source documents to real PDFs.
 *
 * The artwork comes from the app's own /print/[docId] route, so the page a
 * reviewer sees in the workspace is generated from exactly the same box
 * coordinates the provenance overlay uses. Run this whenever a document's
 * boxes change; the output is committed so the app has no build-time
 * dependency on Chrome.
 *
 *   pnpm dev --port 3111
 *   node docs/make-pdfs.mjs
 */

const BASE = process.env.MERIDIAN_URL ?? 'http://localhost:3111';
const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'documents');

// Every document that has pages to print. Ids match src/data/hero.ts.
const DOCS = ['doc-w2', 'doc-1099int', 'doc-1099div', 'doc-receipt', 'doc-prior'];

await mkdir(OUT, { recursive: true });

const browser = await chromium.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
});
const page = await (await browser.newContext()).newPage();

let failed = 0;
for (const id of DOCS) {
  const url = `${BASE}/print/${id}`;
  const res = await page.goto(url, { waitUntil: 'networkidle' });
  if (!res || res.status() !== 200) {
    console.log(`  ✗ ${id} — ${url} returned ${res?.status() ?? 'no response'}`);
    failed++;
    continue;
  }
  // Web fonts must be resolved before printing or the PDF falls back to
  // system faces and the boxes reflow.
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(250);

  const pdf = await page.pdf({
    format: 'Letter',
    printBackground: true,
    margin: { top: '0', right: '0', bottom: '0', left: '0' },
  });
  await writeFile(join(OUT, `${id}.pdf`), pdf);
  console.log(`  ✓ ${id}.pdf — ${(pdf.length / 1024).toFixed(0)} KB`);
}

await browser.close();
console.log(failed ? `\n${failed} document(s) failed` : '\nAll documents written to public/documents/');
process.exit(failed ? 1 : 0);
