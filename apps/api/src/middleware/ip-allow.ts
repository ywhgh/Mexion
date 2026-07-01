import { HTTPException } from "hono/http-exception";
import ipaddr from "ipaddr.js";

function normalizedIp(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  try {
    const parsed = ipaddr.parse(trimmed);
    if (parsed instanceof ipaddr.IPv6 && parsed.isIPv4MappedAddress()) {
      return parsed.toIPv4Address().toString();
    }
    return parsed.toNormalizedString();
  } catch {
    return null;
  }
}

export function sourceIpFromHeaders(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded && forwarded.length > 0 ? forwarded : "127.0.0.1";
}

export function cidrAllows(ip: string, rule: string): boolean {
  const normalized = normalizedIp(ip);
  if (!normalized) return false;
  try {
    const parsedIp = ipaddr.parse(normalized);
    if (!rule.includes("/")) {
      const parsedRule = ipaddr.parse(rule.trim());
      return parsedIp.kind() === parsedRule.kind() && parsedIp.toNormalizedString() === parsedRule.toNormalizedString();
    }
    const range = ipaddr.parseCIDR(rule.trim());
    if (parsedIp.kind() !== range[0].kind()) return false;
    return parsedIp.match(range);
  } catch {
    return false;
  }
}

export function requireIpAllowed(ip: string, rules: string[]): void {
  if (rules.length === 0) return;
  if (!rules.some((rule) => cidrAllows(ip, rule))) {
    throw new HTTPException(401, { message: "Source IP not allowed" });
  }
}


