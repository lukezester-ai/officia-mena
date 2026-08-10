import { desc, eq } from 'drizzle-orm';
import { requireTenant } from '@/lib/auth/get-tenant';
import { db } from '@/lib/db/db';
import { employees } from '@/lib/db/schema/hr';
import { getErrorMessage } from '@/lib/errors';

export async function GET() {
  try {
    const tenant = await requireTenant();
    const data = await db
      .select()
      .from(employees)
      .where(eq(employees.tenantId, tenant.id))
      .orderBy(desc(employees.createdAt));

    return Response.json({ data });
  } catch (error: unknown) {
    const message = getErrorMessage(error);
    const status = message === 'Unauthorized' ? 401 : message === 'Tenant not found' ? 403 : 500;
    return Response.json({ error: message }, { status });
  }
}
