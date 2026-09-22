import { file, glob } from "astro/loaders";
import { defineCollection } from "astro:content";
import { eventsLoader } from "@lib/calendar";
import { z } from "astro/zod";

export const CALENDAR_URL =
  "https://calendar.google.com/calendar/ical/c_93a709266d679561caf5bcc20fb621fb0af75dd7d6e78c568b65fec39fc34e3b%40group.calendar.google.com/public/basic.ics";

export const collections = {
  pages: defineCollection({
    loader: glob({
      pattern: "**/*.{md,mdx}",
      base: "src/content/pages",
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
      base: "src/content/posts",
      generateId: (options) => {
        // https://stackoverflow.com/questions/423376/how-to-get-the-file-name-from-a-full-path-using-javascript
        var filename = options.entry.replace(/^.*[\\/]/, "");
        return filename.split(".")[0];
      },
    }),
    schema: z.object({
      title: z.string(),
      date: z.coerce.date(),
      categories: z.array(z.string()).default([]),
    }),
  }),

  categories: defineCollection({
    loader: file("src/content/posts/categories.json"),
    schema: z.object({
      name: z.string(),
      description: z.string().optional(),
      frontPage: z.boolean().default(false),
    }),
  }),

  events: defineCollection({
    loader: eventsLoader({}),
  }),
};
