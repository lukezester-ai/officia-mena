import { db, setTenantContext } from '../db/db';
import { tenants } from '../db/schema/tenants';
import { eq } from 'drizzle-orm';
import { auth } from '@/auth';

export async function getTenant() {
  const session = await auth();
  const activeTenantId = (session?.user as { tenantId?: string | null } | undefined)?.tenantId;

  if (!activeTenantId) return null;

  setTenantContext(activeTenantId);
  const [tenant] = await db.select().from(tenants).where(eq(tenants.id, activeTenantId)).limit(1);
  return tenant || null;
}

export async function requireTenant() {
  const session = await auth();
  if (!session?.user?.email) {
    throw new Error('Unauthorized');
  }
  const tenant = await getTenant();
  if (!tenant) {
    throw new Error('Tenant not found');
  }
  return tenant;
}
