"use client";

import * as React from "react";
import { ChevronDown, Check } from "lucide-react";
import { useRole } from "./RoleProvider";
import { ALL_ROLES, ROLES } from "@/lib/roles";

export function RoleSwitcher() {
  const { role, setRole } = useRole();
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const meta = ROLES[role];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 h-9 px-2.5 rounded-md border border-cream-300 bg-white hover:bg-cream-100"
      >
        <span
          className="text-[10px] font-medium px-2 py-[2px] rounded-full"
          style={{ background: meta.bg, color: meta.fg }}
        >
          {meta.short}
        </span>
        <span className="text-[12px] text-ink-700">View as</span>
        <ChevronDown size={13} className="text-ink-400" />
      </button>

      {open && (
        <div className="absolute right-0 top-11 w-[280px] rounded-lg border border-cream-300 bg-white shadow-card z-30 overflow-hidden">
          <p className="px-3 py-2 text-[10px] font-medium text-ink-400 uppercase tracking-tightish border-b border-cream-200">
            Switch role (demo)
          </p>
          <ul>
            {ALL_ROLES.map((r) => {
              const m = ROLES[r];
              const active = r === role;
              return (
                <li key={r}>
                  <button
                    onClick={() => {
                      setRole(r);
                      setOpen(false);
                    }}
                    className={
                      "w-full flex items-start gap-2.5 px-3 py-2.5 hover:bg-cream-50 text-left " +
                      (active ? "bg-cream-50" : "")
                    }
                  >
                    <span
                      className="text-[10px] font-medium px-2 py-[2px] rounded-full mt-0.5 shrink-0"
                      style={{ background: m.bg, color: m.fg }}
                    >
                      {m.short}
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="block text-[13px] font-medium text-ink-800">
                        {m.label}
                      </span>
                      <span className="block text-[11px] text-ink-400 mt-0.5">
                        {m.description}
                      </span>
                    </span>
                    {active && (
                      <Check size={14} className="text-hermes-500 mt-0.5" />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
