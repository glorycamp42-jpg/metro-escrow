"use client";

import * as React from "react";
import { ArrowRightLeft, Trash2, X } from "lucide-react";
import {
  removeEscrowDocument,
  moveEscrowDocument,
  type UserDocument
} from "@/lib/data/userEscrows";
import type { Escrow } from "@/lib/data/mock";
import { Button } from "@/components/ui/Button";

/**
 * Inline action buttons for a user-uploaded document row.
 * Provides Move (to another escrow) and Delete actions.
 */
export function DocumentRowActions({
  doc,
  currentEscrowId,
  allEscrows,
  onChange
}: {
  doc: UserDocument;
  currentEscrowId: string;
  allEscrows: Escrow[];
  onChange: () => void;
}) {
  const [showMove, setShowMove] = React.useState(false);
  const [target, setTarget] = React.useState<string>("");

  React.useEffect(() => {
    // Default the dropdown to the first escrow that isn't the current one
    const first = allEscrows.find((e) => e.id !== currentEscrowId);
    setTarget(first?.id ?? "");
  }, [allEscrows, currentEscrowId, showMove]);

  function handleDelete() {
    const ok = window.confirm(
      "Delete \"" + doc.name + "\"?\n\nThis removes the document from this escrow. The escrow's other data is not affected."
    );
    if (!ok) return;
    removeEscrowDocument(currentEscrowId, doc.id);
    onChange();
  }

  function handleMoveConfirm() {
    if (!target || target === currentEscrowId) return;
    moveEscrowDocument(currentEscrowId, target, doc.id);
    setShowMove(false);
    onChange();
  }

  return (
    <>
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={() => setShowMove(true)}
          title="Move to a different escrow"
          className="grid place-items-center w-7 h-7 rounded-md text-ink-400 hover:text-ink-800 hover:bg-cream-100"
        >
          <ArrowRightLeft size={13} />
        </button>
        <button
          onClick={handleDelete}
          title="Delete this document"
          className="grid place-items-center w-7 h-7 rounded-md text-ink-400 hover:text-red-600 hover:bg-red-50"
        >
          <Trash2 size={13} />
        </button>
      </div>

      {showMove && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-800/40 p-4">
          <div className="w-full max-w-md rounded-lg bg-cream-50 p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[16px] font-medium">Move document</h2>
              <button
                onClick={() => setShowMove(false)}
                className="text-ink-400 hover:text-ink-800"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-[12px] text-ink-500 mb-3">
              Moving <span className="font-medium text-ink-800">{doc.name}</span>
              <br />
              From <span className="font-medium text-ink-700">{currentEscrowId}</span>
            </p>

            <label className="flex flex-col gap-1 text-[13px]">
              <span className="text-ink-500">Move to escrow</span>
              <select
                value={target}
                onChange={(ev) => setTarget(ev.target.value)}
                className="h-9 px-2 rounded-md border border-cream-300 bg-white"
              >
                {allEscrows
                  .filter((e) => e.id !== currentEscrowId)
                  .map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.id} — {e.property.address}, {e.property.city}
                    </option>
                  ))}
              </select>
            </label>

            <div className="flex justify-end gap-2 mt-5">
              <Button variant="secondary" onClick={() => setShowMove(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleMoveConfirm} disabled={!target}>
                Move
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
