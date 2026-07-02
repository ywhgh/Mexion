import { describe, expect, it } from "vitest";
import { decryptSecret, encryptSecret } from "../crypto.js";

describe("secret encryption", () => {
  it("round trips", () => {
    const encrypted = encryptSecret("sk-test");
    expect(decryptSecret(encrypted)).toBe("sk-test");
  });

  it("uses random IV", () => {
    const a = encryptSecret("same");
    const b = encryptSecret("same");
    expect(a).not.toBe(b);
    expect(decryptSecret(a)).toBe("same");
    expect(decryptSecret(b)).toBe("same");
  });

  it("rejects tampered ciphertext", () => {
    const encrypted = encryptSecret("secret");
    const payload = Buffer.from(encrypted, "base64");
    payload[payload.length - 1] = (payload[payload.length - 1] ?? 0) ^ 1;
    expect(() => decryptSecret(payload.toString("base64"))).toThrow();
  });
});
