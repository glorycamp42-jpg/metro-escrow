/**
 * AI Document Reader — calls Claude to extract structured fields from
 * various escrow documents.
 *
 * Requires ANTHROPIC_API_KEY environment variable.
 *
 * Input  : {
 *   base64: string,
 *   mediaType: "application/pdf" | "image/png" | "image/jpeg",
 *   filename: string,
 *   docType?: "purchase_agreement" | "inspection_report" | "loan_estimate" | "title_report" | "auto"
 * }
 * Output : { ok: true, docType: <detected/used>, extracted: any } | { ok: false, reason: string }
 */

import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

type DocType =
  | "purchase_agreement"
  | "inspection_report"
  | "loan_estimate"
  | "title_report"
  | "auto";

const PURCHASE_PROMPT = `You are reading a real estate Purchase Agreement (or similar escrow opening document).

Extract these fields and return ONLY a JSON object (no markdown, no commentary):

{
  "docType": "purchase_agreement",
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
  "emd": "earnest money deposit as integer string if present, else null",
  "aiSummary": "one sentence summary of the agreement"
}

If a field is not in the document, set it to null. The only field you may generate is txnNumber when the document does not specify a file number. Return only valid JSON.`;

const INSPECTION_PROMPT = `You are reading a real estate Home Inspection Report.

Extract and return ONLY this JSON object:

{
  "docType": "inspection_report",
  "inspector": "inspector full name",
  "inspectorCompany": "company name if present, else null",
  "inspectionDate": "YYYY-MM-DD",
  "propertyAddress": "full address",
  "overallCondition": "one of: Excellent | Good | Fair | Poor | null",
  "majorIssues": ["array of major issue descriptions, max 5 items, each <= 80 chars"],
  "minorIssues": ["array of minor issue descriptions, max 5 items"],
  "recommendedRepairs": ["array of recommended repairs with rough $ estimate if mentioned, max 5 items"],
  "estimatedRepairCost": "total estimated repair cost as integer string, or null",
  "safetyConcerns": ["array of safety concerns, empty array if none"],
  "aiSummary": "two-sentence summary covering condition + most important issues"
}

Set unknowns to null or empty array. Return only valid JSON.`;

const LOAN_PROMPT = `You are reading a Loan Estimate (or Closing Disclosure) from a mortgage lender.

Extract and return ONLY this JSON object:

{
  "docType": "loan_estimate",
  "lender": "lender company name",
  "loanOfficer": "loan officer name if present, else null",
  "borrower": "borrower full name",
  "propertyAddress": "full address",
  "loanAmount": "loan amount as integer string, no commas, no $",
  "loanType": "one of: Conventional | FHA | VA | Jumbo | Other",
  "loanTerm": "loan term in years as integer string",
  "interestRate": "interest rate percentage as string (e.g. '6.875')",
  "monthlyPayment": "monthly P&I payment as integer string",
  "estimatedClosingCosts": "estimated closing costs as integer string",
  "cashToClose": "cash to close as integer string",
  "rateLockExpires": "YYYY-MM-DD or null",
  "aiSummary": "one-sentence summary"
}

Set unknowns to null. Return only valid JSON.`;

const TITLE_PROMPT = `You are reading a Preliminary Title Report.

Extract and return ONLY this JSON object:

{
  "docType": "title_report",
  "titleCompany": "title company name",
  "titleOfficer": "title officer name if present, else null",
  "reportDate": "YYYY-MM-DD",
  "orderNumber": "title order number if present, else null",
  "propertyAddress": "full address",
  "apn": "assessor parcel number if present, else null",
  "currentVesting": "current vesting / owner of record",
  "legalDescription": "brief legal description (lot/block/tract) if present",
  "liens": ["array of recorded liens with amount if mentioned"],
  "easements": ["array of easements, max 5 items, each <= 80 chars"],
  "encumbrances": ["array of other encumbrances"],
  "titleExceptions": ["array of title exceptions / schedule B items, max 5"],
  "aiSummary": "two-sentence summary of title status"
}

Set unknowns to null or empty array. Return only valid JSON.`;

const AUTO_PROMPT = `You are reading a real estate / escrow document.

Determine the document type from EXACTLY one of these labels:
"purchase_agreement" | "inspection_report" | "loan_estimate" | "title_report" | "other"

Then return ONLY this JSON object. No markdown fences, no prose before or after, no commentary. Output must start with { and end with }:

{
  "docType": "<one of the labels above>",
  "title": "best guess document title (e.g. 'Residential Purchase Agreement')",
  "aiSummary": "2-3 sentence plain-language summary",
  "keyFacts": ["array of 4-6 key facts, each <= 100 chars"],
  "keyDates": [{"label": "short label", "date": "YYYY-MM-DD"}],
  "keyParties": [{"role": "role", "name": "name"}],
  "keyAmounts": [{"label": "label", "amount": "integer dollars as string"}]
}

Set unknowns to empty array []. Do NOT wrap in code fences. Output JUST the JSON.`;

function promptFor(docType: DocType): string {
  switch (docType) {
    case "purchase_agreement":
      return PURCHASE_PROMPT;
    case "inspection_report":
      return INSPECTION_PROMPT;
    case "loan_estimate":
      return LOAN_PROMPT;
    case "title_report":
      return TITLE_PROMPT;
    case "auto":
      return AUTO_PROMPT;
  }
}

/**
 * Robust JSON extraction. Handles cases where Claude:
 * - wraps output in ```json ... ``` fences
 * - adds a prose preamble like "Here is the analysis: { ... }"
 * - adds a postscript after the JSON
 * Returns the largest `{...}` block found, or null.
 */
function extractJsonObject(raw: string): string | null {
  if (!raw) return null;
  const trimmed = raw.trim();

  // 1. Fenced code block
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fenced && fenced[1]) {
    const inner = fenced[1].trim();
    if (inner.startsWith("{") && inner.endsWith("}")) return inner;
  }

  // 2. First { ... last } in the whole string
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start >= 0 && end > start) {
    return trimmed.slice(start, end + 1);
  }

  return null;
}

export async function POST(req: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { ok: false, reason: "ANTHROPIC_API_KEY is not configured on the server" },
      { status: 503 }
    );
  }

  let body: { base64?: string; mediaType?: string; filename?: string; docType?: DocType };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, reason: "Bad JSON" }, { status: 400 });
  }

  const { base64, mediaType, filename } = body;
  const docType: DocType = body.docType ?? "purchase_agreement";

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

  const prompt = promptFor(docType);

  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1536,
      messages: [
        {
          role: "user",
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          content: [
            sourceBlock,
            {
              type: "text",
              text: prompt + (filename ? "\n\nFile name (context only): " + filename : "")
            }
          ] as any
        }
      ]
    });

    const textBlock = message.content.find((b) => b.type === "text");
    const raw = textBlock && textBlock.type === "text" ? textBlock.text : "";

    const cleaned = extractJsonObject(raw);
    if (!cleaned) {
      return NextResponse.json(
        { ok: false, reason: "Claude returned non-JSON output", raw },
        { status: 502 }
      );
    }

    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(cleaned) as Record<string, unknown>;
    } catch {
      return NextResponse.json(
        { ok: false, reason: "Claude returned malformed JSON", raw },
        { status: 502 }
      );
    }

    const detectedType =
      (typeof parsed.docType === "string" ? (parsed.docType as string) : docType);

    return NextResponse.json({
      ok: true,
      docType: detectedType,
      extracted: parsed
    });
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, reason: errMsg }, { status: 500 });
  }
}
