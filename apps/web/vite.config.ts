import { defineConfig } from "vite";

export default defineConfig({
  appType: "mpa",
  server: {
    proxy: {
      "/api": "http://localhost:8080",
      "/v1": "http://localhost:8080",
    },
  },
});
