"use client";

import * as React from "react";
import type { Role } from "@/lib/roles";

type Ctx = {
  role: Role;
  setRole: (r: Role) => void;
};

const RoleCtx = React.createContext<Ctx | null>(null);
const STORAGE_KEY = "metro-escrow:role";

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRoleState] = React.useState<Role>("officer");

  React.useEffect(() => {
    try {
      const v = window.localStorage.getItem(STORAGE_KEY) as Role | null;
      if (v) setRoleState(v);
    } catch {
      // ignore
    }
  }, []);

  const setRole = React.useCallback((r: Role) => {
    setRoleState(r);
    try {
      window.localStorage.setItem(STORAGE_KEY, r);
    } catch {
      // ignore
    }
  }, []);

  const value = React.useMemo<Ctx>(() => ({ role, setRole }), [role, setRole]);

  return <RoleCtx.Provider value={value}>{children}</RoleCtx.Provider>;
}

export function useRole() {
  const ctx = React.useContext(RoleCtx);
  if (!ctx) throw new Error("useRole must be used within RoleProvider");
  return ctx;
}
