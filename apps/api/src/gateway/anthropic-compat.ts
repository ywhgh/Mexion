import crypto from "node:crypto";

type JsonRecord = Record<string, unknown>;

export type AnthropicContentBlock = JsonRecord & {
  type: string;
  text?: string;
  id?: string;
  name?: string;
  input?: unknown;
  tool_use_id?: string;
  content?: unknown;
  source?: unknown;
};
export type AnthropicMessagesRequest = JsonRecord & {
  model?: string;
  system?: string | AnthropicContentBlock[];
  messages?: Array<{ role: string; content: string | AnthropicContentBlock[] }>;
  max_tokens?: number;
  temperature?: number;
  tools?: unknown[];
  stream?: boolean;
};
export type OpenAIResponsesRequest = JsonRecord & {
  model?: string;
  input: ResponsesInputItem[];
};
export type OpenAIResponsesResponse = JsonRecord;
export type ResponsesInputItem = JsonRecord;
export type AnthropicMessagesResponse = JsonRecord & {
  id: string;
  type: "message";
  role: "assistant";
  model: string;
  content: AnthropicContentBlock[];
  stop_reason: string | null;
  stop_sequence: null;
  usage: { input_tokens: number; output_tokens: number };
};

function isRecord(value: unknown): value is JsonRecord {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function textValue(value: unknown): string {
  if (typeof value === "string") return value;
  if (value === null || value === undefined) return "";
  return JSON.stringify(value);
}

function contentBlocks(content: string | AnthropicContentBlock[] | unknown): AnthropicContentBlock[] {
  if (typeof content === "string") return [{ type: "text", text: content }];
  if (!Array.isArray(content)) return [];
  return content.flatMap((block) => (isRecord(block) && typeof block.type === "string" ? [block as AnthropicContentBlock] : []));
}

function contentText(content: unknown): string {
  if (typeof content === "string") return content;
  if (!Array.isArray(content)) return textValue(content);
  return content.map((block) => (isRecord(block) && typeof block.text === "string" ? block.text : textValue(block))).join("");
}

function inputImageFromSource(source: unknown): JsonRecord {
  if (!isRecord(source)) return { type: "input_image", image_url: "" };
  if (source.type === "base64" && typeof source.data === "string") {
    const mediaType = typeof source.media_type === "string" ? source.media_type : "application/octet-stream";
    return { type: "input_image", image_url: `data:${mediaType};base64,${source.data}` };
  }
  if (typeof source.url === "string") return { type: "input_image", image_url: source.url };
  return { type: "input_image", source };
}

function userMessageToResponsesItems(blocks: AnthropicContentBlock[]): ResponsesInputItem[] {
  const content: JsonRecord[] = [];
  const items: ResponsesInputItem[] = [];
  for (const block of blocks) {
    if (block.type === "text") content.push({ type: "input_text", text: block.text ?? "" });
    else if (block.type === "image") content.push(inputImageFromSource(block.source));
    else if (block.type === "tool_result") {
      items.push({ type: "function_call_output", call_id: block.tool_use_id ?? "", output: contentText(block.content) });
    }
  }
  if (content.length > 0) items.unshift({ type: "message", role: "user", content });
  return items;
}

export function anthropicAssistantToResponsesItems(content: AnthropicContentBlock[]): ResponsesInputItem[] {
  const items: ResponsesInputItem[] = [];
  for (const block of content) {
    if (block.type === "text") {
      items.push({ type: "message", role: "assistant", content: [{ type: "output_text", text: block.text ?? "" }] });
    } else if (block.type === "tool_use") {
      items.push({ type: "function_call", call_id: block.id ?? crypto.randomUUID(), name: block.name ?? "tool", arguments: JSON.stringify(block.input ?? {}) });
    }
  }
  return items;
}

function convertTools(tools: unknown): unknown {
  if (!Array.isArray(tools)) return undefined;
  return tools.flatMap((tool) => {
    if (!isRecord(tool) || typeof tool.name !== "string") return [];
    return [{
      type: "function",
      name: tool.name,
      description: typeof tool.description === "string" ? tool.description : "",
      parameters: isRecord(tool.input_schema) ? tool.input_schema : { type: "object", properties: {} },
    }];
  });
}

export function anthropicToResponsesRequest(anthropicBody: AnthropicMessagesRequest): OpenAIResponsesRequest {
  const input: ResponsesInputItem[] = [];
  if (anthropicBody.system) {
    input.push({ type: "message", role: "system", content: [{ type: "input_text", text: contentText(anthropicBody.system) }] });
  }
  for (const message of anthropicBody.messages ?? []) {
    const blocks = contentBlocks(message.content);
    if (message.role === "assistant") input.push(...anthropicAssistantToResponsesItems(blocks));
    else input.push(...userMessageToResponsesItems(blocks));
  }
  const request: OpenAIResponsesRequest = { ...anthropicBody, input };
  delete request.messages;
  delete request.system;
  if (typeof anthropicBody.max_tokens === "number") {
    request.max_output_tokens = anthropicBody.max_tokens;
    delete request.max_tokens;
  }
  const tools = convertTools(anthropicBody.tools);
  if (tools) request.tools = tools;
  return request;
}

function usage(body: OpenAIResponsesResponse): { input_tokens: number; output_tokens: number } {
  const raw = isRecord(body.usage) ? body.usage : {};
  return {
    input_tokens: Number(raw.input_tokens ?? raw.prompt_tokens ?? 0),
    output_tokens: Number(raw.output_tokens ?? raw.completion_tokens ?? 0),
  };
}

function parseArguments(value: unknown): unknown {
  if (typeof value !== "string") return value ?? {};
  try {
    return JSON.parse(value) as unknown;
  } catch {
    return value;
  }
}

function convertOutputItem(item: JsonRecord): AnthropicContentBlock[] {
  if (item.type === "function_call") {
    return [{ type: "tool_use", id: String(item.call_id ?? item.id ?? crypto.randomUUID()), name: String(item.name ?? "tool"), input: parseArguments(item.arguments) }];
  }
  if (item.type !== "message" || !Array.isArray(item.content)) return [];
  return item.content.flatMap((part) => {
    if (!isRecord(part)) return [];
    if ((part.type === "output_text" || part.type === "text") && typeof part.text === "string") return [{ type: "text", text: part.text }];
    return [];
  });
}

export function responsesToAnthropicResponse(responsesBody: OpenAIResponsesResponse, originalModel: string): AnthropicMessagesResponse {
  const output = Array.isArray(responsesBody.output) ? responsesBody.output : [];
  let content = output.flatMap((item) => (isRecord(item) ? convertOutputItem(item) : []));
  if (content.length === 0 && typeof responsesBody.output_text === "string") content = [{ type: "text", text: responsesBody.output_text }];
  return {
    id: typeof responsesBody.id === "string" ? responsesBody.id : `msg_${crypto.randomUUID().replace(/-/g, "")}`,
    type: "message",
    role: "assistant",
    model: originalModel,
    content,
    stop_reason: "end_turn",
    stop_sequence: null,
    usage: usage(responsesBody),
  };
}

export function anthropicResponseToSse(response: AnthropicMessagesResponse): string {
  const lines: string[] = [];
  const message = { ...response, content: [] };
  lines.push(`event: message_start\ndata: ${JSON.stringify({ type: "message_start", message })}\n`);
  response.content.forEach((block, index) => {
    lines.push(`event: content_block_start\ndata: ${JSON.stringify({ type: "content_block_start", index, content_block: block.type === "text" ? { type: "text", text: "" } : block })}\n`);
    if (block.type === "text" && block.text) {
      lines.push(`event: content_block_delta\ndata: ${JSON.stringify({ type: "content_block_delta", index, delta: { type: "text_delta", text: block.text } })}\n`);
    }
    lines.push(`event: content_block_stop\ndata: ${JSON.stringify({ type: "content_block_stop", index })}\n`);
  });
  lines.push(`event: message_delta\ndata: ${JSON.stringify({ type: "message_delta", delta: { stop_reason: response.stop_reason, stop_sequence: null }, usage: response.usage })}\n`);
  lines.push(`event: message_stop\ndata: ${JSON.stringify({ type: "message_stop" })}\n`);
  return `${lines.join("\n")}\n`;
}
