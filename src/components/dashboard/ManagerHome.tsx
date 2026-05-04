"use client";

import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ShieldCheck, AlertTriangle, TrendingUp, FileBarChart } from "lucide-react";
import { escrows, fmtMoney } from "@/lib/data/mock";

export function ManagerHome() {
  const total = escrows.length;
  const closed = escrows.filter((e) => e.status === "closed").length;
  const flagged = escrows.filter((e) => e.risks.length > 0).length;
  const pipelineValue = escrows.reduce((s, e) => s + e.price, 0);

  return (
    <div className="grid grid-cols-12 gap-4">
      <section className="col-span-12 lg:col-span-8 flex flex-col gap-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Kpi label="Volume YTD" value={fmtMoney(4200000, { compact: true })} sub="+18% YoY" tone="brand" />
          <Kpi label="Pipeline" value={fmtMoney(pipelineValue, { compact: true })} sub={String(total) + " files"} tone="ok" />
          <Kpi label="Closed this month" value={String(closed || 8)} sub="vs target 10" tone="warn" />
          <Kpi label="Audit flags" value={String(flagged)} sub="open" tone="muted" />
        </div>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[14px] font-medium">Officer leaderboard</p>
            <Link href="/reports" className="text-[12px] text-ink-400 hover:text-ink-700">
              Full report
            </Link>
          </div>
          <table className="w-full text-[14px]">
            <thead>
              <tr className="text-left text-[11px] text-ink-400 uppercase tracking-tightish">
                <th className="pb-2">Officer</th>
                <th className="pb-2 text-right">Closed YTD</th>
                <th className="pb-2 text-right">Volume</th>
                <th className="pb-2 text-right">Avg cycle</th>
                <th className="pb-2 text-right">CSAT</th>
              </tr>
            </thead>
            <tbody>
              <Row name="Jin Yu" closed={42} volume="$5.3M" cycle="32d" csat="4.9" />
              <Row name="Marisol Tran" closed={36} volume="$3.1M" cycle="35d" csat="4.7" />
              <Row name="David Kim" closed={28} volume="$1.8M" cycle="41d" csat="4.6" />
            </tbody>
          </table>
        </Card>

        <Card className="p-4">
          <p className="text-[14px] font-medium mb-3">Compliance & trust</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Tile ok label="Last 3-way reconciliation" value="May 3" />
            <Tile ok label="Wire-fraud warnings" value="100% sent" />
            <Tile warn label="Aging files >60d" value="1 file" />
            <Tile ok label="1099-S filings" value="Up to date" />
          </div>
        </Card>
      </section>

      <aside className="col-span-12 lg:col-span-4 flex flex-col gap-4">
        <div className="rounded-lg p-4 text-cream-50" style={{ background: "var(--ink)" }}>
          <p className="text-[12px] mb-1" style={{ color: "var(--hermes)" }}>
            <TrendingUp size={12} className="inline -mt-0.5 mr-1" />
            Forecast
          </p>
          <p className="text-[15px] font-medium">
            Q2 on track for $14.8M.
          </p>
          <p className="text-[12px] mt-1" style={{ color: "var(--hermes-soft)" }}>
            +12% vs Q1, ahead of budget by 4%.
          </p>
        </div>

        <Card className="p-4">
          <p className="text-[13px] font-medium mb-3">Quick reports</p>
          <div className="flex flex-col gap-2">
            <Link href="/reports">
              <Button variant="secondary" className="w-full justify-start">
                <FileBarChart size={13} /> Aging files
              </Button>
            </Link>
            <Link href="/team">
              <Button variant="secondary" className="w-full justify-start">
                <FileBarChart size={13} /> Team performance
              </Button>
            </Link>
            <Link href="/trust">
              <Button variant="secondary" className="w-full justify-start">
                <ShieldCheck size={13} /> Trust reconciliation
              </Button>
            </Link>
          </div>
        </Card>
      </aside>
    </div>
  );
}

function Row({
  name, closed, volume, cycle, csat
}: { name: string; closed: number; volume: string; cycle: string; csat: string }) {
  return (
    <tr className="border-t border-cream-200">
      <td className="py-2.5 font-medium">{name}</td>
      <td className="py-2.5 text-right tabular-nums">{closed}</td>
      <td className="py-2.5 text-right tabular-nums">{volume}</td>
      <td className="py-2.5 text-right tabular-nums">{cycle}</td>
      <td className="py-2.5 text-right tabular-nums">{csat}</td>
    </tr>
  );
}

function Tile({
  ok, warn, label, value
}: { ok?: boolean; warn?: boolean; label: string; value: string }) {
  return (
    <div className="border border-cream-200 rounded-md p-3 flex items-start gap-2">
      {ok && <ShieldCheck size={15} className="text-emerald-600 mt-0.5 shrink-0" />}
      {warn && <AlertTriangle size={15} className="text-amber-600 mt-0.5 shrink-0" />}
      <div>
        <p className="text-[12px] text-ink-400">{label}</p>
        <p className="text-[15px] font-medium mt-0.5">{value}</p>
      </div>
    </div>
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
