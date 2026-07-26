import { db } from '@/lib/db/db';
import { tenants } from '@/lib/db/schema/tenants';
import { users } from '@/lib/db/schema/users';
import { eq } from 'drizzle-orm';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

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

const MOCK_TENANT: TenantRecord = {
  id: 'mock-tenant-id',
  name: 'Officia MENA (Demo)',
  crn: '1234567890',
  trn: '300000000000003',
  country: 'SA',
  createdAt: null,
  updatedAt: null,
  isMock: true,
};

async function findOrProvisionUser(email: string, authUserId: string) {
  const existing = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (existing.length > 0 && existing[0].tenantId) {
    return existing[0];
  }

  const tenantResult = await db.insert(tenants).values({
    name: email.split('@')[0] + "'s Company",
    country: 'SA',
    crn: 'TEMP-' + Date.now().toString(36).toUpperCase(),
  }).returning();

  const tenant = tenantResult[0];

  const [userResult] = await db.insert(users).values({
    authId: authUserId,
    tenantId: tenant.id,
    email,
  }).returning();

  return { ...userResult, tenantId: tenant.id };
}

export async function requireTenant() {
  // Check if Supabase is configured
  const supabaseUrl =process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('your_supabase_url_here')) {
    console.warn('Supabase not configured, using mock tenant for demo');
    return MOCK_TENANT;
  }

  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user || !user.email) {
    redirect('/login');
  }

  try {
    const userRecord = await findOrProvisionUser(user.email, user.id);

    if (!userRecord.tenantId) {
      throw new Error('User has no assigned tenant.');
    }

    const tenantRecord = await db.select().from(tenants).where(eq(tenants.id, userRecord.tenantId)).limit(1);

    if (tenantRecord.length === 0) {
      throw new Error('Tenant not found.');
    }

    return { ...tenantRecord[0], isMock: false as const };
  } catch (err) {
    console.warn('requireTenant error, falling back to mock tenant:', err);
    return MOCK_TENANT;
  }
}
