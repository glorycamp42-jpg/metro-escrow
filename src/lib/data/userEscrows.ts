/** User-created escrows persisted to localStorage. */

import {
  escrows as SEED_ESCROWS,
  type Escrow
} from "./mock";

const KEY = "metro-escrow:user-escrows";

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

/** Merged list (seed + user-created) used by list and lookup. */
export function allEscrows(): Escrow[] {
  return [...SEED_ESCROWS, ...readUserEscrows()];
}

export function findEscrow(id: string): Escrow | undefined {
  const seed = SEED_ESCROWS.find((e) => e.id === id);
  if (seed) return seed;
  return readUserEscrows().find((e) => e.id === id);
}

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
