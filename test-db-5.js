const postgres = require('postgres');
const url = 'postgresql://postgres:Mubarek123456789@aws-0-eu-central-1.pooler.supabase.com:5432/postgres';
const sql = postgres(url);
sql`SELECT 1`.then(() => {
  console.log('Connected!');
  process.exit(0);
}).catch(e => {
  console.error('Connection Error:', e);
  process.exit(1);
});
