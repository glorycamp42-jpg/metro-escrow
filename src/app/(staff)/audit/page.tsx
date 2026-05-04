"use client";

import * as React from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Search, ShieldCheck } from "lucide-react";
import { readAudit, type AuditEvent } from "@/lib/data/audit";

export default function AuditPage() {
  const [list, setList] = React.useState<AuditEvent[]>([]);
  const [q, setQ] = React.useState("");

  React.useEffect(() => {
    setList(readAudit());
  }, []);

  const filtered = list.filter((e) => {
    if (!q) return true;
    const t = q.toLowerCase();
    return (
      e.who.toLowerCase().includes(t) ||
      e.action.toLowerCase().includes(t) ||
      e.target.toLowerCase().includes(t) ||
      (e.detail ?? "").toLowerCase().includes(t)
    );
  });

  return (
    <div className="flex flex-col gap-5">
      <header>
        <h1 className="text-[28px] font-medium tracking-tighter2">Audit log</h1>
        <p className="text-[14px] text-ink-500 mt-1">
          Append-only record of every action that touches an escrow file. CA DRE / DBO compliance requirement.
        </p>
      </header>

      <Card className="p-3 flex items-center gap-2">
        <div className="flex-1 flex items-center gap-2 px-3 h-10 rounded-md bg-cream-50 border border-cream-300">
          <Search size={14} className="text-ink-400" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by user, action, file, or detail..."
            className="border-0 bg-transparent h-auto p-0 focus:ring-0 focus:outline-none"
          />
        </div>
      </Card>

      <Card className="p-0 overflow-hidden">
        {filtered.length === 0 ? (
          <p className="px-5 py-8 text-center text-[13px] text-ink-400">
            No audit entries match your search.
          </p>
        ) : (
          <ul>
            {filtered.map((ev) => (
              <li
                key={ev.id}
                className="flex items-start gap-3 px-5 py-3 border-b border-cream-200 last:border-0"
              >
                <ShieldCheck
                  size={15}
                  className="text-hermes-500 mt-0.5 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] text-ink-800 font-medium">
                    {ev.action}
                  </p>
                  <p className="text-[12px] text-ink-500 mt-0.5">
                    {ev.who} ({ev.role}) on{" "}
                    <Link
                      href={"/transactions/" + ev.target}
                      className="text-hermes-500 hover:underline"
                    >
                      {ev.target}
                    </Link>
                  </p>
                  {ev.detail && (
                    <p className="text-[12px] text-ink-700 mt-1">{ev.detail}</p>
                  )}
                </div>
                <p className="text-[11px] text-ink-400 shrink-0 tabular-nums">
                  {new Date(ev.at).toLocaleString("en-US")}
                </p>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
