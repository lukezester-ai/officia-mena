import { db } from '../db/db';
import { tenants } from '../db/schema/tenants';
import { users } from '../db/schema/users';
import { eq } from 'drizzle-orm';
import { auth } from '@/auth';

export async function getTenant() {
  const session = await auth();
  if (!session?.user?.email) return null;

  const [userRecord] = await db.select().from(users).where(eq(users.email, session.user.email)).limit(1);
  const activeTenantId = userRecord?.tenantId;

  if (!activeTenantId) return null;

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
