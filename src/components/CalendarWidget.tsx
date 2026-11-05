import type { CalendarEvent } from "@lib/calendar";
import dayjs from "dayjs";
import { useState } from "react";

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

function getCalendarDays(year: number, month: number) {
  const firstDate = new Date(year, month, 1);
  const offset = (firstDate.getDay() + 6) % 7;

  return Array.from({ length: 42 }, (_, index) => {
    return new Date(year, month, index - offset + 1);
  });
}

type EventItem = { id: string; event: CalendarEvent };
const dayKey = (date: Date | string) => dayjs(date).format("YYYY-MM-DD");

function getEventsByDay(events: EventItem[], dates: Date[]) {
  const byDay = new Map<string, EventItem[]>();

  // Only include days that are actually shown in the grid
  for (const date of dates) {
    byDay.set(dayKey(date), []);
  }

  for (const item of events) {
    byDay.get(dayKey(item.event.start))?.push(item);
  }

  return byDay;
}

function getShortTitle(title: string, maxLength: number = 30) {
  if (title.length <= maxLength) return title;

  const truncated = title.substring(0, maxLength);
  return `${truncated}...`;
}

export default function Calendar({ events }: CalendarProps) {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(() => {
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  function changeMonth(amount: number) {
    console.log(amount);
    setCurrentMonth(new Date(year, month + amount, 1));
  }

  const dates = getCalendarDays(year, month);
  const eventsByDay = getEventsByDay(events, dates);

  const header = WEEKDAYS.map((day) => <div className="border p-2">{day}</div>);

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
              className={`border p-2 pb-4 min-h-26 ${dateIsToday ? "bg-dsek-yellow/20" : ""}`}
            >
              {date.getMonth() == month ? (
                <div>{date.getDate()}</div>
              ) : (
                <div className="text-foreground-400">{date.getDate()}</div>
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
