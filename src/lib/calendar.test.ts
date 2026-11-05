import { parseCalendar } from "@lib/calendar";
import { describe, expect, it } from "vitest";

describe("parseCalendar", () => {
  it("preserves all-day calendar dates and their exclusive end", () => {
    const events = parseCalendar(
      [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "BEGIN:VEVENT",
        "UID:example@example.com",
        "SUMMARY:Example",
        "DTSTART;VALUE=DATE:20250910",
        "DTEND;VALUE=DATE:20250912",
        "END:VEVENT",
        "END:VCALENDAR",
      ].join("\r\n"),
    );

    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({
      uid: "example@example.com",
      title: "Example",
      allDay: true,
      start: new Date("2025-09-10T00:00:00Z"),
      end: new Date("2025-09-12T00:00:00Z"),
    });
  });
});
