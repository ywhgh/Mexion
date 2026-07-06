/// <reference types="node" />

import { existsSync, readFileSync } from "node:fs";
import { dirname, extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import type { Plugin } from "vite";

const publicDir = join(dirname(fileURLToPath(import.meta.url)), "public");

function publicDirectoryIndex(): Plugin {
  return {
    name: "mexion-public-directory-index",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.method !== "GET" && req.method !== "HEAD") {
          next();
          return;
        }

        const pathname = decodeURIComponent((req.url ?? "/").split("?")[0] ?? "/");
        if (/^\/(?:api|v1)(?:\/|$)/.test(pathname) || extname(pathname)) {
          next();
          return;
        }

        const safePath = normalize(pathname.replace(/^\/+/, "")).replace(
          /^(\.\.[/\\])+/,
          "",
        );
        const file = join(publicDir, safePath, "index.html");
        if (!existsSync(file)) {
          next();
          return;
        }

        res.statusCode = 200;
        res.setHeader("Content-Type", "text/html; charset=utf-8");
        if (req.method === "HEAD") {
          res.end();
          return;
        }
        res.end(readFileSync(file));
      });
    },
  };
}

export default defineConfig({
  appType: "mpa",
  plugins: [publicDirectoryIndex()],
  server: {
    proxy: {
      "^/api(?:/|$)": "http://localhost:8080",
      "^/v1(?:/|$)": "http://localhost:8080",
    },
  },
});
