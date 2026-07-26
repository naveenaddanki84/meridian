"use client";

import type { PDFDocumentLoadingTask } from "pdfjs-dist";

/**
 * pdf.js loaded lazily, so the ~1MB renderer only reaches the browser when
 * someone actually opens a source document — the client screens never pay
 * for it.
 */

let pdfjs: typeof import("pdfjs-dist") | null = null;

async function getPdfjs() {
  if (!pdfjs) {
    const lib = await import("pdfjs-dist");
    // The worker is copied into public/ by scripts/copy-pdf-worker.mjs.
    lib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
    pdfjs = lib;
  }
  return pdfjs;
}

/** Where a document's fabricated PDF lives. */
export function documentPdfUrl(documentId: string): string {
  return `/documents/${documentId}.pdf`;
}

/**
 * Returns the loading task, not the document: the task owns the worker and
 * is what has to be destroyed when the viewer moves on, or every document a
 * preparer opens leaks one.
 */
export async function openPdf(url: string): Promise<PDFDocumentLoadingTask> {
  const lib = await getPdfjs();
  return lib.getDocument({ url });
}
