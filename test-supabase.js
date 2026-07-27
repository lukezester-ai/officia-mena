require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function test() {
  console.log("Testing Supabase connection...");
  const { data, error } = await supabase.auth.signUp({
    email: 'test@example.com',
    password: 'Password123!',
  });
  
  if (error) {
    console.error("Auth Error:", error);
  } else {
    console.log("Auth Success:", data);
  }
}

test();
