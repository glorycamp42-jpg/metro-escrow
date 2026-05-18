/** Reminder rule enable/disable state + custom rules persisted to localStorage. */

const KEY = "metro-escrow:reminders";
const RULES_KEY = "metro-escrow:reminder-rules";

export type CustomRuleTrigger =
  | "days_before_close"
  | "days_before_emd"
  | "days_before_contingency"
  | "days_after_open";

export type CustomRule = {
  id: string;
  name: string;
  trigger: CustomRuleTrigger;
  days: number;
  channel: "email" | "sms";
  audience: "buyer" | "seller" | "agent" | "lender" | "all";
  subject: string;
  body: string;
  enabled: boolean;
  createdAt: string;
};

export const TRIGGER_LABEL: Record<CustomRuleTrigger, string> = {
  days_before_close: "days before close",
  days_before_emd: "days before EMD due",
  days_before_contingency: "days before contingency",
  days_after_open: "days after file open"
};

export const AUDIENCE_LABEL: Record<CustomRule["audience"], string> = {
  buyer: "Buyer",
  seller: "Seller",
  agent: "Agents",
  lender: "Lender",
  all: "All parties"
};

export function readReminderState(): Record<string, boolean> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, boolean>;
  } catch {
    return {};
  }
}

export function writeReminderState(state: Record<string, boolean>) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

export function readCustomRules(): CustomRule[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(RULES_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as CustomRule[];
  } catch {
    return [];
  }
}

export function writeCustomRules(rules: CustomRule[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(RULES_KEY, JSON.stringify(rules));
  } catch {
    // ignore
  }
}

export function addCustomRule(r: Omit<CustomRule, "id" | "createdAt" | "enabled">) {
  const rules = readCustomRules();
  const full: CustomRule = {
    ...r,
    id: "cr-" + Date.now() + "-" + Math.floor(Math.random() * 1000),
    enabled: true,
    createdAt: new Date().toISOString()
  };
  writeCustomRules([...rules, full]);
  return full;
}

export function toggleCustomRule(id: string) {
  const rules = readCustomRules();
  writeCustomRules(rules.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r)));
}

export function deleteCustomRule(id: string) {
  writeCustomRules(readCustomRules().filter((r) => r.id !== id));
}
