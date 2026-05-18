"use client";

import * as React from "react";
import {
  Sparkles, Upload, CheckCircle2, FileText, AlertTriangle, Loader2
} from "lucide-react";
import type { UserDocument } from "@/lib/data/userEscrows";

type DocType =
  | "purchase_agreement"
  | "inspection_report"
  | "loan_estimate"
  | "title_report"
  | "auto";

const DOC_TYPES: { value: DocType; label: string; categoryLabel: string }[] = [
  { value: "auto", label: "Auto-detect", categoryLabel: "Other" },
  { value: "purchase_agreement", label: "Purchase Agreement", categoryLabel: "Contract" },
  { value: "inspection_report", label: "Inspection Report", categoryLabel: "Inspection" },
  { value: "loan_estimate", label: "Loan Estimate / CD", categoryLabel: "Loan" },
  { value: "title_report", label: "Preliminary Title", categoryLabel: "Title" }
];

type ApiResponse =
  | {
      ok: true;
      docType: string;
      extracted: Record<string, unknown>;
    }
  | { ok: false; reason: string; raw?: string };

export function SmartDocReader({
  onSaved
}: {
  onSaved: (doc: UserDocument) => void;
}) {
  const [docType, setDocType] = React.useState<DocType>("auto");
  const [stage, setStage] = React.useState<"idle" | "reading" | "done" | "error">("idle");
  const [filename, setFilename] = React.useState<string | null>(null);
  const [progress, setProgress] = React.useState(0);
  const [extracted, setExtracted] = React.useState<Record<string, unknown> | null>(null);
  const [detectedCategory, setDetectedCategory] = React.useState<string | null>(null);
  const [notice, setNotice] = React.useState<string | null>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const f = files[0];
    setFilename(f.name);
    setStage("reading");
    setProgress(5);
    setNotice(null);
    setExtracted(null);
    setDetectedCategory(null);

    const progressTimer = setInterval(() => {
      setProgress((p) => (p < 90 ? p + 5 + Math.random() * 4 : p));
    }, 280);

    try {
      const base64 = await fileToBase64(f);
      const mediaType = f.type || guessMediaType(f.name);

      const res = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ base64, mediaType, filename: f.name, docType })
      });

      const json = (await res.json()) as ApiResponse;
      clearInterval(progressTimer);
      setProgress(100);

      if (json.ok) {
        const category =
          DOC_TYPES.find((t) => t.value === json.docType)?.categoryLabel ??
          "Other";
        setDetectedCategory(category);
        setExtracted(json.extracted);
        setStage("done");

        const summary =
          typeof json.extracted.aiSummary === "string"
            ? (json.extracted.aiSummary as string)
            : undefined;

        const doc: UserDocument = {
          id: "doc-" + Date.now(),
          name: f.name,
          size: f.size,
          mediaType,
          uploadedAt: new Date().toISOString(),
          uploadedBy: "Jin Yu",
          docCategory: category,
          aiSummary: summary,
          extracted: json.extracted
        };
        onSaved(doc);
      } else {
        setStage("error");
        setNotice(
          json.reason === "ANTHROPIC_API_KEY is not configured on the server"
            ? "Server has no Anthropic key yet."
            : "AI couldn't read this file: " + json.reason
        );
      }
    } catch (err) {
      clearInterval(progressTimer);
      setProgress(100);
      setStage("error");
      const msg = err instanceof Error ? err.message : String(err);
      setNotice("Network error: " + msg);
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
            AI Document Reader
          </p>
          <p className="text-[12px] text-ink-500 mt-0.5">
            Drop any escrow document and Claude extracts the key fields.
          </p>

          {/* Doc type selector */}
          {stage === "idle" && (
            <>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {DOC_TYPES.map((t) => (
                  <button
                    key={t.value}
                    onClick={() => setDocType(t.value)}
                    className={
                      "px-2.5 py-1 rounded-full text-[11px] font-medium border transition-colors " +
                      (docType === t.value
                        ? "border-hermes-500 bg-hermes-500 text-cream-50"
                        : "border-cream-300 bg-white text-ink-500 hover:border-hermes-300")
                    }
                  >
                    {t.label}
                  </button>
                ))}
              </div>

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
            </>
          )}

          {stage === "reading" && (
            <div className="mt-3">
              <p className="text-[12px] text-ink-700 flex items-center gap-2">
                <Loader2 size={13} className="animate-spin" />
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
                  ? "Reading the document..."
                  : "Extracting key fields..."}
              </p>
            </div>
          )}

          {stage === "done" && extracted && (
            <div className="mt-3 rounded-md bg-emerald-50 border border-emerald-200 p-3 text-[13px]">
              <p className="font-medium text-emerald-800 flex items-center gap-1.5">
                <CheckCircle2 size={14} /> Saved to documents
                {detectedCategory && (
                  <span className="ml-2 text-[11px] px-1.5 py-0.5 rounded-full bg-white border border-emerald-200 text-emerald-700">
                    {detectedCategory}
                  </span>
                )}
              </p>
              {typeof extracted.aiSummary === "string" && (
                <p className="mt-2 text-[12px] text-emerald-900">
                  {extracted.aiSummary as string}
                </p>
              )}
              <ExtractedFields extracted={extracted} />
              <div className="mt-3">
                <button
                  className="text-[11px] text-emerald-700 underline"
                  onClick={() => {
                    setStage("idle");
                    setExtracted(null);
                    setFilename(null);
                    setProgress(0);
                  }}
                >
                  Upload another document
                </button>
              </div>
            </div>
          )}

          {stage === "error" && (
            <div className="mt-3 rounded-md bg-amber-50 border border-amber-200 p-3 text-[13px]">
              <p className="font-medium text-amber-800 flex items-center gap-1.5">
                <AlertTriangle size={14} /> Couldn&apos;t read this file
              </p>
              {notice && (
                <p className="mt-1 text-[12px] text-amber-700">{notice}</p>
              )}
              <button
                className="mt-2 text-[11px] text-amber-700 underline"
                onClick={() => {
                  setStage("idle");
                  setFilename(null);
                  setProgress(0);
                  setNotice(null);
                }}
              >
                Try again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* -------- Helpers -------- */

function ExtractedFields({ extracted }: { extracted: Record<string, unknown> }) {
  const skip = new Set(["docType", "aiSummary"]);
  const rows = Object.entries(extracted)
    .filter(([k, v]) => !skip.has(k) && v !== null && v !== undefined && v !== "")
    .slice(0, 10);
  if (rows.length === 0) return null;
  return (
    <ul className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-1 text-emerald-900 text-[11px]">
      {rows.map(([k, v]) => (
        <li key={k} className="flex gap-1">
          <span className="text-emerald-700 capitalize">{humanize(k)}:</span>
          <span className="font-medium truncate">{renderVal(v)}</span>
        </li>
      ))}
    </ul>
  );
}

function humanize(key: string): string {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (s) => s.toUpperCase())
    .trim();
}

function renderVal(v: unknown): string {
  if (Array.isArray(v)) {
    if (v.length === 0) return "—";
    if (typeof v[0] === "string") return (v as string[]).slice(0, 3).join(", ");
    return v.length + " items";
  }
  if (v === null || v === undefined) return "—";
  return String(v);
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
