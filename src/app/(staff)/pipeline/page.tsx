"use client";

import * as React from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  fmtMoney, STAGE_META, type EscrowStage, type Escrow, daysUntil
} from "@/lib/data/mock";
import { allEscrows } from "@/lib/data/userEscrows";

const STAGES: EscrowStage[] = [
  "opening", "contingency", "pre_closing", "closing", "post_closing"
];

export default function PipelinePage() {
  const [escrows, setEscrows] = React.useState<Escrow[]>([]);
  React.useEffect(() => {
    setEscrows(allEscrows());
  }, []);

  const byStage = new Map<EscrowStage, Escrow[]>();
  STAGES.forEach((s) => byStage.set(s, []));
  escrows.forEach((e) => {
    byStage.get(e.stage)?.push(e);
  });

  return (
    <div className="flex flex-col gap-5">
      <header>
        <h1 className="text-[28px] font-medium tracking-tighter2">Pipeline</h1>
        <p className="text-[14px] text-ink-500 mt-1">
          Every escrow on one board, grouped by stage. Drag-to-stage coming next.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3">
        {STAGES.map((s) => {
          const meta = STAGE_META[s];
          const items = byStage.get(s) ?? [];
          const total = items.reduce((sum, e) => sum + e.price, 0);
          return (
            <div
              key={s}
              className="bg-cream-50 border border-cream-300 rounded-lg p-3 min-h-[420px] flex flex-col"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ background: meta.color }}
                  />
                  <p className="text-[13px] font-medium">{meta.label}</p>
                </div>
                <span className="text-[11px] text-ink-400">
                  {items.length} · {fmtMoney(total, { compact: true })}
                </span>
              </div>
              <div className="flex flex-col gap-2 flex-1">
                {items.length === 0 && (
                  <p className="text-[12px] text-ink-400 italic px-1 py-3">
                    No escrows in this stage.
                  </p>
                )}
                {items.map((e) => {
                  const days = daysUntil(e.closingDate) ?? 0;
                  return (
                    <Link
                      key={e.id}
                      href={`/transactions/${e.id}`}
                      className="bg-white border border-cream-300 rounded-md p-3 hover:border-hermes-300 transition-colors block"
                    >
                      <p className="text-[13px] font-medium truncate">
                        {e.property.address}
                      </p>
                      <p className="text-[11px] text-ink-400 mt-0.5">
                        {e.id} · {fmtMoney(e.price, { compact: true })}
                      </p>
                      <div className="flex items-center gap-1 mt-2 flex-wrap">
                        {e.risks.length > 0 && (
                          <Badge bg="#FCEBEB" fg="#A32D2D">
                            {e.risks.length} risk
                          </Badge>
                        )}
                        <Badge
                          bg={days <= 3 && days >= 0 ? "#FFE8D6" : "#F2EBDA"}
                          fg={days <= 3 && days >= 0 ? "var(--hermes)" : "#6B5640"}
                        >
                          {days < 0
                            ? `closed ${Math.abs(days)}d ago`
                            : days === 0
                            ? "closing today"
                            : `close in ${days}d`}
                        </Badge>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
