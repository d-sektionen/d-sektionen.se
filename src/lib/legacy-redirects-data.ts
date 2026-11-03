import { readFileSync } from "node:fs";

/**
 * Old WordPress upload paths and where they live now.
 *
 * The file is a plain object mapping the path on the old site to the path on
 * the new site, for example:
 *
 *   "/wp-content/uploads/2013/10/Grafisk-Profil.pdf": "/docs/2013/10/Grafisk-Profil.pdf"
 */
export const LEGACY_REDIRECTS_FILE = "src/content/legacy-redirects.json";

export type LegacyRedirect = {
  /** The path on the old site, including its leading slash. */
  from: string;
  /** The path (or URL) the old path should redirect to. */
  to: string;
};

/**
 * Validate the JSON file. Keeping this separate from the loader makes a broken
 * redirect file fail with a useful message instead of silently producing a
 * collection with unusable entries.
 */
export function parseLegacyRedirects(json: string): LegacyRedirect[] {
  const data: unknown = JSON.parse(json);

  if (typeof data !== "object" || data === null || Array.isArray(data)) {
    throw new Error(
      `${LEGACY_REDIRECTS_FILE} must contain an object mapping old paths to new paths.`,
    );
  }

  return Object.entries(data).map(([from, to]) => {
    if (typeof to !== "string" || to.length === 0) {
      throw new Error(
        `${LEGACY_REDIRECTS_FILE}: redirect target for "${from}" must be a non-empty string.`,
      );
    }

    if (!from.startsWith("/")) {
      throw new Error(
        `${LEGACY_REDIRECTS_FILE}: redirect source "${from}" must start with "/".`,
      );
    }

    return { from, to };
  });
}

export function readLegacyRedirects(
  file: string = LEGACY_REDIRECTS_FILE,
): LegacyRedirect[] {
  return parseLegacyRedirects(readFileSync(file, "utf8"));
}

/**
 * The JSON stores paths exactly as they appeared in the old URLs. Astro
 * matches routes against decoded paths, so decode them before comparing.
 */
export function decodeLegacyPath(path: string): string {
  try {
    return decodeURIComponent(path);
  } catch {
    return path;
  }
}
