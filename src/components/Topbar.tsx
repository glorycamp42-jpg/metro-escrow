"use client";

import { Search, Sparkles } from "lucide-react";
import { useAi } from "@/components/ai/AiProvider";
import { RoleSwitcher } from "@/components/role/RoleSwitcher";

export function Topbar() {
  const { open } = useAi();
  return (
    <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-cream-300 bg-cream-100/80 backdrop-blur px-5 h-14 print:hidden">
      <button
        onClick={open}
        className="flex items-center gap-2 h-9 px-3 rounded-md border border-cream-300 bg-white text-ink-500 hover:text-ink-800 hover:bg-white text-[12px] w-[320px] max-w-full justify-between"
      >
        <span className="flex items-center gap-2">
          <Search size={14} />
          Ask AI or search escrows...
        </span>
        <span className="text-ink-400">Cmd+K</span>
      </button>
      <div className="flex items-center gap-2">
        <RoleSwitcher />
        <button
          onClick={open}
          className="flex items-center gap-2 h-9 px-3 rounded-md text-cream-50"
          style={{ background: "var(--ink)" }}
        >
          <Sparkles size={14} className="text-hermes-300" />
          <span className="text-[12px] font-medium">AI Assistant</span>
        </button>
      </div>
    </header>
  );
}
