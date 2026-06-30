import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: {
    alias: {
      "@shared": path.resolve(__dirname, "packages/shared/src"),
      "@axion/shared": path.resolve(__dirname, "packages/shared/src"),
      "@": path.resolve(__dirname, "apps/web/src"),
    },
  },
  test: {
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json-summary", "html"],
      thresholds: {
        lines: 60,
        functions: 60,
        branches: 50,
        statements: 60,
      },
      exclude: [
        "**/dist/**",
        "**/*.config.*",
        "**/main.tsx",
        "**/server.ts",
        "**/tailwind.config.ts",
        "**/postcss.config.js",
        "**/vite-env.d.ts",
        "**/db/schema.ts",
        "scripts/**",
      ],
    },
  },
});
