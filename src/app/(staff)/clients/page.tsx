"use client";

import * as React from "react";
import { Card } from "@/components/ui/Card";
import { type Escrow } from "@/lib/data/mock";
import { allEscrows } from "@/lib/data/userEscrows";
import Link from "next/link";

export default function ClientsPage() {
  const [escrows, setEscrows] = React.useState<Escrow[]>([]);
  React.useEffect(() => {
    setEscrows(allEscrows());
  }, []);

  const map = new Map<string, { name: string; email: string; escrowId: string; portalToken: string }>();
  escrows.forEach((e) => {
    e.parties.forEach((p) => {
      if (p.role === "buyer" || p.role === "seller") {
        map.set(p.email, {
          name: p.name,
          email: p.email,
          escrowId: e.id,
          portalToken: e.portalToken
        });
      }
    });
  });
  const clients = Array.from(map.values());
  return (
    <div className="flex flex-col gap-5">
      <header>
        <h1 className="text-[24px] font-medium tracking-tighter2">Clients</h1>
        <p className="text-[13px] text-ink-500 mt-1">
          Buyers and sellers across every active escrow.
        </p>
      </header>
      <Card className="p-0 overflow-hidden">
        <ul>
          {clients.map((c) => (
            <li
              key={c.email}
              className="flex items-center gap-3 px-4 py-3 border-b border-cream-200 last:border-0"
            >
              <div
                className="grid place-items-center w-9 h-9 rounded-full text-cream-50 text-[12px] font-medium"
                style={{ background: "var(--hermes)" }}
              >
                {c.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium">{c.name}</p>
                <p className="text-[11px] text-ink-400">{c.email}</p>
              </div>
              <Link
                href={`/transactions/${c.escrowId}`}
                className="text-[12px] text-hermes-500 hover:underline"
              >
                {c.escrowId}
              </Link>
              <Link
                href={`/portal/${c.portalToken}`}
                target="_blank"
                className="text-[12px] text-ink-400 hover:text-ink-700"
              >
                portal ↗
              </Link>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
