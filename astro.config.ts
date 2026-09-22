// @ts-check

import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, fontProviders } from "astro/config";
import pagefind from "astro-pagefind";
import { visualizer } from "rollup-plugin-visualizer";

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
