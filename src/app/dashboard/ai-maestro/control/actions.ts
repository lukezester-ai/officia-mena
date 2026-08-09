'use server';

import { and, desc, eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { requireTenant } from '@/lib/auth/get-tenant';
import { requireRole } from '@/lib/auth/rbac';
import { db } from '@/lib/db/db';
import { maestroAiRuns } from '@/lib/db/schema/ai_orchestration';
import { deleteMaestroMemory, loadMaestroMemory } from '@/lib/ai/memory';
import { getErrorMessage } from '@/lib/errors';

export async function getMaestroControlData() {
  try {
    const user = await requireRole('admin', 'finance', 'manager', 'member');
    const tenant = await requireTenant();
    const runFilter = ['admin', 'manager'].includes(user.role)
      ? eq(maestroAiRuns.tenantId, tenant.id)
      : and(eq(maestroAiRuns.tenantId, tenant.id), eq(maestroAiRuns.userId, user.id));
    const [runs, memories] = await Promise.all([
      db.select().from(maestroAiRuns).where(runFilter).orderBy(desc(maestroAiRuns.createdAt)).limit(100),
      loadMaestroMemory(tenant.id, user.id),
    ]);
    const completed = runs.filter((run) => run.status === 'completed');
    const failed = runs.filter((run) => run.status === 'failed');
    const measured = completed.filter((run) => run.latencyMs !== null);
    return { success: true, data: { runs, memories, metrics: {
      totalRuns: runs.length, successRate: runs.length ? Math.round(completed.length / runs.length * 1000) / 10 : 100,
      failedRuns: failed.length, averageLatencyMs: measured.length ? Math.round(measured.reduce((sum, run) => sum + (run.latencyMs || 0), 0) / measured.length) : 0,
      totalTokens: runs.reduce((sum, run) => sum + (run.totalTokens || 0), 0),
    } } };
  } catch (error) { return { success: false, error: getErrorMessage(error) }; }
}

export async function removeMaestroMemory(memoryId: string) {
  try {
    const user = await requireRole('admin', 'finance', 'manager', 'member');
    const tenant = await requireTenant();
    await deleteMaestroMemory({ tenantId: tenant.id, userId: user.id, memoryId: z.string().uuid().parse(memoryId),
      canManageCompany: ['admin', 'manager'].includes(user.role) });
    revalidatePath('/dashboard/ai-maestro/control');
    return { success: true };
  } catch (error) { return { success: false, error: getErrorMessage(error) }; }
}
