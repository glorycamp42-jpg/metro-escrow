/**
 * Role model. In Phase 3 these will be Supabase Auth user roles + RLS policies.
 * For now we keep an in-memory + localStorage current-role so the demo can switch.
 */

export type Role = "officer" | "senior" | "processor" | "assistant" | "manager";

export type RoleMeta = {
  key: Role;
  label: string;
  short: string;
  /** Hex used for the role chip background. */
  bg: string;
  /** Hex used for the role chip text. */
  fg: string;
  description: string;
};

export const ROLES: Record<Role, RoleMeta> = {
  officer: {
    key: "officer",
    label: "Escrow officer",
    short: "Officer",
    bg: "#FFE8D6",
    fg: "#A8470F",
    description: "Owns the file. Signs off, calls back wires, manages parties."
  },
  senior: {
    key: "senior",
    label: "Senior officer",
    short: "Senior",
    bg: "#E1F5EE",
    fg: "#0F6E56",
    description: "Approves, escalates, coaches officers, reviews exceptions."
  },
  processor: {
    key: "processor",
    label: "Escrow processor",
    short: "Processor",
    bg: "#E6F1FB",
    fg: "#185FA5",
    description: "Orders title, payoffs, HOA. Preps documents and recordings."
  },
  assistant: {
    key: "assistant",
    label: "Escrow assistant",
    short: "Assistant",
    bg: "#EEEDFE",
    fg: "#534AB7",
    description: "Schedules signings, mails packages, handles intake."
  },
  manager: {
    key: "manager",
    label: "Branch manager",
    short: "Manager",
    bg: "#FCEBEB",
    fg: "#A32D2D",
    description: "Owns volume, productivity, compliance, P&L."
  }
};

export const ALL_ROLES: Role[] = [
  "officer",
  "senior",
  "processor",
  "assistant",
  "manager"
];
