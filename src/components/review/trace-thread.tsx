"use client";

import { useCallback, useEffect, useState } from "react";

interface Point {
  x: number;
  y: number;
}

/**
 * The signature interaction (Challenge 01): an auditor's thread drawn
 * from a return field to the exact box on the source document.
 */
export function TraceThread({
  container,
  from,
  to,
  color,
}: {
  container: HTMLElement | null;
  from: HTMLElement | null;
  to: HTMLElement | null;
  color: string;
}) {
  const [points, setPoints] = useState<{ a: Point; b: Point } | null>(null);

  const measure = useCallback(() => {
    if (!container || !from || !to) {
      setPoints(null);
      return;
    }
    const base = container.getBoundingClientRect();
    const f = from.getBoundingClientRect();
    const t = to.getBoundingClientRect();
    setPoints({
      a: { x: f.right - base.left, y: f.top + f.height / 2 - base.top },
      b: { x: t.left - base.left, y: t.top + t.height / 2 - base.top },
    });
  }, [container, from, to]);

  useEffect(() => {
    measure();
    if (!container) return;

    // Capture-phase scroll catches both scrolling panes with one listener.
    const onScroll = () => measure();
    container.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onScroll);
    return () => {
      container.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onScroll);
    };
  }, [container, measure]);

  if (!points) return null;

  const { a, b } = points;
  const midX = a.x + (b.x - a.x) / 2;
  const path = `M ${a.x} ${a.y} C ${midX} ${a.y}, ${midX} ${b.y}, ${b.x} ${b.y}`;

  return (
    <svg
      className="pointer-events-none absolute inset-0 z-20 hidden h-full w-full lg:block"
      aria-hidden="true"
    >
      <path
        key={path}
        d={path}
        fill="none"
        stroke={color}
        strokeWidth={1.75}
        className="trace-path"
      />
      <circle cx={a.x} cy={a.y} r={3.5} fill={color} />
      <circle cx={b.x} cy={b.y} r={3.5} fill={color} />
    </svg>
  );
}
