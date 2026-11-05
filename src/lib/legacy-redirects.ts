import type { Loader } from "astro/loaders";
import { z } from "astro/zod";
import {
  LEGACY_REDIRECTS_FILE,
  readLegacyRedirects,
} from "./legacy-redirects-data";

/**
 * Content loader for `legacy-redirects.json`.
 *
 * Each redirect becomes a collection entry whose ID is the old path without
 * its leading slash. The `[...legacy].astro` route turns those IDs back into
 * static HTML redirect pages.
 */
export function legacyRedirectsLoader(options: { file?: string } = {}) {
  const file = options.file ?? LEGACY_REDIRECTS_FILE;

  return {
    name: "legacy-redirects-loader",
    load: async ({ store, parseData, watcher }) => {
      const redirects = readLegacyRedirects(file);

      store.clear();

      for (const redirect of redirects) {
        const id = redirect.from.replace(/^\/+/, "");

        if (id.length === 0) {
          throw new Error(
            `${LEGACY_REDIRECTS_FILE}: redirect source must not be "/".`,
          );
        }

        const data = await parseData({ id, data: redirect });
        store.set({ id, data });
      }

      watcher?.add(file);
    },
    schema: z.object({
      from: z.string(),
      to: z.string(),
    }),
  } satisfies Loader;
}
