import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import json from "@eslint/json";
import markdown from "@eslint/markdown";
import css from "@eslint/css";
import { defineConfig, globalIgnores, type Config } from "eslint/config";

import eslintPluginAstro from "eslint-plugin-astro";
import eslintPluginJsxA11y from "eslint-plugin-jsx-a11y";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";
import eslintPluginReact from "eslint-plugin-react";
import eslintPluginReactHooks from "eslint-plugin-react-hooks";
import eslintPluginTailwindcss from "eslint-plugin-tailwindcss";

export default defineConfig([
  globalIgnores([
    "**/dist/**",
    "**/src/content/**",
    "**/.astro/**",
    "package-lock.json",
  ]),
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
  {
    rules: {
      // This rule collides with Prettiers formatting
      "tailwindcss/classnames-order": "off",
    },
    extends: [eslintPluginTailwindcss.configs.recommended as Config],
  },
  // The plugin defaults `cssConfigPath` to `src/style.css`, which does not exist here.
  { settings: { tailwindcss: { cssConfigPath: "src/styles/global.css" } } },
  {
    files: ["**/*.{jsx,tsx}"],
    settings: { react: { version: "detect" } },
    // Redundant with TypeScript prop types.
    rules: { "react/prop-types": "off" },
    extends: [
      eslintPluginReact.configs.flat.recommended,
      eslintPluginReact.configs.flat["jsx-runtime"],
      eslintPluginJsxA11y.flatConfigs.recommended,
    ],
  },
  // Unscoped, these compiler-powered rules crash on non-JS files (e.g. JSON).
  {
    files: ["**/*.{js,mjs,cjs,jsx,ts,mts,cts,tsx,astro}"],
    extends: [eslintPluginReactHooks.configs.flat.recommended],
  },
  // Astro and React a11y both claim the `jsx-a11y` plugin key, so each is scoped to
  // its own file type; registering both everywhere is a config error.
  {
    files: ["**/*.astro"],
    extends: eslintPluginAstro.configs["flat/jsx-a11y-recommended"],
  },
  eslintPluginPrettierRecommended,
  // The plugin forces the `babel` parser for markdown unless the parser is `eslint-mdx`.
  {
    files: ["**/*.md"],
    rules: { "prettier/prettier": ["error", { parser: "markdown" }] },
  },
]);
