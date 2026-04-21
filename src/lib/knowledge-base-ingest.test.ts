import test from "node:test";
import assert from "node:assert/strict";

import { chunkKnowledgeText } from "./knowledge-base-ingest";

test("chunkKnowledgeText keeps short content in one chunk", () => {
  const chunks = chunkKnowledgeText("Business hours are Monday to Friday from 9 to 5.");

  assert.equal(chunks.length, 1);
  assert.equal(chunks[0]?.chunkIndex, 0);
  assert.match(chunks[0]?.text ?? "", /Monday to Friday/);
});

test("chunkKnowledgeText splits long content into multiple overlapping chunks", () => {
  const text = Array.from({ length: 80 }, (_, index) => `Sentence ${index + 1} about the repair shop.`).join(" ");

  const chunks = chunkKnowledgeText(text, {
    targetChars: 220,
    overlapChars: 60,
  });

  assert.ok(chunks.length > 1);
  assert.match(chunks[0]?.text ?? "", /Sentence 1/);
  assert.match(chunks[1]?.text ?? "", /Sentence 7|Sentence 8|Sentence 9/);
});

test("chunkKnowledgeText prefixes section titles onto each emitted chunk", () => {
  const text = "Oil Change\nBring your vehicle in every 5,000 miles for service.";

  const chunks = chunkKnowledgeText(text);

  assert.match(chunks[0]?.sectionTitle ?? "", /Oil Change/);
  assert.match(chunks[0]?.text ?? "", /Oil Change/);
});
