// @ts-check
import { defineConfig, fontProviders } from "astro/config";

import tailwindcss from "@tailwindcss/vite";
import mdx from "@astrojs/mdx";
import { visualizer } from "rollup-plugin-visualizer";
import pagefind from "astro-pagefind";

import preact from "@astrojs/preact";

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
    preact({ compat: true }),
    // pagefind needs to be loaded last
    pagefind(),
    sitemap(),
  ],

  publicDir: "./src/data/public",

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
