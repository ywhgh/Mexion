import dns from "node:dns/promises";
import net from "node:net";
import ipaddr from "ipaddr.js";

export class SsrfBlockedError extends Error {
  constructor(message = "Outbound request blocked by SSRF policy") {
    super(message);
    this.name = "SsrfBlockedError";
  }
}

export class HTTPTimeoutError extends Error {
  constructor(message = "Outbound request timed out") {
    super(message);
    this.name = "HTTPTimeoutError";
  }
}

export type SafeFetchOptions = RequestInit & {
  timeoutMs?: number;
  firstByteTimeoutMs?: number;
  maxRedirects?: number;
  fetchImpl?: typeof fetch;
  resolver?: (hostname: string) => Promise<string[]>;
};

const DEFAULT_TIMEOUT_MS = 30_000;
const DEFAULT_FIRST_BYTE_TIMEOUT_MS = 10_000;
const DEFAULT_MAX_REDIRECTS = 3;

function isBlockedIPv4(ip: string): boolean {
  const parts = ip.split(".").map((part) => Number.parseInt(part, 10));
  if (parts.length !== 4 || parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255)) return true;
  const [a, b, c, d] = parts;
  if (a === undefined || b === undefined || c === undefined || d === undefined) return true;
  if (a === 0) return true;
  if (a === 10) return true;
  if (a === 127) return true;
  if (a === 169 && b === 254) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  if (a === 100 && b >= 64 && b <= 127) return true;
  if (a === 192 && b === 0 && c === 0) return true;
  if (a === 192 && b === 0 && c === 2) return true;
  if (a === 198 && (b === 18 || b === 19)) return true;
  if (a === 198 && b === 51 && c === 100) return true;
  if (a === 203 && b === 0 && c === 113) return true;
  if (a >= 224) return true;
  return false;
}

type IPv4MappedIPv6 = { isIPv4MappedAddress: () => boolean; toIPv4Address: () => { toString: () => string } };

function isBlockedIPv6(ip: string): boolean {
  const addr = ipaddr.parse(ip);
  if (addr.kind() === "ipv6") {
    const mapped = addr as unknown as IPv4MappedIPv6;
    if (mapped.isIPv4MappedAddress()) return isBlockedIPv4(mapped.toIPv4Address().toString());
  }
  const range = addr.range();
  if (range !== "unicast") return true;
  const normalized = addr.toNormalizedString();
  if (normalized === "0:0:0:0:0:0:0:1") return true;
  if (normalized === "0:0:0:0:0:0:0:0") return true;
  return false;
}

export function isBlockedIp(ip: string): boolean {
  try {
    const kind = net.isIP(ip);
    if (kind === 4) return isBlockedIPv4(ip);
    if (kind === 6) return isBlockedIPv6(ip);
    return true;
  } catch {
    return true;
  }
}

export function validateSafeUrlFormat(url: string): URL {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new SsrfBlockedError("Invalid outbound URL");
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new SsrfBlockedError("Outbound URL scheme is not allowed");
  }
  if (!parsed.hostname || parsed.username || parsed.password) {
    throw new SsrfBlockedError("Outbound URL is not allowed");
  }
  return parsed;
}

async function defaultResolver(hostname: string): Promise<string[]> {
  const literalKind = net.isIP(hostname);
  if (literalKind !== 0) return [hostname];
  const records = await dns.lookup(hostname, { all: true, verbatim: true });
  return records.map((record) => record.address);
}

export async function assertSafeOutboundUrl(url: string, resolver: (hostname: string) => Promise<string[]> = defaultResolver): Promise<URL> {
  const parsed = validateSafeUrlFormat(url);
  const literalKind = net.isIP(parsed.hostname);
  const addresses = literalKind === 0 ? await resolver(parsed.hostname) : [parsed.hostname];
  if (addresses.length === 0 || addresses.some((address) => isBlockedIp(address))) {
    throw new SsrfBlockedError("Outbound host is not allowed");
  }
  return parsed;
}

function combineSignals(parent: AbortSignal | null | undefined, timeoutMs: number): { signal: AbortSignal; cleanup: () => void } {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const abort = (): void => controller.abort();
  if (parent) {
    if (parent.aborted) controller.abort();
    else parent.addEventListener("abort", abort, { once: true });
  }
  return {
    signal: controller.signal,
    cleanup: () => {
      clearTimeout(timer);
      if (parent) parent.removeEventListener("abort", abort);
    },
  };
}

function withoutSafeOptions(init: SafeFetchOptions): RequestInit {
  const { timeoutMs: _timeoutMs, firstByteTimeoutMs: _firstByteTimeoutMs, maxRedirects: _maxRedirects, fetchImpl: _fetchImpl, resolver: _resolver, ...rest } = init;
  return rest;
}

function redirectStatus(status: number): boolean {
  return status === 301 || status === 302 || status === 303 || status === 307 || status === 308;
}

function redirectedMethod(method: string, status: number): string {
  if (status === 303) return "GET";
  if ((status === 301 || status === 302) && method !== "GET" && method !== "HEAD") return "GET";
  return method;
}

export async function safeFetch(url: string, init: SafeFetchOptions = {}): Promise<Response> {
  const fetchImpl = init.fetchImpl ?? fetch;
  const resolver = init.resolver ?? defaultResolver;
  const maxRedirects = init.maxRedirects ?? DEFAULT_MAX_REDIRECTS;
  const timeoutMs = init.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const firstByteTimeoutMs = init.firstByteTimeoutMs ?? DEFAULT_FIRST_BYTE_TIMEOUT_MS;
  let currentUrl = url;
  let currentInit = withoutSafeOptions(init);
  let redirects = 0;

  while (true) {
    await assertSafeOutboundUrl(currentUrl, resolver);
    const { signal, cleanup } = combineSignals(currentInit.signal, firstByteTimeoutMs > 0 ? Math.min(timeoutMs, firstByteTimeoutMs) : timeoutMs);
    try {
      const response = await fetchImpl(currentUrl, { ...currentInit, redirect: "manual", signal });
      cleanup();
      if (!redirectStatus(response.status)) return response;
      const location = response.headers.get("location");
      if (!location) return response;
      if (redirects >= maxRedirects) throw new SsrfBlockedError("Outbound redirect limit exceeded");
      const nextUrl = new URL(location, currentUrl).toString();
      await assertSafeOutboundUrl(nextUrl, resolver);
      redirects += 1;
      const method = (currentInit.method ?? "GET").toUpperCase();
      const nextMethod = redirectedMethod(method, response.status);
      const nextInit: RequestInit = { ...currentInit, method: nextMethod };
      if (nextMethod === "GET" || nextMethod === "HEAD") {
        nextInit.body = null;
      } else if (currentInit.body !== undefined) {
        nextInit.body = currentInit.body;
      }
      currentInit = nextInit;
      currentUrl = nextUrl;
    } catch (error) {
      cleanup();
      if (error instanceof SsrfBlockedError) throw error;
      if (error instanceof Error && error.name === "AbortError") {
        throw new HTTPTimeoutError("Outbound request timed out");
      }
      throw error;
    }
  }
}


