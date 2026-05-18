"use client";

import * as React from "react";
import { Card } from "@/components/ui/Card";
import {
  ShieldCheck, AlertTriangle, TrendingUp
} from "lucide-react";
import { fmtMoney, type Escrow } from "@/lib/data/mock";
import { allEscrows } from "@/lib/data/userEscrows";

type Person = {
  name: string;
  role: string;
};

const PEOPLE: Person[] = [
  { name: "Jin Yu", role: "Senior officer" },
  { name: "Marisol Tran", role: "Officer" },
  { name: "David Kim", role: "Officer" },
  { name: "Anita Park", role: "Processor" },
  { name: "Chris Vega", role: "Assistant" }
];

export default function TeamPage() {
  const [escrows, setEscrows] = React.useState<Escrow[]>([]);
  React.useEffect(() => {
    setEscrows(allEscrows());
  }, []);

  const today = new Date();
  const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const sixtyDaysAgo = new Date(today);
  sixtyDaysAgo.setDate(today.getDate() - 60);

  // Per-person stats
  const peopleStats = React.useMemo(
    () =>
      PEOPLE.map((p) => {
        const mine = escrows.filter((e) => e.officer === p.name);
        const active = mine.filter(
          (e) => e.status !== "closed" && e.status !== "cancelled"
        );
        const closingThisMonth = mine.filter((e) => {
          const d = new Date(e.closingDate);
          return d >= today && d <= monthEnd;
        });
        const closed = mine.filter((e) => e.status === "closed");
        const volume = mine.reduce((s, e) => s + e.price, 0);
        const flags = mine.reduce((s, e) => s + e.risks.length, 0);

        // Average cycle: days between openedAt and today (or closingDate if closed)
        let cycle = "-";
        if (active.length > 0) {
          const sum = active.reduce((s, e) => {
            const opened = new Date(e.openedAt);
            const days = Math.max(
              0,
              Math.floor((today.getTime() - opened.getTime()) / (1000 * 60 * 60 * 24))
            );
            return s + days;
          }, 0);
          cycle = Math.round(sum / active.length) + "d";
        }

        return {
          ...p,
          openCount: active.length,
          closingMonth: closingThisMonth.length,
          volume,
          volumeLabel: volume > 0 ? fmtMoney(volume, { compact: true }) : "-",
          cycle,
          closed: closed.length,
          flags
        };
      }),
    [escrows]
  );

  const flagged = escrows.filter((e) => e.risks.length > 0).length;
  const unverifiedWires = escrows.filter((e) => !e.wire.callbackVerified).length;
  const aging = escrows.filter((e) => {
    if (e.status === "closed" || e.status === "cancelled") return false;
    return new Date(e.openedAt) < sixtyDaysAgo;
  }).length;
  const total = escrows.filter((e) => e.status !== "closed" && e.status !== "cancelled").length;
  const pipelineValue = escrows
    .filter((e) => e.status !== "closed" && e.status !== "cancelled")
    .reduce((s, e) => s + e.price, 0);
  const officerCount = new Set(
    escrows.filter((e) => e.officer).map((e) => e.officer)
  ).size;

  return (
    <div className="flex flex-col gap-5">
      <header>
        <h1 className="text-[28px] font-medium tracking-tighter2">Team view</h1>
        <p className="text-[14px] text-ink-500 mt-1">
          Branch-wide pipeline, productivity, and compliance. Senior + manager only.
        </p>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Tile label="Open files" value={String(total)} sub={"across " + officerCount + " officer" + (officerCount === 1 ? "" : "s")} />
        <Tile label="Pipeline value" value={fmtMoney(pipelineValue, { compact: true })} sub="active stages" />
        <Tile label="Audit flags" value={String(flagged)} sub="needs review" tone={flagged > 0 ? "warn" : "ok"} />
        <Tile label="Aging files" value={String(aging)} sub=">60 days open" tone={aging > 0 ? "warn" : "ok"} />
      </div>

      <Card className="p-4">
        <p className="text-[14px] font-medium mb-3">People</p>
        <table className="w-full text-[14px]">
          <thead>
            <tr className="text-left text-[11px] text-ink-400 uppercase tracking-tightish">
              <th className="pb-2">Name</th>
              <th className="pb-2">Role</th>
              <th className="pb-2 text-right">Active</th>
              <th className="pb-2 text-right">Closing this month</th>
              <th className="pb-2 text-right">Volume</th>
              <th className="pb-2 text-right">Avg cycle</th>
              <th className="pb-2 text-right">Closed</th>
              <th className="pb-2 text-right">Flags</th>
            </tr>
          </thead>
          <tbody>
            {peopleStats.map((p) => (
              <tr key={p.name} className="border-t border-cream-200">
                <td className="py-2.5 font-medium">{p.name}</td>
                <td className="py-2.5 text-ink-500">{p.role}</td>
                <td className="py-2.5 text-right tabular-nums">{p.openCount}</td>
                <td className="py-2.5 text-right tabular-nums">{p.closingMonth}</td>
                <td className="py-2.5 text-right tabular-nums">{p.volumeLabel}</td>
                <td className="py-2.5 text-right tabular-nums">{p.cycle}</td>
                <td className="py-2.5 text-right tabular-nums">{p.closed}</td>
                <td className="py-2.5 text-right tabular-nums">
                  {p.flags > 0 ? (
                    <span className="text-red-600 font-medium">{p.flags}</span>
                  ) : (
                    <span className="text-ink-400">0</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="text-[11px] text-ink-400 mt-3">
          Stats computed live from each escrow&apos;s assigned officer.
        </p>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-4">
          <p className="text-[14px] font-medium mb-3">Compliance</p>
          <ul className="space-y-3 text-[14px]">
            <CompRow ok label="Three-way reconciliation" sub="Last reconciled May 3" />
            <CompRow ok label="Wire-fraud warnings" sub="Sent on 100% of open files" />
            <CompRow
              warn
              label={`Wires awaiting callback - ${unverifiedWires}`}
              sub="Officers must verify before funding"
            />
            <CompRow ok label="1099-S queue" sub="All up to date" />
            <CompRow ok label="CA 593 withholding" sub="No pending filings" />
          </ul>
        </Card>

        <Card className="p-4">
          <p className="text-[14px] font-medium mb-3">Forecast</p>
          <div
            className="rounded-lg p-4 text-cream-50 mb-3"
            style={{ background: "var(--ink)" }}
          >
            <p className="text-[12px]" style={{ color: "var(--hermes)" }}>
              <TrendingUp size={12} className="inline -mt-0.5 mr-1" /> This month
            </p>
            <p className="text-[20px] font-medium mt-0.5">
              {fmtMoney(
                escrows
                  .filter((e) => {
                    const d = new Date(e.closingDate);
                    return d >= today && d <= monthEnd;
                  })
                  .reduce((s, e) => s + e.price, 0),
                { compact: true }
              )}{" "}
              closing pipeline
            </p>
            <p className="text-[12px] mt-1" style={{ color: "var(--hermes-soft)" }}>
              {escrows.filter((e) => {
                const d = new Date(e.closingDate);
                return d >= today && d <= monthEnd;
              }).length}{" "}
              file(s) scheduled to close before month end.
            </p>
          </div>
          <ul className="space-y-2 text-[13px]">
            {[0, 1, 2].map((offset) => {
              const m1 = new Date(today.getFullYear(), today.getMonth() + offset, 1);
              const m2 = new Date(today.getFullYear(), today.getMonth() + offset + 1, 0);
              const vol = escrows
                .filter((e) => {
                  const d = new Date(e.closingDate);
                  return d >= m1 && d <= m2;
                })
                .reduce((s, e) => s + e.price, 0);
              return (
                <li key={offset} className="flex items-center justify-between">
                  <span className="text-ink-500">
                    {m1.toLocaleString("en-US", { month: "long" })} closing pipeline
                  </span>
                  <span className="font-medium tabular-nums">
                    {fmtMoney(vol, { compact: true })}
                  </span>
                </li>
              );
            })}
          </ul>
        </Card>
      </div>
    </div>
  );
}

function Tile({
  label, value, sub, tone
}: {
  label: string; value: string; sub: string; tone?: "ok" | "warn";
}) {
  const c = tone === "warn" ? "#A32D2D" : tone === "ok" ? "#0F6E56" : "#6B5640";
  return (
    <div className="bg-white border border-cream-300 rounded-md p-3.5 shadow-card">
      <p className="text-[12px] text-ink-400">{label}</p>
      <p className="text-[26px] font-medium tracking-tighter2 mt-1">{value}</p>
      <p className="text-[12px] mt-1.5" style={{ color: c }}>
        {sub}
      </p>
    </div>
  );
}

function CompRow({
  ok, warn, label, sub
}: { ok?: boolean; warn?: boolean; label: string; sub: string }) {
  return (
    <li className="flex items-start gap-2.5">
      {ok && <ShieldCheck size={15} className="text-emerald-600 mt-0.5 shrink-0" />}
      {warn && <AlertTriangle size={15} className="text-amber-600 mt-0.5 shrink-0" />}
      <div>
        <p className="text-ink-800">{label}</p>
        <p className="text-[12px] text-ink-400">{sub}</p>
      </div>
    </li>
  );
}
