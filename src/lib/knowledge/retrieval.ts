import { createHash } from 'node:crypto';
import { embed } from 'ai';
import { google } from '@ai-sdk/google';
import { and, desc, eq, gt, isNotNull, isNull, lte, or, sql } from 'drizzle-orm';
import { db } from '@/lib/db/db';
import { documentChunks, documentSources, knowledgeRetrievalEvents } from '@/lib/db/schema/documents';

type Scope = 'user_document' | 'zatca_regulation';
type Candidate = { id: string; documentId: string | null; fileName: string; content: string; pageNumber: number | null;
  sectionTitle: string | null; version: number | null; visibility: string | null; allowedRoles: unknown; metric: number };

function canRead(row: Candidate, role: string) {
  if (!row.documentId || row.visibility !== 'restricted') return true;
  return Array.isArray(row.allowedRoles) && row.allowedRoles.includes(role);
}

export function reciprocalRankFusion(vectorIds: string[], keywordIds: string[], k = 60) {
  const scores = new Map<string, number>();
  for (const ids of [vectorIds, keywordIds]) ids.forEach((id, rank) => scores.set(id, (scores.get(id) || 0) + 1 / (k + rank + 1)));
  return [...scores.entries()].sort((a, b) => b[1] - a[1]);
}

export async function retrieveKnowledge(input: { tenantId: string; userId: string; role: string; query: string; scope: Scope; limit?: number }) {
  const started = Date.now(); const limit = Math.min(10, Math.max(1, input.limit || 5));
  const { embedding } = await embed({ model: google.embedding('text-embedding-004'), value: input.query });
  const tenantFilter = input.scope === 'zatca_regulation'
    ? and(eq(documentChunks.docType, input.scope), or(isNull(documentChunks.tenantId), eq(documentChunks.tenantId, input.tenantId)))
    : and(eq(documentChunks.docType, input.scope), eq(documentChunks.tenantId, input.tenantId));
  const now = new Date();
  const sourceFilter = or(isNull(documentChunks.documentId), and(eq(documentSources.status, 'active'),
    or(isNull(documentSources.effectiveAt), lte(documentSources.effectiveAt, now)),
    or(isNull(documentSources.expiresAt), gt(documentSources.expiresAt, now))));
  const selectBase = { id: documentChunks.id, documentId: documentChunks.documentId, fileName: documentChunks.fileName,
    content: documentChunks.content, pageNumber: documentChunks.pageNumber, sectionTitle: documentChunks.sectionTitle,
    version: documentSources.version, visibility: documentSources.visibility, allowedRoles: documentSources.allowedRoles };
  const similarity = sql<number>`1 - (${documentChunks.embedding} <=> ${JSON.stringify(embedding)})`;
  const vectorRows = await db.select({ ...selectBase, metric: similarity }).from(documentChunks)
    .leftJoin(documentSources, eq(documentChunks.documentId, documentSources.id))
    .where(and(tenantFilter, sourceFilter, isNotNull(documentChunks.embedding))).orderBy(desc(similarity)).limit(30) as Candidate[];
  const lexicalRank = sql<number>`ts_rank_cd(to_tsvector('simple', ${documentChunks.content}), websearch_to_tsquery('simple', ${input.query}))`;
  const keywordRows = await db.select({ ...selectBase, metric: lexicalRank }).from(documentChunks)
    .leftJoin(documentSources, eq(documentChunks.documentId, documentSources.id))
    .where(and(tenantFilter, sourceFilter, sql`to_tsvector('simple', ${documentChunks.content}) @@ websearch_to_tsquery('simple', ${input.query})`))
    .orderBy(desc(lexicalRank)).limit(30) as Candidate[];
  const vectors = vectorRows.filter((row) => canRead(row, input.role)); const keywords = keywordRows.filter((row) => canRead(row, input.role));
  const byId = new Map([...vectors, ...keywords].map((row) => [row.id, row])); const fused = reciprocalRankFusion(vectors.map((row) => row.id), keywords.map((row) => row.id));
  const max = fused[0]?.[1] || 1;
  const results = fused.slice(0, limit).map(([id, score]) => { const row = byId.get(id)!; return { id: row.id, documentId: row.documentId,
    fileName: row.fileName, excerpt: row.content.slice(0, 1600), page: row.pageNumber, section: row.sectionTitle, version: row.version,
    score: Math.round(score / max * 100), citation: `${row.fileName}${row.version ? ` v${row.version}` : ''}${row.pageNumber ? `, p.${row.pageNumber}` : ''}${row.sectionTitle ? ` — ${row.sectionTitle}` : ''}` }; });
  await db.insert(knowledgeRetrievalEvents).values({ tenantId: input.tenantId, userId: input.userId,
    queryHash: createHash('sha256').update(input.query).digest('hex'), scope: input.scope, resultCount: results.length,
    topScore: results[0]?.score, latencyMs: Date.now() - started, citations: results.map((row) => ({ documentId: row.documentId, page: row.page, score: row.score })) })
    .catch((error) => console.error('Knowledge retrieval telemetry failed:', error));
  return { results, generatedAt: new Date().toISOString(), retrieval: { strategy: 'hybrid_rrf', vectorCandidates: vectors.length, keywordCandidates: keywords.length } };
}
