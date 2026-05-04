"use client";

import * as React from "react";
import {
  DndContext,
  type DragEndEvent,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors
} from "@dnd-kit/core";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  appointments as seedAppointments,
  colorForKind,
  type AppointmentKind
} from "@/lib/data/mock";

type Appt = {
  id: string;
  escrowId: string;
  title: AppointmentKind;
  start: string;
  duration: number;
};

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];
const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const KINDS: AppointmentKind[] = [
  "Inspection", "Signing", "Closing", "Walkthrough",
  "Loan approval", "Contingency removal", "CD delivery", "Funding", "Recording"
];

function ymd(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return y + "-" + m + "-" + day;
}

function buildMonth(year: number, month: number) {
  const first = new Date(year, month, 1);
  const startDow = first.getDay();
  const start = new Date(year, month, 1 - startDow);
  const cells: { date: Date; iso: string; inMonth: boolean }[] = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    cells.push({ date: d, iso: ymd(d), inMonth: d.getMonth() === month });
  }
  return cells;
}

export function CalendarBoard() {
  const today = new Date();
  const [items, setItems] = React.useState<Appt[]>(seedAppointments);
  const [year, setYear] = React.useState(2026);
  const [month, setMonth] = React.useState(4);
  const [jumpOpen, setJumpOpen] = React.useState(false);
  const [jumpValue, setJumpValue] = React.useState("");
  const [selected, setSelected] = React.useState<string | null>(ymd(today));

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } })
  );

  const cells = React.useMemo(() => buildMonth(year, month), [year, month]);
  const itemsByDay = React.useMemo(() => {
    const map = new Map<string, Appt[]>();
    for (const it of items) {
      const key = it.start.slice(0, 10);
      map.set(key, [...(map.get(key) ?? []), it]);
    }
    return map;
  }, [items]);

  function nudgeMonth(delta: number) {
    let m = month + delta;
    let y = year;
    while (m < 0) { m += 12; y -= 1; }
    while (m > 11) { m -= 12; y += 1; }
    setMonth(m);
    setYear(y);
  }

  function jumpToToday() {
    setMonth(today.getMonth());
    setYear(today.getFullYear());
    setSelected(ymd(today));
  }

  function jumpToDate() {
    const m = jumpValue.match(/^(\d{4})-(\d{2})(?:-(\d{2}))?$/);
    if (!m) return;
    const y = Number(m[1]);
    const mo = Number(m[2]) - 1;
    setYear(y);
    setMonth(mo);
    if (m[3]) setSelected(jumpValue);
    setJumpOpen(false);
    setJumpValue("");
  }

  function onDragEnd(ev: DragEndEvent) {
    const { active, over } = ev;
    if (!over) return;
    const targetIso = String(over.id);
    setItems((curr) =>
      curr.map((a) => {
        if (a.id !== active.id) return a;
        const t = new Date(a.start);
        const [yy, mm, dd] = targetIso.split("-").map(Number);
        t.setFullYear(yy, (mm as number) - 1, dd);
        return { ...a, start: t.toISOString().slice(0, 19) };
      })
    );
  }

  const selectedItems = selected ? itemsByDay.get(selected) ?? [] : [];

  return (
    <div className="flex flex-col gap-4">
      <Card className="p-3 flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1 mr-2">
          <button
            onClick={() => nudgeMonth(-1)}
            className="w-9 h-9 grid place-items-center rounded-md border border-cream-300 hover:bg-cream-100"
            aria-label="Previous month"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => nudgeMonth(1)}
            className="w-9 h-9 grid place-items-center rounded-md border border-cream-300 hover:bg-cream-100"
            aria-label="Next month"
          >
            <ChevronRight size={16} />
          </button>
        </div>
        <h2 className="text-[20px] font-medium tracking-tighter2 mr-3">
          {MONTHS[month]} <span className="text-ink-400">{year}</span>
        </h2>
        <div className="flex items-center gap-1 mr-2">
          <button
            onClick={() => nudgeMonth(-12)}
            className="text-[12px] px-2 h-8 rounded-md border border-cream-300 hover:bg-cream-100"
          >
            year back
          </button>
          <button
            onClick={() => nudgeMonth(12)}
            className="text-[12px] px-2 h-8 rounded-md border border-cream-300 hover:bg-cream-100"
          >
            year forward
          </button>
        </div>
        <Button variant="secondary" size="sm" onClick={jumpToToday}>
          Today
        </Button>
        <div className="flex-1" />
        <div>
          {jumpOpen ? (
            <div className="flex items-center gap-1.5">
              <input
                autoFocus
                value={jumpValue}
                onChange={(e) => setJumpValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") jumpToDate();
                  if (e.key === "Escape") setJumpOpen(false);
                }}
                placeholder="2027-03 or 2028-12-15"
                className="h-9 w-[220px] rounded-md border border-cream-300 px-3 text-[13px] outline-none focus:ring-2 focus:ring-hermes-500/30"
              />
              <Button variant="primary" size="sm" onClick={jumpToDate}>
                Go
              </Button>
            </div>
          ) : (
            <Button variant="secondary" size="sm" onClick={() => setJumpOpen(true)}>
              <Search size={13} /> Jump to date
            </Button>
          )}
        </div>
      </Card>

      <DndContext sensors={sensors} onDragEnd={onDragEnd}>
        <div className="grid grid-cols-12 gap-4">
          <Card className="col-span-12 lg:col-span-9 p-3">
            <div className="grid grid-cols-7 mb-1.5">
              {DOW.map((d) => (
                <p
                  key={d}
                  className="text-[11px] text-ink-400 text-center py-1.5 font-medium"
                >
                  {d}
                </p>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {cells.map((c) => {
                const isToday = c.iso === ymd(today);
                const isSelected = c.iso === selected;
                const dayItems = itemsByDay.get(c.iso) ?? [];
                return (
                  <DayCell
                    key={c.iso}
                    iso={c.iso}
                    label={String(c.date.getDate())}
                    inMonth={c.inMonth}
                    today={isToday}
                    selected={isSelected}
                    items={dayItems}
                    onSelect={() => setSelected(c.iso)}
                  />
                );
              })}
            </div>
          </Card>

          <Card className="col-span-12 lg:col-span-3 p-4 self-start">
            <p className="text-[13px] text-ink-400">Selected day</p>
            <p className="text-[20px] font-medium mt-0.5 tracking-tighter2">
              {selected
                ? new Date(selected).toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric"
                  })
                : "-"}
            </p>
            <div className="mt-3 flex flex-col gap-2">
              {selectedItems.length === 0 ? (
                <p className="text-[13px] text-ink-400">No appointments.</p>
              ) : (
                selectedItems.map((a) => (
                  <div
                    key={a.id}
                    className="rounded-md p-3 text-cream-50"
                    style={{ background: colorForKind(a.title) }}
                  >
                    <p className="text-[13px] font-medium">{a.title}</p>
                    <p className="text-[11px] opacity-80">
                      {new Date(a.start).toLocaleTimeString("en-US", {
                        hour: "numeric",
                        minute: "2-digit"
                      })}
                      {" - "}
                      {a.escrowId}
                    </p>
                  </div>
                ))
              )}
            </div>
            <div className="mt-4 pt-3 border-t border-cream-200">
              <p className="text-[11px] text-ink-400 mb-2">Legend</p>
              <ul className="grid grid-cols-2 gap-x-2 gap-y-1.5 text-[11px]">
                {KINDS.map((k) => (
                  <li key={k} className="flex items-center gap-1.5">
                    <span
                      className="w-2.5 h-2.5 rounded-sm"
                      style={{ background: colorForKind(k) }}
                    />
                    <span className="text-ink-600">{k}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Card>
        </div>
      </DndContext>

      <p className="text-[12px] text-ink-400">
        Hold and drag any pill to reschedule. Use chevrons for months, year buttons for years, or "Jump to date".
      </p>
    </div>
  );
}

function DayCell({
  iso,
  label,
  inMonth,
  today,
  selected,
  items,
  onSelect
}: {
  iso: string;
  label: string;
  inMonth: boolean;
  today: boolean;
  selected: boolean;
  items: Appt[];
  onSelect: () => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: iso });
  return (
    <div
      ref={setNodeRef}
      onClick={onSelect}
      className={
        "min-h-[110px] rounded-md p-1.5 border transition-colors cursor-pointer flex flex-col gap-1 " +
        (today
          ? "bg-hermes-50 border-hermes-500"
          : selected
          ? "bg-cream-200 border-hermes-300"
          : isOver
          ? "bg-cream-200 border-hermes-300"
          : inMonth
          ? "bg-white border-cream-300"
          : "bg-cream-50 border-cream-200")
      }
    >
      <div className="flex items-center justify-between">
        <p
          className={
            "text-[12px] " +
            (today
              ? "font-medium text-hermes-500"
              : inMonth
              ? "text-ink-700"
              : "text-ink-400")
          }
        >
          {label}
        </p>
        {items.length > 3 && (
          <span className="text-[10px] text-ink-400">+{items.length - 3}</span>
        )}
      </div>
      <div className="flex flex-col gap-0.5">
        {items.slice(0, 3).map((a) => (
          <DraggablePill key={a.id} appt={a} />
        ))}
      </div>
    </div>
  );
}

function DraggablePill({ appt }: { appt: Appt }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: appt.id });
  return (
    <div
      ref={setNodeRef}
      style={{
        transform: transform
          ? "translate3d(" + transform.x + "px, " + transform.y + "px, 0)"
          : undefined,
        background: colorForKind(appt.title),
        opacity: isDragging ? 0.7 : 1
      }}
      {...listeners}
      {...attributes}
      className="cursor-grab active:cursor-grabbing select-none rounded text-cream-50 px-1.5 py-0.5 text-[10px] truncate"
      title={appt.title + " - " + appt.escrowId}
      onClick={(e) => e.stopPropagation()}
    >
      <span className="font-medium">{appt.title}</span>
      <span className="opacity-75 ml-1">
        {new Date(appt.start).toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit"
        })}
      </span>
    </div>
  );
}
