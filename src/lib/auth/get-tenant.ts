import { db } from '@/lib/db/db';
import { tenants } from '@/lib/db/schema/tenants';
import { users } from '@/lib/db/schema/users';
import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { currentUser } from '@clerk/nextjs/server';

export type TenantRecord = {
  id: string;
  name: string;
  crn: string | null;
  trn: string | null;
  country: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  isMock: boolean;
};

async function findOrProvisionUser(clerkId: string, email: string) {
  const existing = await db.select().from(users).where(eq(users.clerkId, clerkId)).limit(1);
  if (existing.length > 0 && existing[0].tenantId) {
    return existing[0];
  }

  // Check if they exist by email but no clerkId (migration scenario)
  const existingByEmail = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (existingByEmail.length > 0 && existingByEmail[0].tenantId) {
    await db.update(users).set({ clerkId }).where(eq(users.id, existingByEmail[0].id));
    return { ...existingByEmail[0], clerkId };
  }

  const tenantResult = await db.insert(tenants).values({
    name: email.split('@')[0] + "'s Company",
    country: 'SA',
    crn: 'TEMP-' + Date.now().toString(36).toUpperCase(),
  }).returning();

  const tenant = tenantResult[0];

  const [userResult] = await db.insert(users).values({
    clerkId: clerkId,
    tenantId: tenant.id,
    email,
  }).returning();

  return { ...userResult, tenantId: tenant.id };
}

export async function requireTenant() {
  if (process.env.NODE_ENV === 'development') {
    const existing = await db.select().from(tenants).limit(1);
    if (existing.length > 0) {
      return { ...existing[0], isMock: true } as TenantRecord;
    }
    
    const [newTenant] = await db.insert(tenants).values({
      name: 'Development Company',
      crn: '1234567890',
      country: 'SA'
    }).returning();
    
    return { ...newTenant, isMock: true } as TenantRecord;
  }

  const user = await currentUser();
  if (!user) {
    redirect('/login');
  }

  const email = user.emailAddresses[0]?.emailAddress;
  if (!email) {
    throw new Error('User has no email address');
  }

  const dbUser = await findOrProvisionUser(user.id, email);
  
  if (!dbUser.tenantId) {
    redirect('/onboarding');
  }

  const tenant = await db.select().from(tenants).where(eq(tenants.id, dbUser.tenantId)).limit(1);
  if (tenant.length === 0) {
    throw new Error('Tenant not found');
  }

  return {
    ...tenant[0],
    isMock: false
  } as TenantRecord;
}
