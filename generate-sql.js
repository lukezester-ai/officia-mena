/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'drizzle');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.sql')).sort();

let sql = '';
for (const file of files) {
  sql += fs.readFileSync(path.join(dir, file), 'utf8') + '\n\n';
}

const authTrigger = `
-- Create a trigger to automatically create a tenant and user when a new Supabase auth user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
DECLARE
  new_tenant_id uuid;
BEGIN
  -- 1. Create a new tenant (company) for this user
  new_tenant_id := gen_random_uuid();
  INSERT INTO public.tenants (id, name, country, created_at, updated_at)
  VALUES (new_tenant_id, 'My Company', 'SA', now(), now());

  -- 2. Create the user profile and link it to the tenant
  INSERT INTO public.users (id, clerk_id, tenant_id, email, created_at)
  VALUES (gen_random_uuid(), NEW.id::text, new_tenant_id, NEW.email, now());

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
`;

sql += authTrigger;

fs.writeFileSync(path.join(__dirname, 'setup.sql'), sql, 'utf8');
console.log('setup.sql generated successfully.');
