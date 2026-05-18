"use client";

import * as React from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Upload, FileText, Sparkles, X } from "lucide-react";
import { SmartDocReader } from "@/components/ai/SmartDocReader";
import {
  allEscrows,
  addEscrowDocument,
  getEscrowDocuments,
  type UserDocument
} from "@/lib/data/userEscrows";
import { useToast } from "@/components/ui/Toast";
import type { Escrow } from "@/lib/data/mock";

const SAMPLE = [
  { name: "Purchase Agreement.pdf", type: "Purchase Agreement", who: "John Buyer", date: "Apr 9", size: "239 KB", status: "Signed" },
  { name: "Home Inspection Report.pdf", type: "Inspection", who: "Inspector", date: "Apr 11", size: "1.14 MB", status: "AI summarized" },
  { name: "Appraisal Report.pdf", type: "Appraisal", who: "Appraiser", date: "Apr 14", size: "869 KB", status: "Uploaded" },
  { name: "Title Report.pdf", type: "Title", who: "Title Co.", date: "Apr 17", size: "445 KB", status: "Uploaded" }
];

type DocWithEscrow = UserDocument & { escrowId: string; escrowAddress: string };

export default function DocumentsPage() {
  const toast = useToast();
  const [escrows, setEscrows] = React.useState<Escrow[]>([]);
  const [userDocs, setUserDocs] = React.useState<DocWithEscrow[]>([]);
  const [showUpload, setShowUpload] = React.useState(false);
  const [targetEscrowId, setTargetEscrowId] = React.useState<string>("");

  function refresh() {
    const all = allEscrows();
    setEscrows(all);
    if (!targetEscrowId && all.length > 0) setTargetEscrowId(all[0].id);
    const docs: DocWithEscrow[] = [];
    for (const e of all) {
      const escrowDocs = getEscrowDocuments(e.id);
      for (const d of escrowDocs) {
        docs.push({ ...d, escrowId: e.id, escrowAddress: e.property.address });
      }
    }
    docs.sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt));
    setUserDocs(docs);
  }

  React.useEffect(() => {
    refresh();
  }, []);

  function handleSaved(doc: UserDocument) {
    if (!targetEscrowId) {
      toast.push("Pick an escrow first", "warn");
      return;
    }
    addEscrowDocument(targetEscrowId, doc);
    refresh();
    toast.push(
      doc.docCategory
        ? "AI extracted " + doc.docCategory + " fields and saved"
        : "Document saved",
      "ok"
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <header className="flex items-end justify-between">
        <div>
          <h1 className="text-[24px] font-medium tracking-tighter2">Documents</h1>
          <p className="text-[13px] text-ink-500 mt-1">
            Drop a PDF — Claude reads it, classifies it, and extracts key terms.
          </p>
        </div>
        <Button variant="primary" onClick={() => setShowUpload(true)}>
          <Upload size={14} /> Upload document
        </Button>
      </header>

      {userDocs.length > 0 && (
        <Card className="p-0 overflow-hidden">
          <div className="px-4 py-2.5 border-b border-cream-200 bg-cream-50">
            <p className="text-[11px] uppercase tracking-tightish text-hermes-500 font-medium">
              Uploaded by you ({userDocs.length})
            </p>
          </div>
          <ul>
            {userDocs.map((d) => (
              <li
                key={d.id}
                className="flex items-start gap-3 px-4 py-3 border-b border-cream-200 last:border-0"
              >
                <div className="grid place-items-center w-9 h-9 rounded-md bg-hermes-50 text-hermes-500 text-[10px] font-medium shrink-0">
                  {d.docCategory ? d.docCategory.slice(0, 4).toUpperCase() : "NEW"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium truncate">{d.name}</p>
                  <p className="text-[11px] text-ink-400">
                    {(d.size / 1024).toFixed(1)} KB · {d.uploadedBy} ·{" "}
                    {new Date(d.uploadedAt).toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit"
                    })}
                    {" · "}
                    <Link
                      href={"/transactions/" + d.escrowId}
                      className="text-hermes-500 hover:underline"
                    >
                      {d.escrowId}
                    </Link>{" "}
                    <span className="text-ink-400">{d.escrowAddress}</span>
                  </p>
                  {d.aiSummary && (
                    <p className="text-[12px] text-ink-700 mt-1 italic">
                      &ldquo;{d.aiSummary}&rdquo;
                    </p>
                  )}
                </div>
                {d.docCategory && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-hermes-soft text-hermes-500">
                    <Sparkles size={9} className="inline -mt-0.5 mr-1" />
                    {d.docCategory}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </Card>
      )}

      <Card className="p-0 overflow-hidden">
        <div className="px-4 py-2.5 border-b border-cream-200 bg-cream-50">
          <p className="text-[11px] uppercase tracking-tightish text-ink-400 font-medium">
            Sample documents (demo data)
          </p>
        </div>
        <ul>
          {SAMPLE.map((d) => (
            <li
              key={d.name}
              className="flex items-center gap-3 px-4 py-3 border-b border-cream-200 last:border-0"
            >
              <div className="grid place-items-center w-9 h-9 rounded-md bg-cream-100 text-ink-700">
                <FileText size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium truncate">{d.name}</p>
                <p className="text-[11px] text-ink-400">
                  {d.type} · {d.who} · {d.date} · {d.size}
                </p>
              </div>
              <span
                className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                style={{
                  background:
                    d.status === "AI summarized" ? "var(--hermes-soft)" : "#F2EBDA",
                  color:
                    d.status === "AI summarized" ? "var(--hermes)" : "#6B5640"
                }}
              >
                {d.status === "AI summarized" && (
                  <Sparkles size={9} className="inline -mt-0.5 mr-1" />
                )}
                {d.status}
              </span>
            </li>
          ))}
        </ul>
      </Card>

      {showUpload && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-ink-800/40 p-4">
          <div className="w-full max-w-xl rounded-lg bg-cream-50 p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[16px] font-medium">Upload document</h2>
              <button
                onClick={() => setShowUpload(false)}
                className="text-ink-400 hover:text-ink-800"
              >
                <X size={18} />
              </button>
            </div>

            <label className="flex flex-col gap-1 mb-4">
              <span className="text-[12px] text-ink-500">Attach to escrow</span>
              <select
                value={targetEscrowId}
                onChange={(ev) => setTargetEscrowId(ev.target.value)}
                className="h-9 px-2 rounded-md border border-cream-300 bg-white text-[13px]"
              >
                {escrows.length === 0 && <option value="">No escrows yet</option>}
                {escrows.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.id} — {e.property.address}, {e.property.city}
                  </option>
                ))}
              </select>
            </label>

            <SmartDocReader onSaved={handleSaved} />

            <div className="flex justify-end gap-2 mt-5">
              <Button variant="secondary" onClick={() => setShowUpload(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
