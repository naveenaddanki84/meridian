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

/**
 * Painted once, at a fixed width, then scaled by CSS.
 *
 * The tempting version re-renders on resize to match the pane exactly, but
 * two `page.render()` calls overlapping on one canvas compound the PDF's
 * bottom-left-origin flip and the page comes out upside down — which is
 * exactly what shipped the first time, because the race only lost on a
 * slower connection. One render, no observers, no race. 1200px covers the
 * pane at 2× on any realistic viewport.
 */
const RENDER_WIDTH = 1200;

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
  const [ratio, setRatio] = useState(11 / 8.5);

  useEffect(() => {
    let cancelled = false;
    let task: { cancel: () => void; promise: Promise<void> } | null = null;

    const paint = async () => {
      const page = await pdf.getPage(pageNumber);
      const canvas = canvasRef.current;
      if (cancelled || !canvas) return;

      const base = page.getViewport({ scale: 1 });
      setRatio(base.height / base.width);

      const viewport = page.getViewport({ scale: RENDER_WIDTH / base.width });
      canvas.width = Math.floor(viewport.width);
      canvas.height = Math.floor(viewport.height);

      const context = canvas.getContext("2d");
      if (!context) return;
      // Assigning width already clears the canvas; being explicit means a
      // stale transform can never survive into the next paint.
      context.setTransform(1, 0, 0, 1, 0, 0);

      task = page.render({ canvas, canvasContext: context, viewport });
      try {
        await task.promise;
      } catch {
        // Cancelled by an unmount — nothing to report.
      }
    };

    void paint();

    return () => {
      cancelled = true;
      task?.cancel();
    };
  }, [pdf, pageNumber]);

  return (
    <div
      className="relative w-full overflow-hidden rounded-lg border border-line-strong bg-white shadow-lift"
      style={{ aspectRatio: `1 / ${ratio}` }}
    >
      <canvas ref={canvasRef} className="block h-full w-full" aria-hidden="true" />

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
