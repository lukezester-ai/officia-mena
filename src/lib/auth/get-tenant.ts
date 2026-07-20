import { db } from '@/lib/db/db';
import { tenants } from '@/lib/db/schema/tenants';

// This is a mock function since we don't have real auth yet.
// It retrieves the first tenant from the database.
export async function requireTenant() {
  const allTenants = await db.select().from(tenants).limit(1);
  if (allTenants.length === 0) {
    throw new Error('No tenant found in the database. Please run the seed script.');
  }
  return allTenants[0];
}
