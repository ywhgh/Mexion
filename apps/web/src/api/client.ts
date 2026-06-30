export type ApiResult<T> = { ok: true; data: T } | { ok: false; error: { code: string; message: string } };

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.body && !headers.has("content-type")) {
    headers.set("content-type", "application/json");
  }
  const response = await fetch(path, {
    ...init,
    credentials: "include",
    headers,
  });
  const payload = (await response.json()) as ApiResult<T>;
  if (!payload.ok) {
    throw new Error(payload.error.message);
  }
  return payload.data;
}
