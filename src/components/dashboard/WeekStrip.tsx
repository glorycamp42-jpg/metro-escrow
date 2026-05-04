"use client";

/**
 * Compact 7-day strip for the dashboard.
 * Full drag-and-drop calendar lives at /calendar.
 */
import { appointments, escrows } from "@/lib/data/mock";

const DAYS = [
  { label: "Mon", date: "May 4" },
  { label: "Tue", date: "May 5" },
  { label: "Wed", date: "May 6" },
  { label: "Thu", date: "May 7" },
  { label: "Fri", date: "May 8" },
  { label: "Sat", date: "May 9" },
  { label: "Sun", date: "May 10" }
];

export function WeekStrip() {
  // bucket appointments by day index of this week (May 4-10 mock)
  const buckets: Record<number, typeof appointments> = {};
  appointments.forEach((a) => {
    const d = new Date(a.start);
    const idx = Math.max(0, Math.min(6, d.getDay() === 0 ? 6 : d.getDay() - 1));
    buckets[idx] = [...(buckets[idx] ?? []), a];
  });

  return (
    <div>
      <div className="grid grid-cols-7 gap-1.5 mb-1.5">
        {DAYS.map((d, i) => (
          <p
            key={d.label}
            className="text-[10px] text-ink-400 text-center"
            aria-current={i === 1 ? "date" : undefined}
          >
            {d.label}
          </p>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1.5">
        {DAYS.map((d, i) => {
          const items = buckets[i] ?? [];
          const isToday = i === 1;
          return (
            <div
              key={d.label}
              className={
                "min-h-[96px] rounded-md p-1.5 border " +
                (isToday
                  ? "bg-hermes-50 border-hermes-500"
                  : "bg-cream-50 border-cream-300")
              }
            >
              {isToday && (
                <p className="text-[9px] font-medium text-hermes-500 mb-1">
                  {d.date}
                </p>
              )}
              {!isToday && (
                <p className="text-[9px] text-ink-400 mb-1">{d.date}</p>
              )}
              <div className="flex flex-col gap-1">
                {items.map((a) => {
                  const isClosing = a.title === "Closing";
                  return (
                    <div
                      key={a.id}
                      draggable
                      className="text-[10px] px-1.5 py-1 rounded text-cream-50 cursor-grab active:cursor-grabbing"
                      style={{
                        background: isClosing ? "#F37021" : "#2C1810"
                      }}
                      title={`${a.title} · ${a.escrowId}`}
                    >
                      {a.title} ·{" "}
                      {new Date(a.start).toLocaleTimeString("en-US", {
                        hour: "numeric",
                        minute: "2-digit"
                      })}
                    </div>
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
