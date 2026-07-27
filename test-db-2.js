const postgres = require('postgres');
const url = 'postgresql://postgres.yrdzwrxebajnhfkiaoqv:%5BMubarek1981Uzbekistan1987%40%5D@aws-0-eu-central-1.pooler.supabase.com:6543/postgres';
const sql = postgres(url);
sql`SELECT 1`.then(() => {
  console.log('Connected!');
  process.exit(0);
}).catch(e => {
  console.error('Connection Error:', e);
  process.exit(1);
});
