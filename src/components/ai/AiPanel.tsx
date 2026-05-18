"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles, X, ArrowUp, FileText, Bell, AlertTriangle, Search, ArrowRight
} from "lucide-react";
import { useAi } from "./AiProvider";
import { runAgent, type AgentMessage } from "@/lib/aiAgent";
import { fmtMoney, type Escrow } from "@/lib/data/mock";
import { allEscrows } from "@/lib/data/userEscrows";

const QUICK = [
  { label: "Summarize today", prompt: "Give me a 3-bullet summary of today across all my escrows." },
  { label: "Send reminders", prompt: "Send reminders to anyone with a missing signature in the next 3 days." },
  { label: "Check risk flags", prompt: "List every active risk flag and what action I should take." }
];

type SearchHit = {
  kind: "escrow" | "party" | "address";
  id: string;
  primary: string;
  secondary: string;
  href: string;
};

function localSearch(q: string, escrows: Escrow[]): SearchHit[] {
  if (!q.trim()) return [];
  const t = q.toLowerCase();
  const hits: SearchHit[] = [];
  for (const e of escrows) {
    if (e.id.toLowerCase().includes(t)) {
      hits.push({
        kind: "escrow", id: e.id,
        primary: e.id,
        secondary: e.property.address + " - " + fmtMoney(e.price, { compact: true }),
        href: "/transactions/" + e.id
      });
    }
    if (
      e.property.address.toLowerCase().includes(t) ||
      e.property.city.toLowerCase().includes(t)
    ) {
      hits.push({
        kind: "address", id: e.id + "-addr",
        primary: e.property.address + " - " + e.property.city,
        secondary: e.id + " - " + fmtMoney(e.price, { compact: true }),
        href: "/transactions/" + e.id
      });
    }
    for (const p of e.parties) {
      if (
        p.name.toLowerCase().includes(t) ||
        p.email.toLowerCase().includes(t)
      ) {
        hits.push({
          kind: "party", id: e.id + "-" + p.id,
          primary: p.name,
          secondary: p.role.replace("_", " ") + " - " + e.id,
          href: "/transactions/" + e.id
        });
      }
    }
  }
  return hits.slice(0, 8);
}

export function AiPanel() {
  const { isOpen, close } = useAi();
  const router = useRouter();
  const [escrows, setEscrows] = React.useState<Escrow[]>([]);
  const [input, setInput] = React.useState("");
  const [messages, setMessages] = React.useState<AgentMessage[]>([
    {
      role: "assistant",
      text: "Search a file, address, or person - or ask me to do something. Try: \"Open escrow for 999 Sunset Blvd, Maria as buyer, $1.5M, close June 1\"."
    }
  ]);
  const [busy, setBusy] = React.useState(false);
  const inputRef = React.useRef<HTMLTextAreaElement>(null);

  React.useEffect(() => {
    setEscrows(allEscrows());
  }, []);

  React.useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 50);
  }, [isOpen]);

  const hits = React.useMemo(() => localSearch(input, escrows), [input, escrows]);
  const looksLikeQuery = input.trim().length > 0 && input.trim().length <= 50 && !input.includes("?") && hits.length > 0;

  async function send(promptOverride?: string) {
    const prompt = (promptOverride ?? input).trim();
    if (!prompt || busy) return;
    setMessages((m) => [...m, { role: "user", text: prompt }]);
    setInput("");
    setBusy(true);
    try {
      const reply = await runAgent(prompt);
      setMessages((m) => [...m, reply]);
    } finally {
      setBusy(false);
    }
  }

  function go(href: string) {
    close();
    setInput("");
    router.push(href);
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-30 flex justify-end">
      <button
        aria-label="Close AI panel"
        onClick={close}
        className="absolute inset-0 bg-ink-900/30"
      />
      <aside
        className="relative h-full w-full max-w-[440px] flex flex-col"
        style={{ background: "var(--ink)" }}
      >
        <div className="flex items-center justify-between px-5 h-14 border-b border-white/10">
          <div className="flex items-center gap-2 text-cream-50">
            <Sparkles size={15} className="text-hermes-300" />
            <span className="text-[13px] font-medium">AI Assistant + search</span>
          </div>
          <button
            onClick={close}
            className="text-cream-50/70 hover:text-cream-50"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 no-scrollbar">
          {hits.length > 0 && looksLikeQuery && (
            <div>
              <p className="text-[10px] uppercase tracking-tightish text-cream-100/60 mb-2 flex items-center gap-1.5">
                <Search size={11} /> Search results
              </p>
              <ul className="space-y-1">
                {hits.map((h) => (
                  <li key={h.id}>
                    <button
                      onClick={() => go(h.href)}
                      className="w-full text-left px-3 py-2 rounded-md bg-white/5 hover:bg-white/10 border border-white/10 text-cream-50 text-[13px]"
                    >
                      <div className="flex items-center justify-between">
                        <div className="min-w-0">
                          <p className="truncate font-medium">{h.primary}</p>
                          <p className="truncate text-[11px] text-cream-100/60">
                            {h.kind} - {h.secondary}
                          </p>
                        </div>
                        <ArrowRight size={13} className="text-cream-100/50 shrink-0 ml-2" />
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
              <p className="text-[10px] text-cream-100/40 mt-2">
                Press Enter to ask me instead.
              </p>
            </div>
          )}

          {messages.map((m, i) => (
            <div
              key={i}
              className={
                m.role === "assistant"
                  ? "text-[13px] text-cream-50 bg-white/5 border border-white/10 rounded-md px-3 py-2.5 leading-relaxed"
                  : "text-[13px] text-cream-50 bg-hermes-500/15 border border-hermes-500/40 rounded-md px-3 py-2.5 ml-6"
              }
            >
              {m.text}
              {m.actions && m.actions.length > 0 && (
                <ul className="mt-2 flex flex-col gap-1.5">
                  {m.actions.map((a, j) => (
                    <li
                      key={j}
                      className="flex items-start gap-2 text-[12px] text-cream-100/90"
                    >
                      {a.kind === "open_escrow" && <FileText size={13} className="mt-0.5 text-hermes-300" />}
                      {a.kind === "send_reminder" && <Bell size={13} className="mt-0.5 text-hermes-300" />}
                      {a.kind === "flag" && <AlertTriangle size={13} className="mt-0.5 text-hermes-300" />}
                      <span>{a.summary}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
          {busy && <p className="text-[12px] text-cream-100/60">Thinking...</p>}
        </div>

        <div className="border-t border-white/10 px-5 py-3 space-y-3">
          <div className="flex flex-wrap gap-1.5">
            {QUICK.map((q) => (
              <button
                key={q.label}
                onClick={() => send(q.prompt)}
                className="text-[11px] px-2.5 py-1 rounded-full bg-white/8 border border-white/15 text-cream-100/90 hover:bg-white/15"
              >
                {q.label}
              </button>
            ))}
          </div>
          <div className="flex items-end gap-2 bg-white/5 border border-white/15 rounded-lg p-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              placeholder="Search or ask me to do something..."
              rows={2}
              className="flex-1 resize-none bg-transparent text-[13px] text-cream-50 placeholder:text-cream-100/40 outline-none"
            />
            <button
              onClick={() => send()}
              disabled={busy || !input.trim()}
              className="grid place-items-center w-8 h-8 rounded-md text-cream-50 disabled:opacity-40"
              style={{ background: "var(--hermes)" }}
            >
              <ArrowUp size={14} />
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}
