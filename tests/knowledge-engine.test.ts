import { describe, expect, it } from 'vitest';
import { chunkKnowledgePages } from '@/lib/knowledge/ingestion';
import { reciprocalRankFusion } from '@/lib/knowledge/retrieval';

describe('enterprise knowledge engine', () => {
  it('keeps page citations while creating overlapping chunks', () => {
    const text = `Policy section\n${'A sentence about compliance. '.repeat(120)}`;
    const chunks = chunkKnowledgePages([{ num: 7, text }], 500, 80);
    expect(chunks.length).toBeGreaterThan(2);
    expect(chunks.every((chunk) => chunk.pageNumber === 7)).toBe(true);
    expect(chunks[0].sectionTitle).toBe('Policy section');
    expect(chunks.map((chunk) => chunk.chunkIndex)).toEqual(chunks.map((_, index) => index));
  });

  it('ignores empty pages and tiny extraction noise', () => {
    expect(chunkKnowledgePages([{ num: 1, text: '   ' }, { num: 2, text: 'tiny' }])).toEqual([]);
  });

  it('RRF rewards documents found by both retrieval strategies', () => {
    const fused = reciprocalRankFusion(['vector-only', 'both'], ['both', 'keyword-only']);
    expect(fused[0][0]).toBe('both');
    expect(new Set(fused.map(([id]) => id))).toEqual(new Set(['vector-only', 'both', 'keyword-only']));
  });
});
