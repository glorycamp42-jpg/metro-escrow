import { Card } from "@/components/ui/Card";
import { dashboardKpis, escrows, fmtMoney } from "@/lib/data/mock";

export default function AnalyticsPage() {
  const total = escrows.length;
  const closed = escrows.filter((e) => e.status === "closed").length;
  const closing = escrows.filter((e) => e.status === "pending_closing").length;
  const inProgress = escrows.filter((e) => e.status === "in_progress").length;

  return (
    <div className="flex flex-col gap-5">
      <header>
        <h1 className="text-[24px] font-medium tracking-tighter2">Analytics</h1>
        <p className="text-[13px] text-ink-500 mt-1">
          Numbers reflect what's actually in your books — single source of truth.
        </p>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat label="Total transactions" value={`${total}`} />
        <Stat label="In progress" value={`${inProgress}`} />
        <Stat label="Closing soon" value={`${closing}`} />
        <Stat label="Closed" value={`${closed}`} />
      </div>

      <Card className="p-5">
        <p className="text-[13px] font-medium mb-3">Volume YTD</p>
        <p className="text-[32px] font-medium tracking-tighter2">
          {fmtMoney(dashboardKpis.volumeYtd)}
        </p>
        <p className="text-[12px] text-ink-400 mt-1">+18% vs last year</p>
      </Card>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white border border-cream-300 rounded-md p-3.5 shadow-card">
      <p className="text-[11px] text-ink-400">{label}</p>
      <p className="text-[22px] font-medium tracking-tighter2 mt-1">{value}</p>
    </div>
  );
}
