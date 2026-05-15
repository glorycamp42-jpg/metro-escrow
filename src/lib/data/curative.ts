/** Title curative items - liens, judgments, taxes to clear before recording. */

export type CurativeStatus = "open" | "requested" | "received" | "cleared";

export type CurativeKind =
  | "mortgage_payoff" | "hoa_lien" | "judgment_lien"
  | "tax_lien" | "mechanic_lien" | "bond_release" | "other";

export type CurativeItem = {
  id: string;
  escrowId: string;
  kind: CurativeKind;
  description: string;
  status: CurativeStatus;
  amount?: number;
  ownedBy: "officer" | "processor" | "title";
  dueBy?: string;
};

export const KIND_LABEL: Record<CurativeKind, string> = {
  mortgage_payoff: "Mortgage payoff",
  hoa_lien: "HOA lien",
  judgment_lien: "Judgment lien",
  tax_lien: "Tax lien",
  mechanic_lien: "Mechanic's lien",
  bond_release: "Bond release",
  other: "Other curative"
};

export const STATUS_LABEL: Record<CurativeStatus, { label: string; bg: string; fg: string }> = {
  open: { label: "Open", bg: "#FCEBEB", fg: "#A32D2D" },
  requested: { label: "Requested", bg: "#FFE8D6", fg: "#A8470F" },
  received: { label: "Received", bg: "#FAEEDA", fg: "#854F0B" },
  cleared: { label: "Cleared", bg: "#E1F5EE", fg: "#0F6E56" }
};

const CURATIVE: Record<string, CurativeItem[]> = {
  "TXN-2024-001": [
    { id: "cu-1", escrowId: "TXN-2024-001", kind: "mortgage_payoff", description: "Existing mortgage with Chase Bank", status: "requested", amount: 467500, ownedBy: "processor", dueBy: "2026-05-08" },
    { id: "cu-2", escrowId: "TXN-2024-001", kind: "hoa_lien", description: "Sunset HOA back dues", status: "cleared", amount: 850, ownedBy: "processor" },
    { id: "cu-3", escrowId: "TXN-2024-001", kind: "judgment_lien", description: "Small claims judgment - 2019", status: "received", amount: 3200, ownedBy: "title", dueBy: "2026-05-10" }
  ],
  "TXN-2024-002": [
    { id: "cu-4", escrowId: "TXN-2024-002", kind: "mortgage_payoff", description: "Commercial loan - First Republic", status: "requested", amount: 1400000, ownedBy: "processor", dueBy: "2026-05-05" }
  ],
  "TXN-2024-003": [],
  "TXN-2024-004": [
    { id: "cu-5", escrowId: "TXN-2024-004", kind: "tax_lien", description: "Prior owner property tax", status: "open", amount: 4200, ownedBy: "officer" }
  ]
};

export function curativeFor(escrowId: string): CurativeItem[] {
  return CURATIVE[escrowId] ?? [];
}
