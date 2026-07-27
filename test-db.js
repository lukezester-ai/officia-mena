const postgres = require('postgres');
const sql = postgres(process.env.DATABASE_URL);
sql`SELECT 1`.then(() => {
  console.log('Connected!');
  process.exit(0);
}).catch(e => {
  console.error('Connection Error:', e);
  process.exit(1);
});
