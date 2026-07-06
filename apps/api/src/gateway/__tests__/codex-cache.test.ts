import { describe, expect, it } from "vitest";
import { injectPromptCacheControl } from "../codex-cache.js";

function largePrompt(): string {
  return "cache ".repeat(900);
}

describe("codex prompt cache injection", () => {
  it("injects Anthropic cache_control into a large system prompt", () => {
    const body = {
      model: "claude-3-5-sonnet",
      messages: [
        { role: "system", content: [{ type: "text", text: largePrompt() }] },
        { role: "user", content: "hello" },
      ],
    };
    const enriched = injectPromptCacheControl(body, "anthropic");
    const messages = enriched.messages as Array<{ content: unknown }>;
    expect(enriched).not.toBe(body);
    expect(messages[0]?.content).toEqual([
      { type: "text", text: largePrompt(), cache_control: { type: "ephemeral" } },
    ]);
  });

  it("does not modify OpenAI provider bodies", () => {
    const body = { model: "gpt-4o", messages: [{ role: "system", content: largePrompt() }] };
    expect(injectPromptCacheControl(body, "openai")).toBe(body);
  });

  it("does not inject small prompts", () => {
    const body = { model: "claude-3-5-sonnet", messages: [{ role: "system", content: "short prompt" }] };
    expect(injectPromptCacheControl(body, "anthropic")).toBe(body);
  });
});
