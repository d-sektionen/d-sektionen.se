import { glob } from "astro/loaders";
import { defineCollection } from "astro:content";
import { z } from "astro/zod";

export const collections = {
  nav: defineCollection({
    loader: glob({
      pattern: "**/*.{md,mdx}",
      base: "src/data/nav",
    }),
    schema: z.object({
      title: z.string(),
      redirect: z.url(),
    }),
  }),

  news: defineCollection({
    loader: glob({
      pattern: "**/*.{md,mdx}",
      base: "src/data/news",
    }),
    schema: z.object({
      title: z.string(),
      date: z.iso.date(),
    }),
  }),
};
