import { expect, it } from "vitest";
import { getCalendarDays, getWeekEventSegments } from "./CalendarWidget";

function entry(id: string, start: string, allDay = false, end = start) {
  return {
    id,
    event: {
      uid: id,
      title: id,
      start: new Date(start),
      end: new Date(end),
      allDay,
    },
  };
}

it("builds complete Monday-Sunday weeks, including leap day and adjacent months", () => {
  const days = getCalendarDays(2024, 1);

  expect(days).toHaveLength(35);
  expect(days[0]).toEqual(new Date("2024-01-29"));
  expect(days[31]).toEqual(new Date("2024-02-29"));
  expect(days.at(-1)).toEqual(new Date("2024-03-03"));
});

it("keeps all-day dates and places timed events on their Stockholm date", () => {
  const days = getCalendarDays(2026, 10);

  const allDay = entry("all-day", "2026-11-03T00:00:00Z", true);
  const late = entry("late", "2026-11-03T23:00:00Z");
  const segments = getWeekEventSegments([allDay, late], days.slice(7, 14));

  expect(segments).toEqual([
    {
      ...allDay,
      startColumn: 2,
      endColumn: 3,
      lane: 0,
      continuesBefore: false,
      continuesAfter: false,
    },
    {
      ...late,
      startColumn: 3,
      endColumn: 4,
      lane: 0,
      continuesBefore: false,
      continuesAfter: false,
    },
  ]);
});

it("keeps same-day events in separate lanes even when their times do not overlap", () => {
  const week = getCalendarDays(2026, 10).slice(7, 14);
  const first = entry(
    "first",
    "2026-11-03T10:00:00Z",
    false,
    "2026-11-03T11:00:00Z",
  );
  const second = entry(
    "second",
    "2026-11-03T12:00:00Z",
    false,
    "2026-11-03T13:00:00Z",
  );

  expect(getWeekEventSegments([first, second], week)).toEqual([
    {
      ...first,
      startColumn: 2,
      endColumn: 3,
      lane: 0,
      continuesBefore: false,
      continuesAfter: false,
    },
    {
      ...second,
      startColumn: 2,
      endColumn: 3,
      lane: 1,
      continuesBefore: false,
      continuesAfter: false,
    },
  ]);
});

it("returns no segments for an empty week or events outside it", () => {
  const week = getCalendarDays(2026, 10).slice(7, 14);
  const before = entry("before", "2026-11-01", true, "2026-11-02");
  const after = entry("after", "2026-11-09", true, "2026-11-10");

  expect(getWeekEventSegments([], week)).toEqual([]);
  expect(getWeekEventSegments([before, after], week)).toEqual([]);
});

it.each([
  {
    label: "all-day",
    item: entry("all-day", "2025-03-28", true, "2025-04-01"),
  },
  {
    label: "timed",
    // Stockholm changes from UTC+1 to UTC+2 on March 30.
    // These instants are March 28 at 23:00 and April 1 at midnight locally.
    item: entry("timed", "2025-03-28T22:00:00Z", false, "2025-03-31T22:00:00Z"),
  },
])(
  "clips $label events across weeks and excludes their midnight end",
  ({ item }) => {
    const firstWeek = getCalendarDays(2025, 2).slice(28, 35);
    const nextWeek = getCalendarDays(2025, 3).slice(0, 7);

    expect(getWeekEventSegments([item], firstWeek)).toEqual([
      {
        ...item,
        startColumn: 5,
        endColumn: 8,
        lane: 0,
        continuesBefore: false,
        continuesAfter: true,
      },
    ]);
    expect(getWeekEventSegments([item], nextWeek)).toEqual([
      {
        ...item,
        startColumn: 1,
        endColumn: 2,
        lane: 0,
        continuesBefore: true,
        continuesAfter: false,
      },
    ]);
  },
);

it("sorts by earliest day then longest span and reuses adjacent lanes", () => {
  const week = getCalendarDays(2026, 10).slice(7, 14);
  const long = entry("long", "2026-11-02", true, "2026-11-05");
  const short = entry("short", "2026-11-02", true, "2026-11-03");
  const next = entry("next", "2026-11-03", true, "2026-11-05");
  const adjacent = entry("adjacent", "2026-11-05", true, "2026-11-06");

  const segments = getWeekEventSegments([adjacent, next, short, long], week);

  expect(segments).toEqual([
    {
      ...long,
      startColumn: 1,
      endColumn: 4,
      lane: 0,
      continuesBefore: false,
      continuesAfter: false,
    },
    {
      ...short,
      startColumn: 1,
      endColumn: 2,
      lane: 1,
      continuesBefore: false,
      continuesAfter: false,
    },
    {
      ...next,
      startColumn: 2,
      endColumn: 4,
      lane: 1,
      continuesBefore: false,
      continuesAfter: false,
    },
    {
      ...adjacent,
      startColumn: 4,
      endColumn: 5,
      lane: 0,
      continuesBefore: false,
      continuesAfter: false,
    },
  ]);
});
