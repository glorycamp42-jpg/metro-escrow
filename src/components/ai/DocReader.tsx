"use client";

import * as React from "react";
import { Sparkles, Upload, CheckCircle2, FileText, AlertTriangle } from "lucide-react";

export type Extracted = {
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
};

/**
 * Drag-drop PDF/image. POSTs to /api/extract which calls Claude.
 * Falls back to deterministic mock samples if the API is unavailable.
 */
export function DocReader({ onExtract }: { onExtract: (e: Extracted) => void }) {
  const [stage, setStage] = React.useState<"idle" | "reading" | "done" | "error">("idle");
  const [filename, setFilename] = React.useState<string | null>(null);
  const [progress, setProgress] = React.useState(0);
  const [extracted, setExtracted] = React.useState<Extracted | null>(null);
  const [notice, setNotice] = React.useState<string | null>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const f = files[0];
    setFilename(f.name);
    setStage("reading");
    setProgress(5);
    setNotice(null);

    const progressTimer = setInterval(() => {
      setProgress((p) => (p < 90 ? p + 6 + Math.random() * 4 : p));
    }, 250);

    try {
      const base64 = await fileToBase64(f);
      const mediaType = f.type || guessMediaType(f.name);

      const res = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ base64, mediaType, filename: f.name })
      });

      const json = await res.json();
      clearInterval(progressTimer);
      setProgress(100);

      if (json.ok && json.extracted) {
        const ex = normaliseNulls(json.extracted as Extracted);
        setExtracted(ex);
        setStage("done");
        onExtract(ex);
      } else {
        // Real API failed (no key, bad PDF, parse error). Fall back to mock.
        const ex = simulateExtract(f.name);
        setExtracted(ex);
        setStage("done");
        setNotice(
          json.reason === "ANTHROPIC_API_KEY is not configured on the server"
            ? "Demo mode — server has no Anthropic key yet. Using sample data."
            : "Couldn't read this file with AI — using sample data instead."
        );
        onExtract(ex);
      }
    } catch (err) {
      clearInterval(progressTimer);
      const ex = simulateExtract(f.name);
      setExtracted(ex);
      setProgress(100);
      setStage("done");
      setNotice("Network error — using sample data.");
      onExtract(ex);
    }
  }

  return (
    <div
      className="rounded-lg border-2 border-dashed border-hermes-300 bg-hermes-50/40 p-5"
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        handleFiles(e.dataTransfer?.files ?? null);
      }}
    >
      <div className="flex items-start gap-3">
        <div
          className="grid place-items-center w-10 h-10 rounded-md text-cream-50 shrink-0"
          style={{ background: "var(--ink)" }}
        >
          <Sparkles size={18} className="text-hermes-300" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-medium text-ink-800">
            Skip typing - drop a Purchase Agreement
          </p>
          <p className="text-[12px] text-ink-500 mt-0.5">
            AI extracts price, closing date, buyer, address and fills the form.
          </p>

          {stage === "idle" && (
            <label className="mt-3 inline-flex items-center gap-2 h-9 px-3 rounded-md border border-cream-300 bg-white text-[13px] cursor-pointer hover:bg-cream-100">
              <Upload size={13} />
              Choose file (PDF, JPG, PNG)
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                className="hidden"
                onChange={(e) => handleFiles(e.target.files)}
              />
            </label>
          )}

          {stage === "reading" && (
            <div className="mt-3">
              <p className="text-[12px] text-ink-700 flex items-center gap-2">
                <FileText size={13} className="text-ink-400" />
                Reading <span className="font-medium">{filename}</span>...
              </p>
              <div className="mt-2 h-1.5 rounded-full bg-cream-200 overflow-hidden">
                <div
                  className="h-full transition-all duration-150"
                  style={{
                    width: progress + "%",
                    background: "var(--hermes)"
                  }}
                />
              </div>
              <p className="text-[11px] text-ink-400 mt-1">
                {progress < 30
                  ? "Sending to Claude..."
                  : progress < 70
                  ? "Identifying parties and price..."
                  : "Locking in closing date..."}
              </p>
            </div>
          )}

          {stage === "done" && extracted && (
            <div className="mt-3 rounded-md bg-emerald-50 border border-emerald-200 p-3 text-[13px]">
              <p className="font-medium text-emerald-800 flex items-center gap-1.5">
                <CheckCircle2 size={14} /> Filled the form below
              </p>
              <ul className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-emerald-900 text-[12px]">
                {extracted.txnNumber && <li>Transaction: {extracted.txnNumber}</li>}
                {extracted.address && <li>Address: {extracted.address}</li>}
                {extracted.price && <li>Price: ${extracted.price}</li>}
                {extracted.closingDate && <li>Closing: {extracted.closingDate}</li>}
                {extracted.buyer && <li>Buyer: {extracted.buyer}</li>}
                {extracted.buyerEmail && <li>Email: {extracted.buyerEmail}</li>}
              </ul>
              {notice && (
                <p className="mt-2 text-[11px] text-amber-700 flex items-start gap-1">
                  <AlertTriangle size={11} className="mt-0.5 shrink-0" /> {notice}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== "string") {
        reject(new Error("Bad file read"));
        return;
      }
      const comma = result.indexOf(",");
      resolve(comma >= 0 ? result.slice(comma + 1) : result);
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function guessMediaType(name: string): string {
  const lower = name.toLowerCase();
  if (lower.endsWith(".pdf")) return "application/pdf";
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
  if (lower.endsWith(".webp")) return "image/webp";
  if (lower.endsWith(".gif")) return "image/gif";
  return "application/octet-stream";
}

function normaliseNulls(e: Extracted): Extracted {
  const out: Extracted = {};
  (Object.keys(e) as (keyof Extracted)[]).forEach((k) => {
    const v = e[k];
    if (v !== null && v !== undefined && v !== "") out[k] = v as never;
  });
  return out;
}

function simulateExtract(name: string): Extracted {
  const hash = Array.from(name).reduce((s, c) => s + c.charCodeAt(0), 0);
  const samples: Extracted[] = [
    { txnNumber: "TXN-2026-101", type: "Residential Resale", address: "742 Sunset Blvd", city: "Beverly Hills", state: "CA", zip: "90210", price: "1450000", closingDate: "2026-06-30", buyer: "Marcus Lee", buyerEmail: "marcus.lee@example.com" },
    { txnNumber: "TXN-2026-102", type: "Investment Property", address: "1820 Wilshire Ave", city: "Santa Monica", state: "CA", zip: "90403", price: "2100000", closingDate: "2026-07-12", buyer: "Lillian Park", buyerEmail: "lillian@example.com" },
    { txnNumber: "TXN-2026-103", type: "Commercial", address: "55 East 1st St", city: "Los Angeles", state: "CA", zip: "90012", price: "3850000", closingDate: "2026-08-15", buyer: "Sun & Co LLC", buyerEmail: "ops@suncollc.com" }
  ];
  return samples[hash % samples.length];
}
