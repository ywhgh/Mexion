import { describe, expect, it } from "vitest";
import { redactBody, redactHeaders } from "../redact.js";

describe("redact", () => {
  it("redacts sensitive headers", () => {
    expect(redactHeaders({ authorization: "Bearer sk-xxx", "content-type": "application/json", "X-API-Key": "abc" })).toEqual({
      authorization: "[REDACTED]",
      "content-type": "application/json",
      "X-API-Key": "[REDACTED]",
    });
  });

  it("redacts sensitive body keys recursively", () => {
    expect(redactBody({ username: "u", password: "p", nested: { token: "t", value: 1 }, list: [{ apiKey: "k" }] })).toEqual({
      username: "u",
      password: "[REDACTED]",
      nested: { token: "[REDACTED]", value: 1 },
      list: [{ apiKey: "[REDACTED]" }],
    });
  });
});
