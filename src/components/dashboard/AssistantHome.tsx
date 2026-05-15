"use client";

import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  Calendar, Mail, Phone, MessageCircle, FileSignature, Package
} from "lucide-react";
import { escrows, appointments } from "@/lib/data/mock";
import { useToast } from "@/components/ui/Toast";

export function AssistantHome() {
  const toast = useToast();
  const myTasks = escrows.flatMap((e) =>
    e.tasks
      .filter((t) => t.owner === "assistant" && !t.done)
      .map((t) => ({ ...t, escrowId: e.id, address: e.property.address }))
  );
  const upcoming = appointments
    .map((a) => ({ ...a, ts: new Date(a.start).getTime() }))
    .sort((x, y) => x.ts - y.ts)
    .slice(0, 5);

  return (
    <div className="grid grid-cols-12 gap-4">
      <section className="col-span-12 lg:col-span-8 flex flex-col gap-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Kpi label="To schedule" value={String(myTasks.length)} sub="signings, walkthroughs" tone="brand" />
          <Kpi label="Pkg to mail" value="3" sub="closing packets" tone="warn" />
          <Kpi label="Calls to make" value="6" sub="confirmations" tone="ok" />
          <Kpi label="Welcome packets" value="2" sub="new files this week" tone="muted" />
        </div>

        <Card className="p-4">
          <p className="text-[14px] font-medium mb-3">Today's queue</p>
          <ul className="divide-y divide-cream-200">
            {myTasks.length === 0 && (
              <p className="text-[13px] text-ink-400 italic">No assistant tasks today.</p>
            )}
            {myTasks.map((t) => (
              <li key={t.escrowId + t.id} className="flex items-start gap-3 py-2.5">
                <Calendar size={16} className="text-ink-400 mt-0.5 shrink-0" />
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
          <div className="mt-3 pt-3 border-t border-cream-200">
            <Link href="/queue">
              <Button size="sm" variant="secondary">All my tasks</Button>
            </Link>
          </div>
        </Card>

        <Card className="p-4">
          <p className="text-[14px] font-medium mb-3">Upcoming appointments</p>
          <ul className="divide-y divide-cream-200">
            {upcoming.map((a) => (
              <li key={a.id} className="flex items-center justify-between py-2.5">
                <div>
                  <p className="text-[14px] font-medium">{a.title}</p>
                  <p className="text-[12px] text-ink-400">
                    {a.escrowId} -{" "}
                    {new Date(a.start).toLocaleString("en-US", {
                      weekday: "short", month: "short", day: "numeric",
                      hour: "numeric", minute: "2-digit"
                    })}
                  </p>
                </div>
                <Button size="sm" variant="secondary" onClick={() => toast.push("Appointment confirmed - reminder queued", "ok")}>Confirm</Button>
              </li>
            ))}
          </ul>
        </Card>
      </section>

      <aside className="col-span-12 lg:col-span-4 flex flex-col gap-4">
        <Card className="p-4">
          <p className="text-[13px] font-medium mb-3">Quick actions</p>
          <div className="flex flex-col gap-2">
            <Button variant="secondary" className="justify-start" onClick={() => toast.push("Signing appointment scheduler opened", "ok")}>
              <FileSignature size={13} /> Set up signing
            </Button>
            <Button variant="secondary" className="justify-start" onClick={() => { toast.push("Closing packet sent to print queue", "ok"); window.print(); }}>
              <Package size={13} /> Print closing packet
            </Button>
            <Button variant="secondary" className="justify-start" onClick={() => toast.push("Dialing party for confirmation...", "info")}>
              <Phone size={13} /> Call to confirm
            </Button>
            <Button variant="secondary" className="justify-start" onClick={() => toast.push("SMS reminder sent", "ok")}>
              <MessageCircle size={13} /> Send SMS reminder
            </Button>
            <Button variant="secondary" className="justify-start" onClick={() => toast.push("Welcome packet emailed", "ok")}>
              <Mail size={13} /> Email welcome packet
            </Button>
          </div>
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
