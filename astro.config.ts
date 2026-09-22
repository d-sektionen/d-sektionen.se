// @ts-check
import { defineConfig, fontProviders } from "astro/config";

import tailwindcss from "@tailwindcss/vite";
import mdx from "@astrojs/mdx";
import { visualizer } from "rollup-plugin-visualizer";
import pagefind from "astro-pagefind";

import react from "@astrojs/react";

import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [
      tailwindcss(),
      visualizer({
        emitFile: true,
        filename: "stats.html",
      }),
    ],
  },

  site: "https://d-sektionen.se",
  integrations: [
    mdx(),
    sitemap(),
    react(),
    // pagefind needs to be loaded last
    pagefind(),
  ],

  publicDir: "./src/content/public",

  fonts: [
    {
      provider: fontProviders.local(),
      name: "Rocky AOE",
      cssVariable: "--font-rocky-aoe",
      options: {
        variants: [
          {
            src: ["./src/assets/fonts/ROCKYAOE.ttf"],
            weight: "normal",
            style: "normal",
          },
        ],
      },
    },
  ],
});
