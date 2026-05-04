import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ShieldCheck, AlertTriangle, FileDown } from "lucide-react";
import { escrows, fmtMoney } from "@/lib/data/mock";

export default function TrustPage() {
  // Mock trust account totals
  const receipts = escrows.reduce((s, e) => s + e.settlement.emd, 0);
  const open = escrows.filter((e) => e.status !== "closed").length;
  const verifiedWires = escrows.filter((e) => e.wire.callbackVerified).length;
  const unverifiedWires = escrows.length - verifiedWires;

  return (
    <div className="flex flex-col gap-5">
      <header className="flex items-end justify-between">
        <div>
          <h1 className="text-[28px] font-medium tracking-tighter2">
            Trust accounting
          </h1>
          <p className="text-[14px] text-ink-500 mt-1">
            Single trust ledger across all escrows. Three-way reconciliation required before any disbursement.
          </p>
        </div>
        <Button variant="secondary">
          <FileDown size={14} /> Export reconciliation
        </Button>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="Trust balance" value={fmtMoney(receipts)} sub="across all open files" />
        <KpiCard label="Open files" value={`${open}`} sub="with funds in trust" />
        <KpiCard
          label="Wires verified"
          value={`${verifiedWires} / ${escrows.length}`}
          sub={
            unverifiedWires > 0 ? `${unverifiedWires} need callback` : "all verified"
          }
          tone={unverifiedWires > 0 ? "warn" : "ok"}
        />
        <KpiCard
          label="Last reconciled"
          value="May 3"
          sub="3-way matched"
          tone="ok"
        />
      </div>

      <Card className="p-5">
        <p className="text-[14px] font-medium mb-3">Files with funds in trust</p>
        <table className="w-full text-[14px]">
          <thead>
            <tr className="text-left text-[11px] font-medium text-ink-400 uppercase tracking-tightish">
              <th className="pb-2">File</th>
              <th className="pb-2">Property</th>
              <th className="pb-2 text-right">EMD</th>
              <th className="pb-2 text-right">Disbursed</th>
              <th className="pb-2 text-right">Balance</th>
              <th className="pb-2">Wire</th>
            </tr>
          </thead>
          <tbody>
            {escrows.map((e) => (
              <tr key={e.id} className="border-t border-cream-200">
                <td className="py-3 font-medium">{e.id}</td>
                <td className="py-3">{e.property.address}</td>
                <td className="py-3 text-right tabular-nums">
                  {fmtMoney(e.settlement.emd)}
                </td>
                <td className="py-3 text-right tabular-nums text-ink-400">$0</td>
                <td className="py-3 text-right tabular-nums">
                  {fmtMoney(e.settlement.emd)}
                </td>
                <td className="py-3">
                  {e.wire.callbackVerified ? (
                    <span className="inline-flex items-center gap-1 text-emerald-700 text-[12px]">
                      <ShieldCheck size={13} /> verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-red-700 text-[12px]">
                      <AlertTriangle size={13} /> needs callback
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

function KpiCard({
  label,
  value,
  sub,
  tone
}: {
  label: string;
  value: string;
  sub: string;
  tone?: "ok" | "warn";
}) {
  const color = tone === "warn" ? "#A32D2D" : tone === "ok" ? "#0F6E56" : "#6B5640";
  return (
    <div className="bg-white border border-cream-300 rounded-md p-4 shadow-card">
      <p className="text-[12px] text-ink-400">{label}</p>
      <p className="text-[26px] font-medium tracking-tighter2 mt-1">{value}</p>
      <p className="text-[12px] mt-1.5" style={{ color }}>
        {sub}
      </p>
    </div>
  );
}
