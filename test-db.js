require('dotenv').config({ path: '.env.local' });
const postgres = require('postgres');
const sql = postgres(process.env.STORAGE_POSTGRES_URL);

async function test() {
  try {
    const res = await sql`SELECT 1 as num`;
    console.log('Database connection successful:', res);
  } catch (err) {
    console.error('Database connection failed:', err);
  } finally {
    process.exit();
  }
}
test();
