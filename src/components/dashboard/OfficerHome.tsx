"use client";

import * as React from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  dashboardKpis, fmtMoney, STATUS_META, type Escrow
} from "@/lib/data/mock";
import { allEscrows } from "@/lib/data/userEscrows";
import { ArrowRight, AlertTriangle } from "lucide-react";
import { WeekStrip } from "@/components/dashboard/WeekStrip";

export function OfficerHome() {
  const [escrows, setEscrows] = React.useState<Escrow[]>([]);
  React.useEffect(() => {
    setEscrows(allEscrows());
  }, []);

  const allRisks = escrows.flatMap((e) =>
    e.risks.map((r) => ({ ...r, escrowId: e.id }))
  );
  const portalSpotlight = escrows[0];
  const unverifiedWires = escrows.filter((e) => !e.wire.callbackVerified);

  return (
    <div className="grid grid-cols-12 gap-4">
      <section className="col-span-12 lg:col-span-8 flex flex-col gap-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Kpi label="In escrow" value={String(dashboardKpis.inEscrow)} sub="+2 this week" tone="ok" />
          <Kpi label="Awaiting signature" value={String(dashboardKpis.awaitingSignature)} sub="2 due today" tone="warn" />
          <Kpi label="Closing this month" value={String(dashboardKpis.closingThisMonth)} sub="on track" tone="muted" />
          <Kpi label="Volume YTD" value={fmtMoney(dashboardKpis.volumeYtd, { compact: true })} sub="+18%" tone="brand" />
        </div>

        <Card className="p-4">
          <div className="flex items-baseline justify-between mb-3">
            <p className="text-[14px] font-medium">This week</p>
            <Link href="/calendar" className="text-[12px] text-ink-400 hover:text-ink-700">
              Open calendar
            </Link>
          </div>
          <WeekStrip />
        </Card>

        <Card className="p-4">
          <div className="flex items-baseline justify-between mb-3">
            <p className="text-[14px] font-medium">Active escrows</p>
            <Link href="/transactions" className="text-[12px] text-ink-400 hover:text-ink-700">
              View all
            </Link>
          </div>
          <ul className="divide-y divide-cream-200">
            {escrows.slice(0, 4).map((e) => {
              const meta = STATUS_META[e.status];
              return (
                <li key={e.id}>
                  <Link
                    href={"/transactions/" + e.id}
                    className="flex items-center justify-between gap-3 py-2.5 hover:bg-cream-50 rounded-md px-1 -mx-1"
                  >
                    <div className="min-w-0">
                      <p className="text-[14px] font-medium truncate">
                        {e.property.address} - {e.property.city}
                      </p>
                      <p className="text-[12px] text-ink-400 truncate">
                        {e.id} - {fmtMoney(e.price, { compact: true })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {e.risks.length > 0 && (
                        <Badge bg="#FCEBEB" fg="#A32D2D">Risk</Badge>
                      )}
                      <Badge bg={meta.bg} fg={meta.fg}>{meta.label}</Badge>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </Card>
      </section>

      <aside className="col-span-12 lg:col-span-4 flex flex-col gap-4">
        <div className="rounded-lg p-4 text-cream-50" style={{ background: "var(--ink)" }}>
          <p className="text-[12px] font-medium mb-1" style={{ color: "var(--hermes)" }}>
            AI Assistant
          </p>
          <p className="text-[14px] leading-relaxed">
            Want me to open a new escrow, draft a closing notice, or check today's flags? Press <span className="px-1.5 py-0.5 rounded bg-white/10 text-[12px]">Cmd+K</span>.
          </p>
        </div>

        {unverifiedWires.length > 0 && (
          <Card className="p-4 border-red-200" style={{ background: "#FFF8F8" }}>
            <p className="text-[13px] font-medium text-red-700 mb-2">
              Wires awaiting your callback - {unverifiedWires.length}
            </p>
            <ul className="space-y-2">
              {unverifiedWires.map((e) => (
                <li key={e.id}>
                  <Link
                    href={"/transactions/" + e.id}
                    className="text-[13px] text-ink-800 hover:underline"
                  >
                    {e.id} - {e.property.address}
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        )}

        {allRisks.length > 0 && (
          <Card className="p-4">
            <p className="text-[13px] font-medium text-red-700 mb-2">
              <AlertTriangle size={13} className="inline -mt-0.5 mr-1" />
              Risk flags - {allRisks.length}
            </p>
            <ul className="divide-y divide-cream-200">
              {allRisks.map((r) => (
                <li key={r.id} className="py-2">
                  <p className="text-[13px] font-medium">
                    {r.escrowId} - {r.message}
                  </p>
                  <p className="text-[11px] text-ink-400">AI flagged</p>
                </li>
              ))}
            </ul>
          </Card>
        )}

        {portalSpotlight && (
          <div className="rounded-lg p-4 text-cream-50" style={{ background: "var(--hermes)" }}>
            <p className="text-[12px]" style={{ color: "var(--hermes-soft)" }}>
              Client portal - live
            </p>
            <p className="text-[15px] font-medium mt-0.5">
              {portalSpotlight.parties.find((p) => p.role === "buyer")?.name ?? "Buyer"} is on step {portalSpotlight.step} of 8
            </p>
            <Link
              href={"/portal/" + portalSpotlight.portalToken}
              target="_blank"
              className="text-[12px] inline-flex items-center gap-1 mt-2"
              style={{ color: "var(--hermes-soft)" }}
            >
              Preview portal <ArrowRight size={12} />
            </Link>
          </div>
        )}
      </aside>
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
