import { renderToStaticMarkup } from "react-dom/server";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { CalendarEvent } from "../lib/calendar";
import Calendar from "./CalendarWidget";

const originalTimezone = process.env.TZ;

beforeAll(() => {
  process.env.TZ = "Europe/Stockholm";
});

afterAll(() => {
  if (originalTimezone === undefined) delete process.env.TZ;
  else process.env.TZ = originalTimezone;
});

function renderDays(event: Partial<CalendarEvent>) {
  const html = renderToStaticMarkup(
    <Calendar
      serverDate="2025-09-15T12:00:00Z"
      events={[
        {
          id: "event-1",
          event: {
            uid: "event-1@example.com",
            title: "Calendar event",
            start: new Date("2025-09-10T00:00:00Z"),
            end: new Date("2025-09-11T00:00:00Z"),
            allDay: true,
            ...event,
          },
        },
      ]}
    />,
  );
  const cells = html.split('<div class="border p-2 pb-4 min-h-26');
  return (day: number) => {
    const cell = cells.find((part) =>
      new RegExp(`^ [^"]*"><div>${day}</div>`).test(part),
    );
    if (!cell) throw new Error(`Missing September ${day} cell`);
    return cell;
  };
}

describe("calendar entries", () => {
  it("shows an all-day event on its calendar date in Stockholm", () => {
    const day = renderDays({});
    expect(day(10)).toContain("Calendar event");
    expect(day(11)).not.toContain("Calendar event");
  });

  it("uses the local date for timed events", () => {
    const day = renderDays({
      allDay: false,
      start: new Date("2025-09-10T09:30:00Z"),
      end: new Date("2025-09-10T10:30:00Z"),
    });
    expect(day(10)).toContain("Calendar event");
    expect(day(11)).not.toContain("Calendar event");
  });

  it("shows all-day events on every covered date, excluding the end", () => {
    const day = renderDays({ end: new Date("2025-09-13T00:00:00Z") });
    expect(day(12)).toContain("Calendar event");
    expect(day(11)).toContain("Calendar event");
    expect(day(10)).toContain("Calendar event");
    expect(day(13)).not.toContain("Calendar event");
  });

  it("links an event to its details page", () => {
    const day = renderDays({});
    expect(day(10) + day(11)).toContain('href="/kalender/event-1"');
  });
});
