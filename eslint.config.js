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
      "apps/web/public/vendor/**",
      "data/**",
      "*.db*"
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
  }
];

