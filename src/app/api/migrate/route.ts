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
    const connectionString = process.env.MIGRATION_DATABASE_URL || process.env.POSTGRES_URL;
    if (!connectionString) {
      return NextResponse.json({ error: 'MIGRATION_DATABASE_URL or POSTGRES_URL is not set' }, { status: 503 });
    }

    migrationClient = postgres(connectionString, {
      max: 1,
      ssl: 'require',
      prepare: false
    });
    const requestedMigrations = ['0019_email_delivery_audit.sql', '0020_open_banking_consents.sql'] as const;
    const statementsByMigration = new Map<string, string[]>();
    for (const migration of requestedMigrations) {
      const contents = await readFile(path.join(process.cwd(), 'drizzle', migration), 'utf8');
      statementsByMigration.set(
        migration,
        contents.split('--> statement-breakpoint').map((value) => value.trim()).filter(Boolean)
      );
    }
    const applied: string[] = [];
    const skipped: string[] = [];
    let statementCount = 0;
    await migrationClient.begin(async (transaction) => {
      await transaction.unsafe("SELECT pg_advisory_xact_lock(hashtext('officia_mena_scoped_migrations'))");
      await transaction.unsafe(`
        CREATE TABLE IF NOT EXISTS public.officia_migration_history (
          migration varchar(255) PRIMARY KEY,
          applied_at timestamp DEFAULT now() NOT NULL
        )
      `);
      for (const migration of requestedMigrations) {
        const existing = await transaction<{ migration: string }[]>`
          SELECT migration FROM public.officia_migration_history WHERE migration = ${migration}
        `;
        if (existing.length > 0) {
          skipped.push(migration);
          continue;
        }
        for (const statement of statementsByMigration.get(migration) ?? []) {
          await transaction.unsafe(statement);
          statementCount += 1;
        }
        await transaction`
          INSERT INTO public.officia_migration_history (migration) VALUES (${migration})
        `;
        applied.push(migration);
      }
    });
    return NextResponse.json({ success: true, applied, skipped, statements: statementCount });
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
