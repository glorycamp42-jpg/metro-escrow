"use client";

import * as React from "react";
import { X, AlertTriangle, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { patchEscrow, type EscrowPatch } from "@/lib/data/userEscrows";
import type { Escrow, Party, CriticalDates } from "@/lib/data/mock";

type Mapping = {
  key: string;
  group: "Property" | "Transaction" | "Parties" | "Critical dates" | "Settlement";
  label: string;
  currentValue: string;
  newValue: string;
  apply: (patch: EscrowPatch, partiesAcc: Party[]) => void;
};

export function ApplyExtractedModal({
  escrow,
  extracted,
  docCategory,
  onClose,
  onApplied
}: {
  escrow: Escrow;
  extracted: Record<string, unknown>;
  docCategory?: string;
  onClose: () => void;
  onApplied: () => void;
}) {
  const mappings = React.useMemo(
    () => buildMappings(extracted, escrow),
    [extracted, escrow]
  );

  // selected by default
  const [selected, setSelected] = React.useState<Record<string, boolean>>(() =>
    Object.fromEntries(mappings.map((m) => [m.key, true]))
  );

  const mismatchAddress = detectAddressMismatch(extracted, escrow);

  function toggle(key: string) {
    setSelected((s) => ({ ...s, [key]: !s[key] }));
  }

  function applySelected() {
    const patch: EscrowPatch = {};
    const newParties: Party[] = [];
    for (const m of mappings) {
      if (!selected[m.key]) continue;
      m.apply(patch, newParties);
    }
    if (newParties.length > 0) {
      patch.parties = [...escrow.parties, ...newParties];
    }
    patchEscrow(escrow.id, patch);
    onApplied();
  }

  const selectedCount = mappings.filter((m) => selected[m.key]).length;
  const grouped = groupBy(mappings, (m) => m.group);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-800/50 p-4">
      <div className="w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-lg bg-cream-50 shadow-2xl">
        <div className="sticky top-0 bg-cream-50 border-b border-cream-300 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-[16px] font-medium">
              Apply extracted data to {escrow.id}
            </h2>
            <p className="text-[12px] text-ink-500 mt-0.5">
              {escrow.property.address}, {escrow.property.city}
              {docCategory && (
                <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded-full bg-hermes-soft text-hermes-500 font-medium">
                  {docCategory}
                </span>
              )}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-ink-400 hover:text-ink-800"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6">
          {mismatchAddress && (
            <div className="mb-4 rounded-md border border-amber-300 bg-amber-50 p-3">
              <p className="text-[13px] font-medium text-amber-900 flex items-center gap-1.5">
                <AlertTriangle size={14} /> Address mismatch
              </p>
              <p className="text-[12px] text-amber-800 mt-1">
                This document is for{" "}
                <span className="font-medium">{mismatchAddress.docAddress}</span>{" "}
                but you&apos;re attaching it to{" "}
                <span className="font-medium">{mismatchAddress.escrowAddress}</span>.
                Double-check you picked the right escrow before applying.
              </p>
            </div>
          )}

          {mappings.length === 0 ? (
            <p className="text-[13px] text-ink-500">
              No structured fields found in this document. Saved as an attachment.
            </p>
          ) : (
            <>
              <p className="text-[12px] text-ink-500 mb-3">
                Check the fields you want to apply. The document file is already
                saved — this just fills in escrow data.
              </p>

              {(["Property", "Transaction", "Parties", "Critical dates", "Settlement"] as const).map((group) => {
                const rows = grouped[group];
                if (!rows || rows.length === 0) return null;
                return (
                  <div key={group} className="mb-4">
                    <p className="text-[11px] uppercase tracking-tightish text-ink-400 font-medium mb-2">
                      {group}
                    </p>
                    <ul className="border border-cream-300 rounded-md divide-y divide-cream-200 overflow-hidden">
                      {rows.map((m) => (
                        <li
                          key={m.key}
                          className={
                            "flex items-start gap-3 px-3 py-2.5 cursor-pointer hover:bg-cream-100 " +
                            (selected[m.key] ? "bg-hermes-soft/40" : "bg-white")
                          }
                          onClick={() => toggle(m.key)}
                        >
                          <input
                            type="checkbox"
                            checked={!!selected[m.key]}
                            onChange={() => toggle(m.key)}
                            onClick={(ev) => ev.stopPropagation()}
                            className="mt-0.5 accent-hermes-500"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-medium text-ink-800">
                              {m.label}
                            </p>
                            <p className="text-[12px] text-ink-500 flex items-center gap-1.5 mt-0.5 flex-wrap">
                              <span className="line-through text-ink-400">
                                {m.currentValue || "(empty)"}
                              </span>
                              <ArrowRight size={11} className="text-ink-400" />
                              <span className="font-medium text-ink-800">
                                {m.newValue}
                              </span>
                            </p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </>
          )}
        </div>

        <div className="sticky bottom-0 bg-cream-50 border-t border-cream-300 px-6 py-4 flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={applySelected}
            disabled={selectedCount === 0}
          >
            <CheckCircle2 size={14} /> Apply {selectedCount} field{selectedCount === 1 ? "" : "s"}
          </Button>
        </div>
      </div>
    </div>
  );
}

/* -------- Mapping builder -------- */

function buildMappings(
  extracted: Record<string, unknown>,
  escrow: Escrow
): Mapping[] {
  const out: Mapping[] = [];

  // -------- Property --------
  const addr = pickAddress(extracted);
  if (addr && addr !== escrow.property.address) {
    out.push({
      key: "addr",
      group: "Property",
      label: "Street address",
      currentValue: escrow.property.address,
      newValue: addr,
      apply: (p) => {
        p.property = { ...p.property, address: addr };
      }
    });
  }
  const city = str(extracted.city) ?? parseCityFromPropAddress(extracted);
  if (city && city !== escrow.property.city) {
    out.push({
      key: "city",
      group: "Property",
      label: "City",
      currentValue: escrow.property.city,
      newValue: city,
      apply: (p) => {
        p.property = { ...p.property, city };
      }
    });
  }
  const state = str(extracted.state) ?? parseStateFromPropAddress(extracted);
  if (state && state !== escrow.property.state) {
    out.push({
      key: "state",
      group: "Property",
      label: "State",
      currentValue: escrow.property.state,
      newValue: state,
      apply: (p) => {
        p.property = { ...p.property, state };
      }
    });
  }
  const zip = str(extracted.zip) ?? parseZipFromPropAddress(extracted);
  if (zip && zip !== escrow.property.zip) {
    out.push({
      key: "zip",
      group: "Property",
      label: "ZIP",
      currentValue: escrow.property.zip,
      newValue: zip,
      apply: (p) => {
        p.property = { ...p.property, zip };
      }
    });
  }
  const apn = str(extracted.apn);
  if (apn && apn !== (escrow.property.apn ?? "")) {
    out.push({
      key: "apn",
      group: "Property",
      label: "APN",
      currentValue: escrow.property.apn ?? "",
      newValue: apn,
      apply: (p) => {
        p.property = { ...p.property, apn };
      }
    });
  }

  // -------- Transaction --------
  const txType = str(extracted.type);
  const validTypes: Escrow["type"][] = [
    "Residential Resale",
    "Commercial",
    "1031 Exchange",
    "Investment Property",
    "REO",
    "Refinance"
  ];
  if (txType && validTypes.includes(txType as Escrow["type"]) && txType !== escrow.type) {
    out.push({
      key: "txType",
      group: "Transaction",
      label: "Transaction type",
      currentValue: escrow.type,
      newValue: txType,
      apply: (p) => {
        p.type = txType as Escrow["type"];
      }
    });
  }
  const price = num(extracted.price);
  if (price !== null && price !== escrow.price) {
    out.push({
      key: "price",
      group: "Transaction",
      label: "Sale price",
      currentValue: "$" + escrow.price.toLocaleString(),
      newValue: "$" + price.toLocaleString(),
      apply: (p) => {
        p.price = price;
        p.settlement = { ...p.settlement, salePrice: price };
      }
    });
  }
  const closing = str(extracted.closingDate);
  if (closing && closing !== escrow.closingDate) {
    out.push({
      key: "closing",
      group: "Transaction",
      label: "Closing date",
      currentValue: escrow.closingDate,
      newValue: closing,
      apply: (p) => {
        p.closingDate = closing;
        p.critical = { ...p.critical, closing };
      }
    });
  }

  // -------- Parties --------
  const buyer = str(extracted.buyer);
  const buyerEmail = str(extracted.buyerEmail);
  if (buyer && !escrow.parties.some((p) => p.role === "buyer" && p.name === buyer)) {
    out.push({
      key: "buyer",
      group: "Parties",
      label: "Add buyer",
      currentValue: "",
      newValue: buyer + (buyerEmail ? " · " + buyerEmail : ""),
      apply: (_p, partiesAcc) => {
        partiesAcc.push({
          id: "p-buyer-" + Date.now(),
          name: buyer,
          role: "buyer",
          email: buyerEmail ?? "buyer@example.com"
        });
      }
    });
  }
  const seller = str(extracted.seller);
  if (seller && !escrow.parties.some((p) => p.role === "seller" && p.name === seller)) {
    out.push({
      key: "seller",
      group: "Parties",
      label: "Add seller",
      currentValue: "",
      newValue: seller,
      apply: (_p, partiesAcc) => {
        partiesAcc.push({
          id: "p-seller-" + (Date.now() + 1),
          name: seller,
          role: "seller",
          email: "seller@example.com"
        });
      }
    });
  }
  const borrower = str(extracted.borrower);
  if (borrower && !escrow.parties.some((p) => p.role === "buyer" && p.name === borrower)) {
    out.push({
      key: "borrower",
      group: "Parties",
      label: "Add borrower (as buyer)",
      currentValue: "",
      newValue: borrower,
      apply: (_p, partiesAcc) => {
        partiesAcc.push({
          id: "p-borrower-" + Date.now(),
          name: borrower,
          role: "buyer",
          email: "borrower@example.com"
        });
      }
    });
  }
  const lender = str(extracted.lender);
  if (lender && !escrow.parties.some((p) => p.role === "lender" && p.name === lender)) {
    out.push({
      key: "lender",
      group: "Parties",
      label: "Add lender",
      currentValue: "",
      newValue: lender,
      apply: (_p, partiesAcc) => {
        partiesAcc.push({
          id: "p-lender-" + Date.now(),
          name: lender,
          role: "lender",
          email: "lender@example.com",
          company: lender
        });
      }
    });
  }
  const titleCompany = str(extracted.titleCompany);
  if (titleCompany && !escrow.parties.some((p) => p.role === "title" && p.name === titleCompany)) {
    out.push({
      key: "title",
      group: "Parties",
      label: "Add title company",
      currentValue: "",
      newValue: titleCompany,
      apply: (_p, partiesAcc) => {
        partiesAcc.push({
          id: "p-title-" + Date.now(),
          name: titleCompany,
          role: "title",
          email: "title@example.com",
          company: titleCompany
        });
      }
    });
  }

  // Auto-detect keyParties array
  if (Array.isArray(extracted.keyParties)) {
    for (const kp of extracted.keyParties as Array<{ role?: string; name?: string }>) {
      if (!kp || !kp.name || !kp.role) continue;
      const role = mapRole(kp.role);
      if (escrow.parties.some((p) => p.role === role && p.name === kp.name)) continue;
      const k = "kp-" + role + "-" + kp.name.slice(0, 8);
      const captured = { name: kp.name, role };
      out.push({
        key: k,
        group: "Parties",
        label: "Add " + role.replace("_", " "),
        currentValue: "",
        newValue: kp.name,
        apply: (_p, partiesAcc) => {
          partiesAcc.push({
            id: "p-" + k + "-" + Date.now(),
            name: captured.name,
            role: captured.role,
            email: "party@example.com"
          });
        }
      });
    }
  }

  // -------- Critical dates --------
  type DateKey = keyof CriticalDates;
  const dateMappings: { extractedKey: string; criticalKey: DateKey; label: string }[] = [
    { extractedKey: "contractAccepted", criticalKey: "contractAccepted", label: "Contract accepted" },
    { extractedKey: "inspectionDate", criticalKey: "inspectionContingency", label: "Inspection date" },
    { extractedKey: "reportDate", criticalKey: "contractAccepted", label: "Report date" },
    { extractedKey: "rateLockExpires", criticalKey: "funding", label: "Rate lock expires" }
  ];
  for (const dm of dateMappings) {
    const v = str(extracted[dm.extractedKey]);
    if (!v) continue;
    const current = escrow.critical[dm.criticalKey];
    if (current === v) continue;
    out.push({
      key: "date-" + dm.criticalKey,
      group: "Critical dates",
      label: dm.label,
      currentValue: current ?? "",
      newValue: v,
      apply: (p) => {
        p.critical = { ...p.critical, [dm.criticalKey]: v };
      }
    });
  }
  // keyDates from auto
  if (Array.isArray(extracted.keyDates)) {
    for (const kd of extracted.keyDates as Array<{ label?: string; date?: string }>) {
      if (!kd || !kd.label || !kd.date) continue;
      const k = mapDateLabel(kd.label);
      if (!k) continue;
      const current = escrow.critical[k];
      if (current === kd.date) continue;
      const captured = { k, date: kd.date };
      out.push({
        key: "kd-" + k,
        group: "Critical dates",
        label: kd.label,
        currentValue: current ?? "",
        newValue: kd.date,
        apply: (p) => {
          p.critical = { ...p.critical, [captured.k]: captured.date };
        }
      });
    }
  }

  // -------- Settlement --------
  const emd = num(extracted.emd);
  if (emd !== null && emd !== escrow.settlement.emd) {
    out.push({
      key: "emd",
      group: "Settlement",
      label: "Earnest money deposit",
      currentValue: "$" + escrow.settlement.emd.toLocaleString(),
      newValue: "$" + emd.toLocaleString(),
      apply: (p) => {
        p.settlement = { ...p.settlement, emd };
      }
    });
  }
  const loanAmount = num(extracted.loanAmount);
  if (loanAmount !== null && loanAmount !== escrow.settlement.loanAmount) {
    out.push({
      key: "loan",
      group: "Settlement",
      label: "Loan amount",
      currentValue: "$" + escrow.settlement.loanAmount.toLocaleString(),
      newValue: "$" + loanAmount.toLocaleString(),
      apply: (p) => {
        p.settlement = { ...p.settlement, loanAmount };
      }
    });
  }

  return out;
}

/* -------- Helpers -------- */

function str(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const trimmed = v.trim();
  if (!trimmed || trimmed.toLowerCase() === "null" || trimmed === "—") return null;
  return trimmed;
}

function num(v: unknown): number | null {
  const s = typeof v === "number" ? String(v) : str(v);
  if (!s) return null;
  const n = Number(String(s).replace(/[$,\s]/g, ""));
  return Number.isFinite(n) ? n : null;
}

function pickAddress(extracted: Record<string, unknown>): string | null {
  const direct = str(extracted.address);
  if (direct) return direct;
  const propAddr = str(extracted.propertyAddress);
  if (!propAddr) return null;
  // Parse "123 Main St, City, ST 12345" → "123 Main St"
  const parts = propAddr.split(",");
  return parts[0].trim();
}

function parseCityFromPropAddress(extracted: Record<string, unknown>): string | null {
  const propAddr = str(extracted.propertyAddress);
  if (!propAddr) return null;
  const parts = propAddr.split(",");
  if (parts.length < 2) return null;
  return parts[1].trim();
}

function parseStateFromPropAddress(extracted: Record<string, unknown>): string | null {
  const propAddr = str(extracted.propertyAddress);
  if (!propAddr) return null;
  const parts = propAddr.split(",");
  if (parts.length < 3) return null;
  const last = parts[2].trim();
  const m = last.match(/^([A-Z]{2})/);
  return m ? m[1] : null;
}

function parseZipFromPropAddress(extracted: Record<string, unknown>): string | null {
  const propAddr = str(extracted.propertyAddress);
  if (!propAddr) return null;
  const m = propAddr.match(/\b(\d{5})\b/);
  return m ? m[1] : null;
}

function mapRole(role: string): Party["role"] {
  const r = role.toLowerCase();
  if (r.includes("buyer") && r.includes("agent")) return "buyer_agent";
  if (r.includes("seller") && r.includes("agent")) return "seller_agent";
  if (r.includes("listing")) return "seller_agent";
  if (r.includes("buyer") || r.includes("borrower") || r.includes("purchaser")) return "buyer";
  if (r.includes("seller") || r.includes("grantor")) return "seller";
  if (r.includes("lender") || r.includes("bank") || r.includes("mortgage")) return "lender";
  if (r.includes("title") || r.includes("escrow")) return "title";
  if (r.includes("hoa")) return "hoa";
  if (r.includes("tax")) return "tax";
  return "buyer";
}

function mapDateLabel(label: string): keyof CriticalDates | null {
  const l = label.toLowerCase();
  if (l.includes("contract") && l.includes("accept")) return "contractAccepted";
  if (l.includes("contract") && (l.includes("date") || l.includes("sign"))) return "contractAccepted";
  if (l.includes("emd") || l.includes("earnest")) return "emdDue";
  if (l.includes("inspect")) return "inspectionContingency";
  if (l.includes("appraisal")) return "appraisalContingency";
  if (l.includes("loan") && l.includes("conting")) return "loanContingency";
  if (l.includes("cd") || (l.includes("closing") && l.includes("disclosure"))) return "cdDelivered";
  if (l.includes("sign")) return "signing";
  if (l.includes("fund")) return "funding";
  if (l.includes("record")) return "recording";
  if (l.includes("clos")) return "closing";
  return null;
}

function detectAddressMismatch(
  extracted: Record<string, unknown>,
  escrow: Escrow
): { docAddress: string; escrowAddress: string } | null {
  const docAddr = pickAddress(extracted);
  if (!docAddr) return null;
  const a = normalize(docAddr);
  const b = normalize(escrow.property.address);
  if (!a || !b) return null;
  if (a === b) return null;
  // First word usually street number — if street numbers differ AND street names differ, mismatch
  const aNum = a.split(" ")[0];
  const bNum = b.split(" ")[0];
  if (aNum !== bNum) {
    return {
      docAddress: docAddr + (extracted.city ? ", " + (extracted.city as string) : ""),
      escrowAddress: escrow.property.address + ", " + escrow.property.city
    };
  }
  return null;
}

function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/\bstreet\b/g, "st")
    .replace(/\bavenue\b/g, "ave")
    .replace(/\bboulevard\b/g, "blvd")
    .replace(/\bdrive\b/g, "dr")
    .replace(/[.,#]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function groupBy<T, K extends string>(arr: T[], key: (t: T) => K): Record<K, T[]> {
  const out = {} as Record<K, T[]>;
  for (const item of arr) {
    const k = key(item);
    if (!out[k]) out[k] = [];
    out[k].push(item);
  }
  return out;
}
