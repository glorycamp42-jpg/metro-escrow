"use client";

import * as React from "react";
import {
  ArrowRight, Upload, FileSignature, MessageSquare, X,
  CheckCircle2, Loader2, Send
} from "lucide-react";
import {
  addEscrowDocument,
  addPortalNotification,
  type UserDocument
} from "@/lib/data/userEscrows";
import { sendMessage } from "@/lib/data/messages";
import { addEnvelope, getSignedDocuments } from "@/lib/data/envelopes";
import { logAudit } from "@/lib/data/audit";

type ToastState = { message: string; tone: "ok" | "info" } | null;

const PACKET_DOCS = [
  "Buyer's Inspection Advisory",
  "Lead-Based Paint Disclosure",
  "Natural Hazard Disclosure",
  "Transfer Disclosure Statement",
  "Earthquake Hazards Report",
  "Megan's Law Disclosure"
];

export function PortalActions({
  escrowId,
  buyerName
}: {
  escrowId: string;
  buyerName: string;
}) {
  const [modal, setModal] = React.useState<null | "sign" | "message">(null);
  const fileRef = React.useRef<HTMLInputElement>(null);
  const [toast, setToast] = React.useState<ToastState>(null);
  const [alreadySigned, setAlreadySigned] = React.useState<Set<string>>(new Set());

  React.useEffect(() => {
    setAlreadySigned(getSignedDocuments(escrowId));
  }, [escrowId]);

  function refreshSigned() {
    setAlreadySigned(getSignedDocuments(escrowId));
  }

  const remaining = PACKET_DOCS.filter((d) => !alreadySigned.has(d));
  const allDone = remaining.length === 0;

  function showToast(message: string, tone: "ok" | "info" = "ok") {
    setToast({ message, tone });
    window.setTimeout(() => setToast(null), 3500);
  }

  /* -------- Upload proof of funds -------- */

  function handleUploadClick() {
    fileRef.current?.click();
  }

  function handleUploadFile(ev: React.ChangeEvent<HTMLInputElement>) {
    const f = ev.target.files?.[0];
    if (!f) return;
    const doc: UserDocument = {
      id: "doc-pof-" + Date.now(),
      name: f.name,
      size: f.size,
      mediaType: f.type || "application/octet-stream",
      uploadedAt: new Date().toISOString(),
      uploadedBy: buyerName,
      docCategory: "Proof of Funds"
    };
    addEscrowDocument(escrowId, doc);
    addPortalNotification(escrowId, {
      type: "document",
      title: "Proof of funds received",
      body: buyerName + " uploaded " + f.name + ". Please verify.",
      from: buyerName
    });
    logAudit({
      who: buyerName,
      role: "Client",
      action: "Proof of funds uploaded",
      target: escrowId,
      detail: f.name + " (" + (f.size / 1024).toFixed(1) + " KB)"
    });
    showToast("Proof of funds uploaded — your officer has been notified");
    if (fileRef.current) fileRef.current.value = "";
  }

  /* -------- Sign disclosure packet -------- */

  function handleSignAll(signed: boolean[]) {
    const now = new Date().toISOString();
    const nowReadable = new Date().toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit"
    });

    let count = 0;
    let skipped = 0;
    PACKET_DOCS.forEach((docName, idx) => {
      if (!signed[idx]) return;
      // Skip docs that are already signed in a prior session — avoid duplicates
      if (alreadySigned.has(docName)) {
        skipped++;
        return;
      }
      count++;
      const slug = docName.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40);
      const uniq = Date.now() + "-" + idx;

      // 1. Save to escrow's documents list
      const doc: UserDocument = {
        id: "doc-sign-" + slug + "-" + uniq,
        name: docName + " - Signed.pdf",
        size: 0,
        mediaType: "application/pdf",
        uploadedAt: now,
        uploadedBy: buyerName,
        docCategory: "Disclosure",
        aiSummary: "Signed by " + buyerName + " on " + nowReadable + ".",
        extracted: {
          docType: "signed_disclosure",
          signedBy: buyerName,
          signedAt: now,
          documentName: docName
        }
      };
      addEscrowDocument(escrowId, doc);

      // 2. Save as a completed e-signature envelope (for the Signatures page)
      addEnvelope({
        id: "env-portal-" + slug + "-" + uniq,
        escrowId,
        document: docName,
        status: "completed",
        sentAt: now,
        completedAt: now,
        signers: [{ name: buyerName, email: "client@portal", status: "signed" }]
      });

      // 3. Append to audit log
      logAudit({
        who: buyerName,
        role: "Client",
        action: "Document signed",
        target: escrowId,
        detail: docName + " (via portal)"
      });
    });

    refreshSigned();

    if (count === 0) {
      // Nothing new — user resubmitted already-signed only
      setModal(null);
      showToast(skipped > 0 ? "Nothing new to sign — already signed" : "No documents selected", "info");
      return;
    }

    const totalSignedNow = count + skipped;
    addPortalNotification(escrowId, {
      type: "action_required",
      title: totalSignedNow === PACKET_DOCS.length ? "Disclosure packet signed" : "Signatures received",
      body:
        buyerName + " signed " + count + " new disclosure document" + (count === 1 ? "" : "s") +
        " (" + totalSignedNow + " of " + PACKET_DOCS.length + " total). " +
        "Signed copies are in Documents and Signatures.",
      from: buyerName
    });
    setModal(null);
    showToast(
      totalSignedNow === PACKET_DOCS.length
        ? "All disclosures signed — saved to your escrow file"
        : count + " new disclosure" + (count === 1 ? "" : "s") + " signed (" + totalSignedNow + " of " + PACKET_DOCS.length + ")"
    );
  }

  /* -------- Message officer -------- */

  function handleSendMessage(body: string) {
    if (!body.trim()) return;
    sendMessage(escrowId, body.trim(), buyerName, "buyer");
    addPortalNotification(escrowId, {
      type: "message",
      title: "New message from " + buyerName,
      body: body.trim().slice(0, 140) + (body.length > 140 ? "..." : ""),
      from: buyerName
    });
    logAudit({
      who: buyerName,
      role: "Client",
      action: "Message sent",
      target: escrowId,
      detail: body.trim().slice(0, 80)
    });
    setModal(null);
    showToast("Message sent — your officer will reply soon");
  }

  return (
    <section className="mt-6">
      <p className="text-[13px] font-medium mb-3 text-ink-700">What&apos;s next for you</p>

      <input
        ref={fileRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png,.heic"
        className="hidden"
        onChange={handleUploadFile}
      />

      <ActionRow
        icon={<Upload size={16} />}
        label="Upload proof of funds"
        hint="Bank statement or wire confirmation · 2 minutes"
        primary
        onClick={handleUploadClick}
      />
      <ActionRow
        icon={<FileSignature size={16} />}
        label={allDone ? "Disclosure packet signed" : "Sign disclosure packet"}
        hint={
          allDone
            ? "All " + PACKET_DOCS.length + " signed - tap to review"
            : remaining.length + " of " + PACKET_DOCS.length + " documents waiting"
        }
        done={allDone}
        onClick={() => setModal("sign")}
      />
      <ActionRow
        icon={<MessageSquare size={16} />}
        label="Message your escrow officer"
        hint="Average reply · 12 minutes"
        onClick={() => setModal("message")}
      />

      {modal === "sign" && (
        <SignPacketModal
          docs={PACKET_DOCS}
          alreadySigned={alreadySigned}
          onClose={() => setModal(null)}
          onSubmit={handleSignAll}
        />
      )}
      {modal === "message" && (
        <MessageOfficerModal
          onClose={() => setModal(null)}
          onSend={handleSendMessage}
        />
      )}

      {toast && (
        <div
          className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 max-w-[90vw] rounded-lg px-4 py-3 text-[13px] font-medium shadow-lg"
          style={{
            background: toast.tone === "ok" ? "#0F6E56" : "var(--ink)",
            color: "#FAF6EE"
          }}
        >
          <CheckCircle2 size={14} className="inline -mt-0.5 mr-1.5" />
          {toast.message}
        </div>
      )}
    </section>
  );
}

/* -------- Action row -------- */

function ActionRow({
  icon,
  label,
  hint,
  primary,
  done,
  onClick
}: {
  icon: React.ReactNode;
  label: string;
  hint: string;
  primary?: boolean;
  done?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={
        "w-full flex items-center gap-3 rounded-lg px-4 py-3.5 mb-2 transition-colors " +
        (done
          ? "border border-emerald-200 bg-emerald-50 hover:bg-emerald-100"
          : primary
          ? "border border-hermes-500 bg-hermes-50 hover:bg-hermes-100"
          : "border border-cream-300 bg-white hover:bg-cream-50")
      }
    >
      <span
        className={
          "grid place-items-center w-9 h-9 rounded-md " +
          (done
            ? "text-emerald-700 bg-emerald-100"
            : primary
            ? "text-cream-50"
            : "text-ink-700 bg-cream-100")
        }
        style={!done && primary ? { background: "var(--hermes)" } : undefined}
      >
        {done ? <CheckCircle2 size={16} /> : icon}
      </span>
      <div className="flex-1 text-left">
        <p className="text-[13px] font-medium text-ink-800">{label}</p>
        <p className="text-[11px] text-ink-500 mt-0.5">{hint}</p>
      </div>
      <ArrowRight size={14} className="text-ink-400" />
    </button>
  );
}

/* -------- Sign packet modal -------- */

function SignPacketModal({
  docs,
  alreadySigned,
  onClose,
  onSubmit
}: {
  docs: string[];
  alreadySigned: Set<string>;
  onClose: () => void;
  onSubmit: (signed: boolean[]) => void;
}) {
  // Pre-check previously-signed docs; user can also toggle unsigned ones
  const [signed, setSigned] = React.useState<boolean[]>(() =>
    docs.map((d) => alreadySigned.has(d))
  );

  function toggle(i: number) {
    // Don't allow un-signing a doc that's already been signed in a prior session
    if (alreadySigned.has(docs[i])) return;
    setSigned((s) => {
      const next = [...s];
      next[i] = !next[i];
      return next;
    });
  }

  function signAll() {
    setSigned(docs.map(() => true));
  }

  const newlySignedCount = signed.filter((v, i) => v && !alreadySigned.has(docs[i])).length;
  const totalChecked = signed.filter(Boolean).length;
  const allDone = totalChecked === docs.length;
  const allWerePreviouslySigned = alreadySigned.size === docs.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-800/50 p-4">
      <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-lg bg-cream-50 p-5 shadow-2xl">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[16px] font-medium">Disclosure packet</h2>
          <button onClick={onClose} className="text-ink-400 hover:text-ink-800">
            <X size={18} />
          </button>
        </div>
        <p className="text-[12px] text-ink-500 mb-3">
          {allWerePreviouslySigned
            ? "You've already signed every document. Tap Cancel to close."
            : "Tap each remaining document to sign. Previously-signed items are locked."}
        </p>

        <ul className="rounded-md border border-cream-300 bg-white divide-y divide-cream-200 mb-3">
          {docs.map((d, i) => {
            const wasAlready = alreadySigned.has(d);
            const isChecked = signed[i];
            return (
              <li
                key={d}
                onClick={() => toggle(i)}
                className={
                  "flex items-center gap-3 px-3 py-3 " +
                  (wasAlready ? "cursor-default opacity-70" : "cursor-pointer hover:bg-cream-50")
                }
              >
                <button
                  aria-label={isChecked ? "Signed" : "Sign"}
                  disabled={wasAlready}
                  className={
                    "grid place-items-center w-6 h-6 rounded-full border-2 " +
                    (isChecked
                      ? "border-hermes-500 bg-hermes-500 text-cream-50"
                      : "border-cream-300 bg-white")
                  }
                >
                  {isChecked && <CheckCircle2 size={14} />}
                </button>
                <p
                  className={
                    "flex-1 text-[13px] " +
                    (isChecked ? "text-ink-500 line-through" : "text-ink-800")
                  }
                >
                  {d}
                </p>
                {wasAlready ? (
                  <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                    Already signed
                  </span>
                ) : !isChecked ? (
                  <FileSignature size={13} className="text-ink-400" />
                ) : null}
              </li>
            );
          })}
        </ul>

        <div className="flex items-center justify-between gap-2">
          {!allWerePreviouslySigned ? (
            <button
              onClick={signAll}
              className="text-[12px] text-hermes-500 hover:underline"
            >
              Sign all remaining
            </button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="h-9 px-3 rounded-md border border-cream-300 bg-white text-[13px]"
            >
              {allWerePreviouslySigned ? "Close" : "Cancel"}
            </button>
            {!allWerePreviouslySigned && (
              <button
                onClick={() => onSubmit(signed)}
                disabled={newlySignedCount === 0}
                className={
                  "h-9 px-3 rounded-md text-[13px] font-medium text-cream-50 " +
                  (newlySignedCount === 0 ? "opacity-50 cursor-not-allowed" : "")
                }
                style={{ background: "var(--hermes)" }}
              >
                {allDone
                  ? "Submit " + newlySignedCount + " new"
                  : "Submit " + newlySignedCount + " signed"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------- Message officer modal -------- */

function MessageOfficerModal({
  onClose,
  onSend
}: {
  onClose: () => void;
  onSend: (body: string) => void;
}) {
  const [text, setText] = React.useState("");
  const [sending, setSending] = React.useState(false);

  function submit() {
    if (!text.trim()) return;
    setSending(true);
    onSend(text);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-800/50 p-4">
      <div className="w-full max-w-md rounded-lg bg-cream-50 p-5 shadow-2xl">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[16px] font-medium">Message your escrow officer</h2>
          <button onClick={onClose} className="text-ink-400 hover:text-ink-800">
            <X size={18} />
          </button>
        </div>
        <p className="text-[12px] text-ink-500 mb-3">
          Your message goes straight to Jin Yu. Replies typically within 12 minutes.
        </p>
        <textarea
          autoFocus
          value={text}
          onChange={(ev) => setText(ev.target.value)}
          placeholder="What would you like to ask?"
          rows={5}
          className="w-full px-3 py-2 rounded-md border border-cream-300 bg-white text-[14px] resize-y"
        />
        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={onClose}
            className="h-9 px-3 rounded-md border border-cream-300 bg-white text-[13px]"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={!text.trim() || sending}
            className={
              "h-9 px-3 rounded-md text-[13px] font-medium text-cream-50 inline-flex items-center gap-1.5 " +
              (!text.trim() || sending ? "opacity-50 cursor-not-allowed" : "")
            }
            style={{ background: "var(--hermes)" }}
          >
            {sending ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
