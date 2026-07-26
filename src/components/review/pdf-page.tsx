"use client";

import { useEffect, useRef, useState } from "react";
import type { PDFDocumentProxy } from "pdfjs-dist";
import type { SourceBox } from "@/data/types";
import { FIELD_AREA_STYLE, boxPosition } from "@/lib/doc-geometry";

/**
 * One page of a source document: the real PDF painted to a canvas, with the
 * provenance overlay on top of it.
 *
 * The overlay is deliberately invisible until a value is selected — the
 * point is to highlight *the* box the number came from, not to decorate the
 * page with every box we happen to know about.
 */
export function PdfPage({
  pdf,
  pageNumber,
  boxes,
  activeBoxId,
  highlightColor,
  registerBox,
}: {
  pdf: PDFDocumentProxy;
  pageNumber: number;
  boxes: readonly SourceBox[];
  activeBoxId: string | null;
  highlightColor: string;
  registerBox: (id: string, el: HTMLElement | null) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [ratio, setRatio] = useState(11 / 8.5);

  useEffect(() => {
    let cancelled = false;
    let task: { cancel: () => void } | null = null;

    const render = async () => {
      const canvas = canvasRef.current;
      const wrap = wrapRef.current;
      if (!canvas || !wrap) return;

      const page = await pdf.getPage(pageNumber);
      if (cancelled) return;

      const base = page.getViewport({ scale: 1 });
      if (!cancelled) setRatio(base.height / base.width);

      // Render at the element's own width, times the device pixel ratio, so
      // form rules stay crisp on retina instead of resampling a fixed bitmap.
      const width = wrap.clientWidth || 640;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const viewport = page.getViewport({ scale: (width / base.width) * dpr });

      canvas.width = Math.floor(viewport.width);
      canvas.height = Math.floor(viewport.height);
      canvas.style.width = "100%";
      canvas.style.height = "auto";

      const context = canvas.getContext("2d");
      if (!context) return;

      task = page.render({ canvas, canvasContext: context, viewport });
      try {
        await (task as unknown as { promise: Promise<void> }).promise;
      } catch {
        // Cancelled by a resize or an unmount — nothing to report.
      }
    };

    void render();
    const observer = new ResizeObserver(() => void render());
    if (wrapRef.current) observer.observe(wrapRef.current);

    return () => {
      cancelled = true;
      task?.cancel();
      observer.disconnect();
    };
  }, [pdf, pageNumber]);

  return (
    <div
      ref={wrapRef}
      className="relative w-full overflow-hidden rounded-lg border border-line-strong bg-white shadow-lift"
      style={{ aspectRatio: `1 / ${ratio}` }}
    >
      <canvas ref={canvasRef} className="block w-full" aria-hidden="true" />

      {/* Provenance overlay — same coordinate system the page was printed in */}
      <div style={FIELD_AREA_STYLE} className="pointer-events-none">
        {boxes.map((box) => {
          const active = box.id === activeBoxId;
          return (
            <div
              key={box.id}
              ref={(el) => registerBox(box.id, el)}
              // The box a value was extracted from — the anchor the trace
              // thread points at, and how tests find a highlight now that
              // the text itself lives inside the PDF canvas.
              data-box-id={box.id}
              data-active={active ? "true" : undefined}
              className={`absolute rounded-sm transition-all duration-200 ${
                active ? "z-10" : ""
              }`}
              style={{
                ...boxPosition(box),
                ...(active
                  ? {
                      boxShadow: `0 0 0 2.5px ${highlightColor}, 0 8px 24px rgb(28 35 33 / 0.18)`,
                      backgroundColor: "rgb(255 250 200 / 0.35)",
                    }
                  : {}),
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
