import js from "@eslint/js";
import boundaries from "eslint-plugin-boundaries";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";
import tseslint from "typescript-eslint";

const layer = (type) => ({ element: { type } });
const external = { module: { origin: "external" } };
const core = { module: { origin: "core" } };
const restrictImports = (regex, message) => ({
  "no-restricted-imports": ["error", { patterns: [{ regex, message }] }],
});

export default tseslint.config(
  { ignores: ["dist", "node_modules", "src/server/db/migrations"] },
  js.configs.recommended,
  ...tseslint.configs.strict,
  { rules: { "@typescript-eslint/no-non-null-assertion": "off" } },
  {
    files: ["src/**/*.{ts,tsx}"],
    plugins: { boundaries },
    settings: {
      "import/resolver": { typescript: { alwaysTryTypes: true } },
      "boundaries/elements": [
        { type: "engine", pattern: "src/engine" },
        { type: "contracts", pattern: "src/contracts" },
        { type: "server", pattern: "src/server" },
        { type: "web", pattern: "src/web" },
      ],
    },
    rules: {
      "boundaries/dependencies": [
        "error",
        {
          default: "disallow",
          policies: [
            { from: layer("engine"), allow: { to: layer("engine") } },
            { from: layer("contracts"), allow: { to: [layer("contracts"), layer("engine"), external] } },
            {
              from: layer("server"),
              allow: { to: [layer("server"), layer("engine"), layer("contracts"), external, core] },
            },
            {
              from: layer("web"),
              allow: { to: [layer("web"), layer("engine"), layer("contracts"), external] },
            },
          ],
        },
      ],
    },
  },
  {
    files: ["src/engine/**/*.ts"],
    ignores: ["src/engine/**/*.test.ts"],
    rules: restrictImports("^(?!\\.)", "The engine is pure and imports nothing outside itself."),
  },
  {
    files: ["src/contracts/**/*.ts"],
    rules: restrictImports("^(?!\\.|zod$|#engine$)", "Contracts may only import zod and the engine."),
  },
  {
    files: ["src/server/**/*.ts"],
    languageOptions: { globals: globals.node },
  },
  {
    files: ["src/web/**/*.{ts,tsx}"],
    languageOptions: { globals: globals.browser },
    plugins: { "react-hooks": reactHooks },
    rules: {
      ...reactHooks.configs.recommended.rules,
      ...restrictImports("^node:", "The web app runs in the browser."),
    },
  },
);
