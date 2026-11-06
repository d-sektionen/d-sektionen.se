import { expect, it } from "vitest";
import { getCalendarDays, getEventsByDay } from "./CalendarWidget";

function entry(id: string, start: string, allDay = false) {
  return {
    id,
    event: {
      uid: id,
      title: id,
      start: new Date(start),
      end: new Date(start),
      allDay,
    },
  };
}

it("builds complete Monday–Sunday weeks, including leap day and adjacent months", () => {
  const days = getCalendarDays(2024, 1);

  expect(days).toHaveLength(35);
  expect(days[0]).toEqual(new Date("2024-01-29"));
  expect(days[31]).toEqual(new Date("2024-02-29"));
  expect(days.at(-1)).toEqual(new Date("2024-03-03"));
});

it("keeps all-day dates and places timed events on their Stockholm date", () => {
  const allDay = entry("all-day", "2025-01-31T00:00:00Z", true);
  const late = entry("late", "2025-01-31T23:00:00Z");
  const byDay = getEventsByDay(
    [allDay, late],
    [new Date("2025-01-31"), new Date("2025-02-01")],
  );

  expect(byDay.get("2025-01-31")).toEqual([allDay]);
  expect(byDay.get("2025-02-01")).toEqual([late]);
});

it("keeps multiple events and empty days, excluding events outside the grid", () => {
  const first = entry("first", "2025-02-01T10:00:00Z");
  const second = entry("second", "2025-02-01T11:00:00Z");
  const byDay = getEventsByDay(
    [first, second, entry("outside", "2025-01-31T10:00:00Z")],
    [new Date("2025-02-01"), new Date("2025-02-02")],
  );

  expect(byDay).toEqual(
    new Map([
      ["2025-02-01", [first, second]],
      ["2025-02-02", []],
    ]),
  );
});

it("shows multi-day events across the visible days, excluding their midnight end", () => {
  const allDay = entry("all-day", "2025-03-28", true);
  allDay.event.end = new Date("2025-04-01");
  const timed = entry("timed", "2025-03-28T22:00:00Z");
  timed.event.end = new Date("2025-03-31T22:00:00Z"); // April 1 midnight in Stockholm
  const dates = ["2025-03-29", "2025-03-30", "2025-03-31", "2025-04-01"];
  const byDay = getEventsByDay(
    [allDay, timed],
    dates.map((date) => new Date(date)),
  );

  expect([...byDay.values()]).toEqual([
    [allDay, timed],
    [allDay, timed],
    [allDay, timed],
    [],
  ]);
});
