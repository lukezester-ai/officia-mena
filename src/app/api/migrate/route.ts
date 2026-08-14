import { NextResponse } from 'next/server';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import path from 'path';
import { getErrorCause, getErrorMessage, getErrorStack } from '@/lib/errors';
import { requireBearerSecret } from '@/lib/auth/api';

export async function POST(request: Request) {
  const unauthorized = requireBearerSecret(request, 'MIGRATION_SECRET');
  if (unauthorized) return unauthorized;
  try {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      return NextResponse.json({ error: 'DATABASE_URL is not set' }, { status: 500 });
    }

    const migrationClient = postgres(connectionString, { 
      max: 1,
      ssl: 'require',
      prepare: false
    });
    const db = drizzle(migrationClient);

    // Run the migrations. In Vercel, the drizzle folder is at process.cwd() + '/drizzle'
    await migrate(db, { migrationsFolder: path.join(process.cwd(), 'drizzle') });
    
    await migrationClient.end();

    return NextResponse.json({ success: true, message: 'Database migrated successfully! All tables created.' });
  } catch (error: unknown) {
    const cause = getErrorCause(error);
    console.error('Production migration failed:', { message: getErrorMessage(error), causeCode: cause.code, causeMessage: cause.message });
    return NextResponse.json({ 
      success: false, 
      error: getErrorMessage(error),
      causeMsg: cause.message,
      causeCode: cause.code,
      causeDetail: cause.detail,
      ...(process.env.NODE_ENV === 'development' ? { stack: getErrorStack(error) } : {})
    }, { status: 500 });
  }
}
