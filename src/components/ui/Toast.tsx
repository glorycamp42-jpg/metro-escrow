"use client";

import * as React from "react";
import { CheckCircle2, AlertTriangle, Info, X } from "lucide-react";

type Tone = "ok" | "warn" | "info";

export type ToastItem = {
  id: string;
  message: string;
  tone: Tone;
};

type Ctx = {
  push: (msg: string, tone?: Tone) => void;
};

const ToastCtx = React.createContext<Ctx | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = React.useState<ToastItem[]>([]);

  const push = React.useCallback((message: string, tone: Tone = "ok") => {
    const id = Math.random().toString(36).slice(2, 9);
    setItems((curr) => [...curr, { id, message, tone }]);
    setTimeout(() => {
      setItems((curr) => curr.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const value = React.useMemo(() => ({ push }), [push]);

  return (
    <ToastCtx.Provider value={value}>
      {children}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-[360px]">
        {items.map((t) => {
          const Icon =
            t.tone === "ok" ? CheckCircle2 : t.tone === "warn" ? AlertTriangle : Info;
          const colors = {
            ok: { bg: "#ECFDF5", border: "#A7F3D0", icon: "#0F6E56", text: "#064E3B" },
            warn: { bg: "#FEF3C7", border: "#FCD34D", icon: "#A8470F", text: "#78350F" },
            info: { bg: "#FFFFFF", border: "#E5DCC9", icon: "#F37021", text: "#2C1810" }
          }[t.tone];
          return (
            <div
              key={t.id}
              className="rounded-md border shadow-card px-3.5 py-3 flex items-start gap-2.5 animate-in"
              style={{
                background: colors.bg,
                borderColor: colors.border,
                color: colors.text
              }}
            >
              <Icon size={16} style={{ color: colors.icon, marginTop: 1 }} />
              <p className="text-[13px] flex-1 leading-relaxed">{t.message}</p>
              <button
                onClick={() =>
                  setItems((curr) => curr.filter((x) => x.id !== t.id))
                }
                className="opacity-60 hover:opacity-100"
                aria-label="Close"
              >
                <X size={13} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastCtx.Provider>
  );
}

export function useToast() {
  const ctx = React.useContext(ToastCtx);
  if (!ctx) {
    // Graceful fallback during SSR or outside provider
    return {
      push: (msg: string) => {
        if (typeof window !== "undefined") console.log("[toast]", msg);
      }
    };
  }
  return ctx;
}
