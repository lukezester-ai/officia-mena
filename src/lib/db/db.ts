import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as dotenv from 'dotenv';
import * as schema from './schema';

dotenv.config();

function createDb() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is required.');
  }
  const client = postgres(connectionString, { prepare: false });
  return drizzle(client, { schema });
}

let _db: ReturnType<typeof drizzle> | null = null;

export const db = new Proxy<Record<string, unknown>>({} as ReturnType<typeof drizzle>, {
  get(_, prop) {
    if (!_db) _db = createDb();
    return Reflect.get(_db, prop);
  },
  set(_, prop, value) {
    if (!_db) _db = createDb();
    return Reflect.set(_db, prop, value);
  },
});
