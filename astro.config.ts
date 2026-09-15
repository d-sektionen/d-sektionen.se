// @ts-check
import { defineConfig, fontProviders } from "astro/config";

import tailwindcss from "@tailwindcss/vite";
import mdx from "@astrojs/mdx";
import pagefind from "astro-pagefind";

import react from "@astrojs/react";

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
  },

  integrations: [
    mdx(),
    react(),
    pagefind(), // pagefind needs to be loaded last
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
