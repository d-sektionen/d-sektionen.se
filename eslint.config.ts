import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import json from "@eslint/json";
import markdown from "@eslint/markdown";
import css from "@eslint/css";
import { defineConfig, globalIgnores, type ConfigObject } from "eslint/config";

import eslintPluginAstro from "eslint-plugin-astro";
import eslintConfigPrettier from "eslint-config-prettier";
import eslintPluginTailwindcss from "eslint-plugin-tailwindcss";

export default defineConfig([
  globalIgnores(["**/dist/**", "**/src/content/**"]),
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts}"],
    plugins: { js },
    extends: ["js/recommended"],
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
  },
  tseslint.configs.recommended,
  {
    files: ["**/*.json"],
    plugins: { json },
    language: "json/json",
    extends: ["json/recommended"],
  },
  {
    files: ["**/*.md"],
    plugins: { markdown },
    language: "markdown/gfm",
    extends: ["markdown/recommended"],
  },
  {
    files: ["**/*.css"],
    plugins: { css },
    language: "css/css",
    extends: ["css/recommended"],
  },
  ...eslintPluginAstro.configs["flat/recommended"],
  eslintPluginTailwindcss.configs.recommended as ConfigObject,
  // The plugin defaults `cssConfigPath` to `src/style.css`, which does not exist here.
  { settings: { tailwindcss: { cssConfigPath: "src/styles/global.css" } } },
  eslintConfigPrettier,
]);
