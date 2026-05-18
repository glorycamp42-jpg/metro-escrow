"use client";

import * as React from "react";
import { FileDown, RefreshCw, X } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { fmtMoney, type Escrow } from "@/lib/data/mock";
import { readReceipts, writeReceipts, METHOD_LABEL, type Receipt, type ReceiptMethod } from "@/lib/data/receipts";
import { useToast } from "@/components/ui/Toast";
import { logAudit } from "@/lib/data/audit";

type Mode = "estimated" | "final";

type Row = { label: string; amount: number; note?: string };

function buildRows(e: Escrow, mode: Mode) {
  const price = e.settlement.salePrice;
  const loan = e.settlement.loanAmount;
  const emd = e.settlement.emd;

  // Commissions (5% buyer side + seller side total, can be tweaked)
  const buyerCommissionRate = 0.025;
  const sellerCommissionRate = 0.025;
  const buyerCommission = Math.round(price * buyerCommissionRate);
  const sellerCommission = Math.round(price * sellerCommissionRate);
  const totalCommission = buyerCommission + sellerCommission;

  // Prorations - assume 12 days into 6-month tax cycle for demo
  const annualTax = Math.round(price * 0.0125);
  const taxProrationSellerOwes = Math.round(annualTax * (15 / 365));
  const hoaProration = e.parties.some((p) => p.role === "buyer") ? 175 : 0;

  // Minor adjustment in final (3 cents off, repair credit applied)
  const finalAdjustment = mode === "final" ? -2500 : 0;

  // Buyer side
  const buyerSide: Row[] = [
    { label: "Sale price", amount: price },
    { label: "Loan amount", amount: -loan, note: "from lender at funding" },
    { label: "EMD on deposit", amount: -emd, note: "applied to cash to close" },
    { label: "Tax proration (seller credit)", amount: -taxProrationSellerOwes, note: "for unbilled period" },
    { label: "HOA dues proration", amount: hoaProration, note: "buyer owes for partial month" },
    { label: "Escrow fee (½ buyer)", amount: Math.round(price * 0.0015 + 250) / 2 },
    { label: "Title insurance — ALTA lender", amount: Math.round(price * 0.0008) },
    { label: "Recording fees", amount: 165 },
    { label: "Notary fees (½ buyer)", amount: 125 },
    { label: "Wire fees", amount: 35 },
    { label: "Loan origination fee", amount: Math.round(loan * 0.01) },
    { label: "Prepaid interest", amount: Math.round(loan * 0.004 / 365 * 15), note: "15 days at note rate" },
    { label: "Property tax impound (3 mo)", amount: Math.round(annualTax / 4) },
    { label: "Hazard insurance impound", amount: 280 }
  ];
  if (mode === "final") {
    buyerSide.push({ label: "Repair credit (final)", amount: finalAdjustment, note: "negotiated post-inspection" });
  }

  // Seller side
  const sellerSide: Row[] = [
    { label: "Sale price", amount: price },
    { label: "Existing mortgage payoff", amount: -Math.round(price * 0.55), note: "demand received" },
    { label: "Buyer agent commission", amount: -buyerCommission, note: (buyerCommissionRate * 100).toFixed(1) + "% (paid by seller)" },
    { label: "Seller agent commission", amount: -sellerCommission, note: (sellerCommissionRate * 100).toFixed(1) + "%" },
    { label: "Tax proration (seller credit to buyer)", amount: taxProrationSellerOwes, note: "seller owes for held period" },
    { label: "Escrow fee (½ seller)", amount: -Math.round((price * 0.0015 + 250) / 2) },
    { label: "Title insurance — CLTA owner", amount: -Math.round(price * 0.0035) },
    { label: "County transfer tax", amount: -Math.round(price * 0.0011) },
    { label: "Notary fees (½ seller)", amount: -125 },
    { label: "HOA transfer (if applicable)", amount: -450 },
    { label: "Termite report", amount: -650 },
    { label: "Home warranty (1 year)", amount: -650 }
  ];
  if (mode === "final") {
    sellerSide.push({ label: "Repair credit to buyer (final)", amount: finalAdjustment, note: "post-inspection adjustment" });
  }

  const buyerCash =
    buyerSide.reduce((s, r) => s + r.amount, 0);
  const sellerNet =
    price -
    Math.round(price * 0.55) -
    buyerCommission -
    sellerCommission +
    taxProrationSellerOwes -
    Math.round((price * 0.0015 + 250) / 2) -
    Math.round(price * 0.0035) -
    Math.round(price * 0.0011) -
    125 -
    450 -
    650 -
    650 +
    (mode === "final" ? finalAdjustment : 0);

  return {
    buyerSide,
    sellerSide,
    buyerCash: Math.round(buyerCash),
    sellerNet: Math.round(sellerNet),
    totalCommission
  };
}

export function SettlementPanel({ escrow: e }: { escrow: Escrow }) {
  const toast = useToast();
  const [mode, setMode] = React.useState<Mode>("estimated");
  const rows = React.useMemo(() => buildRows(e, mode), [e, mode]);
  const [receipts, setReceipts] = React.useState(() =>
    readReceipts().filter((r) => r.escrowId === e.id)
  );

  function recalc() {
    logAudit({ who: "Jin Yu", role: "Officer", action: "Settlement recalculated", target: e.id, detail: "Mode: " + mode });
    toast.push("Settlement recalculated against latest figures", "ok");
  }
  function exportPdf() {
    const lines: string[] = [];
    lines.push("Settlement Statement");
    lines.push("====================");
    lines.push("File: " + e.id);
    lines.push("Property: " + e.property.address + ", " + e.property.city + ", " + e.property.state + " " + e.property.zip);
    lines.push("Mode: " + (mode === "estimated" ? "Estimated (at file open)" : "Final (at closing)"));
    lines.push("Closing date: " + new Date(e.closingDate).toLocaleDateString("en-US"));
    lines.push("Sale price: " + fmtMoney(e.settlement.salePrice));
    lines.push("");
    lines.push("BUYER SIDE");
    lines.push("----------");
    for (const r of rows.buyerSide) {
      const sign = r.amount < 0 ? "-" : " ";
      lines.push(sign + fmtMoney(Math.abs(r.amount)).padEnd(14) + " " + r.label + (r.note ? "  (" + r.note + ")" : ""));
    }
    lines.push("");
    lines.push("Cash to close: " + fmtMoney(Math.abs(rows.buyerCash)));
    lines.push("");
    lines.push("SELLER SIDE");
    lines.push("-----------");
    for (const r of rows.sellerSide) {
      const sign = r.amount < 0 ? "-" : " ";
      lines.push(sign + fmtMoney(Math.abs(r.amount)).padEnd(14) + " " + r.label + (r.note ? "  (" + r.note + ")" : ""));
    }
    lines.push("");
    lines.push("Net to seller: " + fmtMoney(Math.abs(rows.sellerNet)));
    lines.push("");
    lines.push("Total commission: " + fmtMoney(rows.totalCommission));
    lines.push("");
    lines.push("Generated " + new Date().toLocaleString("en-US"));

    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "settlement-" + e.id + ".txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    logAudit({ who: "Jin Yu", role: "Officer", action: "Settlement exported", target: e.id, detail: "Mode: " + mode + " (text)" });
    toast.push("Settlement statement downloaded", "ok");
  }
  const [showReceiptModal, setShowReceiptModal] = React.useState(false);
  function logReceipt() {
    setShowReceiptModal(true);
  }
  function handleSaveReceipt(r: Omit<Receipt, "id" | "escrowId" | "receivedBy">) {
    const full: Receipt = {
      ...r,
      id: "rc-" + Date.now() + "-" + Math.floor(Math.random() * 1000),
      escrowId: e.id,
      receivedBy: "Jin Yu"
    };
    const all = readReceipts();
    writeReceipts([...all, full]);
    setReceipts(readReceipts().filter((x) => x.escrowId === e.id));
    setShowReceiptModal(false);
    logAudit({
      who: "Jin Yu",
      role: "Officer",
      action: "Receipt logged",
      target: e.id,
      detail: fmtMoney(full.amount) + " from " + full.from + " (" + METHOD_LABEL[full.method] + ")"
    });
    toast.push("Receipt of " + fmtMoney(full.amount) + " recorded", "ok");
  }
  const totalReceipts = receipts.reduce((s, r) => s + r.amount, 0);

  React.useEffect(() => {
    setReceipts(readReceipts().filter((r) => r.escrowId === e.id));
  }, [e.id]);

  return (
    <div className="flex flex-col gap-4">
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div>
            <p className="text-[14px] font-medium">Settlement statement</p>
            <p className="text-[12px] text-ink-400">
              CFPB Closing Disclosure preview · {mode === "estimated" ? "estimated at file open" : "final at closing"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="inline-flex rounded-md border border-cream-300 overflow-hidden">
              <button
                onClick={() => setMode("estimated")}
                className={
                  "px-3 h-8 text-[12px] " +
                  (mode === "estimated" ? "bg-hermes-500 text-cream-50" : "bg-white hover:bg-cream-50")
                }
              >
                Estimated
              </button>
              <button
                onClick={() => setMode("final")}
                className={
                  "px-3 h-8 text-[12px] border-l border-cream-300 " +
                  (mode === "final" ? "bg-hermes-500 text-cream-50" : "bg-white hover:bg-cream-50")
                }
              >
                Final
              </button>
            </div>
            <Button variant="secondary" size="sm" onClick={recalc}>
              <RefreshCw size={12} /> Recalculate
            </Button>
            <Button variant="secondary" size="sm" onClick={exportPdf}>
              <FileDown size={12} /> Export PDF
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SettlementSide title="Buyer side" rows={rows.buyerSide} total={["Cash to close", rows.buyerCash]} />
          <SettlementSide title="Seller side" rows={rows.sellerSide} total={["Net proceeds", rows.sellerNet]} negTotal />
        </div>

        <div className="mt-4 pt-4 border-t border-cream-200 grid grid-cols-3 gap-3 text-[13px]">
          <Stat label="Total commission" value={fmtMoney(rows.totalCommission)} tone="brand" />
          <Stat label="Closing date" value={new Date(e.closingDate).toLocaleDateString("en-US", { month: "long", day: "numeric" })} />
          <Stat label={mode === "estimated" ? "Status" : "Final approved by"} value={mode === "estimated" ? "Estimated" : "Pending sign-off"} />
        </div>
      </Card>

      <Card className="p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[14px] font-medium">Receipts on file</p>
          <Button size="sm" variant="ghost" onClick={logReceipt}>+ Log receipt</Button>
        </div>
        <p className="text-[12px] text-ink-400 mb-3">
          All deposits received into the trust account for this file. Required for 3-way reconciliation.
        </p>
        {receipts.length === 0 ? (
          <p className="text-[13px] text-ink-400 italic">No receipts yet.</p>
        ) : (
          <>
            <table className="w-full text-[13px]">
              <thead>
                <tr className="text-left text-[11px] font-medium text-ink-400 uppercase tracking-tightish border-b border-cream-200">
                  <th className="pb-2">Date</th>
                  <th className="pb-2">From</th>
                  <th className="pb-2">Method</th>
                  <th className="pb-2">Reference</th>
                  <th className="pb-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {receipts.map((r) => (
                  <tr key={r.id} className="border-b border-cream-100 last:border-0">
                    <td className="py-2.5">
                      {new Date(r.receivedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </td>
                    <td className="py-2.5">{r.from}</td>
                    <td className="py-2.5 text-ink-500">{METHOD_LABEL[r.method]}</td>
                    <td className="py-2.5 text-ink-500 font-mono text-[12px]">{r.reference}</td>
                    <td className="py-2.5 text-right tabular-nums font-medium">{fmtMoney(r.amount)}</td>
                  </tr>
                ))}
                <tr>
                  <td colSpan={4} className="pt-3 text-[12px] text-ink-500 text-right">Total received</td>
                  <td className="pt-3 text-right tabular-nums font-medium text-[14px]" style={{ color: "var(--hermes)" }}>
                    {fmtMoney(totalReceipts)}
                  </td>
                </tr>
              </tbody>
            </table>
          </>
        )}
      </Card>

      {showReceiptModal && (
        <ReceiptModal onClose={() => setShowReceiptModal(false)} onSave={handleSaveReceipt} />
      )}
    </div>
  );
}

function ReceiptModal({
  onClose,
  onSave
}: {
  onClose: () => void;
  onSave: (r: Omit<Receipt, "id" | "escrowId" | "receivedBy">) => void;
}) {
  const today = new Date().toISOString().slice(0, 10);
  const [amount, setAmount] = React.useState("");
  const [from, setFrom] = React.useState("");
  const [method, setMethod] = React.useState<ReceiptMethod>("wire");
  const [reference, setReference] = React.useState("");
  const [date, setDate] = React.useState(today);
  const [notes, setNotes] = React.useState("");

  function submit() {
    const amt = parseFloat(amount.replace(/[$,]/g, ""));
    if (!amt || amt <= 0 || !from.trim() || !reference.trim()) return;
    onSave({
      amount: Math.round(amt),
      from: from.trim(),
      method,
      reference: reference.trim(),
      receivedAt: new Date(date + "T00:00:00").toISOString(),
      notes: notes.trim() || undefined
    });
  }

  const valid =
    !!from.trim() &&
    !!reference.trim() &&
    parseFloat(amount.replace(/[$,]/g, "")) > 0;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-ink-800/40 p-4">
      <div className="w-full max-w-md rounded-lg bg-cream-50 p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[16px] font-medium">Log a receipt</h2>
          <button onClick={onClose} className="text-ink-400 hover:text-ink-800" aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <div className="flex flex-col gap-3 text-[13px]">
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1">
              <span className="text-ink-500">Amount</span>
              <input
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="25,000"
                inputMode="decimal"
                className="h-9 px-2 rounded-md border border-cream-300 bg-white"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-ink-500">Date received</span>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="h-9 px-2 rounded-md border border-cream-300 bg-white"
              />
            </label>
          </div>
          <label className="flex flex-col gap-1">
            <span className="text-ink-500">From (payer name)</span>
            <input
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              placeholder="e.g. John Buyer"
              className="h-9 px-2 rounded-md border border-cream-300 bg-white"
            />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1">
              <span className="text-ink-500">Method</span>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value as ReceiptMethod)}
                className="h-9 px-2 rounded-md border border-cream-300 bg-white"
              >
                <option value="wire">Wire</option>
                <option value="check">Check</option>
                <option value="cashier_check">Cashier&apos;s check</option>
                <option value="ach">ACH</option>
              </select>
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-ink-500">Reference #</span>
              <input
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="FED-XXXX or CHK-####"
                className="h-9 px-2 rounded-md border border-cream-300 bg-white"
              />
            </label>
          </div>
          <label className="flex flex-col gap-1">
            <span className="text-ink-500">Notes (optional)</span>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="e.g. Initial EMD"
              className="w-full text-[13px] rounded-md border border-cream-300 p-2 resize-none bg-white"
            />
          </label>
        </div>
        <div className="mt-5 flex items-center justify-end gap-2">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={submit} disabled={!valid}>
            Save receipt
          </Button>
        </div>
      </div>
    </div>
  );
}

function SettlementSide({
  title,
  rows,
  total,
  negTotal
}: {
  title: string;
  rows: Row[];
  total: [string, number];
  negTotal?: boolean;
}) {
  return (
    <div className="border border-cream-200 rounded-lg overflow-hidden">
      <p className="px-4 py-2.5 text-[12px] font-medium text-ink-600 bg-cream-50 border-b border-cream-200">
        {title}
      </p>
      <table className="w-full text-[13px]">
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-b border-cream-100 last:border-0">
              <td className="px-4 py-2 text-ink-700 align-top">
                {r.label}
                {r.note && <p className="text-[11px] text-ink-400 mt-0.5 italic">{r.note}</p>}
              </td>
              <td className="px-4 py-2 text-right tabular-nums whitespace-nowrap align-top">
                {r.amount < 0 ? "−" : ""}{fmtMoney(Math.abs(r.amount))}
              </td>
            </tr>
          ))}
          <tr className="bg-hermes-50 font-medium">
            <td className="px-4 py-2.5 text-ink-800">{total[0]}</td>
            <td className="px-4 py-2.5 text-right tabular-nums" style={{ color: "var(--hermes)" }}>
              {fmtMoney(Math.abs(total[1]))}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: "brand" }) {
  return (
    <div className="bg-cream-50 rounded-md p-3 border border-cream-200">
      <p className="text-[11px] text-ink-400">{label}</p>
      <p
        className="text-[16px] font-medium tracking-tighter2 mt-0.5"
        style={{ color: tone === "brand" ? "var(--hermes)" : undefined }}
      >
        {value}
      </p>
    </div>
  );
}
