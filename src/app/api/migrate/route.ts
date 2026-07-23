import { NextResponse } from 'next/server';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import path from 'path';

function isAuthorized(req: Request) {
  const migrationSecret = process.env.MIGRATION_SECRET;
  if (!migrationSecret) return false;

  const bearerToken = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  const headerToken = req.headers.get('x-migration-secret');
  return bearerToken === migrationSecret || headerToken === migrationSecret;
}

export async function POST(req: Request) {
  try {
    if (!isAuthorized(req)) {
      return NextResponse.json({ error: 'Unauthorized migration request' }, { status: 401 });
    }

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
    const err = error instanceof Error ? error : new Error('Unknown migration error');
    const cause = err.cause && typeof err.cause === 'object'
      ? err.cause as { message?: string; code?: string; detail?: string }
      : {};
    return NextResponse.json({ 
      success: false, 
      error: err.message,
      causeMsg: cause.message,
      causeCode: cause.code,
      causeDetail: cause.detail,
      stack: err.stack 
    }, { status: 500 });
  }
}
