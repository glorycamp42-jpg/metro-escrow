"use client";

import * as React from "react";
import { ArrowUp, Search, Lock } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { type Escrow } from "@/lib/data/mock";
import { allEscrows } from "@/lib/data/userEscrows";
import {
  readMessages, sendMessage, ROLE_LABEL, type Message
} from "@/lib/data/messages";

export default function MessagesPage() {
  const [escrows, setEscrows] = React.useState<Escrow[]>([]);
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [active, setActive] = React.useState<string>("");
  const [draft, setDraft] = React.useState("");
  const [q, setQ] = React.useState("");
  const endRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const list = allEscrows();
    setEscrows(list);
    setMessages(readMessages());
    if (list.length > 0) setActive(list[0].id);
  }, []);

  React.useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [active, messages.length]);

  function send() {
    const body = draft.trim();
    if (!body) return;
    const created = sendMessage(active, body);
    setMessages((m) => [...m, created]);
    setDraft("");
  }

  const threads = escrows
    .map((e) => {
      const thread = messages.filter((m) => m.escrowId === e.id);
      const last = thread[thread.length - 1];
      const unread = thread.filter((m) => !m.read && m.fromRole !== "officer").length;
      return { escrow: e, last, unread, count: thread.length };
    })
    .filter((t) => {
      if (!q) return true;
      const term = q.toLowerCase();
      return (
        t.escrow.id.toLowerCase().includes(term) ||
        t.escrow.property.address.toLowerCase().includes(term) ||
        (t.last?.body ?? "").toLowerCase().includes(term)
      );
    })
    .sort((a, b) => {
      const aT = a.last ? new Date(a.last.at).getTime() : 0;
      const bT = b.last ? new Date(b.last.at).getTime() : 0;
      return bT - aT;
    });

  const activeEscrow = escrows.find((e) => e.id === active);
  const activeMessages = messages
    .filter((m) => m.escrowId === active)
    .sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());

  return (
    <div className="flex flex-col gap-5 h-[calc(100vh-110px)]">
      <header>
        <h1 className="text-[28px] font-medium tracking-tighter2">Messages</h1>
        <p className="text-[14px] text-ink-500 mt-1">
          One thread per escrow. All parties on the file can be looped in.
        </p>
      </header>

      <div className="grid grid-cols-12 gap-4 flex-1 min-h-0">
        <Card className="col-span-12 md:col-span-4 p-0 overflow-hidden flex flex-col">
          <div className="p-3 border-b border-cream-200">
            <div className="flex items-center gap-2 px-3 h-9 rounded-md bg-cream-50 border border-cream-300">
              <Search size={13} className="text-ink-400" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search threads..."
                className="flex-1 bg-transparent outline-none text-[13px] placeholder:text-ink-400"
              />
            </div>
          </div>
          <ul className="flex-1 overflow-y-auto no-scrollbar">
            {threads.map((t) => (
              <li key={t.escrow.id}>
                <button
                  onClick={() => setActive(t.escrow.id)}
                  className={
                    "w-full text-left px-4 py-3 border-b border-cream-200 hover:bg-cream-50 " +
                    (t.escrow.id === active ? "bg-hermes-50" : "")
                  }
                >
                  <div className="flex items-center justify-between">
                    <p className="text-[13px] font-medium truncate">
                      {t.escrow.property.address}
                    </p>
                    {t.unread > 0 && (
                      <span
                        className="text-[10px] font-medium px-1.5 py-[2px] rounded-full text-cream-50 shrink-0 ml-2"
                        style={{ background: "var(--hermes)" }}
                      >
                        {t.unread}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-ink-400 mt-0.5 truncate">
                    {t.escrow.id} · {t.count} message{t.count !== 1 ? "s" : ""}
                  </p>
                  {t.last && (
                    <p className="text-[12px] text-ink-500 mt-1 truncate">
                      <span className="font-medium">{t.last.from.split(" ")[0]}:</span>{" "}
                      {t.last.body}
                    </p>
                  )}
                </button>
              </li>
            ))}
            {threads.length === 0 && (
              <p className="px-4 py-6 text-center text-[12px] text-ink-400">
                No threads match.
              </p>
            )}
          </ul>
        </Card>

        <Card className="col-span-12 md:col-span-8 p-0 overflow-hidden flex flex-col">
          {activeEscrow ? (
            <>
              <div className="px-5 py-3 border-b border-cream-200 flex items-center justify-between">
                <div>
                  <p className="text-[14px] font-medium">{activeEscrow.property.address}</p>
                  <p className="text-[11px] text-ink-400">
                    {activeEscrow.id} · {activeEscrow.parties.length} parties on file
                  </p>
                </div>
                <span className="text-[11px] text-ink-400 inline-flex items-center gap-1">
                  <Lock size={11} /> Encrypted thread
                </span>
              </div>
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 no-scrollbar">
                {activeMessages.length === 0 ? (
                  <p className="text-[13px] text-ink-400 text-center py-12">
                    No messages yet. Send the first one below.
                  </p>
                ) : (
                  activeMessages.map((m) => {
                    const isMine = m.fromRole === "officer";
                    const role = ROLE_LABEL[m.fromRole];
                    return (
                      <div
                        key={m.id}
                        className={"flex flex-col gap-1 " + (isMine ? "items-end" : "items-start")}
                      >
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] font-medium text-ink-600">
                            {m.from}
                          </span>
                          <span
                            className="text-[10px] px-1.5 py-[1px] rounded-full font-medium"
                            style={{ background: role.bg, color: role.fg }}
                          >
                            {role.label}
                          </span>
                          <span className="text-[10px] text-ink-400">
                            {new Date(m.at).toLocaleString("en-US", {
                              month: "short",
                              day: "numeric",
                              hour: "numeric",
                              minute: "2-digit"
                            })}
                          </span>
                        </div>
                        <div
                          className={
                            "max-w-[80%] px-3 py-2 rounded-lg text-[13px] leading-relaxed " +
                            (isMine
                              ? "text-cream-50"
                              : "bg-cream-50 border border-cream-200 text-ink-800")
                          }
                          style={isMine ? { background: "var(--hermes)" } : undefined}
                        >
                          {m.body}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={endRef} />
              </div>
              <div className="px-5 py-3 border-t border-cream-200">
                <div className="flex items-end gap-2 bg-cream-50 border border-cream-300 rounded-lg p-2">
                  <textarea
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        send();
                      }
                    }}
                    rows={2}
                    placeholder="Type a message to all parties on this file..."
                    className="flex-1 resize-none bg-transparent text-[13px] outline-none placeholder:text-ink-400"
                  />
                  <button
                    onClick={send}
                    disabled={!draft.trim()}
                    className="grid place-items-center w-9 h-9 rounded-md text-cream-50 disabled:opacity-40 shrink-0"
                    style={{ background: "var(--hermes)" }}
                    aria-label="Send"
                  >
                    <ArrowUp size={15} />
                  </button>
                </div>
                <p className="text-[10px] text-ink-400 mt-1.5">
                  Shift+Enter for new line · sent at the bottom of the thread
                </p>
              </div>
            </>
          ) : (
            <p className="text-[13px] text-ink-400 m-auto">Pick a thread to start.</p>
          )}
        </Card>
      </div>
    </div>
  );
}
