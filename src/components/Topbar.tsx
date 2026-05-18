"use client";

import * as React from "react";
import { Search, Sparkles, Sun, Moon, Menu } from "lucide-react";
import { useAi } from "@/components/ai/AiProvider";
import { RoleSwitcher } from "@/components/role/RoleSwitcher";

const THEME_KEY = "metro-escrow:theme";

function isDark(): boolean {
  if (typeof document === "undefined") return false;
  return document.documentElement.classList.contains("dark");
}

export function Topbar() {
  const { open } = useAi();
  const [dark, setDark] = React.useState(false);

  React.useEffect(() => {
    setDark(isDark());
  }, []);

  function toggleTheme() {
    const next = !dark;
    setDark(next);
    if (next) {
      document.documentElement.classList.add("dark");
      try { localStorage.setItem(THEME_KEY, "dark"); } catch {}
    } else {
      document.documentElement.classList.remove("dark");
      try { localStorage.setItem(THEME_KEY, "light"); } catch {}
    }
  }

  function openMobileNav() {
    window.dispatchEvent(new Event("sidebar-toggle"));
  }

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between gap-2 border-b border-cream-300 bg-cream-100/80 backdrop-blur px-3 md:px-5 h-14 print:hidden">
      {/* Mobile hamburger */}
      <button
        onClick={openMobileNav}
        aria-label="Open menu"
        className="md:hidden grid place-items-center w-10 h-10 rounded-md text-ink-700 hover:bg-white shrink-0"
      >
        <Menu size={20} />
      </button>

      {/* Search / Ask AI button */}
      <button
        onClick={open}
        className="flex-1 md:flex-none flex items-center gap-2 h-9 px-3 rounded-md border border-cream-300 bg-white text-ink-500 hover:text-ink-800 text-[12px] md:w-[320px] max-w-full justify-between"
      >
        <span className="flex items-center gap-2 min-w-0">
          <Search size={14} className="shrink-0" />
          <span className="truncate">
            <span className="hidden sm:inline">Ask AI or search escrows...</span>
            <span className="sm:hidden">Ask AI...</span>
          </span>
        </span>
        <span className="text-ink-400 hidden sm:inline">Cmd+K</span>
      </button>

      <div className="flex items-center gap-1 md:gap-2">
        <button
          onClick={toggleTheme}
          aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
          title={dark ? "Switch to light mode" : "Switch to dark mode"}
          className="grid place-items-center w-9 h-9 rounded-md border border-cream-300 bg-white text-ink-500 hover:text-ink-800 shrink-0"
        >
          {dark ? <Sun size={14} /> : <Moon size={14} />}
        </button>
        <div className="hidden sm:block">
          <RoleSwitcher />
        </div>
        <button
          onClick={open}
          className="hidden sm:flex items-center gap-2 h-9 px-3 rounded-md text-cream-50 shrink-0"
          style={{ background: "var(--ink)" }}
        >
          <Sparkles size={14} className="text-hermes-300" />
          <span className="text-[12px] font-medium">AI Assistant</span>
        </button>
      </div>
    </header>
  );
}
