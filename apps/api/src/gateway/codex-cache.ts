type JsonRecord = Record<string, unknown>;

function isRecord(value: unknown): value is JsonRecord {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function messageTextLength(message: JsonRecord): number {
  const content = message.content;
  if (typeof content === "string") return content.length;
  if (!Array.isArray(content)) return 0;
  return content.reduce((sum, block) => {
    if (!isRecord(block)) return sum;
    const text = block.text;
    return typeof text === "string" ? sum + text.length : sum;
  }, 0);
}

function messageTokenEstimate(message: JsonRecord): number {
  return Math.ceil(messageTextLength(message) / 4);
}

function cloneMessages(messages: unknown[]): JsonRecord[] {
  return messages.map((message) => (isRecord(message) ? { ...message } : { role: "user", content: String(message ?? "") }));
}

function cloneContentBlocks(content: unknown): JsonRecord[] {
  if (typeof content === "string") return [{ type: "text", text: content }];
  if (!Array.isArray(content)) return [];
  return content.map((block) => (isRecord(block) ? { ...block } : { type: "text", text: String(block ?? "") }));
}

function injectIntoMessage(message: JsonRecord): JsonRecord | null {
  if (messageTokenEstimate(message) < 1024) return null;
  const content = message.content;
  if (typeof content === "string") {
    return { ...message, content: [{ type: "text", text: content, cache_control: { type: "ephemeral" } }] };
  }
  const blocks = cloneContentBlocks(content);
  for (let index = blocks.length - 1; index >= 0; index -= 1) {
    const block = blocks[index];
    if (!block || typeof block.text !== "string") continue;
    if (isRecord(block.cache_control)) return null;
    blocks[index] = { ...block, cache_control: { type: "ephemeral" } };
    return { ...message, content: blocks };
  }
  return null;
}

function findCacheCandidate(messages: JsonRecord[]): number {
  const systemIndex = messages.findIndex((message) => message.role === "system" && messageTokenEstimate(message) >= 1024);
  if (systemIndex >= 0) return systemIndex;
  return messages.findIndex((message) => message.role === "user" && messageTokenEstimate(message) >= 1024);
}

export function injectPromptCacheControl(requestBody: Record<string, unknown>, provider: string): Record<string, unknown> {
  if (provider !== "anthropic") return requestBody;
  const field = Array.isArray(requestBody.messages) ? "messages" : (Array.isArray(requestBody.input) ? "input" : null);
  if (!field) return requestBody;
  const sourceMessages = requestBody[field];
  if (!Array.isArray(sourceMessages)) return requestBody;
  const messages = cloneMessages(sourceMessages);
  const candidateIndex = findCacheCandidate(messages);
  if (candidateIndex < 0) return requestBody;
  const injected = injectIntoMessage(messages[candidateIndex] ?? {});
  if (!injected) return requestBody;
  messages[candidateIndex] = injected;
  return { ...requestBody, [field]: messages };
}
