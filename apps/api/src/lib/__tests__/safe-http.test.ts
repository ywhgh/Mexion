import { describe, expect, it, vi } from "vitest";
import { safeFetch, SsrfBlockedError } from "../safe-http.js";

const publicResolver = async (): Promise<string[]> => ["93.184.216.34"];

function okFetch(): typeof fetch {
  return vi.fn(async () => new Response("ok", { status: 200 })) as unknown as typeof fetch;
}

describe("safeFetch", () => {
  it("blocks loopback", async () => {
    await expect(safeFetch("http://127.0.0.1", { fetchImpl: okFetch() })).rejects.toBeInstanceOf(SsrfBlockedError);
  });

  it("blocks metadata IP", async () => {
    await expect(safeFetch("http://169.254.169.254/latest/meta-data", { fetchImpl: okFetch() })).rejects.toBeInstanceOf(SsrfBlockedError);
  });

  it("blocks RFC1918 ranges", async () => {
    await expect(safeFetch("http://10.0.0.1", { fetchImpl: okFetch() })).rejects.toBeInstanceOf(SsrfBlockedError);
    await expect(safeFetch("http://192.168.1.1", { fetchImpl: okFetch() })).rejects.toBeInstanceOf(SsrfBlockedError);
  });

  it("blocks non-http schemes", async () => {
    await expect(safeFetch("file:///etc/passwd", { fetchImpl: okFetch() })).rejects.toBeInstanceOf(SsrfBlockedError);
  });

  it("allows normal https with mocked resolver/fetch", async () => {
    const fetchImpl = okFetch();
    const response = await safeFetch("https://api.openai.com/v1", { fetchImpl, resolver: publicResolver });
    expect(response.status).toBe(200);
    expect(fetchImpl).toHaveBeenCalledOnce();
  });

  it("revalidates redirects", async () => {
    const fetchImpl = vi.fn(async () => new Response(null, { status: 302, headers: { location: "http://127.0.0.1/" } })) as unknown as typeof fetch;
    await expect(safeFetch("https://api.openai.com/v1", { fetchImpl, resolver: publicResolver })).rejects.toBeInstanceOf(SsrfBlockedError);
  });
});
