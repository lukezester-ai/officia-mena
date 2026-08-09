import { NextResponse } from 'next/server';
import { db } from '@/lib/db/db';
import { tenants } from '@/lib/db/schema/tenants';
import { requireBearerSecret } from '@/lib/auth/api';
import { getErrorMessage } from '@/lib/errors';
import { recordMonitorRun, scanTenantOperationalRisks } from '@/lib/ai/monitoring';

export async function GET(request: Request) {
  const unauthorized = requireBearerSecret(request, 'CRON_SECRET');
  if (unauthorized) return unauthorized;
  try {
    const tenantRows = await db.select({ id: tenants.id }).from(tenants);
    const results = [];
    for (const tenant of tenantRows) {
      const result = await scanTenantOperationalRisks(tenant.id);
      await recordMonitorRun(tenant.id, result);
      results.push({ tenantId: tenant.id, detected: result.detected, autoResolved: result.autoResolved });
    }
    return NextResponse.json({ success: true, tenantsProcessed: results.length, results, generatedAt: new Date().toISOString() });
  } catch (error) {
    console.error('Maestro monitor failed:', error);
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}
