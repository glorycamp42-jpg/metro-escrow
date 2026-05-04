"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowLeft, FileDown, Mail, Printer, Plus, Upload, MessageSquare,
  RefreshCw, AlertTriangle, ShieldAlert, ShieldCheck, Phone, Mail as MailIcon,
  StickyNote, MessageCircle, CheckCircle2, Circle, Sparkles
} from "lucide-react";
import { WirePanel } from "@/components/wire/WirePanel";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  daysUntil, fmtMoney, STATUS_META, STAGE_META,
  type Escrow, type Task, type CommLog
} from "@/lib/data/mock";

type TabKey =
  | "overview" | "parties" | "documents" | "trust"
  | "tasks" | "wire" | "comms" | "timeline";

const TABS: { key: TabKey; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "parties", label: "Parties" },
  { key: "tasks", label: "Tasks" },
  { key: "documents", label: "Documents" },
  { key: "trust", label: "Trust & statement" },
  { key: "wire", label: "Wire instructions" },
  { key: "comms", label: "Comms log" },
  { key: "timeline", label: "Timeline" }
];

export function TransactionDetail({ escrow: e }: { escrow: Escrow }) {
  const [tab, setTab] = React.useState<TabKey>("overview");
  const meta = STATUS_META[e.status];
  const stage = STAGE_META[e.stage];

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <Link
          href="/transactions"
          className="text-ink-500 hover:text-ink-800 inline-flex items-center gap-1.5 text-[13px]"
        >
          <ArrowLeft size={15} /> All transactions
        </Link>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm">
            <FileDown size={13} /> File
          </Button>
          <Button variant="secondary" size="sm">
            <Printer size={13} /> Print
          </Button>
          <Button variant="secondary" size="sm">
            <Mail size={13} /> Email
          </Button>
        </div>
      </div>

      <header>
        <div className="flex items-center gap-2 mb-2">
          <Badge bg={meta.bg} fg={meta.fg}>
            {meta.label}
          </Badge>
          <Badge bg="#FAF6EE" fg={stage.color}>
            Stage · {stage.label}
          </Badge>
          {e.risks.length > 0 && (
            <Badge bg="#FCEBEB" fg="#A32D2D">
              {e.risks.length} risk flag{e.risks.length > 1 ? "s" : ""}
            </Badge>
          )}
        </div>
        <h1 className="text-[28px] font-medium tracking-tighter2">
          {e.property.address}
        </h1>
        <p className="text-[14px] text-ink-500 mt-1">
          {e.id} · {e.property.city}, {e.property.state} {e.property.zip} ·{" "}
          {e.type}
          {e.property.apn && (
            <span className="text-ink-400"> · APN {e.property.apn}</span>
          )}
        </p>
      </header>

      <CriticalDateStrip e={e} />

      <nav className="flex gap-1 border-b border-cream-300 overflow-x-auto no-scrollbar">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={
              "px-4 py-2.5 text-[13px] font-medium border-b-2 -mb-px transition-colors whitespace-nowrap " +
              (tab === t.key
                ? "border-hermes-500 text-ink-800"
                : "border-transparent text-ink-400 hover:text-ink-700")
            }
          >
            {t.label}
          </button>
        ))}
      </nav>

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-4">
          {tab === "overview" && <OverviewTab e={e} />}
          {tab === "parties" && <PartiesTab e={e} />}
          {tab === "tasks" && <TasksTab e={e} />}
          {tab === "documents" && <DocumentsTab />}
          {tab === "trust" && <TrustTab e={e} />}
          {tab === "wire" && <WirePanel escrowId={e.id} initial={e.wire} />}
          {tab === "comms" && <CommsTab e={e} />}
          {tab === "timeline" && <TimelineTab e={e} />}
        </div>

        <aside className="col-span-12 lg:col-span-4 flex flex-col gap-4">
          {e.risks.length > 0 && (
            <Card className="p-4">
              <p className="text-[13px] font-medium text-red-700 mb-2">
                <AlertTriangle size={13} className="inline -mt-0.5 mr-1" />
                AI risk flags
              </p>
              <ul className="space-y-2">
                {e.risks.map((r) => (
                  <li
                    key={r.id}
                    className="rounded-md border border-red-200 bg-red-50 px-3 py-2.5"
                  >
                    <p className="text-[13px] font-medium text-ink-800">
                      {r.message}
                    </p>
                    <p className="text-[11px] text-ink-500 mt-0.5">
                      {r.severity.toUpperCase()} ·{" "}
                      {new Date(r.detectedAt).toLocaleDateString("en-US")}
                    </p>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          <Card className="p-4">
            <p className="text-[13px] font-medium mb-3">Quick actions</p>
            <div className="flex flex-col gap-2">
              <Button variant="secondary" className="justify-start">
                <Plus size={13} /> Add party
              </Button>
              <Button variant="secondary" className="justify-start">
                <Upload size={13} /> Upload document
              </Button>
              <Button variant="secondary" className="justify-start">
                <MessageSquare size={13} /> Send message
              </Button>
              <Button variant="secondary" className="justify-start">
                <RefreshCw size={13} /> Update status
              </Button>
            </div>
          </Card>

          <div
            className="rounded-lg p-4 text-cream-50"
            style={{ background: "var(--hermes)" }}
          >
            <p
              className="text-[12px]"
              style={{ color: "var(--hermes-soft)" }}
            >
              Client portal
            </p>
            <p className="text-[15px] font-medium mt-0.5">
              Step {e.step} of 8
            </p>
            <Link
              href={`/portal/${e.portalToken}`}
              target="_blank"
              className="text-[12px] inline-flex items-center mt-2"
              style={{ color: "var(--hermes-soft)" }}
            >
              Preview client view →
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}

/* -------- Critical date strip -------- */

function CriticalDateStrip({ e }: { e: Escrow }) {
  const items: { label: string; iso?: string }[] = [
    { label: "Contract", iso: e.critical.contractAccepted },
    { label: "EMD due", iso: e.critical.emdDue },
    { label: "Inspection cont.", iso: e.critical.inspectionContingency },
    { label: "Loan cont.", iso: e.critical.loanContingency },
    { label: "CD delivered", iso: e.critical.cdDelivered },
    { label: "Signing", iso: e.critical.signing },
    { label: "Funding", iso: e.critical.funding },
    { label: "Recording", iso: e.critical.recording },
    { label: "Closing", iso: e.critical.closing }
  ];
  return (
    <Card className="p-4 overflow-x-auto no-scrollbar">
      <p className="text-[12px] font-medium text-ink-400 uppercase tracking-tightish mb-2">
        Critical dates
      </p>
      <div className="flex gap-3 min-w-max">
        {items.map((it, i) => {
          const days = daysUntil(it.iso);
          const tone =
            days === null
              ? "text-ink-400"
              : days < 0
              ? "text-ink-400"
              : days <= 3
              ? "text-red-600"
              : days <= 7
              ? "text-hermes-600"
              : "text-ink-700";
          return (
            <div
              key={i}
              className="min-w-[120px] flex flex-col gap-0.5 pr-3 border-r border-cream-200 last:border-0"
            >
              <p className="text-[11px] text-ink-400">{it.label}</p>
              <p className="text-[14px] font-medium text-ink-800">
                {it.iso
                  ? new Date(it.iso).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric"
                    })
                  : "—"}
              </p>
              <p className={"text-[11px] " + tone}>
                {days === null
                  ? "Not set"
                  : days < 0
                  ? `${Math.abs(days)}d ago`
                  : days === 0
                  ? "Today"
                  : `in ${days}d`}
              </p>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

/* -------- Tabs -------- */

function OverviewTab({ e }: { e: Escrow }) {
  return (
    <Card className="p-5">
      <p className="text-[14px] font-medium mb-3">Transaction information</p>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-[14px]">
        <Info label="Transaction number" value={e.id} />
        <Info label="Officer" value={e.officer} />
        <Info label="Type" value={e.type} />
        <Info label="Stage" value={STAGE_META[e.stage].label} />
        <Info label="Purchase price" value={fmtMoney(e.price)} />
        <Info label="Loan amount" value={fmtMoney(e.settlement.loanAmount)} />
        <Info
          label="EMD"
          value={fmtMoney(e.settlement.emd)}
        />
        <Info
          label="Closing date"
          value={new Date(e.closingDate).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric"
          })}
        />
        <Info
          label="Opened"
          value={new Date(e.openedAt).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric"
          })}
        />
        <Info
          label="Days in escrow"
          value={`${Math.max(
            0,
            Math.round(
              (Date.now() - new Date(e.openedAt).getTime()) /
                (1000 * 60 * 60 * 24)
            )
          )} days`}
        />
      </dl>
    </Card>
  );
}

function PartiesTab({ e }: { e: Escrow }) {
  const groups: Array<{ title: string; roles: string[] }> = [
    { title: "Buyer side", roles: ["buyer", "buyer_agent"] },
    { title: "Seller side", roles: ["seller", "seller_agent"] },
    { title: "Lender", roles: ["lender"] },
    { title: "Title & escrow", roles: ["title"] },
    { title: "HOA / tax", roles: ["hoa", "tax"] }
  ];
  return (
    <div className="flex flex-col gap-4">
      {groups.map((g) => {
        const rows = e.parties.filter((p) => g.roles.includes(p.role));
        return (
          <Card key={g.title} className="p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[14px] font-medium">{g.title}</p>
              <Button variant="ghost" size="sm">
                <Plus size={13} /> Add
              </Button>
            </div>
            {rows.length === 0 ? (
              <p className="text-[13px] text-ink-400">No parties on this side yet.</p>
            ) : (
              <ul className="divide-y divide-cream-200">
                {rows.map((p) => (
                  <li
                    key={p.id}
                    className="flex items-center gap-3 py-2.5"
                  >
                    <div
                      className="grid place-items-center w-9 h-9 rounded-full text-cream-50 text-[12px] font-medium"
                      style={{ background: "var(--hermes)" }}
                    >
                      {p.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-medium">{p.name}</p>
                      <p className="text-[11px] text-ink-400">
                        {p.role.replace("_", " ")}
                        {p.company && ` · ${p.company}`}
                      </p>
                    </div>
                    <a
                      href={`mailto:${p.email}`}
                      className="text-[12px] text-hermes-500 hover:underline"
                    >
                      {p.email}
                    </a>
                    {p.phone && (
                      <span className="text-[12px] text-ink-500 ml-3">
                        {p.phone}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </Card>
        );
      })}
    </div>
  );
}

function TasksTab({ e }: { e: Escrow }) {
  const [tasks, setTasks] = React.useState<Task[]>(e.tasks);
  function toggle(id: string) {
    setTasks((curr) =>
      curr.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );
  }
  const groups: { key: Task["category"]; label: string }[] = [
    { key: "opening", label: "Opening" },
    { key: "contingency", label: "Contingencies" },
    { key: "closing", label: "Closing" },
    { key: "post", label: "Post-closing" }
  ];
  const total = tasks.length;
  const done = tasks.filter((t) => t.done).length;
  return (
    <div className="flex flex-col gap-4">
      <Card className="p-4 flex items-center gap-4">
        <div>
          <p className="text-[12px] text-ink-400">Completion</p>
          <p className="text-[20px] font-medium tracking-tighter2">
            {done} / {total}
          </p>
        </div>
        <div className="flex-1 h-2 bg-cream-200 rounded-full overflow-hidden">
          <div
            className="h-full"
            style={{
              width: `${(done / total) * 100}%`,
              background: "var(--hermes)"
            }}
          />
        </div>
        <Button variant="ink" size="sm">
          <Sparkles size={13} /> AI: complete eligible
        </Button>
      </Card>
      {groups.map((g) => {
        const rows = tasks.filter((t) => t.category === g.key);
        if (rows.length === 0) return null;
        return (
          <Card key={g.key} className="p-5">
            <p className="text-[14px] font-medium mb-3">{g.label}</p>
            <ul className="divide-y divide-cream-200">
              {rows.map((t) => (
                <li
                  key={t.id}
                  className="flex items-start gap-3 py-2.5"
                >
                  <button
                    onClick={() => toggle(t.id)}
                    className="mt-0.5 shrink-0"
                    aria-label="Toggle task"
                  >
                    {t.done ? (
                      <CheckCircle2 size={18} className="text-hermes-500" />
                    ) : (
                      <Circle size={18} className="text-ink-400" />
                    )}
                  </button>
                  <div className="flex-1">
                    <p
                      className={
                        "text-[14px] " +
                        (t.done
                          ? "text-ink-400 line-through"
                          : "text-ink-800")
                      }
                    >
                      {t.label}
                    </p>
                    <p className="text-[11px] text-ink-400 mt-0.5">
                      Owner: {t.owner}
                      {t.due && ` · due ${new Date(t.due).toLocaleDateString("en-US")}`}
                    </p>
                  </div>
                  {t.owner === "ai" && (
                    <Badge bg="var(--hermes-soft)" fg="var(--hermes)">
                      AI
                    </Badge>
                  )}
                </li>
              ))}
            </ul>
          </Card>
        );
      })}
    </div>
  );
}

function DocumentsTab() {
  const docs = [
    { name: "Purchase Agreement.pdf", type: "Contract", who: "John Buyer", date: "Apr 9", status: "Signed" },
    { name: "Home Inspection Report.pdf", type: "Inspection", who: "Inspector", date: "Apr 11", status: "AI summarized" },
    { name: "Appraisal Report.pdf", type: "Appraisal", who: "Appraiser", date: "Apr 14", status: "Uploaded" },
    { name: "Preliminary Title Report.pdf", type: "Title", who: "California Title Co.", date: "Apr 17", status: "Reviewed" },
    { name: "Escrow Instructions.pdf", type: "Instructions", who: "Metro Escrow", date: "Apr 3", status: "Signed" },
    { name: "Statement of Information (Buyer).pdf", type: "SI", who: "John Buyer", date: "Apr 9", status: "Signed" },
    { name: "FIRPTA Certification.pdf", type: "FIRPTA", who: "Jane Seller", date: "Apr 12", status: "Signed" }
  ];
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[14px] font-medium">Documents · {docs.length}</p>
        <Button variant="primary" size="sm">
          <Upload size={13} /> Upload
        </Button>
      </div>
      <ul className="divide-y divide-cream-200">
        {docs.map((d) => (
          <li
            key={d.name}
            className="flex items-center gap-3 py-3"
          >
            <div className="grid place-items-center w-10 h-10 rounded-md bg-cream-100 text-ink-700 text-[14px] font-medium">
              {d.type.slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-medium truncate">{d.name}</p>
              <p className="text-[11px] text-ink-400">
                {d.type} · {d.who} · {d.date}
              </p>
            </div>
            <span
              className="text-[11px] px-2 py-0.5 rounded-full font-medium"
              style={{
                background:
                  d.status === "Signed"
                    ? "#E1F5EE"
                    : d.status === "AI summarized"
                    ? "var(--hermes-soft)"
                    : "#F2EBDA",
                color:
                  d.status === "Signed"
                    ? "#0F6E56"
                    : d.status === "AI summarized"
                    ? "var(--hermes)"
                    : "#6B5640"
              }}
            >
              {d.status}
            </span>
          </li>
        ))}
      </ul>
    </Card>
  );
}

function TrustTab({ e }: { e: Escrow }) {
  const buyerFees = e.settlement.fees.filter(
    (f) => f.side === "buyer" || f.side === "split"
  );
  const sellerFees = e.settlement.fees.filter(
    (f) => f.side === "seller" || f.side === "split"
  );
  const buyerTotal = buyerFees.reduce(
    (s, f) => s + (f.side === "split" ? f.amount / 2 : f.amount),
    0
  );
  const sellerTotal = sellerFees.reduce(
    (s, f) => s + (f.side === "split" ? f.amount / 2 : f.amount),
    0
  );
  return (
    <div className="flex flex-col gap-4">
      <Card className="p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-[14px] font-medium">Estimated settlement statement</p>
            <p className="text-[12px] text-ink-400">CFPB Closing Disclosure preview · for review only</p>
          </div>
          <Button variant="secondary" size="sm">
            <FileDown size={13} /> Export PDF
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <SettlementSide
            title="Buyer side"
            rows={[
              ["Sale price", e.settlement.salePrice],
              ["Loan amount", -e.settlement.loanAmount],
              ["EMD applied", -e.settlement.emd],
              ["Buyer credits", -e.settlement.buyerCredits],
              ...buyerFees.map(
                (f) =>
                  [
                    `${f.label}${f.side === "split" ? " (½)" : ""}`,
                    f.side === "split" ? f.amount / 2 : f.amount
                  ] as [string, number]
              ),
              ["Cash to close", e.settlement.buyerCash]
            ]}
            highlight="Cash to close"
          />
          <SettlementSide
            title="Seller side"
            rows={[
              ["Sale price", e.settlement.salePrice],
              ["Existing mortgage payoff", -Math.round(e.settlement.salePrice * 0.55)],
              ["Seller credits", -e.settlement.sellerCredits],
              ...sellerFees.map(
                (f) =>
                  [
                    `${f.label}${f.side === "split" ? " (½)" : ""}`,
                    -(f.side === "split" ? f.amount / 2 : f.amount)
                  ] as [string, number]
              ),
              ["Net proceeds", e.settlement.sellerProceeds]
            ]}
            highlight="Net proceeds"
          />
        </div>
      </Card>
      <Card className="p-5">
        <p className="text-[14px] font-medium mb-2">Trust account ledger</p>
        <p className="text-[12px] text-ink-400 mb-3">
          Three-way reconciliation due before any disbursement (CA DRE / DBO requirement).
        </p>
        <div className="grid grid-cols-3 gap-3 text-[14px]">
          <Stat label="Receipts" value={fmtMoney(e.settlement.emd)} tone="ok" />
          <Stat label="Disbursed" value="$0" tone="muted" />
          <Stat label="Balance" value={fmtMoney(e.settlement.emd)} tone="ok" />
        </div>
      </Card>
    </div>
  );
}

function SettlementSide({
  title,
  rows,
  highlight
}: {
  title: string;
  rows: [string, number][];
  highlight: string;
}) {
  return (
    <div className="border border-cream-200 rounded-lg overflow-hidden">
      <p className="px-4 py-2.5 text-[12px] font-medium text-ink-600 bg-cream-50 border-b border-cream-200">
        {title}
      </p>
      <table className="w-full text-[13px]">
        <tbody>
          {rows.map(([label, amount], i) => {
            const isHighlight = label === highlight;
            return (
              <tr
                key={i}
                className={
                  "border-b border-cream-100 last:border-0 " +
                  (isHighlight ? "bg-hermes-50 font-medium" : "")
                }
              >
                <td className="px-4 py-2 text-ink-700">{label}</td>
                <td className="px-4 py-2 text-right tabular-nums">
                  {amount < 0 ? "−" : ""}
                  {fmtMoney(Math.abs(amount))}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function Stat({
  label,
  value,
  tone
}: {
  label: string;
  value: string;
  tone: "ok" | "warn" | "muted";
}) {
  const colors = { ok: "#0F6E56", warn: "#A32D2D", muted: "#6B5640" };
  return (
    <div className="bg-cream-50 rounded-md p-3 border border-cream-200">
      <p className="text-[11px] text-ink-400">{label}</p>
      <p
        className="text-[18px] font-medium tracking-tighter2"
        style={{ color: colors[tone] }}
      >
        {value}
      </p>
    </div>
  );
}

function WireTab({ e }: { e: Escrow }) {
  const verified = e.wire.callbackVerified;
  const risk = e.wire.riskScore;
  return (
    <div className="flex flex-col gap-4">
      <div
        className={
          "rounded-lg p-5 border " +
          (verified
            ? "bg-emerald-50 border-emerald-200"
            : "bg-red-50 border-red-200")
        }
      >
        <div className="flex items-start gap-3">
          {verified ? (
            <ShieldCheck className="text-emerald-700 mt-0.5" size={22} />
          ) : (
            <ShieldAlert className="text-red-700 mt-0.5" size={22} />
          )}
          <div className="flex-1">
            <p
              className={
                "text-[15px] font-medium " +
                (verified ? "text-emerald-800" : "text-red-800")
              }
            >
              {verified
                ? "Wire instructions verified by callback"
                : "WIRE INSTRUCTIONS NOT VERIFIED — DO NOT FUND"}
            </p>
            <p
              className={
                "text-[12px] mt-1 " +
                (verified ? "text-emerald-700" : "text-red-700")
              }
            >
              {verified
                ? `Verified by ${e.wire.verifiedBy} on ${
                    e.wire.verifiedAt
                      ? new Date(e.wire.verifiedAt).toLocaleString("en-US")
                      : "—"
                  }. Risk score ${risk}/100.`
                : `Risk score ${risk}/100. Call the lender directly using a number from your records — never the one on the email.`}
            </p>
          </div>
          {!verified && (
            <Button variant="primary" size="sm">
              <Phone size={13} /> Verify by callback
            </Button>
          )}
        </div>
      </div>

      <Card className="p-5">
        <p className="text-[14px] font-medium mb-3">Beneficiary bank</p>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-[14px]">
          <Info label="Bank" value={e.wire.bank} />
          <Info label="Beneficiary" value={e.wire.beneficiary} />
          <Info label="Routing (ABA)" value={e.wire.routing} />
          <Info label="Account" value={`••••${e.wire.accountLast4}`} />
        </dl>
      </Card>

      <Card className="p-4">
        <p className="text-[12px] font-medium text-ink-500 mb-1">
          Anti-fraud reminders
        </p>
        <ul className="text-[13px] text-ink-700 list-disc pl-5 space-y-1">
          <li>Always verify by callback to a known number — never trust an inbound email or fax.</li>
          <li>Never accept last-minute changes to wire instructions without re-verifying.</li>
          <li>Send wire-fraud warnings to all parties at file open.</li>
          <li>Use Plaid or bank-to-bank verification when available.</li>
        </ul>
      </Card>
    </div>
  );
}

function CommsTab({ e }: { e: Escrow }) {
  const [comms, setComms] = React.useState<CommLog[]>(e.comms);
  const [body, setBody] = React.useState("");
  function add(channel: CommLog["channel"]) {
    if (!body.trim()) return;
    setComms((c) => [
      {
        id: Math.random().toString(36).slice(2, 9),
        channel,
        who: "Jin Yu",
        body: body.trim(),
        at: new Date().toISOString()
      },
      ...c
    ]);
    setBody("");
  }
  return (
    <div className="flex flex-col gap-4">
      <Card className="p-4">
        <p className="text-[14px] font-medium mb-2">Log a new entry</p>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={2}
          placeholder="Spoke with buyer — confirmed wire send Friday"
          className="w-full text-[14px] rounded-md border border-cream-300 p-3 resize-none focus:outline-none focus:ring-2 focus:ring-hermes-500/30"
        />
        <div className="flex gap-2 mt-2">
          <Button size="sm" variant="secondary" onClick={() => add("phone")}>
            <Phone size={13} /> Phone
          </Button>
          <Button size="sm" variant="secondary" onClick={() => add("email")}>
            <MailIcon size={13} /> Email
          </Button>
          <Button size="sm" variant="secondary" onClick={() => add("sms")}>
            <MessageCircle size={13} /> SMS
          </Button>
          <Button size="sm" variant="secondary" onClick={() => add("note")}>
            <StickyNote size={13} /> Note
          </Button>
        </div>
      </Card>
      <Card className="p-0 overflow-hidden">
        <ul>
          {comms.length === 0 && (
            <p className="text-[13px] text-ink-400 px-5 py-6 text-center">
              No communications logged yet.
            </p>
          )}
          {comms.map((c) => {
            const Icon = c.channel === "phone" ? Phone : c.channel === "email" ? MailIcon : c.channel === "sms" ? MessageCircle : StickyNote;
            return (
              <li
                key={c.id}
                className="px-5 py-3.5 border-b border-cream-200 last:border-0 flex items-start gap-3"
              >
                <Icon size={15} className="text-ink-400 mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] text-ink-800 leading-relaxed">{c.body}</p>
                  <p className="text-[11px] text-ink-400 mt-1">
                    {c.who} · {new Date(c.at).toLocaleString("en-US")}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      </Card>
    </div>
  );
}

function TimelineTab({ e }: { e: Escrow }) {
  return (
    <Card className="p-5">
      <p className="text-[14px] font-medium mb-3">Milestones</p>
      <ol className="space-y-3.5">
        {e.milestones.length === 0 ? (
          <p className="text-[13px] text-ink-400">
            Milestones populate when escrow opens.
          </p>
        ) : (
          e.milestones.map((m) => (
            <li key={m.id} className="flex items-start gap-3">
              <span
                className="w-2.5 h-2.5 rounded-full mt-1.5 shrink-0"
                style={{ background: m.done ? "var(--hermes)" : "#D2C5A8" }}
              />
              <div>
                <p className="text-[14px] font-medium">{m.label}</p>
                <p className="text-[12px] text-ink-400">
                  {new Date(m.due).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric"
                  })}
                </p>
              </div>
            </li>
          ))
        )}
      </ol>
    </Card>
  );
}


function Info({ label, value }: { label: string; value: string }) {
  return (
    <>
      <dt className="text-[12px] text-ink-400">{label}</dt>
      <dd className="text-[14px] font-medium">{value}</dd>
    </>
  );
}
