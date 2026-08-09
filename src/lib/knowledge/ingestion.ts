export type PageInput = { num: number; text: string };
export type KnowledgeChunk = { content: string; pageNumber: number; sectionTitle: string | null; chunkIndex: number };

function sectionFrom(text: string) {
  const first = text.split(/\r?\n/).map((line) => line.trim()).find((line) => line.length >= 3 && line.length <= 120);
  return first || null;
}

export function chunkKnowledgePages(pages: PageInput[], maxChars = 1400, overlap = 180): KnowledgeChunk[] {
  const chunks: KnowledgeChunk[] = [];
  for (const page of pages) {
    const cleaned = page.text.replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim();
    if (!cleaned) continue;
    const sectionTitle = sectionFrom(cleaned);
    let start = 0;
    while (start < cleaned.length) {
      let end = Math.min(cleaned.length, start + maxChars);
      if (end < cleaned.length) {
        const boundary = Math.max(cleaned.lastIndexOf('\n', end), cleaned.lastIndexOf('. ', end));
        if (boundary > start + maxChars * 0.55) end = boundary + 1;
      }
      const content = cleaned.slice(start, end).trim();
      if (content.length >= 30) chunks.push({ content, pageNumber: page.num, sectionTitle, chunkIndex: chunks.length });
      if (end >= cleaned.length) break;
      start = Math.max(start + 1, end - overlap);
    }
  }
  return chunks;
}
