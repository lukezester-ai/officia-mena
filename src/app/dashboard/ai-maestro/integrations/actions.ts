'use server';
import { and, desc, eq } from 'drizzle-orm';
import { z } from 'zod';
import { requireTenant } from '@/lib/auth/get-tenant';
import { requireRole } from '@/lib/auth/rbac';
import { db } from '@/lib/db/db';
import { integrationConnections, integrationJobs } from '@/lib/db/schema/ai_orchestration';
import { bankingConsents } from '@/lib/db/schema/bank';
import { checkConnectors } from '@/lib/integrations/connectors';
import { getErrorMessage } from '@/lib/errors';
import { syncOpenBankingForTenant } from '@/lib/integrations/bank-sync';
import { getOpenBankingProvider } from '@/lib/integrations/open-banking-provider';

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

export async function startBankingConsent() {
  try {
    await requireRole('admin'); const tenant = await requireTenant(); const provider = getOpenBankingProvider(tenant.id);
    const redirectUri = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://officia-mena.com'}/dashboard/ai-maestro/integrations`;
    const consent = await provider.createConsent(redirectUri);
    await db.insert(bankingConsents).values({ tenantId: tenant.id, provider: provider.name, externalConsentId: consent.id,
      status: consent.status, scopes: ['accounts:read', 'transactions:read'], expiresAt: consent.expiresAt ? new Date(consent.expiresAt) : null })
      .onConflictDoUpdate({ target: [bankingConsents.tenantId, bankingConsents.provider, bankingConsents.externalConsentId],
        set: { status: consent.status, expiresAt: consent.expiresAt ? new Date(consent.expiresAt) : null, updatedAt: new Date() } });
    return { success: true, authorizationUrl: consent.authorizationUrl || null };
  } catch (error) { return { success: false, error: getErrorMessage(error) }; }
}

export async function refreshBankingConsent() {
  try {
    await requireRole('admin', 'manager'); const tenant = await requireTenant(); const provider = getOpenBankingProvider(tenant.id);
    const [stored] = await db.select().from(bankingConsents).where(and(eq(bankingConsents.tenantId, tenant.id), eq(bankingConsents.provider, provider.name)))
      .orderBy(desc(bankingConsents.createdAt)).limit(1);
    if (!stored) return { success: false, error: 'No Open Banking consent has been created.' };
    const consent = await provider.getConsent(stored.externalConsentId);
    await db.update(bankingConsents).set({ status: consent.status, expiresAt: consent.expiresAt ? new Date(consent.expiresAt) : null, updatedAt: new Date() })
      .where(and(eq(bankingConsents.id, stored.id), eq(bankingConsents.tenantId, tenant.id)));
    return { success: true, data: { status: consent.status, expiresAt: consent.expiresAt || null } };
  } catch (error) { return { success: false, error: getErrorMessage(error) }; }
}
