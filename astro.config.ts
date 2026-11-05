// @ts-check

import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, fontProviders } from "astro/config";
import pagefind from "astro-pagefind";
import { visualizer } from "rollup-plugin-visualizer";
import { readLegacyRedirects } from "./src/lib/legacy-redirects-data";

const site = "https://d-sektionen.se";

/** Trailing slashes vary between routes, so compare paths without them. */
function normalizePath(pathname: string): string {
  return pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
}

let legacyRedirectPaths: Set<string> | undefined;

/** Check if path is a redirect that should not be included in the sitemap */
function isLegacyRedirect(url: string): boolean {
  legacyRedirectPaths ??= new Set(
    readLegacyRedirects().map(({ from }) =>
      normalizePath(new URL(from, site).pathname),
    ),
  );
  return legacyRedirectPaths.has(normalizePath(new URL(url).pathname));
}

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

  site,
  integrations: [
    mdx(),
    sitemap({ filter: (page) => !isLegacyRedirect(page) }),
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
