/** CA mandatory documents tracking — NHD, HOA Docs, Insurance binder, CPL. */

export type ComplianceStatus = "missing" | "ordered" | "received" | "delivered";

export type ComplianceItem = {
  id: string;
  escrowId: string;
  kind: "nhd" | "hoa_docs" | "insurance_binder" | "cpl" | "preliminary_title" | "wire_warning";
  label: string;
  status: ComplianceStatus;
  /** Hard-deadline (e.g., HOA docs 7-day rule from contract). */
  dueBy?: string;
  vendor?: string;
  notes?: string;
};

export const STATUS_LABEL: Record<ComplianceStatus, { label: string; bg: string; fg: string }> = {
  missing: { label: "Missing", bg: "#FCEBEB", fg: "#A32D2D" },
  ordered: { label: "Ordered", bg: "#FFE8D6", fg: "#A8470F" },
  received: { label: "Received", bg: "#FAEEDA", fg: "#854F0B" },
  delivered: { label: "Delivered", bg: "#E1F5EE", fg: "#0F6E56" }
};

const COMPLIANCE: Record<string, ComplianceItem[]> = {
  "TXN-2024-001": [
    { id: "co-1", escrowId: "TXN-2024-001", kind: "preliminary_title", label: "Preliminary Title Report", status: "delivered", vendor: "California Title Co." },
    { id: "co-2", escrowId: "TXN-2024-001", kind: "wire_warning", label: "Wire fraud warning sent", status: "delivered" },
    { id: "co-3", escrowId: "TXN-2024-001", kind: "nhd", label: "Natural Hazard Disclosure (NHD) report", status: "received", vendor: "JCP-LGS Disclosures", dueBy: "2026-04-14" },
    { id: "co-4", escrowId: "TXN-2024-001", kind: "hoa_docs", label: "HOA Documents (CC&Rs, Bylaws, Financials)", status: "received", vendor: "Sunset HOA", dueBy: "2026-04-08", notes: "7-day delivery rule satisfied" },
    { id: "co-5", escrowId: "TXN-2024-001", kind: "insurance_binder", label: "Homeowner's insurance binder", status: "missing", dueBy: "2026-05-12", notes: "Required by Wells Fargo for funding" },
    { id: "co-6", escrowId: "TXN-2024-001", kind: "cpl", label: "Closing Protection Letter (CPL)", status: "ordered", vendor: "California Title Underwriter" }
  ],
  "TXN-2024-002": [
    { id: "co-7", escrowId: "TXN-2024-002", kind: "preliminary_title", label: "Preliminary Title Report", status: "delivered", vendor: "Title Pro Inc." },
    { id: "co-8", escrowId: "TXN-2024-002", kind: "wire_warning", label: "Wire fraud warning sent", status: "delivered" },
    { id: "co-9", escrowId: "TXN-2024-002", kind: "cpl", label: "Closing Protection Letter (CPL)", status: "received", vendor: "Title Pro Underwriter" },
    { id: "co-10", escrowId: "TXN-2024-002", kind: "insurance_binder", label: "Commercial property insurance binder", status: "missing", dueBy: "2026-05-05" }
  ],
  "TXN-2024-003": [
    { id: "co-11", escrowId: "TXN-2024-003", kind: "wire_warning", label: "Wire fraud warning sent", status: "delivered" }
  ],
  "TXN-2024-004": [
    { id: "co-12", escrowId: "TXN-2024-004", kind: "preliminary_title", label: "Preliminary Title Report", status: "ordered", vendor: "California Title Co." },
    { id: "co-13", escrowId: "TXN-2024-004", kind: "wire_warning", label: "Wire fraud warning sent", status: "delivered" },
    { id: "co-14", escrowId: "TXN-2024-004", kind: "nhd", label: "Natural Hazard Disclosure (NHD) report", status: "ordered", vendor: "JCP-LGS Disclosures" }
  ]
};

export function complianceFor(escrowId: string): ComplianceItem[] {
  return COMPLIANCE[escrowId] ?? [];
}
