export type ApiEnvelope<T> =
  | { ok: true; data: T }
  | { ok: false; error: { code: string; message: string } };

function isEnvelope<T>(value: unknown): value is ApiEnvelope<T> {
  if (!value || typeof value !== "object") {
    return false;
  }
  const record = value as Record<string, unknown>;
  return typeof record.ok === "boolean";
}

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.body && !headers.has("content-type")) {
    headers.set("content-type", "application/json");
  }
  const response = await fetch(path, { ...init, headers });
  const contentType = response.headers.get("content-type") ?? "";
  const payload: unknown = contentType.includes("application/json") ? await response.json() : await response.text();
  if (!isEnvelope<T>(payload)) {
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return payload as T;
  }
  if (!payload.ok) {
    throw new Error(payload.error.message);
  }
  return payload.data;
}

export function jsonBody(value: unknown): string {
  return JSON.stringify(value);
}
