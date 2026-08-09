import { createHash } from 'node:crypto';
import { NextResponse } from 'next/server';
import { and, desc, eq } from 'drizzle-orm';
import { embedMany } from 'ai';
import { google } from '@ai-sdk/google';
import { PDFParse } from 'pdf-parse';
import { z } from 'zod';
import { db } from '@/lib/db/db';
import { documentChunks, documentSources } from '@/lib/db/schema/documents';
import { getErrorMessage } from '@/lib/errors';
import { requireTenant } from '@/lib/auth/get-tenant';
import { requireRole } from '@/lib/auth/rbac';
import { chunkKnowledgePages } from '@/lib/knowledge/ingestion';

const MAX_PDF_BYTES = 20 * 1024 * 1024;
const visibilitySchema = z.enum(['company', 'restricted']).default('company');
const roleSchema = z.enum(['admin', 'finance', 'manager', 'member']);

export async function POST(req: Request) {
  try {
    const user = await requireRole('admin', 'finance', 'manager'); const tenant = await requireTenant();
    const formData = await req.formData(); const file = formData.get('file');
    if (!(file instanceof File)) return NextResponse.json({ error: 'Missing file' }, { status: 400 });
    if (file.type !== 'application/pdf' || !file.name.toLowerCase().endsWith('.pdf')) return NextResponse.json({ error: 'Only PDF files are allowed' }, { status: 415 });
    if (file.size <= 0 || file.size > MAX_PDF_BYTES) return NextResponse.json({ error: 'PDF must be between 1 byte and 20 MB' }, { status: 413 });
    const visibility = visibilitySchema.parse(formData.get('visibility') || 'company');
    const allowedRoles = visibility === 'restricted' ? z.array(roleSchema).min(1).parse(String(formData.get('allowedRoles') || '').split(',').filter(Boolean)) : null;
    const buffer = Buffer.from(await file.arrayBuffer()); const checksum = createHash('sha256').update(buffer).digest('hex');
    const [duplicate] = await db.select({ id: documentSources.id, version: documentSources.version }).from(documentSources)
      .where(and(eq(documentSources.tenantId, tenant.id), eq(documentSources.checksum, checksum))).limit(1);
    if (duplicate) return NextResponse.json({ error: 'Identical document already exists', documentId: duplicate.id, version: duplicate.version }, { status: 409 });
    const parser = new PDFParse({ data: buffer }); const pdf = await parser.getText(); await parser.destroy();
    const chunks = chunkKnowledgePages(pdf.pages); if (!chunks.length) return NextResponse.json({ error: 'No searchable text extracted; OCR is required for this scanned PDF.' }, { status: 422 });
    const { embeddings } = await embedMany({ model: google.embedding('text-embedding-004'), values: chunks.map((chunk) => chunk.content) });
    const [previous] = await db.select().from(documentSources).where(and(eq(documentSources.tenantId, tenant.id), eq(documentSources.fileName, file.name)))
      .orderBy(desc(documentSources.version)).limit(1);
    const source = await db.transaction(async (tx) => {
      if (previous?.status === 'active') await tx.update(documentSources).set({ status: 'superseded', updatedAt: new Date() }).where(eq(documentSources.id, previous.id));
      const [created] = await tx.insert(documentSources).values({ tenantId: tenant.id, docType: 'user_document', fileName: file.name,
        title: file.name.replace(/\.pdf$/i, ''), checksum, version: (previous?.version || 0) + 1, visibility, allowedRoles,
        pageCount: pdf.total, supersedesId: previous?.id, uploadedByUserId: user.id }).returning();
      await tx.insert(documentChunks).values(chunks.map((chunk, index) => ({ tenantId: tenant.id, docType: 'user_document', fileName: file.name,
        documentId: created.id, chunkIndex: chunk.chunkIndex, pageNumber: chunk.pageNumber, sectionTitle: chunk.sectionTitle,
        content: chunk.content, embedding: embeddings[index] })));
      return created;
    });
    return NextResponse.json({ success: true, documentId: source.id, version: source.version, chunksCount: chunks.length, pages: pdf.total });
  } catch (error) { console.error('Knowledge ingestion failed:', error); return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 }); }
}
