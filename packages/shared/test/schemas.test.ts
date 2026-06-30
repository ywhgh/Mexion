import { describe, expect, it } from "vitest";
import { routeCreateSchema, subCreateSchema, tokenCreateSchema } from "../src";

describe("shared schemas", () => {
  it("normalizes subscription defaults", () => {
    const parsed = subCreateSchema.parse({ name: "Daily", rawSources: ["vmess://demo"] });
    expect(parsed.target).toBe("clash-meta");
    expect(parsed.ruleSet).toBe("none");
    expect(parsed.renamePrefix).toBe("");
  });

  it("rejects unsafe route aliases", () => {
    expect(() => routeCreateSchema.parse({ alias: "../bad", upstream: "https://example.com" })).toThrow();
  });

  it("requires a positive bound subscription for tokens", () => {
    expect(() => tokenCreateSchema.parse({ name: "bad", subId: 0 })).toThrow();
  });
});
