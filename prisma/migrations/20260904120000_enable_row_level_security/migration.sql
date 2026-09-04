-- Supabase exposes every table in the `public` schema over its public REST
-- (PostgREST) API. Row Level Security defaults to OFF on tables created via
-- plain `CREATE TABLE` (i.e. via Prisma Migrate), which means all of the
-- tables below were reachable from the internet through Supabase's anon/
-- authenticated REST roles with no access control, regardless of the fact
-- that this app never uses that API.
--
-- This app's Prisma client (`src/lib/prisma.ts`, `prisma/seed.ts`) connects
-- directly to Postgres as the `postgres.<project-ref>` role, which OWNS every
-- table below (it created them via `prisma migrate`). Postgres table owners
-- always bypass RLS unless `FORCE ROW LEVEL SECURITY` is also set — which is
-- deliberately NOT done here. So enabling RLS with zero policies:
--   - fully blocks Supabase's anon/authenticated REST roles (no policies ==
--     default deny), closing the exposure Advisor flagged; and
--   - has zero effect on this app, since all app queries go through Prisma
--     as the table owner, not through PostgREST.
--
-- No policies are added because this app has no legitimate PostgREST/
-- supabase-js consumer (none exists in the codebase) — access to these
-- tables is meant to happen exclusively through the Prisma-backed server code.

ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Business" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "BusinessLocation" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "BusinessHours" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "BusinessStaff" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "BusinessCustomer" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "BlockedSlot" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "StaffSchedule" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "StaffTimeOff" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Category" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Service" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ServiceStaff" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PortfolioImage" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Appointment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Review" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Favorite" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Notification" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SubscriptionPlan" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Subscription" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Payment" ENABLE ROW LEVEL SECURITY;

-- Prisma's own migration-history table lives in `public` too and was flagged
-- by the same Advisor check. It's not part of the Prisma schema, so it can't
-- be expressed as a model, but it needs the same fix.
ALTER TABLE "_prisma_migrations" ENABLE ROW LEVEL SECURITY;
