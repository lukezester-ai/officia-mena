import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as dotenv from 'dotenv';
import * as schema from './schema';

dotenv.config();

// В реална среда тук се ползва DATABASE_URL от .env
// За демо целите ще ползваме mock връзка или placeholder
const connectionString = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/officia_mena';

// Използваме postgres.js client
const client = postgres(connectionString, { prepare: false });
export const db = drizzle(client, { schema });
