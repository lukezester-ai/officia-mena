import { NextResponse } from 'next/server';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import path from 'path';

export async function GET() {
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
  } catch (error: any) {
    const cause = error.cause || {};
    return NextResponse.json({ 
      success: false, 
      error: error.message,
      causeMsg: cause.message,
      causeCode: cause.code,
      causeDetail: cause.detail,
      stack: error.stack 
    }, { status: 500 });
  }
}
