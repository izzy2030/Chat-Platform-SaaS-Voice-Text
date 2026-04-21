import test from "node:test";
import assert from "node:assert/strict";

import {
  DEFAULT_VOICE_SYSTEM_PROMPT,
  buildDefaultTextSystemPrompt,
  normalizeSystemPrompt,
  resolveTextSystemInstruction,
  resolveVoiceSystemInstruction,
} from "./widget-agent-prompt";

test("normalizeSystemPrompt treats whitespace-only prompts as missing", () => {
  assert.equal(normalizeSystemPrompt("   \n  "), undefined);
});

test("resolveTextSystemInstruction falls back to the built-in text prompt", () => {
  assert.equal(
    resolveTextSystemInstruction({
      botName: "Hydra Agent",
      customPrompt: undefined,
    }),
    buildDefaultTextSystemPrompt("Hydra Agent"),
  );
});

test("resolveTextSystemInstruction uses the custom prompt when present", () => {
  assert.equal(
    resolveTextSystemInstruction({
      botName: "Hydra Agent",
      customPrompt: "Talk like a concierge.",
    }),
    "Talk like a concierge.",
  );
});

test("resolveTextSystemInstruction still appends knowledge base context after a custom prompt", () => {
  assert.equal(
    resolveTextSystemInstruction({
      botName: "Hydra Agent",
      customPrompt: "Only answer from approved docs.",
      knowledgeBaseContext: "Office hours are 9-5.",
    }),
    [
      "Only answer from approved docs.",
      "Use the following knowledge base context to answer questions. Prioritize this information over general knowledge:",
      "Office hours are 9-5.",
    ].join("\n\n"),
  );
});

test("resolveVoiceSystemInstruction falls back to the built-in voice prompt", () => {
  assert.equal(resolveVoiceSystemInstruction(undefined), DEFAULT_VOICE_SYSTEM_PROMPT);
});

test("resolveVoiceSystemInstruction uses the custom prompt when present", () => {
  assert.equal(
    resolveVoiceSystemInstruction("Be a calm, premium concierge."),
    "Be a calm, premium concierge.",
  );
});
