# Agent guide

Astro static site for D-Sektionen (d-sektionen.se), built with TypeScript, React islands, Tailwind CSS v4, and Astro content collections. User-facing content is Swedish. The package manager is npm, Node `>=22.12.0` is required (CI uses Node 24), and the default branch is `main`.

Source layout: routes in `src/pages`, layouts in `src/layouts`, components in `src/components`, widget wrappers in `src/widgets`, helpers in `src/lib`, global styles in `src/styles`, and content in the `src/content` submodule.

## Setup

```bash
git submodule update --init --recursive
npm ci
```

- `src/content` is a git submodule pointing at `d-sektionen/d-sektionen.se-content`. Initialize it for a meaningful check and build — an empty submodule leaves the file-based collections empty, and `astro check` can still exit 0 (see the Content model caveat below).
- `node_modules/`, `dist/`, and `.astro/` are gitignored, so installing or building does not dirty `git status`.

## Commands

| Command | What it does |
| --- | --- |
| `npm run check:biome` | `biome check` — lint, format, and assist (import organization). |
| `npm run check:astro` | `astro check` — diagnostics and type checking for `.astro`, TS, and TSX. |
| `npm run check` | Runs both checks, Biome first. |
| `npm run fix` | `biome check --write` — applies safe fixes, import organization, and formatting. |
| `npm run format` | `biome format --write` — formatting only. |
| `npm run build` | Static build to `dist/`, including Pagefind indexing and image optimization. |
| `npm run preview` | Serves the built `dist/`. |

There is no test suite. Validate changes with `npm run check` and, when relevant, `npm run build`.

`astro check` needs `@astrojs/check` and `typescript` (both installed) plus network access: the `events` loader fetches the live Google Calendar during content sync, so an unreachable feed fails the check. The content submodule is not required for `astro check` to exit 0, but an empty submodule means no submodule content is checked — initialize the submodule for a meaningful check. It has no auto-fix option; use `npm run fix` for Biome findings.

By default `astro check` exits 0 on `ts(6133)` unused-local/prop hints, so dead props do not fail CI. Add `--minimumFailingSeverity hint` if you want hints to be fatal.

## CI and deploy

PR CI runs two independent workflows and never builds:

- `.github/workflows/biome-check.yml` runs `npx biome ci` (the CI equivalent of `biome check`).
- `.github/workflows/astro-check.yml` runs `npx astro check` with submodules checked out.

Because PR CI does not run `astro build`, broken path aliases or imports that only fail during bundling can pass PR checks. Run `npm run build` locally whenever you touch `tsconfig.json`, import paths, assets, or content imports.

`.github/workflows/astro-deploy.yml` runs on pushes to `main`, `workflow_dispatch`, and the `submodule-updated` repository dispatch. It checks out `main`, runs `git submodule update --remote --recursive`, then builds and uploads to GitHub Pages. Since it moves `src/content` to the tip of the content repo's `master`, content changes can go live without a site commit.

Caveat for automation: `update-submodule.yml` commits and pushes with the default `GITHUB_TOKEN`. Pushes made with `GITHUB_TOKEN` do not trigger other workflows, so that bot push does not start `astro-deploy.yml`. Use a PAT/GitHub App token or dispatch the deploy explicitly.

## Content model

Collections are defined in `src/content.config.ts`:

- `pages` — `**/*.{md,mdx}` under `src/content/pages`.
- `posts` — `src/content/posts`, with IDs derived from the filename.
- `categories` — `src/content/posts/categories.json`.
- `events` — a custom loader, `eventsLoader` in `src/lib/calendar.ts`, which parses the public Google Calendar iCal feed at build time.

Important constraints:

- Content MDX imports site components through tsconfig aliases (for example `@widgets/Staben.astro` in `aside.mdx` and `footer.mdx`). Moving or renaming anything under an aliased directory such as `src/components/**` requires a matching commit in the content repository.
- Static public files are served from `src/content/public` (the `publicDir` in `astro.config.ts`), not from a root `public/` directory. Add `favicon.ico`, `robots.txt`, and similar files in the content repo.
- Collection entries are persisted sorted by ID, not in loader order, so `getCollection("events")` returns an ID-sorted list. Consumers must sort explicitly — see `src/components/Calendar.astro`. A sort inside `parseCalendar` does not survive the data-store round trip.
- All-day events are normalized to UTC midnight so the calendar date stays stable across time zones; format them in UTC.
- Recurring events (`RRULE`) are not expanded by `parseCalendar`. The live feed currently contains none, but a recurring event added to the calendar needs expansion handling.
- `.gitmodules` tracks the content repo on branch `master`. `git submodule update --remote` moves the gitlink to the tip of `master`; commit that change if it is intentional, otherwise it appears as an unstaged `src/content` change.
- With an empty submodule, `astro check` can still exit 0 while validating no submodule content (a file-loader error for `src/content/posts/categories.json` appears in the log). `npm run build` does fail in that state, on unresolved `@content/*` imports such as `@content/aside.mdx`. Initialize the submodule for a meaningful check, and use `npm run build` to catch missing-content and import failures.

## Path aliases and module resolution

`tsconfig.json` maps `@assets/*`, `@components/*`, `@content/*`, `@layouts/*`, `@lib/*`, `@pages/*`, `@styles/*`, and `@widgets/*` to the matching `src/*` directories. Astro converts these into Vite aliases at build time.

- Keep the `/*` in alias keys. Astro turns a key without `*` into an exact-match regex, so `"@assets"` would never match `@assets/logo.svg`.
- `astro check` does not catch unresolved asset imports: `vite/client` declares `*.svg` as a wildcard module, so a broken `@assets/...` alias type-checks clean. Only `astro build` exercises real module resolution end to end.
- Run `npm run build` after changing aliases or moving imported files.

## Astro assets and islands

- Importing `.svg` or image files in `.tsx`/`.ts` (not just `.astro`) yields Astro `ImageMetadata`. Use `logo.src`, `logo.width`, and `logo.height` for `<img>` elements; see `Navbar.tsx`.
- `astro check` cannot verify asset URLs. After a build, inspect `dist/**/*.html` for `/_astro/...` URLs and the expected intrinsic dimensions.
- `client:*` islands are wrapped in `<astro-island>`, which has `display: contents`. Multiple sibling root elements are therefore fine, and `position: sticky` on an island child still resolves against the page scroll container.

## Biome

`biome.json` configures lint, format, and assist. `npx biome ci` is the CI check; `npm run fix` applies safe fixes.

- Biome formats `.astro` files (frontmatter and template), `.tsx`, JSON, CSS, and — because `html.formatter` is enabled — `.svg` files as HTML. It may reindent or rewrap SVG tags but preserves path data and attribute case, so `npm run fix` can modify assets.
- SVG files are linted too (`lint/a11y/noSvgWithoutTitle` fires on SVGs without a title or accessible role); generated or decorative SVGs may need a suppression.
- Biome does not sort Tailwind classes in `class` attributes (unlike Prettier's Tailwind plugin). Order classes deliberately.
- `lint/a11y/useAnchorContent` fires on `<a><slot /></a>` because Biome cannot see slot content. Suppress it in `.astro` with an HTML comment:

  ```html
  <!-- biome-ignore lint/a11y/useAnchorContent: slot renders content at runtime -->
  ```

- `lint/security/noBlankTarget` fires in `.tsx`/JSX (the safe fix adds `rel="noopener"`), but does not report `.astro` anchors in this setup. Check external links in `.astro` templates manually.
- `assist.actions.source.organizeImports` is enabled and removes unused imports, so `npm run fix` can delete imports. `correctness.noUnusedImports` and `correctness.noUnusedVariables` are off in the config.
- `files.includes` force-ignores `dist` (`!!**/dist`) and excludes `src/content` (`!**/src/content`), so build output and the content submodule are not linted or formatted.
- `npx biome check . --verbose` prints the files Biome actually processes — use it to confirm coverage after adding a file type.

## Development server

Prefer Astro's background mode so the server does not block the shell:

```bash
astro dev --background
```

Manage it with `astro dev stop`, `astro dev status`, and `astro dev logs` (add `--follow` to stream logs). `npm run dev` starts a foreground server instead.

Pagefind's search index is produced by `npm run build`; local search needs the built site (`npm run build` then `npm run preview`), not the dev server.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)
