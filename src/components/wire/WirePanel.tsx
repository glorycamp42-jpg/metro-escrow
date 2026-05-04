"use client";

import * as React from "react";
import { ShieldAlert, ShieldCheck, Phone } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { WireCallbackModal } from "./WireCallbackModal";
import type { WireInstructions } from "@/lib/data/mock";

export function WirePanel({
  escrowId,
  initial
}: {
  escrowId: string;
  initial: WireInstructions;
}) {
  const [wire, setWire] = React.useState(initial);
  const [open, setOpen] = React.useState(false);
  const verified = wire.callbackVerified;

  return (
    <div className="flex flex-col gap-4">
      <div
        className={
          "rounded-lg p-5 border " +
          (verified
            ? "bg-emerald-50 border-emerald-200"
            : "bg-red-50 border-red-200")
        }
      >
        <div className="flex items-start gap-3">
          {verified ? (
            <ShieldCheck className="text-emerald-700 mt-0.5" size={22} />
          ) : (
            <ShieldAlert className="text-red-700 mt-0.5" size={22} />
          )}
          <div className="flex-1">
            <p
              className={
                "text-[15px] font-medium " +
                (verified ? "text-emerald-800" : "text-red-800")
              }
            >
              {verified
                ? "Wire instructions verified by callback"
                : "WIRE INSTRUCTIONS NOT VERIFIED - DO NOT FUND"}
            </p>
            <p
              className={
                "text-[12px] mt-1 " +
                (verified ? "text-emerald-700" : "text-red-700")
              }
            >
              {verified
                ? "Verified by " +
                  (wire.verifiedBy ?? "officer") +
                  " on " +
                  (wire.verifiedAt
                    ? new Date(wire.verifiedAt).toLocaleString("en-US")
                    : "-") +
                  ". Risk score " +
                  wire.riskScore +
                  "/100."
                : "Risk score " +
                  wire.riskScore +
                  "/100. Call the lender directly using a number from your records - never the one on the email."}
            </p>
          </div>
          {!verified && (
            <Button variant="primary" size="sm" onClick={() => setOpen(true)}>
              <Phone size={13} /> Verify by callback
            </Button>
          )}
          {verified && (
            <Button variant="secondary" size="sm" onClick={() => setOpen(true)}>
              Re-verify
            </Button>
          )}
        </div>
      </div>

      <Card className="p-5">
        <p className="text-[14px] font-medium mb-3">Beneficiary bank</p>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-[14px]">
          <Info label="Bank" value={wire.bank} />
          <Info label="Beneficiary" value={wire.beneficiary} />
          <Info label="Routing (ABA)" value={wire.routing} />
          <Info label="Account" value={"...." + wire.accountLast4} />
        </dl>
      </Card>

      <Card className="p-4">
        <p className="text-[12px] font-medium text-ink-500 mb-1">
          Anti-fraud reminders
        </p>
        <ul className="text-[13px] text-ink-700 list-disc pl-5 space-y-1">
          <li>Always verify by callback to a known number - never trust an inbound email or fax.</li>
          <li>Never accept last-minute changes to wire instructions without re-verifying.</li>
          <li>Send wire-fraud warnings to all parties at file open.</li>
          <li>Use Plaid or bank-to-bank verification when available.</li>
        </ul>
      </Card>

      {open && (
        <WireCallbackModal
          escrowId={escrowId}
          bank={wire.bank}
          accountLast4={wire.accountLast4}
          onClose={() => setOpen(false)}
          onVerified={() =>
            setWire((w) => ({
              ...w,
              callbackVerified: true,
              verifiedBy: "Jin Yu",
              verifiedAt: new Date().toISOString(),
              riskScore: Math.min(w.riskScore, 8)
            }))
          }
        />
      )}
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <>
      <dt className="text-[12px] text-ink-400">{label}</dt>
      <dd className="text-[14px] font-medium">{value}</dd>
    </>
  );
}
