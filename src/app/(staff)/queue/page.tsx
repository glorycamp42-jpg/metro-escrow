"use client";

import * as React from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { CheckCircle2, Circle } from "lucide-react";
import { useRole } from "@/components/role/RoleProvider";
import { ROLES, type Role } from "@/lib/roles";
import { type Escrow, type Task } from "@/lib/data/mock";
import { allEscrows } from "@/lib/data/userEscrows";

const ROLE_TO_OWNER: Record<Role, "officer" | "processor" | "assistant" | "ai" | null> = {
  officer: "officer",
  senior: "officer", // senior reviews officer-owned items
  processor: "processor",
  assistant: "assistant",
  manager: null
};

export default function QueuePage() {
  const { role } = useRole();
  const meta = ROLES[role];
  const owner = ROLE_TO_OWNER[role];

  const [escrows, setEscrows] = React.useState<Escrow[]>([]);
  const [doneIds, setDoneIds] = React.useState<Record<string, boolean>>({});

  React.useEffect(() => {
    setEscrows(allEscrows());
  }, []);

  type Row = Task & { escrowId: string; address: string };

  const rows: Row[] = React.useMemo(() => {
    if (!owner) return [];
    return escrows.flatMap((e) =>
      e.tasks
        .filter((t) => t.owner === owner)
        .map((t) => ({ ...t, escrowId: e.id, address: e.property.address }))
    );
  }, [owner, escrows]);

  const open = rows.filter(
    (r) => !r.done && !doneIds[r.escrowId + r.id]
  );
  const done = rows.length - open.length;

  function toggle(id: string) {
    setDoneIds((d) => ({ ...d, [id]: !d[id] }));
  }

  return (
    <div className="flex flex-col gap-5">
      <header>
        <div className="flex items-center gap-2">
          <h1 className="text-[28px] font-medium tracking-tighter2">My queue</h1>
          <span
            className="text-[11px] font-medium px-2.5 py-1 rounded-full"
            style={{ background: meta.bg, color: meta.fg }}
          >
            {meta.label}
          </span>
        </div>
        <p className="text-[14px] text-ink-500 mt-1">
          Tasks owned by you across all open escrows. Completion is local until Phase 3 wires up persistence.
        </p>
      </header>

      {!owner ? (
        <Card className="p-8 text-center">
          <p className="text-[14px] font-medium text-ink-700">
            Managers don't have a personal queue.
          </p>
          <p className="text-[12px] text-ink-400 mt-1">
            Switch to Officer / Senior / Processor / Assistant to see their queue.
          </p>
        </Card>
      ) : rows.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-[14px] font-medium">Your queue is clear. Beautiful.</p>
          <p className="text-[12px] text-ink-400 mt-1">
            New tasks appear here as files move through stages.
          </p>
        </Card>
      ) : (
        <>
          <Card className="p-4 flex items-center gap-4">
            <div>
              <p className="text-[12px] text-ink-400">Open / total</p>
              <p className="text-[22px] font-medium tracking-tighter2">
                {open.length} / {rows.length}
              </p>
            </div>
            <div className="flex-1 h-2 bg-cream-200 rounded-full overflow-hidden">
              <div
                className="h-full"
                style={{
                  width: ((rows.length - open.length) / rows.length) * 100 + "%",
                  background: "var(--hermes)"
                }}
              />
            </div>
            <p className="text-[12px] text-ink-400">{done} done</p>
          </Card>

          <Card className="p-0 overflow-hidden">
            <ul>
              {rows.map((r) => {
                const key = r.escrowId + r.id;
                const isDone = r.done || doneIds[key];
                return (
                  <li
                    key={key}
                    className="flex items-start gap-3 px-5 py-3 border-b border-cream-200 last:border-0"
                  >
                    <button
                      onClick={() => toggle(key)}
                      className="mt-0.5 shrink-0"
                      aria-label="Toggle"
                    >
                      {isDone ? (
                        <CheckCircle2 size={18} className="text-hermes-500" />
                      ) : (
                        <Circle size={18} className="text-ink-400" />
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p
                        className={
                          "text-[14px] " +
                          (isDone
                            ? "text-ink-400 line-through"
                            : "text-ink-800")
                        }
                      >
                        {r.label}
                      </p>
                      <p className="text-[11px] text-ink-400 mt-0.5">
                        <Link
                          href={"/transactions/" + r.escrowId}
                          className="hover:underline"
                        >
                          {r.escrowId}
                        </Link>{" "}
                        - {r.address} - {r.category}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </Card>
        </>
      )}
    </div>
  );
}
