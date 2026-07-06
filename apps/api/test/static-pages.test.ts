import { describe, expect, it } from "vitest";
import { createApp } from "../src/app.js";

describe("static product pages", () => {
  it("serves /api-keys as a page, not an API 404", async () => {
    const app = createApp({ dbPath: ":memory:" });
    const res = await app.request("/api-keys/");
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("text/html");
    await expect(res.text()).resolves.toContain("Mexion — API 密钥");
  });
});
