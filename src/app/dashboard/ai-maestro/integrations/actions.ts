'use server';
import { and, desc, eq } from 'drizzle-orm';
import { z } from 'zod';
import { requireTenant } from '@/lib/auth/get-tenant';
import { requireRole } from '@/lib/auth/rbac';
import { db } from '@/lib/db/db';
import { integrationConnections, integrationJobs } from '@/lib/db/schema/ai_orchestration';
import { checkConnectors } from '@/lib/integrations/connectors';
import { getErrorMessage } from '@/lib/errors';
import { syncOpenBankingForTenant } from '@/lib/integrations/bank-sync';

export async function refreshIntegrationHealth() {
  try {
    await requireRole('admin', 'manager'); const tenant = await requireTenant(); const health = await checkConnectors(tenant.id);
    for (const item of health) await db.insert(integrationConnections).values({ tenantId: tenant.id, provider: item.provider,
      status: item.status, environment: item.environment, config: { message: item.message }, lastCheckedAt: new Date(),
      lastSuccessAt: item.status === 'connected' ? new Date() : null, lastError: item.status === 'error' ? item.message : null })
      .onConflictDoUpdate({ target: [integrationConnections.tenantId, integrationConnections.provider], set: { status: item.status,
        environment: item.environment, config: { message: item.message }, lastCheckedAt: new Date(),
        lastSuccessAt: item.status === 'connected' ? new Date() : null, lastError: item.status === 'error' ? item.message : null, updatedAt: new Date() } });
    return { success: true, data: health };
  } catch (error) { return { success: false, error: getErrorMessage(error) }; }
}

export async function getIntegrationHealth() {
  try { await requireRole('admin', 'manager'); const tenant = await requireTenant();
    return { success: true, data: await db.select().from(integrationConnections).where(eq(integrationConnections.tenantId, tenant.id)) };
  } catch (error) { return { success: false, error: getErrorMessage(error) }; }
}

export async function getIntegrationJobs() {
  try { await requireRole('admin', 'manager'); const tenant = await requireTenant();
    return { success: true, data: await db.select().from(integrationJobs).where(eq(integrationJobs.tenantId, tenant.id)).orderBy(desc(integrationJobs.createdAt)).limit(100) };
  } catch (error) { return { success: false, error: getErrorMessage(error) }; }
}

export async function retryIntegrationJob(id: string) {
  try { await requireRole('admin', 'manager'); const tenant = await requireTenant();
    await db.update(integrationJobs).set({ status: 'retry', nextAttemptAt: new Date(), lastError: null, updatedAt: new Date() })
      .where(and(eq(integrationJobs.tenantId, tenant.id), eq(integrationJobs.id, z.string().uuid().parse(id)), eq(integrationJobs.status, 'dead_letter')));
    return { success: true };
  } catch (error) { return { success: false, error: getErrorMessage(error) }; }
}

export async function syncBankTransactions() {
  try { await requireRole('admin', 'manager'); const tenant = await requireTenant();
    return { success: true, data: await syncOpenBankingForTenant(tenant.id) };
  } catch (error) { return { success: false, error: getErrorMessage(error) }; }
}
