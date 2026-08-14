import { NextResponse } from 'next/server';
import postgres from 'postgres';
import path from 'path';
import { readFile } from 'node:fs/promises';
import { getErrorCause, getErrorMessage, getErrorStack } from '@/lib/errors';
import { requireBearerSecret } from '@/lib/auth/api';

export async function POST(request: Request) {
  const unauthorized = requireBearerSecret(request, 'MIGRATION_SECRET');
  if (unauthorized) return unauthorized;
  let migrationClient: ReturnType<typeof postgres> | null = null;
  try {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      return NextResponse.json({ error: 'DATABASE_URL is not set' }, { status: 500 });
    }

    migrationClient = postgres(connectionString, {
      max: 1,
      ssl: 'require',
      prepare: false
    });
    const requestedMigrations = ['0019_email_delivery_audit.sql', '0020_open_banking_consents.sql'] as const;
    const statements: Array<{ migration: string; sql: string }> = [];
    for (const migration of requestedMigrations) {
      const contents = await readFile(path.join(process.cwd(), 'drizzle', migration), 'utf8');
      for (const statement of contents.split('--> statement-breakpoint').map((value) => value.trim()).filter(Boolean)) {
        statements.push({ migration, sql: statement });
      }
    }
    await migrationClient.begin(async (transaction) => {
      for (const statement of statements) await transaction.unsafe(statement.sql);
    });
    return NextResponse.json({ success: true, applied: requestedMigrations, statements: statements.length });
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
  } finally {
    if (migrationClient) await migrationClient.end().catch(() => undefined);
  }
}
