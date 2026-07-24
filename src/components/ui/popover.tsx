"use client";

import { useEffect, useRef } from "react";

/**
 * Minimal anchored popover: renders below its wrapper, closes on outside
 * click or Escape. Hand-rolled to keep the dependency surface tiny.
 */
export function Popover({
  open,
  onClose,
  align = "right",
  children,
  className = "",
}: {
  open: boolean;
  onClose: () => void;
  align?: "left" | "right";
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClose();
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={ref}
      className={`rise-in absolute top-full z-40 mt-2 rounded-xl border border-line bg-card shadow-pop ${
        align === "right" ? "right-0" : "left-0"
      } ${className}`}
      role="dialog"
    >
      {children}
    </div>
  );
}
