/**
 * Senior-officer escrow data model. Will be swapped for Supabase queries
 * in Phase 3.
 */

export type EscrowStatus =
  | "draft"
  | "opened"
  | "in_progress"
  | "pending_closing"
  | "closed"
  | "cancelled";

export const STATUS_META: Record<
  EscrowStatus,
  { label: string; bg: string; fg: string }
> = {
  draft: { label: "Draft", bg: "#F2EBDA", fg: "#6B5640" },
  opened: { label: "Opened", bg: "#E1F5EE", fg: "#0F6E56" },
  in_progress: { label: "In progress", bg: "#FFE8D6", fg: "#A8470F" },
  pending_closing: { label: "Closing soon", bg: "#FAEEDA", fg: "#854F0B" },
  closed: { label: "Closed", bg: "#E5DCC9", fg: "#3B2A1A" },
  cancelled: { label: "Cancelled", bg: "#FCEBEB", fg: "#A32D2D" }
};

export type EscrowStage =
  | "opening" | "contingency" | "pre_closing" | "closing" | "post_closing";

export const STAGE_META: Record<EscrowStage, { label: string; color: string }> = {
  opening: { label: "Opening", color: "#0F6E56" },
  contingency: { label: "Contingency", color: "#854F0B" },
  pre_closing: { label: "Pre-closing", color: "#185FA5" },
  closing: { label: "Closing", color: "#F37021" },
  post_closing: { label: "Post-closing", color: "#3B2A1A" }
};

export type Party = {
  id: string;
  name: string;
  role:
    | "buyer" | "seller" | "buyer_agent" | "seller_agent"
    | "lender" | "title" | "hoa" | "tax";
  email: string;
  phone?: string;
  company?: string;
};

export type Milestone = { id: string; label: string; due: string; done: boolean };
export type RiskFlag = {
  id: string;
  severity: "low" | "med" | "high";
  message: string;
  detectedAt: string;
};
export type CriticalDates = {
  contractAccepted?: string;
  emdDue?: string;
  inspectionContingency?: string;
  appraisalContingency?: string;
  loanContingency?: string;
  cdDelivered?: string;
  signing?: string;
  funding?: string;
  recording?: string;
  closing?: string;
};
export type WireInstructions = {
  bank: string;
  beneficiary: string;
  routing: string;
  accountLast4: string;
  verifiedBy?: string;
  verifiedAt?: string;
  callbackVerified?: boolean;
  riskScore: number;
};
export type Task = {
  id: string;
  label: string;
  owner: "officer" | "processor" | "assistant" | "ai";
  due?: string;
  done: boolean;
  category: "opening" | "contingency" | "closing" | "post";
};
export type CommLog = {
  id: string;
  channel: "phone" | "email" | "sms" | "note";
  who: string;
  body: string;
  at: string;
};
export type EscrowFee = {
  label: string;
  side: "buyer" | "seller" | "split";
  amount: number;
};
export type EstimatedSettlement = {
  salePrice: number;
  loanAmount: number;
  emd: number;
  buyerCredits: number;
  sellerCredits: number;
  fees: EscrowFee[];
  buyerCash: number;
  sellerProceeds: number;
};
export type Escrow = {
  id: string;
  property: { address: string; city: string; state: string; zip: string; apn?: string };
  type: "Residential Resale" | "Commercial" | "1031 Exchange" | "Investment Property" | "REO" | "Refinance";
  status: EscrowStatus;
  stage: EscrowStage;
  price: number;
  closingDate: string;
  parties: Party[];
  milestones: Milestone[];
  risks: RiskFlag[];
  critical: CriticalDates;
  wire: WireInstructions;
  tasks: Task[];
  comms: CommLog[];
  settlement: EstimatedSettlement;
  portalToken: string;
  step: number;
  officer: string;
  openedAt: string;
};

const officer = "Jin Yu";

const standardChecklist = (t: Escrow["type"]): Task[] => {
  const base: Task[] = [
    { id: "t-open-1", label: "Open escrow file & assign number", owner: "officer", done: true, category: "opening" },
    { id: "t-open-2", label: "Order title (preliminary report)", owner: "processor", done: true, category: "opening" },
    { id: "t-open-3", label: "Send wire-fraud warning to all parties", owner: "officer", done: true, category: "opening" },
    { id: "t-open-4", label: "Receive earnest money deposit", owner: "officer", done: false, category: "opening" },
    { id: "t-open-5", label: "Send escrow instructions for signature", owner: "processor", done: false, category: "opening" },
    { id: "t-cont-1", label: "Confirm inspection contingency removal", owner: "officer", done: false, category: "contingency" },
    { id: "t-cont-2", label: "Confirm appraisal contingency removal", owner: "officer", done: false, category: "contingency" },
    { id: "t-cont-3", label: "Confirm loan contingency removal", owner: "officer", done: false, category: "contingency" },
    { id: "t-cont-4", label: "Order HOA documents (if applicable)", owner: "processor", done: false, category: "contingency" },
    { id: "t-pre-1", label: "Order payoff demand from existing lender", owner: "processor", done: false, category: "closing" },
    { id: "t-pre-2", label: "Verify wire instructions via phone callback", owner: "officer", done: false, category: "closing" },
    { id: "t-pre-3", label: "Send closing disclosure (3-day rule)", owner: "officer", done: false, category: "closing" },
    { id: "t-pre-4", label: "Schedule signing appointment", owner: "assistant", done: false, category: "closing" },
    { id: "t-cl-1", label: "Receive funding from lender", owner: "officer", done: false, category: "closing" },
    { id: "t-cl-2", label: "Record at county recorder", owner: "processor", done: false, category: "closing" },
    { id: "t-cl-3", label: "Disburse per settlement statement", owner: "officer", done: false, category: "closing" },
    { id: "t-post-1", label: "Issue 1099-S to seller", owner: "ai", done: false, category: "post" },
    { id: "t-post-2", label: "File California 593 withholding", owner: "ai", done: false, category: "post" },
    { id: "t-post-3", label: "Send closing package to all parties", owner: "ai", done: false, category: "post" }
  ];
  if (t === "Refinance")
    return base.filter((b) => !b.id.startsWith("t-cont-1") && !b.id.startsWith("t-cont-2"));
  if (t === "1031 Exchange")
    return [
      ...base,
      { id: "t-1031-1", label: "Coordinate with qualified intermediary", owner: "officer", done: false, category: "closing" },
      { id: "t-1031-2", label: "45-day identification deadline tracker", owner: "officer", done: false, category: "contingency" },
      { id: "t-1031-3", label: "180-day exchange completion deadline", owner: "officer", done: false, category: "closing" }
    ];
  return base;
};

const standardSettlement = (price: number, isPurchase: boolean): EstimatedSettlement => {
  const loan = isPurchase ? price * 0.8 : price * 0.7;
  const fees: EscrowFee[] = [
    { label: "Escrow fee", side: "split", amount: Math.round(price * 0.0015 + 250) },
    { label: "Title insurance (CLTA owner)", side: "seller", amount: Math.round(price * 0.0035) },
    { label: "Title insurance (ALTA lender)", side: "buyer", amount: Math.round(price * 0.0008) },
    { label: "Recording fees", side: "buyer", amount: 165 },
    { label: "County transfer tax", side: "seller", amount: Math.round(price * 0.0011) },
    { label: "Notary fees", side: "split", amount: 250 },
    { label: "Wire fees", side: "buyer", amount: 35 },
    { label: "HOA transfer (if applicable)", side: "seller", amount: 450 }
  ];
  return {
    salePrice: price,
    loanAmount: loan,
    emd: isPurchase ? Math.round(price * 0.03) : 0,
    buyerCredits: 0,
    sellerCredits: 0,
    fees,
    buyerCash: Math.round(price * 0.2 + price * 0.025),
    sellerProceeds: Math.round(price * 0.94 - price * 0.06)
  };
};

const wireSafe = (account: string): WireInstructions => ({
  bank: "First Citizens Bank",
  beneficiary: "Metro Escrow Trust Account",
  routing: "121000497",
  accountLast4: account,
  verifiedBy: "Jin Yu",
  verifiedAt: "2026-05-03T16:45:00Z",
  callbackVerified: true,
  riskScore: 8
});

const wireUnverified = (account: string): WireInstructions => ({
  bank: "First Citizens Bank",
  beneficiary: "Metro Escrow Trust Account",
  routing: "121000497",
  accountLast4: account,
  callbackVerified: false,
  riskScore: 62
});

export const escrows: Escrow[] = [
  {
    id: "TXN-2024-001",
    property: { address: "123 Main St", city: "Los Angeles", state: "CA", zip: "90001", apn: "5042-014-019" },
    type: "Residential Resale",
    status: "in_progress",
    stage: "contingency",
    price: 850000,
    closingDate: "2026-05-15",
    openedAt: "2026-04-01",
    officer,
    parties: [
      { id: "p1", name: "John Buyer", role: "buyer", email: "john@example.com", phone: "(213) 555-0101" },
      { id: "p2", name: "Jane Seller", role: "seller", email: "jane@example.com", phone: "(213) 555-0102" },
      { id: "p3", name: "Bob Agent", role: "buyer_agent", email: "bob@example.com", company: "Coldwell Banker" },
      { id: "p4", name: "Karen Listing", role: "seller_agent", email: "karen@example.com", company: "Compass" },
      { id: "p5", name: "Sarah Lender", role: "lender", email: "sarah@example.com", company: "Wells Fargo" },
      { id: "p6", name: "California Title Co.", role: "title", email: "title@catitle.com", company: "California Title" }
    ],
    milestones: [
      { id: "m1", label: "Escrow opened", due: "2026-04-01", done: true },
      { id: "m2", label: "Inspection completed", due: "2026-04-08", done: true },
      { id: "m3", label: "Appraisal received", due: "2026-04-12", done: true },
      { id: "m4", label: "Loan approved", due: "2026-04-15", done: false },
      { id: "m5", label: "Title cleared", due: "2026-05-10", done: false },
      { id: "m6", label: "Final walkthrough", due: "2026-05-12", done: false },
      { id: "m7", label: "Signing", due: "2026-05-13", done: false },
      { id: "m8", label: "Closed", due: "2026-05-15", done: false }
    ],
    risks: [
      { id: "r1", severity: "high", message: "Sale price 18% above neighborhood comps", detectedAt: "2026-05-04T08:30:00Z" }
    ],
    critical: {
      contractAccepted: "2026-03-28",
      emdDue: "2026-04-01",
      inspectionContingency: "2026-04-15",
      appraisalContingency: "2026-04-15",
      loanContingency: "2026-04-25",
      cdDelivered: "2026-05-10",
      signing: "2026-05-13",
      funding: "2026-05-14",
      recording: "2026-05-15",
      closing: "2026-05-15"
    },
    wire: wireSafe("4421"),
    tasks: standardChecklist("Residential Resale"),
    comms: [
      { id: "c1", channel: "phone", who: "John Buyer", body: "Confirmed inspection time for tomorrow 10am", at: "2026-05-03T14:22:00Z" },
      { id: "c2", channel: "email", who: "Sarah Lender", body: "Sent updated loan estimate, awaiting buyer signature", at: "2026-05-04T09:10:00Z" },
      { id: "c3", channel: "note", who: officer, body: "Buyer plans to wire EMD on Friday - flagged for callback verification", at: "2026-05-04T09:45:00Z" }
    ],
    settlement: standardSettlement(850000, true),
    portalToken: "tkn_001_abc",
    step: 4
  },
  {
    id: "TXN-2024-002",
    property: { address: "456 Oak Ave", city: "Santa Monica", state: "CA", zip: "90401", apn: "4288-001-005" },
    type: "Commercial",
    status: "pending_closing",
    stage: "closing",
    price: 2500000,
    closingDate: "2026-05-07",
    openedAt: "2026-03-15",
    officer,
    parties: [
      { id: "p7", name: "Acme LLC", role: "buyer", email: "acme@example.com", company: "Acme LLC" },
      { id: "p8", name: "Westside Holdings", role: "seller", email: "ws@example.com", company: "Westside Holdings LP" },
      { id: "p9", name: "Title Pro", role: "title", email: "title@titlepro.com", company: "Title Pro Inc." }
    ],
    milestones: [],
    risks: [
      { id: "r2", severity: "med", message: "Wire instructions not yet verified by callback", detectedAt: "2026-05-03T14:00:00Z" },
      { id: "r3", severity: "high", message: "CD not yet delivered - closing in 3 days", detectedAt: "2026-05-04T08:00:00Z" }
    ],
    critical: {
      contractAccepted: "2026-03-12",
      emdDue: "2026-03-17",
      cdDelivered: undefined,
      signing: "2026-05-06",
      funding: "2026-05-07",
      recording: "2026-05-07",
      closing: "2026-05-07"
    },
    wire: wireUnverified("9988"),
    tasks: standardChecklist("Commercial"),
    comms: [
      { id: "c4", channel: "email", who: "Acme LLC", body: "Requested CD by EOD today", at: "2026-05-04T11:00:00Z" }
    ],
    settlement: standardSettlement(2500000, true),
    portalToken: "tkn_002_def",
    step: 6
  },
  {
    id: "TXN-2024-003",
    property: { address: "789 Pine Rd", city: "Beverly Hills", state: "CA", zip: "90210", apn: "4351-018-007" },
    type: "1031 Exchange",
    status: "draft",
    stage: "opening",
    price: 1200000,
    closingDate: "2026-06-01",
    openedAt: "2026-05-01",
    officer,
    parties: [],
    milestones: [],
    risks: [],
    critical: { contractAccepted: "2026-04-28", emdDue: "2026-05-03" },
    wire: wireUnverified("5577"),
    tasks: standardChecklist("1031 Exchange"),
    comms: [],
    settlement: standardSettlement(1200000, true),
    portalToken: "tkn_003_ghi",
    step: 1
  },
  {
    id: "TXN-2024-004",
    property: { address: "321 Elm St", city: "Pasadena", state: "CA", zip: "91101", apn: "5746-009-022" },
    type: "Investment Property",
    status: "opened",
    stage: "opening",
    price: 750000,
    closingDate: "2026-05-09",
    openedAt: "2026-04-20",
    officer,
    parties: [
      { id: "p10", name: "Maria Investor", role: "buyer", email: "maria@example.com", phone: "(626) 555-0144" }
    ],
    milestones: [],
    risks: [],
    critical: {
      contractAccepted: "2026-04-18",
      emdDue: "2026-04-22",
      signing: "2026-05-08",
      funding: "2026-05-09",
      closing: "2026-05-09"
    },
    wire: wireSafe("3322"),
    tasks: standardChecklist("Investment Property"),
    comms: [],
    settlement: standardSettlement(750000, true),
    portalToken: "tkn_004_jkl",
    step: 2
  }
];

export type AppointmentKind =
  | "Inspection" | "Signing" | "Closing" | "Walkthrough"
  | "Loan approval" | "Contingency removal" | "CD delivery"
  | "Funding" | "Recording";

export type Appointment = {
  id: string;
  escrowId: string;
  title: AppointmentKind;
  start: string;
  duration: number;
};

const KIND_COLORS: Record<AppointmentKind, string> = {
  Inspection: "#185FA5",
  Signing: "#2C1810",
  Closing: "#F37021",
  Walkthrough: "#0F6E56",
  "Loan approval": "#854F0B",
  "Contingency removal": "#A32D2D",
  "CD delivery": "#534AB7",
  Funding: "#D45F1B",
  Recording: "#3B2A1A"
};

export function colorForKind(k: AppointmentKind) {
  return KIND_COLORS[k];
}

export const appointments: Appointment[] = [
  { id: "a1", escrowId: "TXN-2024-001", title: "Inspection", start: "2026-05-04T10:00:00", duration: 60 },
  { id: "a2", escrowId: "TXN-2024-001", title: "Signing", start: "2026-05-13T14:00:00", duration: 60 },
  { id: "a3", escrowId: "TXN-2024-001", title: "Closing", start: "2026-05-15T11:00:00", duration: 90 },
  { id: "a4", escrowId: "TXN-2024-001", title: "Contingency removal", start: "2026-05-06T09:00:00", duration: 0 },
  { id: "a5", escrowId: "TXN-2024-001", title: "CD delivery", start: "2026-05-10T09:00:00", duration: 0 },
  { id: "a6", escrowId: "TXN-2024-001", title: "Funding", start: "2026-05-14T13:00:00", duration: 30 },
  { id: "a7", escrowId: "TXN-2024-001", title: "Walkthrough", start: "2026-05-12T15:00:00", duration: 45 },
  { id: "a8", escrowId: "TXN-2024-002", title: "Signing", start: "2026-05-06T10:30:00", duration: 60 },
  { id: "a9", escrowId: "TXN-2024-002", title: "Closing", start: "2026-05-07T11:00:00", duration: 90 },
  { id: "a10", escrowId: "TXN-2024-002", title: "Funding", start: "2026-05-07T09:00:00", duration: 30 },
  { id: "a11", escrowId: "TXN-2024-003", title: "Inspection", start: "2026-05-12T14:00:00", duration: 60 },
  { id: "a12", escrowId: "TXN-2024-003", title: "Closing", start: "2026-06-01T11:00:00", duration: 90 },
  { id: "a13", escrowId: "TXN-2024-004", title: "Walkthrough", start: "2026-05-08T09:30:00", duration: 45 },
  { id: "a14", escrowId: "TXN-2024-004", title: "Closing", start: "2026-05-09T11:00:00", duration: 60 }
];

export const dashboardKpis = {
  inEscrow: 12,
  awaitingSignature: 5,
  closingThisMonth: 8,
  volumeYtd: 4200000
};

export function fmtMoney(n: number, opts: { compact?: boolean } = {}) {
  if (opts.compact) {
    if (n >= 1_000_000) return "$" + (n / 1_000_000).toFixed(1) + "M";
    if (n >= 1_000) return "$" + (n / 1_000).toFixed(0) + "K";
  }
  return "$" + n.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

export function daysUntil(iso?: string) {
  if (!iso) return null;
  const ms = new Date(iso).getTime() - Date.now();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}
