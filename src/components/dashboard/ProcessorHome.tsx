"use client";

import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { CheckCircle2, Circle, FileText, Mail, Phone } from "lucide-react";
import { escrows } from "@/lib/data/mock";
import { useToast } from "@/components/ui/Toast";

export function ProcessorHome() {
  const toast = useToast();
  // collect tasks owned by processor across all files
  const myTasks = escrows.flatMap((e) =>
    e.tasks
      .filter((t) => t.owner === "processor")
      .map((t) => ({ ...t, escrowId: e.id, address: e.property.address }))
  );
  const open = myTasks.filter((t) => !t.done);
  const done = myTasks.length - open.length;

  return (
    <div className="grid grid-cols-12 gap-4">
      <section className="col-span-12 lg:col-span-8 flex flex-col gap-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Kpi label="Open tasks" value={String(open.length)} sub="across all files" tone="brand" />
          <Kpi label="Title orders pending" value="3" sub="2 awaiting return" tone="warn" />
          <Kpi label="Payoffs requested" value="2" sub="1 ETA today" tone="ok" />
          <Kpi label="Recordings this week" value="1" sub="Friday" tone="muted" />
        </div>

        <Card className="p-4">
          <p className="text-[14px] font-medium mb-3">My queue - {open.length}</p>
          <ul className="divide-y divide-cream-200">
            {open.length === 0 && (
              <p className="text-[13px] text-ink-400 italic">All clear. Beautiful.</p>
            )}
            {open.slice(0, 12).map((t) => (
              <li key={t.escrowId + t.id} className="flex items-start gap-3 py-2.5">
                <Circle size={18} className="text-ink-400 mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] text-ink-800">{t.label}</p>
                  <p className="text-[11px] text-ink-400 mt-0.5">
                    <Link href={"/transactions/" + t.escrowId} className="hover:underline">
                      {t.escrowId}
                    </Link>{" "}
                    - {t.address}
                  </p>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-3 pt-3 border-t border-cream-200 flex items-center justify-between">
            <p className="text-[12px] text-ink-400">{done} completed today</p>
            <Link href="/queue">
              <Button size="sm" variant="secondary">Go to full queue</Button>
            </Link>
          </div>
        </Card>

        <Card className="p-4">
          <p className="text-[14px] font-medium mb-3">Title status by file</p>
          <table className="w-full text-[13px]">
            <thead>
              <tr className="text-left text-[11px] text-ink-400 uppercase tracking-tightish">
                <th className="pb-2">File</th>
                <th className="pb-2">Property</th>
                <th className="pb-2">Title status</th>
                <th className="pb-2">Curative</th>
              </tr>
            </thead>
            <tbody>
              {escrows.map((e) => (
                <tr key={e.id} className="border-t border-cream-200">
                  <td className="py-2.5 font-medium">{e.id}</td>
                  <td className="py-2.5">{e.property.address}</td>
                  <td className="py-2.5 text-ink-700">
                    {e.stage === "opening" ? "Ordered" : "Received"}
                  </td>
                  <td className="py-2.5 text-ink-400">
                    {e.stage === "opening" ? "Awaiting" : "Clear"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </section>

      <aside className="col-span-12 lg:col-span-4 flex flex-col gap-4">
        <Card className="p-4">
          <p className="text-[13px] font-medium mb-3">Quick send</p>
          <div className="flex flex-col gap-2">
            <Button variant="secondary" className="justify-start" onClick={() => toast.push("Title order email drafted from template", "ok")}>
              <Mail size={13} /> Order title (template)
            </Button>
            <Button variant="secondary" className="justify-start" onClick={() => toast.push("Payoff demand request drafted to existing lender", "ok")}>
              <Mail size={13} /> Request payoff demand
            </Button>
            <Button variant="secondary" className="justify-start" onClick={() => toast.push("HOA documents ordered (7-day rule)", "ok")}>
              <Mail size={13} /> Order HOA documents
            </Button>
            <Button variant="secondary" className="justify-start" onClick={() => toast.push("Dialing lender contact...", "info")}>
              <Phone size={13} /> Call lender
            </Button>
          </div>
        </Card>

        <Card className="p-4">
          <p className="text-[13px] font-medium mb-3">Recent processor activity</p>
          <ul className="text-[13px] space-y-2">
            <li className="flex items-start gap-2">
              <CheckCircle2 size={14} className="text-hermes-500 mt-0.5 shrink-0" />
              <span>Sent title order for TXN-2024-001</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 size={14} className="text-hermes-500 mt-0.5 shrink-0" />
              <span>Received prelim for TXN-2024-002</span>
            </li>
            <li className="flex items-start gap-2">
              <FileText size={14} className="text-ink-400 mt-0.5 shrink-0" />
              <span>HOA documents requested for TXN-2024-001</span>
            </li>
          </ul>
        </Card>
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
