"use client";

import * as React from "react";
import { CalendarBoard } from "@/components/calendar/CalendarBoard";
import { Button } from "@/components/ui/Button";
import { Download } from "lucide-react";
import { appointments } from "@/lib/data/mock";
import { allEscrows } from "@/lib/data/userEscrows";
import { appointmentsToIcs, downloadIcs } from "@/lib/ics";
import { useToast } from "@/components/ui/Toast";

export default function CalendarPage() {
  const toast = useToast();

  function handleExport() {
    const escrows = allEscrows();
    const ics = appointmentsToIcs(appointments, escrows, {
      includeCriticalDates: true
    });
    const today = new Date().toISOString().slice(0, 10);
    downloadIcs("metro-escrow-calendar-" + today + ".ics", ics);
    toast.push("Calendar exported - import to Google Calendar / Outlook / Apple Calendar", "ok");
  }

  return (
    <div className="flex flex-col gap-5">
      <header className="flex items-end justify-between">
        <div>
          <h1 className="text-[24px] font-medium tracking-tighter2">Calendar</h1>
          <p className="text-[13px] text-ink-500 mt-1">
            Drag any appointment to a new day. Conflicts are highlighted in red — clients are auto-notified.
          </p>
        </div>
        <Button variant="secondary" onClick={handleExport} title="Download all appointments and critical dates as a .ics file">
          <Download size={14} /> Export .ics
        </Button>
      </header>
      <CalendarBoard />
    </div>
  );
}
