"use client";

import * as React from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Send, FilePen } from "lucide-react";
import {
  readEnvelopes, writeEnvelopes, STATUS_LABEL,
  type Envelope, type EnvelopeStatus
} from "@/lib/data/envelopes";
import { logAudit } from "@/lib/data/audit";

export default function SignaturesPage() {
  const [list, setList] = React.useState<Envelope[]>([]);

  React.useEffect(() => {
    setList(readEnvelopes());
  }, []);

  function update(id: string, patch: Partial<Envelope>) {
    setList((l) => {
      const next = l.map((e) => (e.id === id ? { ...e, ...patch } : e));
      writeEnvelopes(next);
      return next;
    });
  }

  function send(env: Envelope) {
    update(env.id, {
      status: "sent",
      sentAt: new Date().toISOString()
    });
    logAudit({
      who: "Jin Yu",
      role: "Officer",
      action: "Envelope sent for signature",
      target: env.escrowId,
      detail: env.document + " sent to " + env.signers.map((s) => s.name).join(", ")
    });
  }

  function markCompleted(env: Envelope) {
    update(env.id, {
      status: "completed",
      completedAt: new Date().toISOString(),
      signers: env.signers.map((s) => ({ ...s, status: "signed" }))
    });
    logAudit({
      who: "Jin Yu",
      role: "Officer",
      action: "Envelope marked completed",
      target: env.escrowId,
      detail: env.document + " - all signatures collected"
    });
  }

  const grouped: Record<EnvelopeStatus, Envelope[]> = {
    draft: [], sent: [], delivered: [], signed: [], completed: [], voided: []
  };
  list.forEach((e) => grouped[e.status].push(e));

  return (
    <div className="flex flex-col gap-5">
      <header className="flex items-end justify-between">
        <div>
          <h1 className="text-[28px] font-medium tracking-tighter2">Signatures</h1>
          <p className="text-[14px] text-ink-500 mt-1">
            E-signature envelopes across all escrow files. Status syncs from your provider.
          </p>
        </div>
        <Button variant="primary">
          <FilePen size={14} /> New envelope
        </Button>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat label="In flight" value={String(grouped.sent.length + grouped.delivered.length)} />
        <Stat label="Drafts" value={String(grouped.draft.length)} />
        <Stat label="Completed" value={String(grouped.completed.length)} tone="ok" />
        <Stat label="Voided" value={String(grouped.voided.length)} />
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="grid grid-cols-12 px-5 py-3 text-[11px] font-medium text-ink-400 uppercase tracking-tightish border-b border-cream-200">
          <div className="col-span-3">Document</div>
          <div className="col-span-2">File</div>
          <div className="col-span-3">Signers</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>
        <ul>
          {list.length === 0 && (
            <p className="px-5 py-6 text-center text-[13px] text-ink-400">No envelopes.</p>
          )}
          {list.map((env) => {
            const s = STATUS_LABEL[env.status];
            return (
              <li
                key={env.id}
                className="grid grid-cols-12 px-5 py-3.5 border-b border-cream-200 last:border-0 items-center"
              >
                <div className="col-span-3 text-[14px] font-medium">{env.document}</div>
                <div className="col-span-2">
                  <Link
                    href={"/transactions/" + env.escrowId}
                    className="text-[13px] text-hermes-500 hover:underline"
                  >
                    {env.escrowId}
                  </Link>
                </div>
                <div className="col-span-3 text-[12px] text-ink-500">
                  {env.signers.map((sg) => sg.name + " (" + sg.status + ")").join(", ")}
                </div>
                <div className="col-span-2">
                  <span
                    className="text-[11px] px-2 py-0.5 rounded-full font-medium"
                    style={{ background: s.bg, color: s.fg }}
                  >
                    {s.label}
                  </span>
                </div>
                <div className="col-span-2 flex justify-end gap-1.5">
                  {env.status === "draft" && (
                    <Button size="sm" variant="primary" onClick={() => send(env)}>
                      <Send size={12} /> Send
                    </Button>
                  )}
                  {(env.status === "sent" || env.status === "delivered") && (
                    <Button size="sm" variant="secondary" onClick={() => markCompleted(env)}>
                      Mark completed
                    </Button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </Card>
    </div>
  );
}

function Stat({
  label, value, tone
}: { label: string; value: string; tone?: "ok" }) {
  const c = tone === "ok" ? "#0F6E56" : "#6B5640";
  return (
    <div className="bg-white border border-cream-300 rounded-md p-3.5 shadow-card">
      <p className="text-[12px] text-ink-400">{label}</p>
      <p className="text-[24px] font-medium tracking-tighter2 mt-1" style={{ color: c }}>
        {value}
      </p>
    </div>
  );
}
