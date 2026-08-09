'use server';
import { eq } from 'drizzle-orm';
import { requireTenant } from '@/lib/auth/get-tenant';
import { requireRole } from '@/lib/auth/rbac';
import { db } from '@/lib/db/db';
import { integrationConnections } from '@/lib/db/schema/ai_orchestration';
import { checkConnectors } from '@/lib/integrations/connectors';
import { getErrorMessage } from '@/lib/errors';

export async function refreshIntegrationHealth() {
  try {
    await requireRole('admin', 'manager'); const tenant = await requireTenant(); const health = await checkConnectors();
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
