/** Custom (user-added) curative items + compliance steps persisted to localStorage. */

const CURATIVE_KEY = "metro-escrow:title-curatives";
const COMPLIANCE_KEY = "metro-escrow:compliance-steps";

export type CustomCurativeStatus = "open" | "in_progress" | "cleared";
export type CustomCurative = {
  id: string;
  escrowId: string;
  description: string;
  status: CustomCurativeStatus;
  createdAt: string;
};

export type CustomComplianceStep = {
  id: string;
  escrowId: string;
  name: string;
  completed: boolean;
  createdAt: string;
};

function readCuratives(): Record<string, CustomCurative[]> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(CURATIVE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, CustomCurative[]>) : {};
  } catch {
    return {};
  }
}

function writeCuratives(map: Record<string, CustomCurative[]>) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CURATIVE_KEY, JSON.stringify(map));
  } catch {
    // ignore
  }
}

function readSteps(): Record<string, CustomComplianceStep[]> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(COMPLIANCE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, CustomComplianceStep[]>) : {};
  } catch {
    return {};
  }
}

function writeSteps(map: Record<string, CustomComplianceStep[]>) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(COMPLIANCE_KEY, JSON.stringify(map));
  } catch {
    // ignore
  }
}

export function customCurativesFor(escrowId: string): CustomCurative[] {
  return readCuratives()[escrowId] ?? [];
}

export function addCustomCurative(
  escrowId: string,
  description: string,
  status: CustomCurativeStatus
): CustomCurative {
  const all = readCuratives();
  const item: CustomCurative = {
    id: "cu-custom-" + Date.now() + "-" + Math.floor(Math.random() * 1000),
    escrowId,
    description,
    status,
    createdAt: new Date().toISOString()
  };
  all[escrowId] = [...(all[escrowId] ?? []), item];
  writeCuratives(all);
  return item;
}

export function customStepsFor(escrowId: string): CustomComplianceStep[] {
  return readSteps()[escrowId] ?? [];
}

export function addCustomComplianceStep(
  escrowId: string,
  name: string,
  completed: boolean
): CustomComplianceStep {
  const all = readSteps();
  const item: CustomComplianceStep = {
    id: "cs-custom-" + Date.now() + "-" + Math.floor(Math.random() * 1000),
    escrowId,
    name,
    completed,
    createdAt: new Date().toISOString()
  };
  all[escrowId] = [...(all[escrowId] ?? []), item];
  writeSteps(all);
  return item;
}

export function toggleCustomComplianceStep(escrowId: string, stepId: string) {
  const all = readSteps();
  const list = all[escrowId] ?? [];
  all[escrowId] = list.map((s) => (s.id === stepId ? { ...s, completed: !s.completed } : s));
  writeSteps(all);
}
