import { createClient } from "@supabase/supabase-js";

/** Service-role client for server-only Storage access — never import this
 * from a "use client" file, the key it holds bypasses Storage RLS entirely.
 * Reads still go through the public bucket URL (see image-upload.ts), so the
 * app never needs the anon key at all. */
let cached: ReturnType<typeof createClient> | null = null;

export function getSupabaseAdmin() {
  if (cached) return cached;

  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    throw new Error("SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY tanımlı değil (.env'e bakın)");
  }

  cached = createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  return cached;
}
