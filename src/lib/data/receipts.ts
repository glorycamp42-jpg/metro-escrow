/** Deposit receipts ledger per file. */

export type ReceiptMethod = "wire" | "cashier_check" | "ach" | "check";

export type Receipt = {
  id: string;
  escrowId: string;
  amount: number;
  method: ReceiptMethod;
  from: string;
  reference: string;
  receivedAt: string;
  receivedBy: string;
  notes?: string;
};

const KEY = "metro-escrow:receipts";

const SEED: Receipt[] = [
  { id: "rc-001", escrowId: "TXN-2024-001", amount: 25500, method: "wire", from: "John Buyer", reference: "FED-A1B2C3D4", receivedAt: "2026-04-02T10:14:00Z", receivedBy: "Jin Yu", notes: "Initial EMD" },
  { id: "rc-002", escrowId: "TXN-2024-001", amount: 50000, method: "wire", from: "John Buyer", reference: "FED-E5F6G7H8", receivedAt: "2026-04-22T15:30:00Z", receivedBy: "Jin Yu", notes: "Additional deposit after contingency removal" },
  { id: "rc-003", escrowId: "TXN-2024-002", amount: 75000, method: "cashier_check", from: "Acme LLC", reference: "CHK-887765", receivedAt: "2026-03-18T11:00:00Z", receivedBy: "Jin Yu" },
  { id: "rc-004", escrowId: "TXN-2024-004", amount: 22500, method: "wire", from: "Maria Investor", reference: "FED-Z9Y8X7W6", receivedAt: "2026-04-23T09:45:00Z", receivedBy: "Jin Yu" }
];

export function readReceipts(): Receipt[] {
  if (typeof window === "undefined") return SEED;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return SEED;
    return JSON.parse(raw) as Receipt[];
  } catch {
    return SEED;
  }
}

export function writeReceipts(list: Receipt[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    // ignore
  }
}

export const METHOD_LABEL: Record<ReceiptMethod, string> = {
  wire: "Wire",
  cashier_check: "Cashier's check",
  ach: "ACH",
  check: "Check"
};
