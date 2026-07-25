import { db } from '@/lib/db/db';
import { tenants } from '@/lib/db/schema/tenants';
import { users } from '@/lib/db/schema/users';
import { eq } from 'drizzle-orm';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export async function requireTenant() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/login');
  }

  try {
    // Find the user's record in our public schema to get their tenantId
    const userRecord = await db.select().from(users).where(eq(users.clerkId, user.id)).limit(1);
    
    if (userRecord.length === 0 || !userRecord[0].tenantId) {
      throw new Error('User has no assigned tenant.');
    }

    const tenantId = userRecord[0].tenantId;
    const tenantRecord = await db.select().from(tenants).where(eq(tenants.id, tenantId)).limit(1);

    if (tenantRecord.length === 0) {
      throw new Error('Tenant not found.');
    }

    return tenantRecord[0];
  } catch {
    console.warn('Database error or missing tenant table, falling back to mock tenant');
    return {
      id: 'mock-tenant-id',
      name: 'Officia MENA (Demo)',
      crn: '1234567890',
      trn: '300000000000003',
      country: 'SA',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }
}
