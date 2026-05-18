"use client";

import * as React from "react";
import Link from "next/link";
import {
  DndContext,
  type DragEndEvent,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors
} from "@dnd-kit/core";
import { Badge } from "@/components/ui/Badge";
import {
  fmtMoney, STAGE_META, type EscrowStage, type Escrow, daysUntil
} from "@/lib/data/mock";
import { allEscrows, patchEscrow } from "@/lib/data/userEscrows";
import { logAudit } from "@/lib/data/audit";
import { useToast } from "@/components/ui/Toast";

const STAGES: EscrowStage[] = [
  "opening", "contingency", "pre_closing", "closing", "post_closing"
];

export default function PipelinePage() {
  const toast = useToast();
  const [escrows, setEscrows] = React.useState<Escrow[]>([]);
  React.useEffect(() => {
    setEscrows(allEscrows());
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } })
  );

  const byStage = new Map<EscrowStage, Escrow[]>();
  STAGES.forEach((s) => byStage.set(s, []));
  escrows.forEach((e) => {
    byStage.get(e.stage)?.push(e);
  });

  function onDragEnd(ev: DragEndEvent) {
    const { active, over } = ev;
    if (!over) return;
    const escrowId = String(active.id);
    const newStage = String(over.id) as EscrowStage;
    const target = escrows.find((e) => e.id === escrowId);
    if (!target || target.stage === newStage) return;
    patchEscrow(escrowId, { stage: newStage });
    setEscrows((curr) =>
      curr.map((e) => (e.id === escrowId ? { ...e, stage: newStage } : e))
    );
    logAudit({
      who: "Jin Yu",
      role: "Officer",
      action: "Stage changed",
      target: escrowId,
      detail: target.stage + " -> " + newStage
    });
    toast.push(escrowId + " moved to " + STAGE_META[newStage].label, "ok");
  }

  return (
    <div className="flex flex-col gap-5">
      <header>
        <h1 className="text-[28px] font-medium tracking-tighter2">Pipeline</h1>
        <p className="text-[14px] text-ink-500 mt-1">
          Every escrow on one board, grouped by stage. Drag any card between columns to change its stage.
        </p>
      </header>

      <DndContext sensors={sensors} onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3">
          {STAGES.map((s) => {
            const meta = STAGE_META[s];
            const items = byStage.get(s) ?? [];
            const total = items.reduce((sum, e) => sum + e.price, 0);
            return (
              <StageColumn
                key={s}
                stage={s}
                meta={meta}
                count={items.length}
                total={total}
              >
                {items.length === 0 && (
                  <p className="text-[12px] text-ink-400 italic px-1 py-3">
                    No escrows in this stage.
                  </p>
                )}
                {items.map((e) => (
                  <DraggableCard key={e.id} escrow={e} />
                ))}
              </StageColumn>
            );
          })}
        </div>
      </DndContext>
    </div>
  );
}

function StageColumn({
  stage,
  meta,
  count,
  total,
  children
}: {
  stage: EscrowStage;
  meta: { color: string; label: string };
  count: number;
  total: number;
  children: React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: stage });
  return (
    <div
      ref={setNodeRef}
      className={
        "bg-cream-50 rounded-lg p-3 min-h-[420px] flex flex-col border transition-colors " +
        (isOver ? "border-hermes-500 bg-cream-100" : "border-cream-300")
      }
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
          {count} · {fmtMoney(total, { compact: true })}
        </span>
      </div>
      <div className="flex flex-col gap-2 flex-1">{children}</div>
    </div>
  );
}

function DraggableCard({ escrow: e }: { escrow: Escrow }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: e.id });
  const days = daysUntil(e.closingDate) ?? 0;
  return (
    <div
      ref={setNodeRef}
      style={{
        transform: transform
          ? "translate3d(" + transform.x + "px, " + transform.y + "px, 0)"
          : undefined,
        opacity: isDragging ? 0.6 : 1
      }}
      {...listeners}
      {...attributes}
      className="bg-white border border-cream-300 rounded-md p-3 hover:border-hermes-300 transition-colors cursor-grab active:cursor-grabbing select-none"
    >
      <Link
        href={`/transactions/${e.id}`}
        onClick={(ev) => {
          if (isDragging) ev.preventDefault();
        }}
        className="block"
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
    </div>
  );
}
