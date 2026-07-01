import { defineConfig } from "vite";

export default defineConfig({
  appType: "mpa",
  server: {
    proxy: {
      "/api": "http://127.0.0.1:8787",
      "/v1": "http://127.0.0.1:8787",
    },
  },
});
