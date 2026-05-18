"use client";

import * as React from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  ShieldCheck, AlertTriangle, TrendingUp
} from "lucide-react";
import { fmtMoney, type Escrow } from "@/lib/data/mock";
import { allEscrows } from "@/lib/data/userEscrows";

const TEAM = [
  {
    name: "Jin Yu",
    role: "Senior officer",
    open: 4,
    closingMonth: 3,
    volumeYtd: "$5.3M",
    cycle: "32d",
    csat: "4.9",
    flags: 2
  },
  {
    name: "Marisol Tran",
    role: "Officer",
    open: 3,
    closingMonth: 1,
    volumeYtd: "$3.1M",
    cycle: "35d",
    csat: "4.7",
    flags: 0
  },
  {
    name: "David Kim",
    role: "Officer",
    open: 2,
    closingMonth: 0,
    volumeYtd: "$1.8M",
    cycle: "41d",
    csat: "4.6",
    flags: 1
  },
  {
    name: "Anita Park",
    role: "Processor",
    open: 9,
    closingMonth: 0,
    volumeYtd: "-",
    cycle: "-",
    csat: "-",
    flags: 0
  },
  {
    name: "Chris Vega",
    role: "Assistant",
    open: 14,
    closingMonth: 0,
    volumeYtd: "-",
    cycle: "-",
    csat: "-",
    flags: 0
  }
];

export default function TeamPage() {
  const [escrows, setEscrows] = React.useState<Escrow[]>([]);
  React.useEffect(() => {
    setEscrows(allEscrows());
  }, []);

  const flagged = escrows.filter((e) => e.risks.length > 0).length;
  const unverifiedWires = escrows.filter((e) => !e.wire.callbackVerified).length;
  const aging = 1;
  const total = escrows.length;
  const pipelineValue = escrows.reduce((s, e) => s + e.price, 0);

  return (
    <div className="flex flex-col gap-5">
      <header>
        <h1 className="text-[28px] font-medium tracking-tighter2">Team view</h1>
        <p className="text-[14px] text-ink-500 mt-1">
          Branch-wide pipeline, productivity, and compliance. Senior + manager only.
        </p>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Tile label="Open files" value={String(total)} sub="across 3 officers" />
        <Tile label="Pipeline value" value={fmtMoney(pipelineValue, { compact: true })} sub="all stages" />
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
              <th className="pb-2 text-right">Open</th>
              <th className="pb-2 text-right">Closing this month</th>
              <th className="pb-2 text-right">Volume YTD</th>
              <th className="pb-2 text-right">Avg cycle</th>
              <th className="pb-2 text-right">CSAT</th>
              <th className="pb-2 text-right">Flags</th>
            </tr>
          </thead>
          <tbody>
            {TEAM.map((p) => (
              <tr key={p.name} className="border-t border-cream-200">
                <td className="py-2.5 font-medium">{p.name}</td>
                <td className="py-2.5 text-ink-500">{p.role}</td>
                <td className="py-2.5 text-right tabular-nums">{p.open}</td>
                <td className="py-2.5 text-right tabular-nums">{p.closingMonth}</td>
                <td className="py-2.5 text-right tabular-nums">{p.volumeYtd}</td>
                <td className="py-2.5 text-right tabular-nums">{p.cycle}</td>
                <td className="py-2.5 text-right tabular-nums">{p.csat}</td>
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
              <TrendingUp size={12} className="inline -mt-0.5 mr-1" /> Q2 forecast
            </p>
            <p className="text-[20px] font-medium mt-0.5">$14.8M closing volume</p>
            <p className="text-[12px] mt-1" style={{ color: "var(--hermes-soft)" }}>
              +12% vs Q1, ahead of budget by 4%.
            </p>
          </div>
          <ul className="space-y-2 text-[13px]">
            <li className="flex items-center justify-between">
              <span className="text-ink-500">May closing pipeline</span>
              <span className="font-medium tabular-nums">$5.3M</span>
            </li>
            <li className="flex items-center justify-between">
              <span className="text-ink-500">June closing pipeline</span>
              <span className="font-medium tabular-nums">$4.9M</span>
            </li>
            <li className="flex items-center justify-between">
              <span className="text-ink-500">July closing pipeline</span>
              <span className="font-medium tabular-nums">$4.6M</span>
            </li>
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
