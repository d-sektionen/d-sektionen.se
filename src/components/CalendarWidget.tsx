import type { CalendarEvent } from "@lib/calendar";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { useEffect, useState } from "react";

dayjs.extend(utc);
dayjs.extend(timezone);

const CALENDAR_TZ = "Europe/Stockholm";
const DATE_FORMAT = "YYYY-MM-DD";

const WEEKDAYS = [
  "Måndag",
  "Tisdag",
  "Onsdag",
  "Torsdag",
  "Fredag",
  "Lördag",
  "Söndag",
];
const MONTHS = [
  "Januari",
  "Februari",
  "Mars",
  "April",
  "Maj",
  "Juni",
  "Juli",
  "Augusti",
  "September",
  "Oktober",
  "November",
  "December",
];

type CalendarProps = {
  events: {
    id: string;
    event: CalendarEvent;
  }[];
};

export function getCalendarDays(year: number, month: number): Date[] {
  const firstDate = new Date(Date.UTC(year, month, 1));
  const offset = (firstDate.getUTCDay() + 6) % 7;

  const daysInMonth = dayjs.utc(firstDate).daysInMonth();
  const weeksToDisplay = Math.floor((offset + daysInMonth - 1) / 7) + 1;

  return Array.from({ length: weeksToDisplay * 7 }, (_, index) => {
    return new Date(Date.UTC(year, month, index - offset + 1));
  });
}

type EventItem = { id: string; event: CalendarEvent };

function eventDayKey(date: Date, allDay: boolean): string {
  return allDay
    ? dayjs.utc(date).format(DATE_FORMAT)
    : dayjs(date).tz(CALENDAR_TZ).format(DATE_FORMAT);
}

const dayKey = (date: Date): string => dayjs.utc(date).format(DATE_FORMAT);

export function getEventsByDay(
  events: EventItem[],
  dates: Date[],
): Map<string, EventItem[]> {
  const byDay = new Map<string, EventItem[]>();

  // Only include days that are actually shown in the grid
  for (const date of dates) {
    byDay.set(dayKey(date), []);
  }

  for (const item of events) {
    const { start, end, allDay } = item.event;
    const firstDay = eventDayKey(start, allDay);

    const lastInstant = new Date(Math.max(start.getTime(), end.getTime() - 1));
    const lastDay = eventDayKey(lastInstant, allDay);

    for (const [date, dayEvents] of byDay) {
      if (date >= firstDay && date <= lastDay) dayEvents.push(item);
    }
  }

  return byDay;
}

function getShortTitle(title: string, maxLength: number = 30): string {
  if (title.length <= maxLength) return title;

  const truncationSuffix = "...";
  const truncated = title.substring(0, maxLength - truncationSuffix.length);
  return `${truncated}${truncationSuffix}`;
}

type WeekEventSegment = {
  id: string;
  event: CalendarEvent;
  startColumn: number;
  endColumn: number;
  lane: number;
  continuesBefore: boolean;
  continuesAfter: boolean;
};

function getWeekEventSegments(
  events: EventItem[],
  weekDates: Date[],
): WeekEventSegment[] {
  const weekStart = dayKey(weekDates[0]);
  const weekEnd = dayKey(weekDates[6]);

  // Find events that overlap the displayed week.
  const segments = events.flatMap(({ id, event }) => {
    const firstDay = eventDayKey(event.start, event.allDay);

    // The event's end is exclusive, so subtract one millisecond.
    const lastInstant = new Date(
      Math.max(event.start.getTime(), event.end.getTime() - 1),
    );
    const lastDay = eventDayKey(lastInstant, event.allDay);

    if (firstDay > weekEnd || lastDay < weekStart) {
      return [];
    }

    // Clip the event to the boundaries of this week.
    const startIndex = weekDates.findIndex((date) => dayKey(date) >= firstDay);

    const endIndex = weekDates.findLastIndex((date) => dayKey(date) <= lastDay);

    return [
      {
        id,
        event,
        startColumn: startIndex + 1,
        endColumn: endIndex + 2, // CSS grid end is exclusive.
        lane: 0,
        continuesBefore: firstDay < weekStart,
        continuesAfter: lastDay > weekEnd,
      },
    ];
  });

  // Start earlier events first, prioritizing longer events.
  segments.sort(
    (a, b) => a.startColumn - b.startColumn || b.endColumn - a.endColumn,
  );

  // Track the last occupied column in each event lane.
  const laneEnds: number[] = [];

  for (const segment of segments) {
    // Find the first lane without an overlapping event.
    let lane = laneEnds.findIndex(
      (endColumn) => endColumn <= segment.startColumn,
    );

    if (lane === -1) {
      lane = laneEnds.length;
      laneEnds.push(0);
    }

    segment.lane = lane;
    laneEnds[lane] = segment.endColumn;
  }

  return segments;
}

type CalendarWeekProps = {
  dates: Date[];
  events: EventItem[];
  month: number;
  todayKey: string;
};

function CalendarWeek({ dates, events, month, todayKey }: CalendarWeekProps) {
  const segments = getWeekEventSegments(events, dates);

  return (
    <div className="relative min-h-26">
      {/* Background: day cells, borders and today's highlight. */}
      <div className="pointer-events-none absolute inset-0 grid grid-cols-7">
        {dates.map((date) => (
          <div
            key={dayKey(date)}
            className={`border border-background-300 ${
              dayKey(date) === todayKey ? "bg-dsek-yellow/20" : ""
            }`}
          />
        ))}
      </div>

      {/* Foreground: date numbers and event bars. */}
      <div className="relative grid grid-cols-7 gap-y-1 pb-4">
        {/* First row contains the day numbers. */}
        {dates.map((date) => (
          <div key={dayKey(date)} className="min-w-0 p-2">
            <span
              className={
                date.getUTCMonth() === month ? "" : "text-foreground-400"
              }
            >
              {date.getUTCDate()}
            </span>
          </div>
        ))}

        {/* Event bars span one or multiple day columns. */}
        {segments.map((segment) => (
          <div
            key={segment.id}
            style={{
              gridColumn: `${segment.startColumn} / ${segment.endColumn}`,
              gridRow: segment.lane + 2,
            }}
            title={segment.event.title}
            className={[
              "min-w-0 hyphens-auto break-words bg-dsek-blue/20",
              "px-2 py-1 text-sm",
              segment.continuesBefore ? "rounded-l-none" : "rounded-l-md ml-2",
              segment.continuesAfter ? "rounded-r-none" : "rounded-r-md mr-2",
            ].join(" ")}
          >
            {getShortTitle(segment.event.title)}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Calendar({ events }: CalendarProps) {
  const [today, setToday] = useState(() => dayjs().tz(CALENDAR_TZ));

  const [currentMonth, setCurrentMonth] = useState(() =>
    dayjs().tz(CALENDAR_TZ).startOf("month"),
  );

  useEffect(() => {
    const now = dayjs().tz(CALENDAR_TZ);

    if (now.isSame(today, "day")) return;

    setToday(now);

    if (!now.isSame(currentMonth, "month")) {
      setCurrentMonth(now.startOf("month"));
    }
  }, [currentMonth, today]);

  function changeMonth(amount: number) {
    setCurrentMonth((previous) => previous.add(amount, "month"));
  }

  const year = currentMonth.year();
  const month = currentMonth.month();

  const dates = getCalendarDays(year, month);
  const todayKey = today.format(DATE_FORMAT);

  // Divide the calendar into Monday-to-Sunday weeks.
  const weeks = Array.from({ length: dates.length / 7 }, (_, index) =>
    dates.slice(index * 7, index * 7 + 7),
  );

  return (
    <div>
      {/* Month navigation. */}
      <div className="flex justify-between">
        <button
          type="button"
          onClick={() => changeMonth(-1)}
          aria-label="Previous month"
          className="hover:cursor-pointer"
        >
          Föregående
        </button>

        <div className="text-2xl">
          {MONTHS[month]} {year}
        </div>

        <button
          type="button"
          onClick={() => changeMonth(1)}
          aria-label="Next month"
          className="hover:cursor-pointer"
        >
          Nästa
        </button>
      </div>

      {/* Weekday headers. */}
      <div className="grid grid-cols-7">
        {WEEKDAYS.map((day) => (
          <div key={day} className="min-w-0 border border-background-300 p-2">
            {day}
          </div>
        ))}
      </div>

      {/* Render each calendar week independently. */}
      {weeks.map((week) => (
        <CalendarWeek
          key={dayKey(week[0])}
          dates={week}
          events={events}
          month={month}
          todayKey={todayKey}
        />
      ))}
    </div>
  );
}
