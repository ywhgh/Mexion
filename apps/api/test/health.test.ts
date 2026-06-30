import { describe, expect, it } from "vitest";
import { createApp } from "../src/app";

describe("api skeleton", () => {
  it("answers health checks", async () => {
    const app = createApp({ dbPath: ":memory:" });
    const res = await app.request("/api/health");
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toMatchObject({ ok: true, data: { status: "ok" } });
  });
});
