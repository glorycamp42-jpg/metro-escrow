/** Threaded messaging per escrow. Local storage, Phase 3 → Supabase Realtime. */

export type Message = {
  id: string;
  escrowId: string;
  from: string;
  fromRole: "officer" | "processor" | "assistant" | "buyer" | "seller" | "lender" | "title" | "agent";
  body: string;
  at: string;
  read: boolean;
};

const KEY = "metro-escrow:messages";

const SEED: Message[] = [
  { id: "m-1", escrowId: "TXN-2024-001", from: "John Buyer", fromRole: "buyer", body: "Hi Jin, what time is the inspection tomorrow?", at: "2026-05-03T13:55:00Z", read: true },
  { id: "m-2", escrowId: "TXN-2024-001", from: "Jin Yu", fromRole: "officer", body: "10am, the inspector will meet you at the property. Bob (your agent) will also be there.", at: "2026-05-03T14:02:00Z", read: true },
  { id: "m-3", escrowId: "TXN-2024-001", from: "John Buyer", fromRole: "buyer", body: "Got it, thanks!", at: "2026-05-03T14:05:00Z", read: true },
  { id: "m-4", escrowId: "TXN-2024-001", from: "Sarah Lender", fromRole: "lender", body: "Updated loan estimate sent — please have buyer sign within 24h.", at: "2026-05-04T09:10:00Z", read: false },
  { id: "m-5", escrowId: "TXN-2024-002", from: "Acme LLC", fromRole: "buyer", body: "When will we get the CD? Closing is Friday.", at: "2026-05-04T11:00:00Z", read: false },
  { id: "m-6", escrowId: "TXN-2024-002", from: "Jin Yu", fromRole: "officer", body: "Lender is finalizing today — I'll forward as soon as it lands. Targeting EOD.", at: "2026-05-04T11:08:00Z", read: true },
  { id: "m-7", escrowId: "TXN-2024-004", from: "Maria Investor", fromRole: "buyer", body: "Walkthrough Friday 9:30am works for me.", at: "2026-05-02T16:20:00Z", read: true }
];

export function readMessages(): Message[] {
  if (typeof window === "undefined") return SEED;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return SEED;
    return JSON.parse(raw) as Message[];
  } catch {
    return SEED;
  }
}

export function writeMessages(list: Message[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    // ignore
  }
}

export function sendMessage(
  escrowId: string,
  body: string,
  from = "Jin Yu",
  fromRole: Message["fromRole"] = "officer"
): Message {
  const next: Message = {
    id: "m-" + Math.random().toString(36).slice(2, 9),
    escrowId,
    from,
    fromRole,
    body,
    at: new Date().toISOString(),
    read: true
  };
  if (typeof window !== "undefined") {
    const list = readMessages();
    writeMessages([...list, next]);
  }
  return next;
}

export const ROLE_LABEL: Record<Message["fromRole"], { label: string; bg: string; fg: string }> = {
  officer: { label: "Officer", bg: "#FFE8D6", fg: "#A8470F" },
  processor: { label: "Processor", bg: "#E6F1FB", fg: "#185FA5" },
  assistant: { label: "Assistant", bg: "#EEEDFE", fg: "#534AB7" },
  buyer: { label: "Buyer", bg: "#E1F5EE", fg: "#0F6E56" },
  seller: { label: "Seller", bg: "#FAEEDA", fg: "#854F0B" },
  lender: { label: "Lender", bg: "#E6F1FB", fg: "#185FA5" },
  title: { label: "Title", bg: "#F2EBDA", fg: "#6B5640" },
  agent: { label: "Agent", bg: "#EEEDFE", fg: "#534AB7" }
};
