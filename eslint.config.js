import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";

export default [
  {
    ignores: [
      "node_modules/**",
      "dist/**",
      "coverage/**",
      "apps/**/dist/**",
      "packages/**/dist/**",
      "research/**",
      "apps/web/public/**",
      "apps/web/dist/**",
      "data/**",
      "*.db*",
      // Legacy eslintrc-mode tooling, superseded by this flat config (kept only as an
      // escape hatch). Not application code, so not linted by the flat pipeline.
      "**/.eslintrc.cjs",
      "apps/web/scripts/eslint-legacy.cjs"
    ]
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{ts,tsx,js,jsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2022
      }
    },
    rules: {
      "no-console": ["error", { "allow": ["info", "warn", "error"] }],
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { "argsIgnorePattern": "^_", "varsIgnorePattern": "^_" }
      ]
    }
  },
  {
    // Tests legitimately use `any` and loose function types for mocks/stubs.
    // Relax only these type-strictness rules here; runtime rules (no-console,
    // no-unused-vars, etc.) stay on.
    files: [
      "**/*.spec.{ts,tsx}",
      "**/*.test.{ts,tsx}",
      "**/__tests__/**/*.{ts,tsx}"
    ],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unsafe-function-type": "off"
    }
  }
];


