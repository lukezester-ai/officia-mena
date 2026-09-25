import type { Config } from 'drizzle-kit';
import * as dotenv from 'dotenv';

// Load environment variables from .env.local if it exists, otherwise .env
dotenv.config({ path: '.env.local' });
if (!process.env.STORAGE_POSTGRES_URL && !process.env.POSTGRES_URL && !process.env.DATABASE_URL) {
  dotenv.config(); // Fallback to .env
}

const databaseUrl = process.env.STORAGE_POSTGRES_URL
  || process.env.POSTGRES_URL
  || process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('Database URL environment variable is required. Set STORAGE_POSTGRES_URL, POSTGRES_URL, or DATABASE_URL.');
}

export default {
  schema: './src/lib/db/schema/*',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: databaseUrl,
  },
} satisfies Config;
