export type UsageTokens = { inputTokens: number; outputTokens: number };

const PRICE_TABLE: Array<{ provider: string; modelIncludes: string; input: number; output: number }> = [
  { provider: "openai", modelIncludes: "gpt-4o", input: 500, output: 1500 },
  { provider: "anthropic", modelIncludes: "claude-3-5-sonnet", input: 300, output: 1500 },
  { provider: "gemini", modelIncludes: "gemini-1.5-pro", input: 125, output: 375 },
];

function priceFor(provider: string, model: string): { input: number; output: number } {
  const lowerModel = model.toLowerCase();
  const lowerProvider = provider.toLowerCase();
  return PRICE_TABLE.find((item) => item.provider === lowerProvider && lowerModel.includes(item.modelIncludes)) ?? { input: 1000, output: 3000 };
}

export function estimateCost(provider: string, model: string, inputTokens: number, outputTokens: number): number {
  const price = priceFor(provider, model);
  return Math.max(1, Math.ceil((Math.max(0, inputTokens) * price.input + Math.max(0, outputTokens) * price.output) / 1_000_000));
}

function objectValue(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : null;
}

function numberField(obj: Record<string, unknown> | null, ...keys: string[]): number {
  if (!obj) return 0;
  for (const key of keys) {
    const value = obj[key];
    if (typeof value === "number") return value;
    if (typeof value === "string") return Number.parseInt(value, 10) || 0;
  }
  return 0;
}

export function parseUsageFromResponse(_provider: string, responseBody: unknown): UsageTokens {
  const body = objectValue(responseBody);
  const response = objectValue(body?.response);
  const message = objectValue(body?.message);
  const usage = objectValue(body?.usage) ?? objectValue(response?.usage) ?? objectValue(message?.usage) ?? objectValue(body?.usageMetadata);
  const inputTokens = numberField(usage, "prompt_tokens", "input_tokens", "inputTokens", "promptTokenCount");
  const outputTokens = numberField(usage, "completion_tokens", "output_tokens", "outputTokens", "candidatesTokenCount");
  const totalTokens = numberField(usage, "total_tokens", "totalTokens", "totalTokenCount");
  if ((inputTokens > 0 || outputTokens > 0) || totalTokens === 0) return { inputTokens, outputTokens };
  return { inputTokens: Math.max(0, Math.floor(totalTokens * 0.7)), outputTokens: Math.max(0, Math.ceil(totalTokens * 0.3)) };
}
