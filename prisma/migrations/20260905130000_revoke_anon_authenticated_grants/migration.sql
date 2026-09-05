-- Supabase auto-grants full CRUD on every public-schema table to `anon`/
-- `authenticated` by default (confirmed via pg_default_acl). RLS is enabled
-- with zero policies on all tables (see 20260904120000_enable_row_level_security),
-- so these grants are currently inert (RLS default-denies both roles) — but
-- they're a loaded gun: the first permissive policy anyone adds for either
-- role instantly gets full table access, not just what that policy intended.
-- Prisma connects as the `postgres` role (table owner) and bypasses RLS
-- entirely, so revoking anon/authenticated here has zero effect on the app.
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon;
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM authenticated;

-- Without this, every future `prisma migrate` creates a new table that
-- silently regains the same broad anon/authenticated grants.
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  REVOKE ALL ON TABLES FROM anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  REVOKE ALL ON TABLES FROM authenticated;
