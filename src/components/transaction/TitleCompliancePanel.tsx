"use client";

import * as React from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Field, Select } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { Plus, ShieldCheck, AlertTriangle, X, CheckCircle2, Circle } from "lucide-react";
import {
  curativeFor, KIND_LABEL, STATUS_LABEL as CURATIVE_STATUS
} from "@/lib/data/curative";
import {
  complianceFor, STATUS_LABEL as COMPLIANCE_STATUS
} from "@/lib/data/compliance";
import { fmtMoney } from "@/lib/data/mock";
import {
  customCurativesFor,
  addCustomCurative,
  customStepsFor,
  addCustomComplianceStep,
  toggleCustomComplianceStep,
  type CustomCurative,
  type CustomComplianceStep,
  type CustomCurativeStatus
} from "@/lib/data/customItems";
import { logAudit } from "@/lib/data/audit";

const CURATIVE_STATUS_LABEL: Record<CustomCurativeStatus, { label: string; bg: string; fg: string }> = {
  open: { label: "Open", bg: "#FCEBEB", fg: "#A32D2D" },
  in_progress: { label: "In progress", bg: "#FFE8D6", fg: "#A8470F" },
  cleared: { label: "Cleared", bg: "#E1F5EE", fg: "#0F6E56" }
};

export function TitleCompliancePanel({ escrowId }: { escrowId: string }) {
  const toast = useToast();
  const curative = curativeFor(escrowId);
  const compliance = complianceFor(escrowId);

  const [customCuratives, setCustomCuratives] = React.useState<CustomCurative[]>([]);
  const [customSteps, setCustomSteps] = React.useState<CustomComplianceStep[]>([]);
  const [curativeModal, setCurativeModal] = React.useState(false);
  const [stepModal, setStepModal] = React.useState(false);

  React.useEffect(() => {
    setCustomCuratives(customCurativesFor(escrowId));
    setCustomSteps(customStepsFor(escrowId));
  }, [escrowId]);

  const openCurative =
    curative.filter((c) => c.status !== "cleared").length +
    customCuratives.filter((c) => c.status !== "cleared").length;
  const totalCurative = curative.length + customCuratives.length;

  const missingDocs = compliance.filter(
    (d) => d.status === "missing" || d.status === "ordered"
  ).length;

  function handleAddCurative(description: string, status: CustomCurativeStatus) {
    addCustomCurative(escrowId, description, status);
    setCustomCuratives(customCurativesFor(escrowId));
    setCurativeModal(false);
    logAudit({
      who: "Jin Yu",
      role: "Officer",
      action: "Curative item added",
      target: escrowId,
      detail: description + " (" + status + ")"
    });
    toast.push("Curative item added", "ok");
  }

  function handleAddStep(name: string, completed: boolean) {
    addCustomComplianceStep(escrowId, name, completed);
    setCustomSteps(customStepsFor(escrowId));
    setStepModal(false);
    logAudit({
      who: "Jin Yu",
      role: "Officer",
      action: "Compliance step added",
      target: escrowId,
      detail: name
    });
    toast.push("Compliance step added", "ok");
  }

  function handleToggleStep(id: string) {
    toggleCustomComplianceStep(escrowId, id);
    setCustomSteps(customStepsFor(escrowId));
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <Card className="p-3">
          <p className="text-[12px] text-ink-400">Title curative</p>
          <p className="text-[22px] font-medium tracking-tighter2 mt-0.5">
            {openCurative} <span className="text-[14px] text-ink-400">/ {totalCurative} open</span>
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
          <Button size="sm" variant="ghost" onClick={() => setCurativeModal(true)}>
            <Plus size={13} /> Add item
          </Button>
        </div>
        <p className="text-[12px] text-ink-400 mb-3">
          Every lien or judgment must be cleared (or paid through escrow) before recording.
        </p>
        {curative.length === 0 && customCuratives.length === 0 ? (
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
            {customCuratives.map((c) => {
              const s = CURATIVE_STATUS_LABEL[c.status];
              return (
                <li key={c.id} className="py-3 flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-[13px] font-medium">Custom curative</p>
                      <span
                        className="text-[10px] font-medium px-2 py-[2px] rounded-full"
                        style={{ background: s.bg, color: s.fg }}
                      >
                        {s.label}
                      </span>
                    </div>
                    <p className="text-[12px] text-ink-500 mt-0.5">{c.description}</p>
                    <p className="text-[11px] text-ink-400 mt-0.5">
                      Added {new Date(c.createdAt).toLocaleDateString("en-US")}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      <Card className="p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[14px] font-medium">California compliance documents</p>
          <Button size="sm" variant="ghost" onClick={() => setStepModal(true)}>
            <Plus size={13} /> Add step
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
          {customSteps.map((s) => (
            <li key={s.id} className="py-3 flex items-start gap-3">
              <button
                onClick={() => handleToggleStep(s.id)}
                className="mt-0.5 shrink-0"
                aria-label="Toggle"
              >
                {s.completed ? (
                  <CheckCircle2 size={15} className="text-emerald-600" />
                ) : (
                  <Circle size={15} className="text-ink-400" />
                )}
              </button>
              <div className="flex-1 min-w-0">
                <p className={"text-[13px] font-medium " + (s.completed ? "line-through text-ink-400" : "")}>
                  {s.name}
                </p>
                <p className="text-[11px] text-ink-400 mt-0.5">
                  Custom step · added {new Date(s.createdAt).toLocaleDateString("en-US")}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </Card>

      {curativeModal && (
        <AddCurativeModal
          onClose={() => setCurativeModal(false)}
          onSave={handleAddCurative}
        />
      )}
      {stepModal && (
        <AddStepModal
          onClose={() => setStepModal(false)}
          onSave={handleAddStep}
        />
      )}
    </div>
  );
}

function AddCurativeModal({
  onClose,
  onSave
}: {
  onClose: () => void;
  onSave: (description: string, status: CustomCurativeStatus) => void;
}) {
  const [description, setDescription] = React.useState("");
  const [status, setStatus] = React.useState<CustomCurativeStatus>("open");

  function submit() {
    if (!description.trim()) return;
    onSave(description.trim(), status);
  }

  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-ink-900/40">
      <div className="bg-white rounded-lg w-[460px] max-w-[92%] shadow-card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-cream-200">
          <p className="text-[14px] font-medium">Add curative item</p>
          <button onClick={onClose} aria-label="Close">
            <X size={16} className="text-ink-400 hover:text-ink-700" />
          </button>
        </div>
        <div className="p-5 flex flex-col gap-4">
          <Field label="Title issue description">
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Mechanic's lien from ABC Construction"
            />
          </Field>
          <Field label="Status">
            <Select value={status} onChange={(e) => setStatus(e.target.value as CustomCurativeStatus)}>
              <option value="open">Open</option>
              <option value="in_progress">In progress</option>
              <option value="cleared">Cleared</option>
            </Select>
          </Field>
          <div className="flex justify-end gap-2 pt-2 border-t border-cream-200">
            <Button variant="secondary" onClick={onClose}>Cancel</Button>
            <Button variant="primary" onClick={submit} disabled={!description.trim()}>Add item</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function AddStepModal({
  onClose,
  onSave
}: {
  onClose: () => void;
  onSave: (name: string, completed: boolean) => void;
}) {
  const [name, setName] = React.useState("");
  const [completed, setCompleted] = React.useState(false);

  function submit() {
    if (!name.trim()) return;
    onSave(name.trim(), completed);
  }

  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-ink-900/40">
      <div className="bg-white rounded-lg w-[460px] max-w-[92%] shadow-card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-cream-200">
          <p className="text-[14px] font-medium">Add compliance step</p>
          <button onClick={onClose} aria-label="Close">
            <X size={16} className="text-ink-400 hover:text-ink-700" />
          </button>
        </div>
        <div className="p-5 flex flex-col gap-4">
          <Field label="Step name">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Send 1099-S to seller"
            />
          </Field>
          <label className="flex items-center gap-2 text-[13px] text-ink-700">
            <input
              type="checkbox"
              checked={completed}
              onChange={(e) => setCompleted(e.target.checked)}
            />
            Mark as completed
          </label>
          <div className="flex justify-end gap-2 pt-2 border-t border-cream-200">
            <Button variant="secondary" onClick={onClose}>Cancel</Button>
            <Button variant="primary" onClick={submit} disabled={!name.trim()}>Add step</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
