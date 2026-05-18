/**
 * AI agent route — calls Claude with the chat history and optional escrow
 * context to produce a contextual reply for Jin Yu (senior escrow officer).
 *
 * Requires ANTHROPIC_API_KEY env var. The client falls back to the local
 * deterministic intent matcher (src/lib/aiAgent.ts) when this route returns
 * { ok: false }.
 *
 * Input: { messages: Array<{ role: "user" | "assistant"; content: string }>,
 *          escrowContext?: unknown }
 * Output: { ok: true, text: string, model: string } |
 *         { ok: false, reason: string }
 */

import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

type ChatMessage = { role: "user" | "assistant"; content: string };

const SYSTEM_PROMPT = `You are an AI escrow assistant for Metro Escrow Trust. The user is a senior escrow officer named Jin Yu. Help them with escrow questions, summarize files, draft client/agent emails, and identify risks (especially wire fraud, missed contingencies, unsigned documents, recording delays). Use the escrowContext if provided to ground your answers in the actual file. Keep replies concise and actionable — Jin is busy. When drafting emails, keep them professional but warm.`;

function isRateLimited(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  const e = err as { status?: number; message?: string };
  if (e.status === 429) return true;
  if (e.message && /rate.?limit|429/i.test(e.message)) return true;
  return false;
}

export async function POST(req: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { ok: false, reason: "ANTHROPIC_API_KEY not configured" },
      { status: 503 }
    );
  }

  let body: { messages?: ChatMessage[]; escrowContext?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, reason: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const messages = Array.isArray(body.messages) ? body.messages : [];
  if (messages.length === 0) {
    return NextResponse.json(
      { ok: false, reason: "messages array is required and must be non-empty" },
      { status: 400 }
    );
  }

  // Filter & normalize. Anthropic requires alternating user/assistant, must end on user.
  const cleaned: ChatMessage[] = [];
  for (const m of messages) {
    if (
      !m ||
      typeof m.content !== "string" ||
      (m.role !== "user" && m.role !== "assistant")
    ) {
      continue;
    }
    cleaned.push({ role: m.role, content: m.content });
  }
  // Drop leading assistant messages
  while (cleaned.length > 0 && cleaned[0].role === "assistant") cleaned.shift();
  if (cleaned.length === 0 || cleaned[cleaned.length - 1].role !== "user") {
    return NextResponse.json(
      { ok: false, reason: "Conversation must end with a user message" },
      { status: 400 }
    );
  }

  let systemPrompt = SYSTEM_PROMPT;
  if (body.escrowContext) {
    try {
      systemPrompt +=
        "\n\nCurrent escrow context (JSON):\n" +
        JSON.stringify(body.escrowContext, null, 2).slice(0, 8000);
    } catch {
      // ignore
    }
  }

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  async function callClaude(model: string) {
    return anthropic.messages.create({
      model,
      max_tokens: 1024,
      system: systemPrompt,
      messages: cleaned.map((m) => ({ role: m.role, content: m.content }))
    });
  }

  try {
    let message: Awaited<ReturnType<typeof anthropic.messages.create>>;
    let usedModel = "claude-sonnet-4-6";
    try {
      message = await callClaude("claude-sonnet-4-6");
    } catch (primaryErr) {
      if (isRateLimited(primaryErr)) {
        usedModel = "claude-haiku-4-5";
        message = await callClaude("claude-haiku-4-5");
      } else {
        throw primaryErr;
      }
    }

    const textBlock = message.content.find((b) => b.type === "text");
    const text =
      textBlock && textBlock.type === "text"
        ? textBlock.text
        : "(Claude returned no text content.)";

    return NextResponse.json({ ok: true, text, model: usedModel });
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, reason }, { status: 502 });
  }
}
