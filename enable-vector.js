require('dotenv').config({ path: '.env.local' });
const postgres = require('postgres');

async function main() {
  const sql = postgres(process.env.STORAGE_POSTGRES_URL, { ssl: 'require' });
  console.log('Connected to DB. Creating vector extension...');
  await sql`CREATE EXTENSION IF NOT EXISTS vector;`;
  console.log('Extension created successfully!');
  process.exit(0);
}

main().catch(console.error);
