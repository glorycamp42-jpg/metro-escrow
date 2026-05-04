"use client";

import * as React from "react";
import { ShieldCheck, X, Phone, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Field } from "@/components/ui/Input";
import { logAudit } from "@/lib/data/audit";
import { useRole } from "@/components/role/RoleProvider";
import { ROLES } from "@/lib/roles";

export function WireCallbackModal({
  escrowId,
  bank,
  accountLast4,
  onClose,
  onVerified
}: {
  escrowId: string;
  bank: string;
  accountLast4: string;
  onClose: () => void;
  onVerified: () => void;
}) {
  const { role } = useRole();
  const [callbackNumber, setCallbackNumber] = React.useState("");
  const [contact, setContact] = React.useState("");
  const [outcome, setOutcome] = React.useState<"match" | "mismatch" | "">("");
  const [notes, setNotes] = React.useState("");
  const [step, setStep] = React.useState<"form" | "done">("form");

  function submit() {
    if (!callbackNumber || !contact || !outcome) return;
    logAudit({
      who: "Jin Yu",
      role: ROLES[role].short,
      action:
        outcome === "match"
          ? "Wire callback verified"
          : "Wire mismatch detected",
      target: escrowId,
      detail:
        "Callback to " +
        callbackNumber +
        " (" +
        contact +
        "). Bank " +
        bank +
        ", account ..." +
        accountLast4 +
        ". " +
        (notes || "no notes")
    });
    if (outcome === "match") onVerified();
    setStep("done");
  }

  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-ink-900/40">
      <div className="bg-white rounded-lg w-[520px] max-w-[92%] shadow-card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-cream-200">
          <p className="text-[14px] font-medium flex items-center gap-2">
            <ShieldCheck size={15} className="text-hermes-500" />
            Verify wire by callback
          </p>
          <button onClick={onClose} aria-label="Close">
            <X size={16} className="text-ink-400 hover:text-ink-700" />
          </button>
        </div>

        {step === "form" && (
          <div className="p-5 flex flex-col gap-4">
            <div className="rounded-md bg-amber-50 border border-amber-200 p-3 text-[12px] text-amber-800 flex gap-2">
              <AlertTriangle size={14} className="mt-0.5 shrink-0" />
              <span>
                Use a phone number from your records or the lender's website. Never call back the number on the wire instructions email.
              </span>
            </div>

            <div className="text-[13px] grid grid-cols-2 gap-2 bg-cream-50 rounded-md p-3 border border-cream-200">
              <div>
                <p className="text-ink-400">Beneficiary bank</p>
                <p className="font-medium">{bank}</p>
              </div>
              <div>
                <p className="text-ink-400">Account on file</p>
                <p className="font-medium">{"...." + accountLast4}</p>
              </div>
            </div>

            <Field label="Callback number used">
              <Input
                value={callbackNumber}
                onChange={(e) => setCallbackNumber(e.target.value)}
                placeholder="(213) 555-0190"
              />
            </Field>
            <Field label="Spoke with">
              <Input
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="Maria Lopez, Wells Fargo wire desk"
              />
            </Field>
            <div>
              <p className="text-[12px] font-medium text-ink-600 mb-1.5">Outcome</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setOutcome("match")}
                  className={
                    "flex-1 h-10 rounded-md border text-[13px] font-medium " +
                    (outcome === "match"
                      ? "border-emerald-500 bg-emerald-50 text-emerald-800"
                      : "border-cream-300 bg-white hover:bg-cream-50")
                  }
                >
                  Match - safe to fund
                </button>
                <button
                  onClick={() => setOutcome("mismatch")}
                  className={
                    "flex-1 h-10 rounded-md border text-[13px] font-medium " +
                    (outcome === "mismatch"
                      ? "border-red-500 bg-red-50 text-red-800"
                      : "border-cream-300 bg-white hover:bg-cream-50")
                  }
                >
                  Mismatch - escalate
                </button>
              </div>
            </div>
            <Field label="Notes (optional)">
              <Input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any details to put on the file"
              />
            </Field>

            <div className="flex justify-end gap-2 pt-2 border-t border-cream-200">
              <Button variant="secondary" onClick={onClose}>
                Cancel
              </Button>
              <Button
                variant="primary"
                disabled={!callbackNumber || !contact || !outcome}
                onClick={submit}
              >
                <Phone size={13} /> Log callback
              </Button>
            </div>
          </div>
        )}

        {step === "done" && (
          <div className="p-8 text-center">
            <div className="grid place-items-center w-12 h-12 rounded-full mx-auto mb-3" style={{ background: outcome === "match" ? "#E1F5EE" : "#FCEBEB" }}>
              {outcome === "match" ? (
                <ShieldCheck size={22} className="text-emerald-700" />
              ) : (
                <AlertTriangle size={22} className="text-red-700" />
              )}
            </div>
            <p className="text-[15px] font-medium">
              {outcome === "match"
                ? "Wire verified and audit logged"
                : "Mismatch logged - escalation required"}
            </p>
            <p className="text-[12px] text-ink-400 mt-1">
              {outcome === "match"
                ? "You may proceed with funding."
                : "Notify the senior officer before any movement of funds."}
            </p>
            <div className="mt-5">
              <Button variant="primary" onClick={onClose}>
                Close
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
