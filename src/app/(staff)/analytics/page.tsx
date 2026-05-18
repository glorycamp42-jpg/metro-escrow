"use client";

import * as React from "react";
import { Card } from "@/components/ui/Card";
import { fmtMoney, type Escrow } from "@/lib/data/mock";
import { allEscrows } from "@/lib/data/userEscrows";

export default function AnalyticsPage() {
  const [escrows, setEscrows] = React.useState<Escrow[]>([]);
  React.useEffect(() => {
    setEscrows(allEscrows());
  }, []);

  const today = new Date();
  const yearStart = new Date(today.getFullYear(), 0, 1);
  const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  const total = escrows.length;
  const active = escrows.filter(
    (e) => e.status !== "closed" && e.status !== "cancelled"
  );
  const closing = escrows.filter((e) => e.status === "pending_closing");
  const inProgress = escrows.filter((e) => e.status === "in_progress");
  const closedAll = escrows.filter((e) => e.status === "closed");

  const closingThisMonth = escrows.filter((e) => {
    const d = new Date(e.closingDate);
    return d >= today && d <= monthEnd;
  });

  const closedYtd = closedAll.filter((e) => {
    const d = new Date(e.closingDate);
    return d >= yearStart && d <= today;
  });

  const totalVolume = escrows.reduce((s, e) => s + e.price, 0);
  const closedYtdVolume = closedYtd.reduce((s, e) => s + e.price, 0);
  const closingMonthVolume = closingThisMonth.reduce((s, e) => s + e.price, 0);

  const residential = escrows.filter((e) => e.type === "Residential Resale").length;

  // Average days in escrow for active files (today - openedAt)
  let avgDays = 0;
  if (active.length > 0) {
    const sum = active.reduce((s, e) => {
      const opened = new Date(e.openedAt);
      const days = Math.max(
        0,
        Math.floor((today.getTime() - opened.getTime()) / (1000 * 60 * 60 * 24))
      );
      return s + days;
    }, 0);
    avgDays = Math.round(sum / active.length);
  }

  return (
    <div className="flex flex-col gap-5">
      <header>
        <h1 className="text-[24px] font-medium tracking-tighter2">Analytics</h1>
        <p className="text-[13px] text-ink-500 mt-1">
          Numbers reflect what&apos;s actually in your books — single source of truth.
        </p>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat label="Total transactions" value={`${total}`} sub={`${residential} residential`} />
        <Stat label="Active" value={`${active.length}`} sub={`${inProgress.length} in progress`} />
        <Stat label="Closing soon" value={`${closing.length}`} sub="pending closing" />
        <Stat label="Closed" value={`${closedAll.length}`} sub={`${closedYtd.length} YTD`} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Card className="p-5">
          <p className="text-[13px] font-medium mb-3">Total pipeline volume</p>
          <p className="text-[32px] font-medium tracking-tighter2">
            {fmtMoney(totalVolume)}
          </p>
          <p className="text-[12px] text-ink-400 mt-1">
            across {total} files · {fmtMoney(closingMonthVolume, { compact: true })} closing this month
          </p>
        </Card>

        <Card className="p-5">
          <p className="text-[13px] font-medium mb-3">Closed YTD</p>
          <p className="text-[32px] font-medium tracking-tighter2">
            {fmtMoney(closedYtdVolume)}
          </p>
          <p className="text-[12px] text-ink-400 mt-1">
            {closedYtd.length} files closed since Jan 1
          </p>
        </Card>
      </div>

      <Card className="p-5">
        <p className="text-[13px] font-medium mb-3">Average days in escrow</p>
        <p className="text-[32px] font-medium tracking-tighter2">
          {avgDays}<span className="text-[18px] text-ink-400 font-normal"> days</span>
        </p>
        <p className="text-[12px] text-ink-400 mt-1">
          across {active.length} active file{active.length === 1 ? "" : "s"} — measured from file open to today
        </p>
      </Card>
    </div>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bg-white border border-cream-300 rounded-md p-3.5 shadow-card">
      <p className="text-[11px] text-ink-400">{label}</p>
      <p className="text-[22px] font-medium tracking-tighter2 mt-1">{value}</p>
      {sub && <p className="text-[11px] text-ink-400 mt-1">{sub}</p>}
    </div>
  );
}
