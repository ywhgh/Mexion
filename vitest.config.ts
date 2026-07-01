import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: {
    alias: {
      "@shared": path.resolve(__dirname, "packages/shared/src"),
      "@mexion/shared": path.resolve(__dirname, "packages/shared/src"),
    },
  },
  test: {
    globals: true,
    testTimeout: 15000,
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
        "**/server.ts",
        "**/db/schema.ts",
        "apps/web/public/**",
        "scripts/**",
        "research/**",
      ],
    },
  },
});
