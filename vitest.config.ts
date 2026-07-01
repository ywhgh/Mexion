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
        "**/main.tsx",
        "**/server.ts",
        "**/tailwind.config.ts",
        "**/postcss.config.js",
        "**/vite-env.d.ts",
        "**/db/schema.ts",
        "research/**",
        "apps/web/public/**",
        "apps/**/vitest.setup.ts",
        "apps/web/src/App.tsx",
        "apps/web/src/api/**",
        "apps/web/src/components/page/**",
        "apps/web/src/components/shell/**",
        "apps/web/src/lib/api.ts",
        "apps/web/src/lib/i18n.ts",
        "apps/web/src/lib/theme.ts",
        "apps/web/src/lib/types.ts",
        "apps/web/src/pages/**",
        "apps/web/src/store/**",
        "scripts/**",
      ],
    },
  },
});
