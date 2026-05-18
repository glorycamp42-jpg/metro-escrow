/** User-created escrows + per-escrow patches persisted to localStorage. */

import {
  escrows as SEED_ESCROWS,
  type Escrow,
  type EscrowStatus,
  type EscrowStage,
  type Party,
  type CriticalDates,
  type EstimatedSettlement,
  type WireInstructions
} from "./mock";

const KEY = "metro-escrow:user-escrows";
const PATCHES_KEY = "metro-escrow:patches";

export type UserDocument = {
  id: string;
  name: string;
  size: number;
  mediaType: string;
  uploadedAt: string;
  uploadedBy: string;
  docCategory?: string;
  aiSummary?: string;
  extracted?: Record<string, unknown>;
};

export type PortalNotificationType =
  | "milestone"
  | "action_required"
  | "message"
  | "document";

export type PortalNotification = {
  id: string;
  createdAt: string;
  type: PortalNotificationType;
  title: string;
  body: string;
  read: boolean;
  from: string;
};

export type EscrowPatch = {
  status?: EscrowStatus;
  stage?: EscrowStage;
  parties?: Party[];
  documents?: UserDocument[];
  notifications?: PortalNotification[];
  type?: Escrow["type"];
  price?: number;
  closingDate?: string;
  property?: Partial<Escrow["property"]>;
  critical?: Partial<CriticalDates>;
  settlement?: Partial<EstimatedSettlement>;
  wire?: Partial<WireInstructions>;
};

// ---------- user-created escrows ----------

export function readUserEscrows(): Escrow[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Escrow[];
  } catch {
    return [];
  }
}

export function writeUserEscrows(list: Escrow[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    // ignore
  }
}

export function addUserEscrow(e: Escrow) {
  const list = readUserEscrows();
  writeUserEscrows([...list, e]);
}

// ---------- patches (overrides on top of seed/user escrows) ----------

function readPatches(): Record<string, EscrowPatch> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(PATCHES_KEY);
    return raw ? (JSON.parse(raw) as Record<string, EscrowPatch>) : {};
  } catch {
    return {};
  }
}

function writePatches(p: Record<string, EscrowPatch>) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(PATCHES_KEY, JSON.stringify(p));
  } catch {
    // ignore
  }
}

function applyPatch(e: Escrow): Escrow {
  if (typeof window === "undefined") return e;
  const p = readPatches()[e.id];
  if (!p) return e;
  return {
    ...e,
    status: p.status ?? e.status,
    stage: p.stage ?? e.stage,
    parties: p.parties ?? e.parties,
    type: p.type ?? e.type,
    price: p.price ?? e.price,
    closingDate: p.closingDate ?? e.closingDate,
    property: p.property ? { ...e.property, ...p.property } : e.property,
    critical: p.critical ? { ...e.critical, ...p.critical } : e.critical,
    settlement: p.settlement ? { ...e.settlement, ...p.settlement } : e.settlement,
    wire: p.wire ? { ...e.wire, ...p.wire } : e.wire
  };
}

/** Generic patch writer with deep-merge for nested objects. */
export function patchEscrow(id: string, patch: EscrowPatch) {
  const all = readPatches();
  const existing: EscrowPatch = all[id] ?? {};
  const merged: EscrowPatch = { ...existing, ...patch };
  if (patch.property) {
    merged.property = { ...(existing.property ?? {}), ...patch.property };
  }
  if (patch.critical) {
    merged.critical = { ...(existing.critical ?? {}), ...patch.critical };
  }
  if (patch.settlement) {
    merged.settlement = { ...(existing.settlement ?? {}), ...patch.settlement };
  }
  if (patch.wire) {
    merged.wire = { ...(existing.wire ?? {}), ...patch.wire };
  }
  all[id] = merged;
  writePatches(all);
}

export function getEscrowDocuments(id: string): UserDocument[] {
  if (typeof window === "undefined") return [];
  return readPatches()[id]?.documents ?? [];
}

export function addEscrowDocument(id: string, doc: UserDocument) {
  const all = readPatches();
  const existing = all[id]?.documents ?? [];
  all[id] = { ...all[id], documents: [...existing, doc] };
  writePatches(all);
}

/** Remove a single uploaded document from an escrow. */
export function removeEscrowDocument(escrowId: string, docId: string) {
  const all = readPatches();
  const docs = all[escrowId]?.documents ?? [];
  all[escrowId] = {
    ...all[escrowId],
    documents: docs.filter((d) => d.id !== docId)
  };
  writePatches(all);
}

/** Move an uploaded document from one escrow to another. */
export function moveEscrowDocument(fromEscrowId: string, toEscrowId: string, docId: string) {
  if (fromEscrowId === toEscrowId) return;
  const all = readPatches();
  const fromDocs = all[fromEscrowId]?.documents ?? [];
  const doc = fromDocs.find((d) => d.id === docId);
  if (!doc) return;
  all[fromEscrowId] = {
    ...all[fromEscrowId],
    documents: fromDocs.filter((d) => d.id !== docId)
  };
  const toDocs = all[toEscrowId]?.documents ?? [];
  all[toEscrowId] = {
    ...all[toEscrowId],
    documents: [...toDocs, doc]
  };
  writePatches(all);
}

export function addEscrowParty(id: string, party: Party, currentParties: Party[]) {
  const all = readPatches();
  const merged = [...currentParties, party];
  all[id] = { ...all[id], parties: merged };
  writePatches(all);
}

export function updateEscrowStatus(id: string, status: EscrowStatus) {
  const all = readPatches();
  all[id] = { ...all[id], status };
  writePatches(all);
}

// ---------- portal notifications ----------

export function getPortalNotifications(escrowId: string): PortalNotification[] {
  if (typeof window === "undefined") return [];
  const list = readPatches()[escrowId]?.notifications ?? [];
  return [...list].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getUnreadCount(escrowId: string): number {
  if (typeof window === "undefined") return 0;
  return (readPatches()[escrowId]?.notifications ?? []).filter((n) => !n.read).length;
}

export function addPortalNotification(
  escrowId: string,
  notif: { type: PortalNotificationType; title: string; body: string; from?: string }
) {
  const all = readPatches();
  const existing = all[escrowId]?.notifications ?? [];
  const full: PortalNotification = {
    id: "notif-" + Date.now() + "-" + Math.floor(Math.random() * 1000),
    createdAt: new Date().toISOString(),
    read: false,
    from: notif.from ?? "Jin Yu",
    type: notif.type,
    title: notif.title,
    body: notif.body
  };
  all[escrowId] = { ...all[escrowId], notifications: [...existing, full] };
  writePatches(all);
}

export function markNotificationRead(escrowId: string, notifId: string) {
  const all = readPatches();
  const notifs = all[escrowId]?.notifications ?? [];
  all[escrowId] = {
    ...all[escrowId],
    notifications: notifs.map((n) => (n.id === notifId ? { ...n, read: true } : n))
  };
  writePatches(all);
}

export function markAllNotificationsRead(escrowId: string) {
  const all = readPatches();
  const notifs = all[escrowId]?.notifications ?? [];
  all[escrowId] = {
    ...all[escrowId],
    notifications: notifs.map((n) => ({ ...n, read: true }))
  };
  writePatches(all);
}

// ---------- combined lookups ----------

/** Merged list (seed + user-created) with patches applied. */
export function allEscrows(): Escrow[] {
  return [...SEED_ESCROWS, ...readUserEscrows()].map(applyPatch);
}

export function findEscrow(id: string): Escrow | undefined {
  const seed = SEED_ESCROWS.find((e) => e.id === id);
  if (seed) return applyPatch(seed);
  const user = readUserEscrows().find((e) => e.id === id);
  return user ? applyPatch(user) : undefined;
}

// ---------- backup / restore ----------

/** Serialize all user escrows as pretty JSON for a backup download. */
export function exportUserEscrows(): string {
  return JSON.stringify(readUserEscrows(), null, 2);
}

/** Merge escrows from a backup JSON. De-duped by id (import overrides). */
export function importUserEscrows(jsonText: string): { added: number; total: number } {
  let incoming: Escrow[];
  try {
    const parsed = JSON.parse(jsonText);
    if (!Array.isArray(parsed)) throw new Error("not an array");
    incoming = parsed as Escrow[];
  } catch {
    throw new Error("Backup file is not valid JSON");
  }
  const existing = readUserEscrows();
  const byId = new Map<string, Escrow>();
  for (const e of existing) byId.set(e.id, e);
  let added = 0;
  for (const e of incoming) {
    if (!e || typeof e.id !== "string") continue;
    if (!byId.has(e.id)) added++;
    byId.set(e.id, e);
  }
  const merged = Array.from(byId.values());
  writeUserEscrows(merged);
  return { added, total: merged.length };
}
