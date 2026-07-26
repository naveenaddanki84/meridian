"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Sparkles } from "lucide-react";

/**
 * The product's thesis, running live: a value on the return, the thread,
 * and the exact box it came from. This is the real interaction from the
 * review workspace, reduced to its essence and looped — no screenshot.
 */
export function HeroTrace() {
  const [phase, setPhase] = useState<"idle" | "traced" | "verified">("idle");
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const fieldRef = useRef<HTMLDivElement | null>(null);
  const boxRef = useRef<HTMLDivElement | null>(null);
  const [line, setLine] = useState<{ x1: number; y1: number; x2: number; y2: number } | null>(null);

  useEffect(() => {
    // A slow, three-beat loop: land, trace, verify.
    const timings: [number, typeof phase][] = [
      [900, "traced"],
      [3200, "verified"],
      [6200, "idle"],
    ];
    const timers = timings.map(([ms, next]) => window.setTimeout(() => setPhase(next), ms));
    const loop = window.setInterval(() => {
      setPhase("idle");
      window.setTimeout(() => setPhase("traced"), 900);
      window.setTimeout(() => setPhase("verified"), 3200);
    }, 7000);
    return () => {
      timers.forEach(clearTimeout);
      clearInterval(loop);
    };
  }, []);

  useEffect(() => {
    const measure = () => {
      const wrap = wrapRef.current;
      const a = fieldRef.current;
      const bEl = boxRef.current;
      if (!wrap || !a || !bEl) return;
      const w = wrap.getBoundingClientRect();
      const ar = a.getBoundingClientRect();
      const br = bEl.getBoundingClientRect();
      setLine({
        x1: ar.right - w.left,
        y1: ar.top + ar.height / 2 - w.top,
        x2: br.left - w.left,
        y2: br.top + br.height / 2 - w.top,
      });
    };
    const frame = window.requestAnimationFrame(measure);
    window.addEventListener("resize", measure);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", measure);
    };
  }, []);

  const active = phase !== "idle";
  const verified = phase === "verified";
  const stroke = verified ? "#276742" : "#5b5bd6";

  return (
    <div
      ref={wrapRef}
      className="relative grid grid-cols-1 items-center gap-3 rounded-lg border border-line bg-card p-4 shadow-pop sm:grid-cols-[1fr_auto_1fr] sm:gap-6 sm:p-6"
      aria-label="A wage figure on a tax return traced back to Box 1 of the source W-2"
    >
      {/* The return field */}
      <div>
        <p className="mb-2 text-[12px] font-bold uppercase tracking-wider text-ink-faint">
          The return
        </p>
        <div
          ref={fieldRef}
          className={`rounded-xl border bg-paper/60 px-3 py-2.5 transition-colors duration-500 ${
            active ? "border-spruce/40" : "border-line"
          }`}
        >
          <p className="text-[13px] font-semibold text-ink">Wages and salary</p>
          <p className="font-mono text-[12px] uppercase tracking-wide text-ink-faint">
            1040 · Line 1a
          </p>
          <p className="tnum mt-1.5 font-mono text-[15px] font-semibold text-ink">$85,200.00</p>
          <span
            className={`mt-1.5 inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-[12px] font-semibold transition-colors duration-500 ${
              verified ? "bg-verified-soft text-verified" : "bg-ai-soft text-ai"
            }`}
          >
            {verified ? (
              <>
                <Check className="h-3 w-3" />
                Verified
              </>
            ) : (
              <>
                <Sparkles className="h-3 w-3" />
                AI · unverified
              </>
            )}
          </span>
        </div>
      </div>

      <div className="hidden w-2 sm:block sm:w-8" aria-hidden="true" />

      {/* The source document */}
      <div>
        <p className="mb-2 text-[12px] font-bold uppercase tracking-wider text-ink-faint">
          The receipt
        </p>
        <div className="rounded-lg border border-line-strong bg-white p-2.5">
          <p className="mb-2 font-mono text-[12px] font-semibold uppercase tracking-wide text-ink-faint">
            W-2 · Lumen Health
          </p>
          <div
            ref={boxRef}
            className="rounded-md border px-2 py-1.5 transition-all duration-500"
            style={
              active
                ? { borderColor: "transparent", boxShadow: `0 0 0 2px ${stroke}`, background: "#fffef8" }
                : { borderColor: "#e5e3db" }
            }
          >
            <p className="text-[12px] font-medium uppercase tracking-wide text-ink-faint">
              1 · Wages, tips
            </p>
            <p className="tnum font-mono text-[13px] font-semibold text-ink">85,200.00</p>
          </div>
          <div className="mt-1.5 rounded-md border border-line px-2 py-1.5 opacity-45">
            <p className="text-[12px] font-medium uppercase tracking-wide text-ink-faint">
              2 · Fed. tax withheld
            </p>
            <p className="tnum font-mono text-[13px] text-ink">11,430.00</p>
          </div>
        </div>
      </div>

      {/* The thread */}
      {line && (
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full"
          aria-hidden="true"
        >
          <path
            key={`${phase}-${line.x1}-${line.y1}`}
            d={`M ${line.x1} ${line.y1} C ${line.x1 + (line.x2 - line.x1) / 2} ${line.y1}, ${
              line.x1 + (line.x2 - line.x1) / 2
            } ${line.y2}, ${line.x2} ${line.y2}`}
            fill="none"
            stroke={stroke}
            strokeWidth={1.75}
            className={active ? "trace-path" : "opacity-0"}
          />
          {active && (
            <>
              <circle cx={line.x1} cy={line.y1} r={3.5} fill={stroke} />
              <circle cx={line.x2} cy={line.y2} r={3.5} fill={stroke} />
            </>
          )}
        </svg>
      )}
    </div>
  );
}
