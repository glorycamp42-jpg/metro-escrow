import { CalendarBoard } from "@/components/calendar/CalendarBoard";

export default function CalendarPage() {
  return (
    <div className="flex flex-col gap-5">
      <header>
        <h1 className="text-[24px] font-medium tracking-tighter2">Calendar</h1>
        <p className="text-[13px] text-ink-500 mt-1">
          Drag any appointment to a new day. Conflicts are highlighted in red — clients are auto-notified.
        </p>
      </header>
      <CalendarBoard />
    </div>
  );
}
