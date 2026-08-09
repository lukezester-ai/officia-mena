DROP POLICY IF EXISTS users_auth_lookup ON users;
--> statement-breakpoint
CREATE POLICY users_auth_lookup ON users
  FOR SELECT
  USING (
    lower(email) = lower(nullif(current_setting('app.user_email', true), ''))
  );
