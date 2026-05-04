import { Card } from "@/components/ui/Card";
import { escrows, fmtMoney, daysUntil } from "@/lib/data/mock";

export default function ReportsPage() {
  const aging = escrows
    .map((e) => {
      const opened = (Date.now() - new Date(e.openedAt).getTime()) / (1000 * 60 * 60 * 24);
      return { ...e, ageDays: Math.floor(opened) };
    })
    .sort((a, b) => b.ageDays - a.ageDays);

  const closingByMonth: Record<string, number> = {};
  for (const e of escrows) {
    const k = e.closingDate.slice(0, 7);
    closingByMonth[k] = (closingByMonth[k] ?? 0) + e.price;
  }

  return (
    <div className="flex flex-col gap-5">
      <header>
        <h1 className="text-[28px] font-medium tracking-tighter2">Reports</h1>
        <p className="text-[14px] text-ink-500 mt-1">
          Aging files, closing forecast, officer productivity. Data refreshes nightly.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-5">
          <p className="text-[14px] font-medium mb-3">Aging files (oldest first)</p>
          <table className="w-full text-[13px]">
            <thead>
              <tr className="text-left text-[11px] text-ink-400 uppercase tracking-tightish">
                <th className="pb-2">File</th>
                <th className="pb-2">Property</th>
                <th className="pb-2 text-right">Days open</th>
                <th className="pb-2 text-right">Closing in</th>
              </tr>
            </thead>
            <tbody>
              {aging.map((e) => {
                const closeIn = daysUntil(e.closingDate);
                return (
                  <tr key={e.id} className="border-t border-cream-200">
                    <td className="py-2.5 font-medium">{e.id}</td>
                    <td className="py-2.5">{e.property.address}</td>
                    <td
                      className={
                        "py-2.5 text-right tabular-nums " +
                        (e.ageDays > 60 ? "text-red-600 font-medium" : "")
                      }
                    >
                      {e.ageDays}d
                    </td>
                    <td className="py-2.5 text-right tabular-nums">
                      {closeIn === null
                        ? "—"
                        : closeIn < 0
                        ? `closed ${Math.abs(closeIn)}d ago`
                        : `${closeIn}d`}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>

        <Card className="p-5">
          <p className="text-[14px] font-medium mb-3">Closing forecast</p>
          <table className="w-full text-[13px]">
            <thead>
              <tr className="text-left text-[11px] text-ink-400 uppercase tracking-tightish">
                <th className="pb-2">Month</th>
                <th className="pb-2 text-right">Volume</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(closingByMonth)
                .sort()
                .map(([month, vol]) => (
                  <tr key={month} className="border-t border-cream-200">
                    <td className="py-2.5 font-medium">
                      {new Date(month + "-01").toLocaleDateString("en-US", {
                        month: "long",
                        year: "numeric"
                      })}
                    </td>
                    <td className="py-2.5 text-right tabular-nums">
                      {fmtMoney(vol)}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </Card>

        <Card className="p-5 lg:col-span-2">
          <p className="text-[14px] font-medium mb-3">Officer productivity</p>
          <table className="w-full text-[13px]">
            <thead>
              <tr className="text-left text-[11px] text-ink-400 uppercase tracking-tightish">
                <th className="pb-2">Officer</th>
                <th className="pb-2 text-right">Open files</th>
                <th className="pb-2 text-right">Closing this month</th>
                <th className="pb-2 text-right">Volume YTD</th>
                <th className="pb-2 text-right">Avg cycle</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-cream-200">
                <td className="py-2.5 font-medium">Jin Yu</td>
                <td className="py-2.5 text-right tabular-nums">{escrows.length}</td>
                <td className="py-2.5 text-right tabular-nums">3</td>
                <td className="py-2.5 text-right tabular-nums">$5.3M</td>
                <td className="py-2.5 text-right tabular-nums">32 days</td>
              </tr>
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
}
