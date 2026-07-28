import { db } from '../db/db';
import { tenants } from '../db/schema/tenants';
import { users } from '../db/schema/users';
import { eq } from 'drizzle-orm';
import { auth } from '@/auth';

export async function getTenant() {
  const session = await auth();
  
  // If no session, fallback to development tenant for demo purposes
  let userRecord = null;
  if (session?.user?.email) {
    const records = await db.select().from(users).where(eq(users.email, session.user.email)).limit(1);
    if (records.length > 0) {
      userRecord = records[0];
    }
  }
  
  let activeTenantId = userRecord?.tenantId;

  if (!activeTenantId) {
    // Find or create the default development tenant
    const defaultTenantName = 'Officia MENA Corp';
    const tenantRecords = await db.select().from(tenants).where(eq(tenants.name, defaultTenantName)).limit(1);
    
    if (tenantRecords.length > 0) {
      activeTenantId = tenantRecords[0].id;
    } else {
      const [newTenant] = await db.insert(tenants).values({
        name: defaultTenantName,
        crn: '1010123456',
      }).returning();
      activeTenantId = newTenant.id;
    }
    
    // If we have a user but they don't have a tenant, attach them
    if (userRecord && !userRecord.tenantId && activeTenantId) {
      await db.update(users).set({ tenantId: activeTenantId }).where(eq(users.id, userRecord.id));
    }
  }

  if (!activeTenantId) return null;

  const [tenant] = await db.select().from(tenants).where(eq(tenants.id, activeTenantId)).limit(1);
  return tenant || null;
}

export async function requireTenant() {
  const tenant = await getTenant();
  if (!tenant) {
    throw new Error('Tenant not found');
  }
  return tenant;
}
