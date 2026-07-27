const postgres = require('postgres');
const sql = postgres({
  host: 'aws-0-eu-central-1.pooler.supabase.com',
  port: 6543,
  database: 'postgres',
  username: 'postgres.yrdzwrxebajnhfkiaoqv',
  password: 'Mubarek1981Uzbekistan1987@',
  ssl: 'require'
});
sql`SELECT 1`.then(() => {
  console.log('Connected!');
  process.exit(0);
}).catch(e => {
  console.error('Connection Error:', e);
  process.exit(1);
});
