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
    showToast("Proof of funds uploaded — your officer has been notified");
    if (fileRef.current) fileRef.current.value = "";
  }

  /* -------- Sign disclosure packet -------- */

  function handleSignAll(signed: boolean[]) {
    const count = signed.filter(Boolean).length;
    addPortalNotification(escrowId, {
      type: "action_required",
      title: count === PACKET_DOCS.length ? "Disclosure packet signed" : "Partial signatures received",
      body:
        buyerName + " signed " + count + " of " + PACKET_DOCS.length + " disclosure documents.",
      from: buyerName
    });
    setModal(null);
    showToast(
      count === PACKET_DOCS.length
        ? "All disclosures signed — your officer has been notified"
        : count + " of " + PACKET_DOCS.length + " signed"
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
        label="Sign disclosure packet"
        hint={PACKET_DOCS.length + " documents waiting"}
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
  onClick
}: {
  icon: React.ReactNode;
  label: string;
  hint: string;
  primary?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={
        "w-full flex items-center gap-3 rounded-lg px-4 py-3.5 mb-2 transition-colors " +
        (primary
          ? "border border-hermes-500 bg-hermes-50 hover:bg-hermes-100"
          : "border border-cream-300 bg-white hover:bg-cream-50")
      }
    >
      <span
        className={
          "grid place-items-center w-9 h-9 rounded-md " +
          (primary ? "text-cream-50" : "text-ink-700 bg-cream-100")
        }
        style={primary ? { background: "var(--hermes)" } : undefined}
      >
        {icon}
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
  onClose,
  onSubmit
}: {
  docs: string[];
  onClose: () => void;
  onSubmit: (signed: boolean[]) => void;
}) {
  const [signed, setSigned] = React.useState<boolean[]>(() => docs.map(() => false));

  function toggle(i: number) {
    setSigned((s) => {
      const next = [...s];
      next[i] = !next[i];
      return next;
    });
  }

  function signAll() {
    setSigned(docs.map(() => true));
  }

  const signedCount = signed.filter(Boolean).length;
  const allSigned = signedCount === docs.length;

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
          Tap each document to sign. In production this opens the real e-sign envelope.
        </p>

        <ul className="rounded-md border border-cream-300 bg-white divide-y divide-cream-200 mb-3">
          {docs.map((d, i) => (
            <li
              key={d}
              onClick={() => toggle(i)}
              className="flex items-center gap-3 px-3 py-3 cursor-pointer hover:bg-cream-50"
            >
              <button
                aria-label={signed[i] ? "Unsign" : "Sign"}
                className={
                  "grid place-items-center w-6 h-6 rounded-full border-2 " +
                  (signed[i]
                    ? "border-hermes-500 bg-hermes-500 text-cream-50"
                    : "border-cream-300 bg-white")
                }
              >
                {signed[i] && <CheckCircle2 size={14} />}
              </button>
              <p className={"flex-1 text-[13px] " + (signed[i] ? "text-ink-500 line-through" : "text-ink-800")}>
                {d}
              </p>
              {!signed[i] && (
                <FileSignature size={13} className="text-ink-400" />
              )}
            </li>
          ))}
        </ul>

        <div className="flex items-center justify-between gap-2">
          <button
            onClick={signAll}
            className="text-[12px] text-hermes-500 hover:underline"
          >
            Sign all at once
          </button>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="h-9 px-3 rounded-md border border-cream-300 bg-white text-[13px]"
            >
              Cancel
            </button>
            <button
              onClick={() => onSubmit(signed)}
              disabled={signedCount === 0}
              className={
                "h-9 px-3 rounded-md text-[13px] font-medium text-cream-50 " +
                (signedCount === 0 ? "opacity-50 cursor-not-allowed" : "")
              }
              style={{ background: "var(--hermes)" }}
            >
              {allSigned ? "Submit all signed" : "Submit " + signedCount + " signed"}
            </button>
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
