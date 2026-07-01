import { describe, expect, it } from "vitest";
import { cidrAllows } from "../src/middleware/ip-allow";

describe("ip allow middleware", () => {
  it("matches IPv4 and IPv6 CIDR rules", () => {
    expect(cidrAllows("127.0.0.1", "127.0.0.1/32")).toBe(true);
    expect(cidrAllows("127.0.0.1", "10.0.0.0/8")).toBe(false);
    expect(cidrAllows("2001:db8::1", "2001:db8::/32")).toBe(true);
  });
});
