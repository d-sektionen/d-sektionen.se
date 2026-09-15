import { glob } from "astro/loaders";
import { defineCollection } from "astro:content";
import { eventsLoader } from "@lib/calendar";
import { z } from "astro/zod";

export const CALENDAR_URL =
  "https://calendar.google.com/calendar/ical/c_93a709266d679561caf5bcc20fb621fb0af75dd7d6e78c568b65fec39fc34e3b%40group.calendar.google.com/public/basic.ics";

export const collections = {
  nav: defineCollection({
    loader: glob({
      pattern: "**/*.{md,mdx}",
      base: "src/data/nav",
    }),
    schema: z.object({
      title: z.string(),
      category: z.string().optional(),
      redirect: z.url().optional(),
    }),
  }),

  posts: defineCollection({
    loader: glob({
      pattern: "**/*.{md,mdx}",
      base: "src/data/posts",
    }),
    schema: z.object({
      title: z.string(),
      date: z.iso.date(),
    }),
  }),

  events: defineCollection({
    loader: eventsLoader({}),
  }),
};
