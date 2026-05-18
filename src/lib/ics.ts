/**
 * iCalendar (.ics) export helpers.
 *
 * Generates RFC 5545 compliant calendar files that import cleanly into
 * Google Calendar, Apple Calendar, Outlook, and Fantastical.
 */

import type { Appointment, Escrow } from "@/lib/data/mock";

/* -------- Formatting -------- */

function fmtIcsDateTime(iso: string): string {
  // "2026-05-04T10:00:00" → "20260504T100000"
  return iso.replace(/[-:]/g, "").replace(/\..*$/, "");
}

function fmtIcsDate(isoDate: string): string {
  // "2026-05-04" → "20260504"
  return isoDate.replace(/-/g, "");
}

function fmtIcsDatePlusOne(isoDate: string): string {
  // DTEND for all-day events is exclusive — needs to be next day
  const d = new Date(isoDate + "T00:00:00");
  d.setDate(d.getDate() + 1);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return y + m + day;
}

function fmtNowUtc(): string {
  const now = new Date();
  return now.toISOString().replace(/[-:]/g, "").replace(/\..*Z$/, "Z");
}

function escapeText(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/\r?\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

/**
 * Folds long ICS lines to 75 octets per RFC 5545 §3.1.
 * Continuation lines are prefixed with a single space.
 */
function foldLine(line: string): string {
  if (line.length <= 75) return line;
  const chunks: string[] = [];
  let i = 0;
  while (i < line.length) {
    const size = i === 0 ? 75 : 74;
    chunks.push((i === 0 ? "" : " ") + line.substring(i, i + size));
    i += size;
  }
  return chunks.join("\r\n");
}

/* -------- Event builders -------- */

function buildTimedEvent(opts: {
  uid: string;
  stamp: string;
  startIso: string;
  durationMinutes: number;
  summary: string;
  description: string;
  location: string;
}): string {
  const start = fmtIcsDateTime(opts.startIso);
  const startDate = new Date(opts.startIso);
  const endDate = new Date(startDate.getTime() + opts.durationMinutes * 60_000);
  // Preserve local-time format (no Z) — these are floating times.
  const y = endDate.getFullYear();
  const m = String(endDate.getMonth() + 1).padStart(2, "0");
  const d = String(endDate.getDate()).padStart(2, "0");
  const h = String(endDate.getHours()).padStart(2, "0");
  const mi = String(endDate.getMinutes()).padStart(2, "0");
  const end = `${y}${m}${d}T${h}${mi}00`;

  return [
    "BEGIN:VEVENT",
    "UID:" + opts.uid,
    "DTSTAMP:" + opts.stamp,
    "DTSTART:" + start,
    "DTEND:" + end,
    foldLine("SUMMARY:" + escapeText(opts.summary)),
    foldLine("DESCRIPTION:" + escapeText(opts.description)),
    foldLine("LOCATION:" + escapeText(opts.location)),
    "END:VEVENT"
  ].join("\r\n");
}

function buildAllDayEvent(opts: {
  uid: string;
  stamp: string;
  dateIso: string;
  summary: string;
  description: string;
  location: string;
}): string {
  return [
    "BEGIN:VEVENT",
    "UID:" + opts.uid,
    "DTSTAMP:" + opts.stamp,
    "DTSTART;VALUE=DATE:" + fmtIcsDate(opts.dateIso),
    "DTEND;VALUE=DATE:" + fmtIcsDatePlusOne(opts.dateIso),
    foldLine("SUMMARY:" + escapeText(opts.summary)),
    foldLine("DESCRIPTION:" + escapeText(opts.description)),
    foldLine("LOCATION:" + escapeText(opts.location)),
    "END:VEVENT"
  ].join("\r\n");
}

const DEFAULT_DURATION_BY_KIND: Record<string, number> = {
  Inspection: 60,
  Signing: 60,
  Closing: 90,
  Walkthrough: 45,
  "Loan approval": 30,
  "Contingency removal": 15,
  "CD delivery": 15,
  Funding: 30,
  Recording: 30
};

/* -------- Public API -------- */

export function appointmentsToIcs(
  appointments: Appointment[],
  escrows: Escrow[],
  options: { includeCriticalDates?: boolean } = {}
): string {
  const { includeCriticalDates = true } = options;
  const escrowById = new Map(escrows.map((e) => [e.id, e]));
  const stamp = fmtNowUtc();
  const events: string[] = [];

  // Appointments (timed events)
  for (const a of appointments) {
    const escrow = escrowById.get(a.escrowId);
    const property = escrow ? escrow.property : null;
    const propAddr = property
      ? property.address + ", " + property.city + ", " + property.state + " " + property.zip
      : "";
    const summary =
      a.title + (property ? " - " + property.address : "") + " [" + a.escrowId + "]";
    const description =
      "Escrow: " + a.escrowId + "\n" +
      "Appointment: " + a.title +
      (property ? "\nProperty: " + propAddr : "");
    const duration = a.duration && a.duration > 0
      ? a.duration
      : DEFAULT_DURATION_BY_KIND[a.title] ?? 30;

    events.push(
      buildTimedEvent({
        uid: a.id + "@metro-escrow",
        stamp,
        startIso: a.start,
        durationMinutes: duration,
        summary,
        description,
        location: propAddr
      })
    );
  }

  // Critical dates (all-day events) — one per escrow per filled field
  if (includeCriticalDates) {
    const labels: Record<string, string> = {
      contractAccepted: "Contract accepted",
      emdDue: "EMD due",
      inspectionContingency: "Inspection contingency",
      appraisalContingency: "Appraisal contingency",
      loanContingency: "Loan contingency",
      cdDelivered: "CD delivered",
      signing: "Signing",
      funding: "Funding",
      recording: "Recording",
      closing: "Closing"
    };
    for (const e of escrows) {
      const propAddr =
        e.property.address + ", " + e.property.city + ", " + e.property.state + " " + e.property.zip;
      for (const [key, label] of Object.entries(labels)) {
        const date = e.critical[key as keyof typeof e.critical];
        if (!date) continue;
        events.push(
          buildAllDayEvent({
            uid: "critical-" + e.id + "-" + key + "@metro-escrow",
            stamp,
            dateIso: date,
            summary: label + " - " + e.property.address + " [" + e.id + "]",
            description:
              "Escrow: " + e.id + "\n" +
              "Milestone: " + label + "\n" +
              "Property: " + propAddr,
            location: propAddr
          })
        );
      }
    }
  }

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Metro Escrow//Calendar//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:Metro Escrow",
    "X-WR-TIMEZONE:America/Los_Angeles",
    ...events,
    "END:VCALENDAR"
  ].join("\r\n");
}

export function escrowToIcs(escrow: Escrow, appointments: Appointment[]): string {
  const escrowAppointments = appointments.filter((a) => a.escrowId === escrow.id);
  return appointmentsToIcs(escrowAppointments, [escrow], { includeCriticalDates: true });
}

export function downloadIcs(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
