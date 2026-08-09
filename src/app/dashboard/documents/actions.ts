'use server';
import { and, desc, eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { requireTenant } from '@/lib/auth/get-tenant';
import { requireRole } from '@/lib/auth/rbac';
import { db } from '@/lib/db/db';
import { documentSources, knowledgeRetrievalEvents } from '@/lib/db/schema/documents';
import { getErrorMessage } from '@/lib/errors';

export async function getKnowledgeControlData() {
  try { await requireRole('admin', 'finance', 'manager'); const tenant = await requireTenant();
    const [sources, events] = await Promise.all([
      db.select().from(documentSources).where(eq(documentSources.tenantId, tenant.id)).orderBy(desc(documentSources.createdAt)).limit(100),
      db.select().from(knowledgeRetrievalEvents).where(eq(knowledgeRetrievalEvents.tenantId, tenant.id)).orderBy(desc(knowledgeRetrievalEvents.createdAt)).limit(100),
    ]);
    return { success: true, data: { sources, metrics: { activeDocuments: sources.filter((row) => row.status === 'active').length,
      retrievals: events.length, noResultRate: events.length ? Math.round(events.filter((row) => row.resultCount === 0).length / events.length * 1000) / 10 : 0,
      averageLatencyMs: events.length ? Math.round(events.reduce((sum, row) => sum + row.latencyMs, 0) / events.length) : 0 } } };
  } catch (error) { return { success: false, error: getErrorMessage(error) }; }
}

export async function archiveKnowledgeDocument(id: string) {
  try { await requireRole('admin', 'manager'); const tenant = await requireTenant();
    await db.update(documentSources).set({ status: 'archived', updatedAt: new Date() })
      .where(and(eq(documentSources.id, z.string().uuid().parse(id)), eq(documentSources.tenantId, tenant.id)));
    revalidatePath('/dashboard/documents'); return { success: true };
  } catch (error) { return { success: false, error: getErrorMessage(error) }; }
}
