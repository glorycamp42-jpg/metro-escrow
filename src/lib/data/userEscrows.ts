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
