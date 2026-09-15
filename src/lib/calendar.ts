import ICAL from "ical.js";

/**
 * D-Sektionen's public Google Calendar feed. Anyone with the link can read it,
 * so there is no secret here - it is fetched at build time, not per request.
 */
export const CALENDAR_URL =
  "https://calendar.google.com/calendar/ical/c_93a709266d679561caf5bcc20fb621fb0af75dd7d6e78c568b65fec39fc34e3b%40group.calendar.google.com/public/basic.ics";

export type CalendarEvent = {
  /** Stable identifier from the feed's UID. */
  uid: string;
  title: string;
  /**
   * Start instant. For an all-day event this is UTC midnight of its first day
   * (see the note on all-day handling in `toDate`).
   */
  start: Date;
  /**
   * End instant. For an all-day event this is EXCLUSIVE, per RFC 5545: an
   * all-day event running 2025-09-10 -> 2025-09-25 covers the 10th through the
   * 24th. An event with no DTEND (and no DURATION) ends when it starts.
   */
  end: Date;
  /** True when the feed gave a date with no time of day. */
  allDay: boolean;
  description?: string;
  location?: string;
};

/**
 * Convert an `ICAL.Time` to a JS `Date`.
 *
 * A date-only value (`DTSTART;VALUE=DATE:20250929`, used by all-day events) is
 * "floating": it carries no timezone, and `toJSDate()` resolves it against
 * whatever timezone the process happens to run in. Verified against the live
 * feed: the same event becomes `2025-09-29T00:00:00Z` under `TZ=UTC` but
 * `2025-09-29T04:00:00Z` under `TZ=America/New_York` - and on a machine east of
 * UTC it would land on the previous day once formatted for Stockholm. Pinning
 * to UTC midnight from the raw Y/M/D components keeps the calendar day intact
 * wherever this runs, so format all-day events with a UTC timezone.
 */
function toDate(time: ICAL.Time): Date {
  if (time.isDate) {
    return new Date(Date.UTC(time.year, time.month - 1, time.day));
  }
  return time.toJSDate();
}

/**
 * Parse raw iCalendar text into events, sorted by start time.
 *
 * Pure and synchronous, so it can be tested without touching the network.
 * `fetchCalendarEvents` is the network-facing wrapper.
 *
 * Recurring events (RRULE) are NOT expanded - this returns each VEVENT once,
 * with its first occurrence. The live feed currently contains no RRULE, but a
 * recurring event added to the calendar would need expansion handling here.
 */
export function parseCalendar(ics: string): CalendarEvent[] {
  const calendar = new ICAL.Component(ICAL.parse(ics));
  const events: CalendarEvent[] = [];

  for (const vevent of calendar.getAllSubcomponents("vevent")) {
    // Google leaves CANCELLED entries in the feed for deleted events.
    if (vevent.getFirstPropertyValue("status") === "CANCELLED") continue;

    const event = new ICAL.Event(vevent);

    events.push({
      uid: event.uid,
      title: event.summary,
      start: toDate(event.startDate),
      end: toDate(event.endDate),
      allDay: event.startDate.isDate,
      // Both getters return "" when the property is absent.
      description: event.description || undefined,
      location: event.location || undefined,
    });
  }

  // Sorted here so callers get a deterministic order without having to ask.
  // UID breaks ties so the order is stable between builds.
  return events.sort(
    (a, b) =>
      a.start.getTime() - b.start.getTime() || a.uid.localeCompare(b.uid),
  );
}

/**
 * Fetch the calendar and parse it. Intended to run at build time.
 *
 * Throws on a failed request rather than returning an empty list: a calendar
 * that silently renders as empty because of a network blip is far harder to
 * notice than a failed build. Wrap the call in try/catch if you would rather
 * degrade gracefully.
 */
export async function fetchCalendarEvents(
  url: string = CALENDAR_URL,
): Promise<CalendarEvent[]> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `Calendar request failed: ${response.status} ${response.statusText} (${url})`,
    );
  }

  return parseCalendar(await response.text());
}
