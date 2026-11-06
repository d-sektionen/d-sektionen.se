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

export default function Calendar({ events }: CalendarProps) {
  // serverDate: ISO string, identical on server and client
  const [today, setToday] = useState(() => dayjs().tz(CALENDAR_TZ));
  const [currentMonth, setCurrentMonth] = useState(() =>
    dayjs().tz(CALENDAR_TZ).startOf("month"),
  );

  useEffect(() => {
    const now = dayjs();
    if (now.isSame(today, "day")) return; // same day: skip, no state change

    console.log(`Setting today to ${now}`);
    setToday(now);
    if (!now.isSame(currentMonth, "month")) {
      setCurrentMonth(now.startOf("month"));
    }
  }, [currentMonth, today]);

  function changeMonth(amount: number) {
    setCurrentMonth(currentMonth.add(amount, "month"));
  }

  const year = currentMonth.year();
  const month = currentMonth.month();

  const dates = getCalendarDays(year, month);
  const eventsByDay = getEventsByDay(events, dates);

  const header = WEEKDAYS.map((day) => (
    <div key={day} className="border p-2">
      {day}
    </div>
  ));

  return (
    <div>
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
      <div className="grid grid-cols-7">
        {header}
        {dates.map((date) => {
          const dayEvents = eventsByDay.get(dayKey(date)) ?? [];
          const dateIsToday = dayjs(today).isSame(date, "day");

          return (
            <div
              key={dayKey(date)}
              className={`border p-2 pb-4 min-h-26 ${dateIsToday ? "bg-dsek-yellow/20" : ""}`}
            >
              {date.getUTCMonth() === month ? (
                <div>{date.getUTCDate()}</div>
              ) : (
                <div className="text-foreground-400">{date.getUTCDate()}</div>
              )}
              {dayEvents.map(({ id, event }) => (
                <div
                  key={id}
                  className="text-sm mt-2 break-words hyphens-auto bg-dsek-blue/20"
                >
                  {getShortTitle(event.title)}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
