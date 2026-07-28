import { describe, expect, it, vi } from "vitest";
import { createMexionLocalPreviewPlugin } from "../vite-local-preview";
import {
  isTrustedPreviewRequest,
  requireLoopbackBackendUrl,
  serializeForInlineScript,
} from "../vite-security";

describe("Vite security helpers", () => {
  it("escapes script-breaking inline JSON characters", () => {
    const serialized = serializeForInlineScript({ value: "</script><script>alert(1)</script>" });
    expect(serialized).not.toContain("<");
    expect(JSON.parse(serialized)).toEqual({ value: "</script><script>alert(1)</script>" });
  });

  it("allows only an HTTP loopback backend root for preview credentials", () => {
    expect(requireLoopbackBackendUrl("http://127.0.0.1:8080").port).toBe("8080");
    expect(() => requireLoopbackBackendUrl("https://example.com")).toThrow(/loopback/);
    expect(() => requireLoopbackBackendUrl("http://localhost:8080/api")).toThrow(/loopback/);
    expect(() => requireLoopbackBackendUrl("http://user:pass@127.0.0.1:8080")).toThrow(/loopback/);
  });

  it("requires loopback transport and a same-origin host", () => {
    expect(
      isTrustedPreviewRequest({
        remoteAddress: "::ffff:127.0.0.1",
        host: "127.0.0.1:5515",
        origin: "http://127.0.0.1:5515",
        fetchSite: "same-origin",
      }),
    ).toBe(true);

    expect(
      isTrustedPreviewRequest({
        remoteAddress: "192.168.1.20",
        host: "127.0.0.1:5515",
        origin: "http://127.0.0.1:5515",
        fetchSite: "same-origin",
      }),
    ).toBe(false);

    expect(
      isTrustedPreviewRequest({
        remoteAddress: "127.0.0.1",
        host: "attacker.example",
        origin: "http://attacker.example",
        fetchSite: "same-origin",
      }),
    ).toBe(false);
  });

  it("removes preview credentials from the Vite environment after snapshotting them", async () => {
    const emailName = "MEXION_PREVIEW_ADMIN_EMAIL";
    const passwordName = "MEXION_PREVIEW_ADMIN_PASSWORD";
    const previousEmail = process.env[emailName];
    const previousPassword = process.env[passwordName];
    const expectedEmail = "preview@example.test";
    const expectedPassword = "test-only-password";

    try {
      process.env[emailName] = expectedEmail;
      process.env[passwordName] = expectedPassword;
      const plugin = createMexionLocalPreviewPlugin("http://127.0.0.1:8080");

      expect(process.env[emailName]).toBeUndefined();
      expect(process.env[passwordName]).toBeUndefined();

      type Middleware = (
        request: {
          method: string;
          socket: { remoteAddress: string };
          headers: Record<string, string>;
        },
        response: {
          statusCode: number;
          setHeader: ReturnType<typeof vi.fn>;
          end: ReturnType<typeof vi.fn>;
        },
      ) => Promise<void>;

      let middleware: Middleware | undefined;
      if (typeof plugin.configureServer !== "function") {
        throw new Error("Expected a configureServer hook");
      }
      plugin.configureServer({
        middlewares: {
          use: (_path: string, handler: Middleware) => {
            middleware = handler;
          },
        },
      } as never);
      if (!middleware) throw new Error("Preview middleware was not registered");

      const refreshCookie =
        "sub2api_refresh_token=opaque; Path=/api/v1/auth; HttpOnly; SameSite=Lax";
      const fetchMock = vi.fn(async (_input: URL | string, _init?: RequestInit) => ({
        status: 200,
        headers: {
          get: (name: string) =>
            name.toLowerCase() === "set-cookie" ? refreshCookie : "application/json",
        },
        text: async () => '{"code":0}',
      }));
      vi.stubGlobal("fetch", fetchMock);

      const setHeader = vi.fn();
      await middleware(
        {
          method: "POST",
          socket: { remoteAddress: "127.0.0.1" },
          headers: {
            host: "127.0.0.1:5515",
            origin: "http://127.0.0.1:5515",
            "sec-fetch-site": "same-origin",
            "x-mexion-preview": "1",
          },
        },
        {
          statusCode: 0,
          setHeader,
          end: vi.fn(),
        },
      );

      const requestInit = fetchMock.mock.calls[0]?.[1];
      expect(JSON.parse(String(requestInit?.body))).toEqual({
        email: expectedEmail,
        password: expectedPassword,
      });
      expect(new Headers(requestInit?.headers).get("X-User-UI-Request")).toBe("1");
      expect(setHeader).toHaveBeenCalledWith("Set-Cookie", refreshCookie);
    } finally {
      vi.unstubAllGlobals();
      if (previousEmail === undefined) delete process.env[emailName];
      else process.env[emailName] = previousEmail;
      if (previousPassword === undefined) delete process.env[passwordName];
      else process.env[passwordName] = previousPassword;
    }
  });
});
