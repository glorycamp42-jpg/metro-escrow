"use client";

import * as React from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Mail, MessageCircle, Bell, CheckCircle2, Sparkles, X, Trash2 } from "lucide-react";
import { logAudit } from "@/lib/data/audit";
import {
  readReminderState, writeReminderState,
  readCustomRules, addCustomRule, toggleCustomRule, deleteCustomRule,
  TRIGGER_LABEL, AUDIENCE_LABEL,
  type CustomRule, type CustomRuleTrigger
} from "@/lib/data/reminders";
import { useToast } from "@/components/ui/Toast";

type Rule = {
  id: string;
  name: string;
  trigger: string;
  channel: ("email" | "sms")[];
  audience: string;
  enabled: boolean;
};

const DEFAULTS: Rule[] = [
  { id: "r-1", name: "Closing D-3 reminder", trigger: "3 calendar days before closing date", channel: ["email", "sms"], audience: "Buyer + Seller", enabled: true },
  { id: "r-2", name: "Signing reminder", trigger: "24 hours before signing appointment", channel: ["sms"], audience: "Signing party", enabled: true },
  { id: "r-3", name: "Wire instructions warning", trigger: "On file open", channel: ["email"], audience: "All parties", enabled: true },
  { id: "r-4", name: "Document waiting", trigger: "Document unsigned for 48 hours", channel: ["email"], audience: "Pending signer", enabled: true },
  { id: "r-5", name: "Loan contingency D-2", trigger: "2 calendar days before loan contingency expires", channel: ["email"], audience: "Buyer + Buyer agent", enabled: false },
  { id: "r-6", name: "Funding confirmation", trigger: "Wire received from lender", channel: ["email", "sms"], audience: "All parties", enabled: true }
];

const SAMPLE_LOG = [
  { at: "2026-05-04T07:00:00Z", channel: "email", recipient: "john@example.com", subject: "Closing in 3 days - 123 Main St", status: "sent" },
  { at: "2026-05-04T07:00:00Z", channel: "sms", recipient: "(213) 555-0101", subject: "Reminder: closing 5/15 - 123 Main St", status: "sent" },
  { at: "2026-05-03T17:30:00Z", channel: "email", recipient: "acme@example.com", subject: "Signing tomorrow at 10:30am", status: "sent" },
  { at: "2026-05-02T09:00:00Z", channel: "email", recipient: "sarah@example.com", subject: "Closing disclosure ready for review", status: "delivered" },
  { at: "2026-05-01T08:00:00Z", channel: "email", recipient: "john@example.com", subject: "Wire fraud warning - read first", status: "opened" }
];

export default function RemindersPage() {
  const toast = useToast();
  const [rules, setRules] = React.useState<Rule[]>(DEFAULTS);
  const [custom, setCustom] = React.useState<CustomRule[]>([]);
  const [showModal, setShowModal] = React.useState(false);

  React.useEffect(() => {
    const saved = readReminderState();
    if (Object.keys(saved).length > 0) {
      setRules((rs) => rs.map((r) => (r.id in saved ? { ...r, enabled: saved[r.id] } : r)));
    }
    setCustom(readCustomRules());
  }, []);

  function toggle(id: string) {
    setRules((rs) => {
      const next = rs.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r));
      const just = next.find((r) => r.id === id);
      const state: Record<string, boolean> = {};
      for (const r of next) state[r.id] = r.enabled;
      writeReminderState(state);
      logAudit({
        who: "Jin Yu",
        role: "Officer",
        action: just?.enabled ? "Reminder rule enabled" : "Reminder rule disabled",
        target: "system",
        detail: just?.name ?? ""
      });
      toast.push((just?.name ?? "Rule") + " " + (just?.enabled ? "enabled" : "disabled"), "info");
      return next;
    });
  }

  function toggleCustom(id: string) {
    toggleCustomRule(id);
    const next = readCustomRules();
    setCustom(next);
    const just = next.find((r) => r.id === id);
    logAudit({
      who: "Jin Yu",
      role: "Officer",
      action: just?.enabled ? "Custom rule enabled" : "Custom rule disabled",
      target: "system",
      detail: just?.name ?? ""
    });
  }

  function removeCustom(id: string) {
    const target = custom.find((r) => r.id === id);
    deleteCustomRule(id);
    setCustom(readCustomRules());
    logAudit({
      who: "Jin Yu",
      role: "Officer",
      action: "Custom rule deleted",
      target: "system",
      detail: target?.name ?? ""
    });
    toast.push("Custom rule deleted", "info");
  }

  function handleSaveCustom(r: Omit<CustomRule, "id" | "createdAt" | "enabled">) {
    const created = addCustomRule(r);
    setCustom(readCustomRules());
    setShowModal(false);
    logAudit({
      who: "Jin Yu",
      role: "Officer",
      action: "Custom rule added",
      target: "system",
      detail: created.name
    });
    toast.push("Custom rule \"" + created.name + "\" created", "ok");
  }

  return (
    <div className="flex flex-col gap-5">
      <header className="flex items-end justify-between">
        <div>
          <h1 className="text-[28px] font-medium tracking-tighter2">Reminders</h1>
          <p className="text-[14px] text-ink-500 mt-1">
            Automated email + SMS rules. Disable anything that doesn&apos;t fit your office voice.
          </p>
        </div>
        <Button variant="ink" onClick={() => setShowModal(true)}>
          <Sparkles size={13} /> Draft a custom rule
        </Button>
      </header>

      <Card className="p-0 overflow-hidden">
        <div className="grid grid-cols-12 px-5 py-3 text-[11px] font-medium text-ink-400 uppercase tracking-tightish border-b border-cream-200">
          <div className="col-span-4">Rule</div>
          <div className="col-span-3">Trigger</div>
          <div className="col-span-2">Channel</div>
          <div className="col-span-2">Audience</div>
          <div className="col-span-1 text-right">On</div>
        </div>
        <ul>
          {rules.map((r) => (
            <li key={r.id} className="grid grid-cols-12 px-5 py-3 border-b border-cream-200 last:border-0 items-center">
              <div className="col-span-4 text-[14px] font-medium">{r.name}</div>
              <div className="col-span-3 text-[12px] text-ink-500">{r.trigger}</div>
              <div className="col-span-2 flex items-center gap-1.5 flex-wrap">
                {r.channel.includes("email") && (
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-cream-100 text-ink-700 inline-flex items-center gap-1">
                    <Mail size={11} /> Email
                  </span>
                )}
                {r.channel.includes("sms") && (
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-cream-100 text-ink-700 inline-flex items-center gap-1">
                    <MessageCircle size={11} /> SMS
                  </span>
                )}
              </div>
              <div className="col-span-2 text-[12px] text-ink-500">{r.audience}</div>
              <div className="col-span-1 text-right">
                <button
                  onClick={() => toggle(r.id)}
                  className={
                    "w-9 h-5 rounded-full transition-colors relative " +
                    (r.enabled ? "bg-hermes-500" : "bg-cream-300")
                  }
                  aria-label={"Toggle " + r.name}
                >
                  <span className={"absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all " + (r.enabled ? "left-[18px]" : "left-0.5")} />
                </button>
              </div>
            </li>
          ))}
          {custom.map((r) => (
            <li key={r.id} className="grid grid-cols-12 px-5 py-3 border-b border-cream-200 last:border-0 items-center bg-cream-50/50">
              <div className="col-span-4 text-[14px] font-medium flex items-center gap-2">
                {r.name}
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-hermes-50 text-hermes-500 font-medium uppercase tracking-tightish">
                  Custom
                </span>
              </div>
              <div className="col-span-3 text-[12px] text-ink-500">
                {r.days} {TRIGGER_LABEL[r.trigger]}
              </div>
              <div className="col-span-2 flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-cream-100 text-ink-700 inline-flex items-center gap-1">
                  {r.channel === "email" ? <Mail size={11} /> : <MessageCircle size={11} />}
                  {r.channel === "email" ? "Email" : "SMS"}
                </span>
              </div>
              <div className="col-span-2 text-[12px] text-ink-500">{AUDIENCE_LABEL[r.audience]}</div>
              <div className="col-span-1 text-right flex items-center justify-end gap-1.5">
                <button
                  onClick={() => removeCustom(r.id)}
                  className="text-ink-400 hover:text-red-700"
                  aria-label="Delete rule"
                  title="Delete"
                >
                  <Trash2 size={13} />
                </button>
                <button
                  onClick={() => toggleCustom(r.id)}
                  className={
                    "w-9 h-5 rounded-full transition-colors relative " +
                    (r.enabled ? "bg-hermes-500" : "bg-cream-300")
                  }
                  aria-label={"Toggle " + r.name}
                >
                  <span className={"absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all " + (r.enabled ? "left-[18px]" : "left-0.5")} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </Card>

      <Card className="p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[14px] font-medium">
            <Bell size={13} className="inline -mt-0.5 mr-1" />
            Recent sends
          </p>
          <p className="text-[12px] text-ink-400">last 24 hours</p>
        </div>
        <ul className="divide-y divide-cream-200">
          {SAMPLE_LOG.map((log, i) => (
            <li key={i} className="flex items-center gap-3 py-2.5">
              <div className="grid place-items-center w-8 h-8 rounded-md shrink-0" style={{ background: "var(--hermes-soft)", color: "var(--hermes)" }}>
                {log.channel === "email" ? <Mail size={14} /> : <MessageCircle size={14} />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium truncate">{log.subject}</p>
                <p className="text-[11px] text-ink-400 mt-0.5">
                  to {log.recipient} - {new Date(log.at).toLocaleString("en-US")}
                </p>
              </div>
              <span className="text-[11px] inline-flex items-center gap-1 text-emerald-700">
                <CheckCircle2 size={12} /> {log.status}
              </span>
            </li>
          ))}
        </ul>
      </Card>

      {showModal && (
        <CustomRuleModal onClose={() => setShowModal(false)} onSave={handleSaveCustom} />
      )}
    </div>
  );
}

function CustomRuleModal({
  onClose,
  onSave
}: {
  onClose: () => void;
  onSave: (r: Omit<CustomRule, "id" | "createdAt" | "enabled">) => void;
}) {
  const [name, setName] = React.useState("");
  const [trigger, setTrigger] = React.useState<CustomRuleTrigger>("days_before_close");
  const [days, setDays] = React.useState(3);
  const [channel, setChannel] = React.useState<"email" | "sms">("email");
  const [audience, setAudience] = React.useState<CustomRule["audience"]>("all");
  const [subject, setSubject] = React.useState("");
  const [body, setBody] = React.useState("");

  function submit() {
    if (!name.trim() || !subject.trim() || !body.trim()) return;
    onSave({
      name: name.trim(),
      trigger,
      days: Math.max(0, Number(days) || 0),
      channel,
      audience,
      subject: subject.trim(),
      body: body.trim()
    });
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-ink-800/40 p-4">
      <div className="w-full max-w-lg rounded-lg bg-cream-50 p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[16px] font-medium">New custom reminder rule</h2>
          <button onClick={onClose} className="text-ink-400 hover:text-ink-800" aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <div className="flex flex-col gap-3 text-[13px]">
          <label className="flex flex-col gap-1">
            <span className="text-ink-500">Rule name</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Pre-signing nudge"
              className="h-9 px-2 rounded-md border border-cream-300 bg-white"
            />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1">
              <span className="text-ink-500">Trigger</span>
              <select
                value={trigger}
                onChange={(e) => setTrigger(e.target.value as CustomRuleTrigger)}
                className="h-9 px-2 rounded-md border border-cream-300 bg-white"
              >
                <option value="days_before_close">Days before close</option>
                <option value="days_before_emd">Days before EMD due</option>
                <option value="days_before_contingency">Days before contingency</option>
                <option value="days_after_open">Days after file open</option>
              </select>
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-ink-500">Days</span>
              <input
                type="number"
                min={0}
                value={days}
                onChange={(e) => setDays(parseInt(e.target.value, 10) || 0)}
                className="h-9 px-2 rounded-md border border-cream-300 bg-white"
              />
            </label>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1">
              <span className="text-ink-500">Channel</span>
              <select
                value={channel}
                onChange={(e) => setChannel(e.target.value as "email" | "sms")}
                className="h-9 px-2 rounded-md border border-cream-300 bg-white"
              >
                <option value="email">Email</option>
                <option value="sms">SMS</option>
              </select>
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-ink-500">Audience</span>
              <select
                value={audience}
                onChange={(e) => setAudience(e.target.value as CustomRule["audience"])}
                className="h-9 px-2 rounded-md border border-cream-300 bg-white"
              >
                <option value="all">All parties</option>
                <option value="buyer">Buyer</option>
                <option value="seller">Seller</option>
                <option value="agent">Agents</option>
                <option value="lender">Lender</option>
              </select>
            </label>
          </div>
          <label className="flex flex-col gap-1">
            <span className="text-ink-500">Subject</span>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Closing in 3 days — checklist inside"
              className="h-9 px-2 rounded-md border border-cream-300 bg-white"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-ink-500">Body</span>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={5}
              placeholder="Reminder text sent to recipients. Use clear, friendly wording."
              className="w-full text-[13px] rounded-md border border-cream-300 p-2 resize-none bg-white"
            />
          </label>
        </div>
        <div className="mt-5 flex items-center justify-end gap-2">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={submit}
            disabled={!name.trim() || !subject.trim() || !body.trim()}
          >
            Save rule
          </Button>
        </div>
      </div>
    </div>
  );
}
