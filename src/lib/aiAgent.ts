/**
 * Local AI agent stub.
 *
 * Phase 1 ships this as a deterministic intent matcher so the UI can be
 * shipped without API keys. Phase 2 swaps `runAgent` for a server route
 * that calls Anthropic with tool definitions like:
 *   - openEscrow({ address, buyer, price, closingDate })
 *   - sendReminders({ escrowIds, channel })
 *   - listRiskFlags()
 *   - summarizeToday()
 *
 * Tool calls go through the same shape (`AgentAction[]`) the panel renders today.
 */

import { allEscrows } from "./data/userEscrows";

export type AgentAction =
  | { kind: "open_escrow"; summary: string }
  | { kind: "send_reminder"; summary: string }
  | { kind: "flag"; summary: string };

export type AgentMessage = {
  role: "user" | "assistant";
  text: string;
  actions?: AgentAction[];
};

const ADDRESS_RE = /(\d{2,5})\s+([A-Za-z][A-Za-z\s]+?(?:St|Street|Ave|Avenue|Blvd|Boulevard|Rd|Road|Dr|Drive|Way|Ln|Lane|Ct|Court))/i;
const PRICE_RE = /\$?\s?(\d+(?:[\.,]\d+)?)\s?(m|million|k|thousand)?/i;
const NAME_RE = /(?:by|with|for)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/;

function parsePrice(raw: string): number | null {
  const m = raw.match(PRICE_RE);
  if (!m) return null;
  const n = parseFloat(m[1].replace(/,/g, ""));
  if (!Number.isFinite(n)) return null;
  if (m[2]?.match(/m|million/i)) return n * 1_000_000;
  if (m[2]?.match(/k|thousand/i)) return n * 1_000;
  return n;
}

export async function runAgent(prompt: string): Promise<AgentMessage> {
  await new Promise((r) => setTimeout(r, 350));
  const lower = prompt.toLowerCase();

  if (lower.includes("open") && lower.includes("escrow")) {
    const addr = prompt.match(ADDRESS_RE)?.[0] ?? "the new property";
    const price = parsePrice(prompt);
    const buyer = prompt.match(NAME_RE)?.[1] ?? "the buyer";
    return {
      role: "assistant",
      text: `Drafted a new escrow at ${addr}${
        price ? ` for ${price.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })}` : ""
      } with ${buyer} as buyer. Review the details before opening.`,
      actions: [
        {
          kind: "open_escrow",
          summary: `Open escrow at ${addr}${buyer ? ` · buyer ${buyer}` : ""}`
        }
      ]
    };
  }

  if (lower.includes("summarize") || lower.includes("summary")) {
    const escrows = allEscrows();
    const open = escrows.filter((e) => e.status !== "closed").length;
    const risks = escrows.flatMap((e) => e.risks).length;
    const closingSoon = escrows.filter((e) => e.status === "pending_closing").length;
    return {
      role: "assistant",
      text: `Today in three lines:
• ${open} active escrows, ${closingSoon} closing within the week.
• ${risks} open risk flags — top one: ${escrows[0]?.risks[0]?.message ?? "no critical flags"}.
• 4 client portal updates pending your review.`
    };
  }

  if (lower.includes("reminder")) {
    return {
      role: "assistant",
      text: "Queued reminders to all parties with missing signatures or documents in the next 3 days. They'll be sent via email + SMS at 9am tomorrow.",
      actions: [
        { kind: "send_reminder", summary: "12 reminders queued · 4 escrows touched" }
      ]
    };
  }

  if (lower.includes("risk") || lower.includes("flag")) {
    const escrows = allEscrows();
    const items = escrows.flatMap((e) =>
      e.risks.map((r) => ({ id: e.id, msg: r.message }))
    );
    return {
      role: "assistant",
      text:
        items.length === 0
          ? "No active risk flags right now."
          : `${items.length} active risk flags:`,
      actions: items.map((i) => ({
        kind: "flag" as const,
        summary: `${i.id} · ${i.msg}`
      }))
    };
  }

  return {
    role: "assistant",
    text:
      "I can do a few things today: open new escrows, summarize what needs attention, send batch reminders, or walk through risk flags. Tell me which and I'll get started."
  };
}
