import test from "node:test";
import assert from "node:assert/strict";

import {
  getEffectiveConversationState,
  GREETING_ONLY_RESOLVE_MS,
  INACTIVE_RESOLVE_MS,
  isGreetingOnlyPreview,
} from "./conversation-status";

const NOW = 1_700_000_000_000;

test("isGreetingOnlyPreview matches simple greetings", () => {
  assert.equal(isGreetingOnlyPreview("Hello"), true);
  assert.equal(isGreetingOnlyPreview("hey there!"), true);
});

test("isGreetingOnlyPreview rejects longer substantive messages", () => {
  assert.equal(isGreetingOnlyPreview("Hello I need help with pricing"), false);
});

test("getEffectiveConversationState keeps manual resolved conversations resolved", () => {
  assert.deepEqual(
    getEffectiveConversationState({
      status: "resolved",
      lastMessageAt: NOW - 60_000,
      lastMessagePreview: "Hello",
      messageCount: 1,
      now: NOW,
    }),
    { status: "resolved", resolutionReason: "manual" },
  );
});

test("getEffectiveConversationState auto-resolves stale greeting-only conversations", () => {
  assert.deepEqual(
    getEffectiveConversationState({
      status: "active",
      lastMessageAt: NOW - GREETING_ONLY_RESOLVE_MS,
      lastMessagePreview: "Hello",
      messageCount: 1,
      now: NOW,
    }),
    { status: "resolved", resolutionReason: "auto_greeting" },
  );
});

test("getEffectiveConversationState auto-resolves inactive conversations after timeout", () => {
  assert.deepEqual(
    getEffectiveConversationState({
      status: "ongoing",
      lastMessageAt: NOW - INACTIVE_RESOLVE_MS,
      lastMessagePreview: "Here is our pricing.",
      messageCount: 4,
      now: NOW,
    }),
    { status: "resolved", resolutionReason: "auto_inactive" },
  );
});

test("getEffectiveConversationState keeps recent conversations open", () => {
  assert.deepEqual(
    getEffectiveConversationState({
      status: "ongoing",
      lastMessageAt: NOW - 60_000,
      lastMessagePreview: "Here is our pricing.",
      messageCount: 4,
      now: NOW,
    }),
    { status: "ongoing", resolutionReason: null },
  );
});
