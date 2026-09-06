/**
 * One-time (idempotent) Supabase Storage setup: creates the buckets this app
 * uploads business photos / user avatars into, public-read + size/type
 * limited. Run with: npx tsx scripts/setup-supabase-storage.ts
 *
 * Writes only ever happen server-side via the service-role key (see
 * src/lib/image-upload.ts), which bypasses Storage RLS entirely — same
 * pattern as the zero-policy RLS setup on the Postgres tables (RLS enabled,
 * no policies, table owner/service-role bypasses). Public buckets serve GETs
 * without needing a policy at all, so no Storage policies are added here.
 */
import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
const FILE_SIZE_LIMIT = "5MB";

const BUCKETS = ["business-photos", "avatars"] as const;

async function main() {
  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    console.error("SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY .env içinde tanımlı değil.");
    process.exit(1);
  }

  const supabase = createClient(url, serviceRoleKey, { auth: { persistSession: false } });

  const { data: existing, error: listError } = await supabase.storage.listBuckets();
  if (listError) {
    console.error("Bucket listesi alınamadı:", listError.message);
    process.exit(1);
  }
  const existingNames = new Set((existing ?? []).map((b) => b.name));

  for (const name of BUCKETS) {
    if (existingNames.has(name)) {
      console.log(`✓ "${name}" zaten mevcut, atlanıyor.`);
      continue;
    }
    const { error } = await supabase.storage.createBucket(name, {
      public: true,
      fileSizeLimit: FILE_SIZE_LIMIT,
      allowedMimeTypes: ALLOWED_MIME_TYPES,
    });
    if (error) {
      console.error(`"${name}" oluşturulamadı:`, error.message);
      process.exit(1);
    }
    console.log(`✓ "${name}" oluşturuldu (public, max ${FILE_SIZE_LIMIT}, ${ALLOWED_MIME_TYPES.join("/")}).`);
  }

  console.log("Supabase Storage kurulumu tamamlandı.");
}

main();
