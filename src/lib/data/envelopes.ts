/** e-signature envelopes. Phase 3 -> DocuSign / HelloSign integration. */

export type EnvelopeStatus =
  | "draft" | "sent" | "delivered" | "signed" | "completed" | "voided";

export type Envelope = {
  id: string;
  escrowId: string;
  document: string;
  signers: { name: string; email: string; status: "waiting" | "viewed" | "signed" }[];
  status: EnvelopeStatus;
  sentAt?: string;
  completedAt?: string;
};

const KEY = "metro-escrow:envelopes";

const SEED: Envelope[] = [
  {
    id: "env-001",
    escrowId: "TXN-2024-001",
    document: "Joint Escrow Instructions",
    status: "completed",
    sentAt: "2026-04-03T15:00:00Z",
    completedAt: "2026-04-04T11:30:00Z",
    signers: [
      { name: "John Buyer", email: "john@example.com", status: "signed" },
      { name: "Jane Seller", email: "jane@example.com", status: "signed" }
    ]
  },
  {
    id: "env-002",
    escrowId: "TXN-2024-001",
    document: "Closing Disclosure",
    status: "delivered",
    sentAt: "2026-05-10T09:00:00Z",
    signers: [
      { name: "John Buyer", email: "john@example.com", status: "viewed" }
    ]
  },
  {
    id: "env-003",
    escrowId: "TXN-2024-002",
    document: "Closing Disclosure",
    status: "draft",
    signers: [
      { name: "Acme LLC", email: "acme@example.com", status: "waiting" }
    ]
  }
];

export function readEnvelopes(): Envelope[] {
  if (typeof window === "undefined") return SEED;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return SEED;
    return JSON.parse(raw) as Envelope[];
  } catch {
    return SEED;
  }
}

export function writeEnvelopes(list: Envelope[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    // ignore
  }
}

/** Append an envelope; returns the saved record. */
export function addEnvelope(env: Envelope): Envelope {
  const list = readEnvelopes();
  writeEnvelopes([...list, env]);
  return env;
}

export const STATUS_LABEL: Record<EnvelopeStatus, { label: string; bg: string; fg: string }> = {
  draft: { label: "Draft", bg: "#F2EBDA", fg: "#6B5640" },
  sent: { label: "Sent", bg: "#E6F1FB", fg: "#185FA5" },
  delivered: { label: "Delivered", bg: "#FFE8D6", fg: "#A8470F" },
  signed: { label: "Signed", bg: "#E1F5EE", fg: "#0F6E56" },
  completed: { label: "Completed", bg: "#E1F5EE", fg: "#0F6E56" },
  voided: { label: "Voided", bg: "#FCEBEB", fg: "#A32D2D" }
};
