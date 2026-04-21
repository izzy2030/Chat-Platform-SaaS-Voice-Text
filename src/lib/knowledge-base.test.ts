import test from "node:test";
import assert from "node:assert/strict";

import {
  buildKnowledgeBaseStats,
  coerceWebsiteUrl,
  getEffectiveValue,
} from "./knowledge-base";

test("coerceWebsiteUrl adds https when the protocol is omitted", () => {
  assert.equal(coerceWebsiteUrl("mikesautorepair.com"), "https://mikesautorepair.com");
});

test("coerceWebsiteUrl trims whitespace and preserves an existing protocol", () => {
  assert.equal(coerceWebsiteUrl(" https://mikesautorepair.com/about "), "https://mikesautorepair.com/about");
});

test("buildKnowledgeBaseStats counts only included indexed pages", () => {
  const stats = buildKnowledgeBaseStats([
    { included: true, crawlStatus: "indexed" },
    { included: true, crawlStatus: "indexed" },
    { included: false, crawlStatus: "indexed" },
    { included: true, crawlStatus: "excluded" },
  ]);

  assert.deepEqual(stats, {
    pagesIndexed: 2,
    urlsDiscovered: 4,
    includedPages: 3,
  });
});

test("getEffectiveValue keeps manual overrides above crawler values", () => {
  assert.equal(
    getEffectiveValue({
      manual: "773 Main St",
      extracted: "771 Main St",
    }),
    "773 Main St",
  );
});

test("getEffectiveValue falls back to extracted values when there is no override", () => {
  assert.equal(
    getEffectiveValue({
      manual: undefined,
      extracted: "Open 24/7",
    }),
    "Open 24/7",
  );
});
