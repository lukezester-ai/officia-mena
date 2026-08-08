import { eq } from 'drizzle-orm';
import { auth } from '@/auth';
import { db } from '@/lib/db/db';
import { users } from '@/lib/db/schema/users';

export type UserRole = 'admin' | 'finance' | 'manager' | 'member';

export async function requireRole(...allowedRoles: UserRole[]) {
  const session = await auth();
  if (!session?.user?.email) throw new Error('Unauthorized');

  const [user] = await db.select().from(users).where(eq(users.email, session.user.email)).limit(1);
  if (!user || !allowedRoles.includes(user.role as UserRole)) {
    throw new Error('Forbidden');
  }
  return user;
}
