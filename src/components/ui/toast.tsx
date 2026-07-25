"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { Check, Info, Undo2 } from "lucide-react";

/**
 * Action feedback (UX rule: never change state silently). Every
 * confirmation lands in one polite live region, so screen readers hear
 * what sighted users see. Optional undo keeps destructive-feeling
 * actions reversible.
 */

interface Toast {
  id: number;
  message: string;
  tone: "success" | "info";
  undo?: () => void;
}

interface ToastApi {
  notify: (message: string, options?: { tone?: Toast["tone"]; undo?: () => void }) => void;
}

const ToastContext = createContext<ToastApi | null>(null);

const VISIBLE_MS = 4000;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<readonly Toast[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const notify = useCallback<ToastApi["notify"]>(
    (message, options) => {
      const id = Date.now() + Math.random();
      setToasts((prev) => [
        ...prev.slice(-2),
        { id, message, tone: options?.tone ?? "success", undo: options?.undo },
      ]);
      window.setTimeout(() => dismiss(id), VISIBLE_MS);
    },
    [dismiss],
  );

  const api = useMemo(() => ({ notify }), [notify]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        className="pointer-events-none fixed bottom-4 left-1/2 z-[60] flex w-[min(24rem,calc(100vw-2rem))] -translate-x-1/2 flex-col gap-2"
        role="status"
        aria-live="polite"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="rise-in pointer-events-auto flex items-center gap-2.5 rounded-xl border border-line bg-ink px-3.5 py-2.5 shadow-pop"
          >
            {toast.tone === "success" ? (
              <Check className="h-4 w-4 shrink-0 text-[#8fd6ab]" />
            ) : (
              <Info className="h-4 w-4 shrink-0 text-[#b9c4be]" />
            )}
            <span className="flex-1 text-[13px] font-medium text-white">{toast.message}</span>
            {toast.undo && (
              <button
                type="button"
                onClick={() => {
                  toast.undo?.();
                  dismiss(toast.id);
                }}
                className="flex items-center gap-1 rounded-lg px-2 py-1 text-[12px] font-semibold text-[#8fd6ab] transition-colors hover:bg-white/10"
              >
                <Undo2 className="h-3.5 w-3.5" />
                Undo
              </button>
            )}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  // Components can render outside the provider (tests, isolated pages);
  // a no-op keeps them working rather than throwing.
  return ctx ?? { notify: () => {} };
}
