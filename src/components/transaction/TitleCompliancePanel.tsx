"use client";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { Plus, ShieldCheck, AlertTriangle } from "lucide-react";
import {
  curativeFor, KIND_LABEL, STATUS_LABEL as CURATIVE_STATUS
} from "@/lib/data/curative";
import {
  complianceFor, STATUS_LABEL as COMPLIANCE_STATUS
} from "@/lib/data/compliance";
import { fmtMoney } from "@/lib/data/mock";

export function TitleCompliancePanel({ escrowId }: { escrowId: string }) {
  const toast = useToast();
  const curative = curativeFor(escrowId);
  const compliance = complianceFor(escrowId);
  const openCurative = curative.filter((c) => c.status !== "cleared").length;
  const missingDocs = compliance.filter(
    (d) => d.status === "missing" || d.status === "ordered"
  ).length;

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <Card className="p-3">
          <p className="text-[12px] text-ink-400">Title curative</p>
          <p className="text-[22px] font-medium tracking-tighter2 mt-0.5">
            {openCurative} <span className="text-[14px] text-ink-400">/ {curative.length} open</span>
          </p>
          <p className="text-[11px] mt-1" style={{ color: openCurative === 0 ? "#0F6E56" : "#A8470F" }}>
            {openCurative === 0 ? "All clear" : "Action required"}
          </p>
        </Card>
        <Card className="p-3">
          <p className="text-[12px] text-ink-400">CA compliance docs</p>
          <p className="text-[22px] font-medium tracking-tighter2 mt-0.5">
            {compliance.length - missingDocs} <span className="text-[14px] text-ink-400">/ {compliance.length} delivered</span>
          </p>
          <p className="text-[11px] mt-1" style={{ color: missingDocs === 0 ? "#0F6E56" : "#A32D2D" }}>
            {missingDocs === 0 ? "Compliant" : missingDocs + " still pending"}
          </p>
        </Card>
      </div>

      <Card className="p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[14px] font-medium">Title curative items</p>
          <Button size="sm" variant="ghost" onClick={() => toast.push("New curative item form opened", "info")}>
            <Plus size={13} /> Add item
          </Button>
        </div>
        <p className="text-[12px] text-ink-400 mb-3">
          Every lien or judgment must be cleared (or paid through escrow) before recording.
        </p>
        {curative.length === 0 ? (
          <p className="text-[13px] text-ink-400 italic py-4">
            No curative items on this file. Title comes back clean.
          </p>
        ) : (
          <ul className="divide-y divide-cream-200">
            {curative.map((c) => {
              const s = CURATIVE_STATUS[c.status];
              return (
                <li key={c.id} className="py-3 flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-[13px] font-medium">{KIND_LABEL[c.kind]}</p>
                      <span
                        className="text-[10px] font-medium px-2 py-[2px] rounded-full"
                        style={{ background: s.bg, color: s.fg }}
                      >
                        {s.label}
                      </span>
                    </div>
                    <p className="text-[12px] text-ink-500 mt-0.5">{c.description}</p>
                    <p className="text-[11px] text-ink-400 mt-0.5">
                      Owner: {c.ownedBy}
                      {c.dueBy && (
                        <> · due {new Date(c.dueBy).toLocaleDateString("en-US")}</>
                      )}
                    </p>
                  </div>
                  {c.amount && (
                    <p className="text-[13px] font-medium tabular-nums">
                      {fmtMoney(c.amount)}
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      <Card className="p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[14px] font-medium">California compliance documents</p>
          <Button size="sm" variant="ghost" onClick={() => toast.push("New compliance doc form opened", "info")}>
            <Plus size={13} /> Add doc
          </Button>
        </div>
        <p className="text-[12px] text-ink-400 mb-3">
          NHD, HOA Docs (7-day rule), Insurance binder, CPL — required for CA closings.
        </p>
        <ul className="divide-y divide-cream-200">
          {compliance.map((d) => {
            const s = COMPLIANCE_STATUS[d.status];
            const overdue =
              d.dueBy &&
              new Date(d.dueBy).getTime() < Date.now() &&
              d.status !== "delivered" && d.status !== "received";
            return (
              <li key={d.id} className="py-3 flex items-start gap-3">
                {d.status === "delivered" || d.status === "received" ? (
                  <ShieldCheck size={15} className="text-emerald-600 mt-0.5 shrink-0" />
                ) : (
                  <AlertTriangle
                    size={15}
                    className={(overdue ? "text-red-600" : "text-amber-600") + " mt-0.5 shrink-0"}
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-[13px] font-medium">{d.label}</p>
                    <span
                      className="text-[10px] font-medium px-2 py-[2px] rounded-full"
                      style={{ background: s.bg, color: s.fg }}
                    >
                      {s.label}
                    </span>
                    {overdue && (
                      <span className="text-[10px] font-medium px-2 py-[2px] rounded-full bg-red-50 text-red-700">
                        OVERDUE
                      </span>
                    )}
                  </div>
                  {d.vendor && (
                    <p className="text-[11px] text-ink-400 mt-0.5">Vendor: {d.vendor}</p>
                  )}
                  {d.dueBy && (
                    <p className="text-[11px] text-ink-400 mt-0.5">
                      Due {new Date(d.dueBy).toLocaleDateString("en-US")}
                    </p>
                  )}
                  {d.notes && (
                    <p className="text-[12px] text-ink-600 mt-1 italic">{d.notes}</p>
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
