import { copyFile, mkdir } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';

/**
 * pdf.js renders in a web worker. Next can't bundle it for us, so the file
 * is copied into public/ before dev and build — keeping it out of git while
 * guaranteeing it matches the installed pdfjs-dist version.
 */
const require = createRequire(import.meta.url);
const pdfjsRoot = dirname(require.resolve('pdfjs-dist/package.json'));
const source = join(pdfjsRoot, 'build', 'pdf.worker.min.mjs');
const target = join(process.cwd(), 'public', 'pdf.worker.min.mjs');

await mkdir(dirname(target), { recursive: true });
await copyFile(source, target);
console.log('pdf.js worker → public/pdf.worker.min.mjs');
