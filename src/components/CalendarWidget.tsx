import type { CalendarEvent } from "@lib/calendar";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { useEffect, useState } from "react";

dayjs.extend(utc);

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
  serverDate: string;
};

function getCalendarDays(year: number, month: number) {
  const firstDate = new Date(year, month, 1);
  const offset = (firstDate.getDay() + 6) % 7;

  return Array.from({ length: 42 }, (_, index) => {
    return new Date(year, month, index - offset + 1);
  });
}

type EventItem = { id: string; event: CalendarEvent };
const dayKey = (date: Date | string) => dayjs.utc(date).format("YYYY-MM-DD");
const localKey = (date: Date) => dayjs(date).format("YYYY-MM-DD");

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

export default function Calendar({ events, serverDate }: CalendarProps) {
  // serverDate: ISO string, identical on server and client
  const [today, setToday] = useState(() => dayjs(serverDate));
  const [currentMonth, setCurrentMonth] = useState(() =>
    dayjs(serverDate).startOf("month"),
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

  const year = currentMonth.get("year");
  const month = currentMonth.get("month");

  function changeMonth(amount: number) {
    const newCurrentMonth = new Date(year, month + amount, 1);
    setCurrentMonth(dayjs(newCurrentMonth));
  }

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
              key={localKey(date)}
              className={`border p-2 pb-4 min-h-26 ${dateIsToday ? "bg-dsek-yellow/20" : ""}`}
            >
              {date.getMonth() === month ? (
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
