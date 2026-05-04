/** Append-only audit log. Local for now. Phase 3 -> Supabase + immutable storage. */

export type AuditEvent = {
  id: string;
  at: string;
  who: string;
  role: string;
  action: string;
  target: string;
  detail?: string;
};

const KEY = "metro-escrow:audit";

function now() {
  return new Date().toISOString();
}

export function readAudit(): AuditEvent[] {
  if (typeof window === "undefined") return SEED;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return SEED;
    return JSON.parse(raw) as AuditEvent[];
  } catch {
    return SEED;
  }
}

export function logAudit(ev: Omit<AuditEvent, "id" | "at">) {
  if (typeof window === "undefined") return;
  const next: AuditEvent = {
    ...ev,
    id: Math.random().toString(36).slice(2, 9),
    at: now()
  };
  try {
    const list = readAudit();
    const merged = [next, ...list].slice(0, 200);
    window.localStorage.setItem(KEY, JSON.stringify(merged));
  } catch {
    // ignore
  }
  return next;
}

const SEED: AuditEvent[] = [
  {
    id: "seed-1",
    at: "2026-05-04T08:30:00Z",
    who: "Jin Yu",
    role: "Officer",
    action: "Risk flag detected",
    target: "TXN-2024-001",
    detail: "AI flagged sale price 18% above comps"
  },
  {
    id: "seed-2",
    at: "2026-05-03T16:45:00Z",
    who: "Jin Yu",
    role: "Officer",
    action: "Wire callback verified",
    target: "TXN-2024-001",
    detail: "Verified bank ending 4421 via callback to Wells Fargo (213) 555-0190"
  },
  {
    id: "seed-3",
    at: "2026-05-03T14:22:00Z",
    who: "Jin Yu",
    role: "Officer",
    action: "Phone call logged",
    target: "TXN-2024-001",
    detail: "Inspection time confirmed for tomorrow 10am"
  },
  {
    id: "seed-4",
    at: "2026-04-17T09:00:00Z",
    who: "Anita Park",
    role: "Processor",
    action: "Title report received",
    target: "TXN-2024-001",
    detail: "Preliminary title report from California Title Co."
  },
  {
    id: "seed-5",
    at: "2026-04-09T11:00:00Z",
    who: "Anita Park",
    role: "Processor",
    action: "Document uploaded",
    target: "TXN-2024-001",
    detail: "Purchase Agreement (signed) v2"
  }
];
