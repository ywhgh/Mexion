const SENSITIVE_HEADER_NAMES = new Set([
  "authorization",
  "x-api-key",
  "x-goog-api-key",
  "cookie",
  "set-cookie",
  "x-auth-token",
  "x-access-token",
]);

const SENSITIVE_BODY_KEY = /(password|secret|token|key|auth|credential|bearer)/i;
const REDACTED = "[REDACTED]";

export function redactHeaders(headers: Record<string, string>): Record<string, string> {
  const redacted: Record<string, string> = {};
  for (const [key, value] of Object.entries(headers)) {
    redacted[key] = SENSITIVE_HEADER_NAMES.has(key.toLowerCase()) ? REDACTED : value;
  }
  return redacted;
}

function redactValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map((item) => redactValue(item));
  if (value && typeof value === "object") return redactBody(value as Record<string, unknown>);
  return value;
}

export function redactBody(data: Record<string, unknown>): Record<string, unknown> {
  const output: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    output[key] = SENSITIVE_BODY_KEY.test(key) ? REDACTED : redactValue(value);
  }
  return output;
}
