export type KnowledgeChunk = {
  chunkIndex: number;
  sectionTitle?: string;
  text: string;
  charCount: number;
};

type ChunkOptions = {
  targetChars?: number;
  overlapChars?: number;
};

function normalizeText(text: string) {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/\u00a0/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function chunkKnowledgeText(
  rawText: string,
  options: ChunkOptions = {},
): KnowledgeChunk[] {
  const text = normalizeText(rawText);
  if (!text) {
    return [];
  }

  const targetChars = Math.max(options.targetChars ?? 1800, 300);
  const overlapChars = Math.max(options.overlapChars ?? 200, 0);
  const paragraphs = text.split(/\n\s*\n/).map((paragraph) => paragraph.trim()).filter(Boolean);
  const units = paragraphs.flatMap((paragraph) => {
    if (paragraph.length <= targetChars) {
      return [paragraph];
    }

    return paragraph
      .split(/(?<=[.!?])\s+/)
      .map((sentence) => sentence.trim())
      .filter(Boolean);
  });
  const firstLine = paragraphs[0]?.split("\n")[0]?.trim();
  const sectionTitle =
    firstLine && firstLine.length < 100 && !/[.!?]$/.test(firstLine)
      ? firstLine
      : undefined;

  const chunks: KnowledgeChunk[] = [];
  let buffer = "";
  let chunkIndex = 0;

  for (const unit of units) {
    const separator = buffer.includes("\n") || unit.includes("\n") ? "\n\n" : " ";
    const candidate = buffer ? `${buffer}${separator}${unit}` : unit;
    if (candidate.length <= targetChars || !buffer) {
      buffer = candidate;
      continue;
    }

    const textWithTitle = sectionTitle && !buffer.startsWith(sectionTitle)
      ? `${sectionTitle}\n\n${buffer}`
      : buffer;

    chunks.push({
      chunkIndex,
      sectionTitle,
      text: textWithTitle,
      charCount: textWithTitle.length,
    });
    chunkIndex += 1;

    const overlap = buffer.slice(Math.max(buffer.length - overlapChars, 0)).trim();
    buffer = overlap ? `${overlap} ${unit}`.trim() : unit;
  }

  if (buffer) {
    const textWithTitle = sectionTitle && !buffer.startsWith(sectionTitle)
      ? `${sectionTitle}\n\n${buffer}`
      : buffer;

    chunks.push({
      chunkIndex,
      sectionTitle,
      text: textWithTitle,
      charCount: textWithTitle.length,
    });
  }

  return chunks;
}
