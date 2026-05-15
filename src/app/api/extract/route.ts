/**
 * AI Document Reader — calls Claude to extract escrow fields from a Purchase Agreement.
 *
 * Requires ANTHROPIC_API_KEY environment variable (set in Vercel dashboard).
 *
 * Input  : { base64: string, mediaType: "application/pdf" | "image/png" | "image/jpeg", filename: string }
 * Output : { ok: true, extracted: Extracted } | { ok: false, reason: string }
 */

import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

type Extracted = {
  txnNumber?: string;
  type?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  price?: string;
  closingDate?: string;
  buyer?: string;
  buyerEmail?: string;
  seller?: string;
  emd?: string;
};

const PROMPT = `You are reading a real estate Purchase Agreement (or similar escrow opening document).

Extract these fields and return ONLY a JSON object (no markdown, no commentary):

{
  "txnNumber": "TXN-YYYY-NNN format if present, else generate as TXN-<year>-<3 digit random>",
  "type": "one of: Residential Resale | Commercial | 1031 Exchange | Investment Property | REO | Refinance",
  "address": "street address only, e.g. 123 Main St",
  "city": "city name",
  "state": "2-letter state code, e.g. CA",
  "zip": "5-digit zip",
  "price": "purchase price in dollars as integer string, no commas, no $",
  "closingDate": "YYYY-MM-DD",
  "buyer": "buyer full name or entity name",
  "buyerEmail": "buyer email if present, else null",
  "seller": "seller name if present, else null",
  "emd": "earnest money deposit as integer string if present, else null"
}

If a field is not in the document, set it to null. Do not invent values for missing fields. The only field you may generate is txnNumber when the document does not specify a file number.

Return only valid JSON. No prose, no fenced code block.`;

export async function POST(req: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { ok: false, reason: "ANTHROPIC_API_KEY is not configured on the server" },
      { status: 503 }
    );
  }

  let body: { base64?: string; mediaType?: string; filename?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, reason: "Bad JSON" }, { status: 400 });
  }

  const { base64, mediaType, filename } = body;
  if (!base64 || !mediaType) {
    return NextResponse.json(
      { ok: false, reason: "Missing base64 or mediaType" },
      { status: 400 }
    );
  }

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const sourceBlock =
    mediaType === "application/pdf"
      ? {
          type: "document" as const,
          source: {
            type: "base64" as const,
            media_type: "application/pdf" as const,
            data: base64
          }
        }
      : {
          type: "image" as const,
          source: {
            type: "base64" as const,
            media_type: mediaType as "image/png" | "image/jpeg" | "image/webp" | "image/gif",
            data: base64
          }
        };

  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          // SDK type defs don't include the document block yet; the API does.
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          content: [
            sourceBlock,
            {
              type: "text",
              text: PROMPT + (filename ? "\n\nFile name (context only): " + filename : "")
            }
          ] as any
        }
      ]
    });

    const textBlock = message.content.find((b) => b.type === "text");
    const raw = textBlock && textBlock.type === "text" ? textBlock.text : "";
    const cleaned = raw.replace(/```json\s*/i, "").replace(/```\s*$/i, "").trim();

    let parsed: Extracted;
    try {
      parsed = JSON.parse(cleaned) as Extracted;
    } catch {
      return NextResponse.json(
        { ok: false, reason: "Claude returned non-JSON output", raw },
        { status: 502 }
      );
    }

    return NextResponse.json({ ok: true, extracted: parsed });
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, reason: errMsg }, { status: 500 });
  }
}
