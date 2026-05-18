"use client";

import * as React from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ShieldCheck, AlertTriangle, ArrowUpRight } from "lucide-react";
import { fmtMoney, STAGE_META, type Escrow } from "@/lib/data/mock";
import { allEscrows } from "@/lib/data/userEscrows";
import { useToast } from "@/components/ui/Toast";

export function SeniorHome() {
  const toast = useToast();
  const [escrows, setEscrows] = React.useState<Escrow[]>([]);
  React.useEffect(() => {
    setEscrows(allEscrows());
  }, []);

  const flagged = escrows.filter((e) => e.risks.length > 0);
  const unverifiedWires = escrows.filter((e) => !e.wire.callbackVerified);
  const total = escrows.length;
  const closingSoon = escrows.filter((e) => e.status === "pending_closing").length;

  return (
    <div className="grid grid-cols-12 gap-4">
      <section className="col-span-12 lg:col-span-8 flex flex-col gap-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Kpi label="Team open files" value={String(total)} sub="3 officers" tone="brand" />
          <Kpi label="Pending approval" value="4" sub="exception requests" tone="warn" />
          <Kpi label="Closing this week" value={String(closingSoon)} sub="watch list" tone="ok" />
          <Kpi label="Audit flags" value={String(flagged.length)} sub="needs review" tone="muted" />
        </div>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[14px] font-medium">Files waiting on your approval</p>
            <Link href="/queue" className="text-[12px] text-ink-400 hover:text-ink-700">
              Open queue
            </Link>
          </div>
          <ul className="divide-y divide-cream-200">
            {flagged.length === 0 && (
              <p className="text-[13px] text-ink-400 italic">Nothing flagged for senior review.</p>
            )}
            {flagged.map((e) => (
              <li key={e.id} className="flex items-start gap-3 py-2.5">
                <AlertTriangle size={16} className="text-red-600 mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-medium">
                    <Link href={"/transactions/" + e.id} className="hover:underline">
                      {e.id}
                    </Link>{" "}
                    - {e.property.address}
                  </p>
                  <p className="text-[12px] text-ink-500 mt-0.5">
                    {e.risks.map((r) => r.message).join(" - ")}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge bg={STAGE_META[e.stage].color + "22"} fg={STAGE_META[e.stage].color}>
                      {STAGE_META[e.stage].label}
                    </Badge>
                    <span className="text-[11px] text-ink-400">
                      Officer: {e.officer}
                    </span>
                  </div>
                </div>
                <Button size="sm" variant="primary" onClick={() => toast.push("Review opened for " + e.id, "info")}>Review</Button>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-4">
          <p className="text-[14px] font-medium mb-3">Officer load</p>
          <table className="w-full text-[14px]">
            <thead>
              <tr className="text-left text-[11px] text-ink-400 uppercase tracking-tightish">
                <th className="pb-2">Officer</th>
                <th className="pb-2 text-right">Open</th>
                <th className="pb-2 text-right">Closing this month</th>
                <th className="pb-2 text-right">Volume YTD</th>
                <th className="pb-2 text-right">Flags</th>
              </tr>
            </thead>
            <tbody>
              <Row name="Jin Yu" open={4} closing={3} volume="$5.3M" flags={2} />
              <Row name="Marisol Tran" open={3} closing={1} volume="$3.1M" flags={0} />
              <Row name="David Kim" open={2} closing={0} volume="$1.8M" flags={1} />
            </tbody>
          </table>
        </Card>
      </section>

      <aside className="col-span-12 lg:col-span-4 flex flex-col gap-4">
        <Card className="p-4">
          <p className="text-[13px] font-medium text-red-700 mb-2">
            Wire callbacks pending
          </p>
          <ul className="space-y-2 text-[13px]">
            {unverifiedWires.map((e) => (
              <li key={e.id}>
                <Link href={"/transactions/" + e.id} className="hover:underline">
                  {e.id}
                </Link>{" "}
                - {e.property.address}
              </li>
            ))}
            {unverifiedWires.length === 0 && (
              <p className="text-ink-400 italic">All wires verified.</p>
            )}
          </ul>
        </Card>

        <Card className="p-4">
          <p className="text-[13px] font-medium mb-2">Compliance status</p>
          <ul className="text-[13px] space-y-2">
            <Row2 ok label="3-way reconciliation" sub="last May 3" />
            <Row2 ok label="Wire-fraud warnings sent" sub="all open files" />
            <Row2 warn label="Aging files >60d" sub="1 file" />
            <Row2 ok label="1099-S queue" sub="up to date" />
          </ul>
        </Card>

        <div className="rounded-lg p-4 text-cream-50" style={{ background: "var(--ink)" }}>
          <p className="text-[12px] mb-1" style={{ color: "var(--hermes)" }}>AI Assistant</p>
          <p className="text-[13px]">
            Try: "Summarize today across the team" or "Show files older than 60 days." Press Cmd+K.
          </p>
        </div>
      </aside>
    </div>
  );
}

function Row({
  name, open, closing, volume, flags
}: { name: string; open: number; closing: number; volume: string; flags: number }) {
  return (
    <tr className="border-t border-cream-200">
      <td className="py-2.5 font-medium">{name}</td>
      <td className="py-2.5 text-right tabular-nums">{open}</td>
      <td className="py-2.5 text-right tabular-nums">{closing}</td>
      <td className="py-2.5 text-right tabular-nums">{volume}</td>
      <td className="py-2.5 text-right tabular-nums">
        {flags > 0 ? (
          <span className="text-red-600 font-medium">{flags}</span>
        ) : (
          <span className="text-ink-400">0</span>
        )}
      </td>
    </tr>
  );
}

function Row2({
  ok, warn, label, sub
}: { ok?: boolean; warn?: boolean; label: string; sub: string }) {
  return (
    <li className="flex items-start gap-2">
      {ok && <ShieldCheck size={14} className="text-emerald-600 mt-0.5 shrink-0" />}
      {warn && <AlertTriangle size={14} className="text-amber-600 mt-0.5 shrink-0" />}
      <div>
        <p className="text-ink-800">{label}</p>
        <p className="text-[11px] text-ink-400">{sub}</p>
      </div>
    </li>
  );
}

function Kpi({
  label, value, sub, tone
}: {
  label: string; value: string; sub: string; tone: "ok" | "warn" | "muted" | "brand";
}) {
  const c = { ok: "#0F6E56", warn: "#A8470F", muted: "#6B5640", brand: "#F37021" }[tone];
  return (
    <div className="bg-white border border-cream-300 rounded-md p-3.5 shadow-card">
      <p className="text-[12px] text-ink-400">{label}</p>
      <p className="text-[24px] font-medium tracking-tighter2 mt-1">{value}</p>
      <p className="text-[12px] mt-1.5" style={{ color: c }}>{sub}</p>
    </div>
  );
}
