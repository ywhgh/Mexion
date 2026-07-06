import { describe, expect, it } from "vitest";
import {
  anthropicAssistantToResponsesItems,
  anthropicToResponsesRequest,
  responsesToAnthropicResponse,
  type AnthropicContentBlock,
} from "../anthropic-compat.js";

describe("anthropic responses compatibility", () => {
  it("converts basic Anthropic text dialogue to Responses input", () => {
    const converted = anthropicToResponsesRequest({
      model: "gpt-4o",
      system: "You are concise.",
      max_tokens: 128,
      messages: [{ role: "user", content: [{ type: "text", text: "hello" }] }],
    });
    expect(converted).toMatchObject({
      model: "gpt-4o",
      max_output_tokens: 128,
      input: [
        { type: "message", role: "system", content: [{ type: "input_text", text: "You are concise." }] },
        { type: "message", role: "user", content: [{ type: "input_text", text: "hello" }] },
      ],
    });
    expect(converted.messages).toBeUndefined();
  });

  it("converts assistant tool_use blocks to function calls", () => {
    const blocks: AnthropicContentBlock[] = [
      { type: "text", text: "checking" },
      { type: "tool_use", id: "toolu_1", name: "lookup", input: { q: "mexion" } },
      { type: "thinking", text: "hidden" },
    ];
    expect(anthropicAssistantToResponsesItems(blocks)).toEqual([
      { type: "message", role: "assistant", content: [{ type: "output_text", text: "checking" }] },
      { type: "function_call", call_id: "toolu_1", name: "lookup", arguments: JSON.stringify({ q: "mexion" }) },
    ]);
  });

  it("converts Responses output back to Anthropic message format", () => {
    const converted = responsesToAnthropicResponse({
      id: "resp_1",
      output: [
        { type: "message", content: [{ type: "output_text", text: "done" }] },
        { type: "function_call", call_id: "call_1", name: "save", arguments: "{\"ok\":true}" },
      ],
      usage: { input_tokens: 11, output_tokens: 7 },
    }, "claude-3-5-sonnet");
    expect(converted).toMatchObject({
      id: "resp_1",
      type: "message",
      role: "assistant",
      model: "claude-3-5-sonnet",
      content: [
        { type: "text", text: "done" },
        { type: "tool_use", id: "call_1", name: "save", input: { ok: true } },
      ],
      usage: { input_tokens: 11, output_tokens: 7 },
    });
  });
});
