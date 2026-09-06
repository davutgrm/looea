import { randomUUID } from "crypto";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

/** Server-only — imports the service-role Supabase client. Never import this
 * from a "use client" component; only from "use server" action files. */

export const BUCKETS = {
  BUSINESS_PHOTOS: "business-photos",
  AVATARS: "avatars",
} as const;

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

type DetectedImage = { contentType: "image/jpeg" | "image/png" | "image/webp"; ext: "jpg" | "png" | "webp" };

/** Sniffs real file content (magic bytes) instead of trusting the client's
 * declared MIME type or the file extension — a renamed .html file with a
 * "jpg" extension must still be rejected. */
function detectImageType(buffer: Buffer): DetectedImage | null {
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { contentType: "image/jpeg", ext: "jpg" };
  }
  if (
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return { contentType: "image/png", ext: "png" };
  }
  if (buffer.length >= 12 && buffer.toString("ascii", 0, 4) === "RIFF" && buffer.toString("ascii", 8, 12) === "WEBP") {
    return { contentType: "image/webp", ext: "webp" };
  }
  return null;
}

export type ValidatedImage = DetectedImage & { buffer: Buffer };
type ValidationResult = { ok: true; value: ValidatedImage } | { ok: false; error: string };

export async function validateImageFile(file: File): Promise<ValidationResult> {
  if (file.size === 0) return { ok: false, error: "Dosya boş" };
  if (file.size > MAX_IMAGE_BYTES) return { ok: false, error: "Görsel en fazla 5MB olabilir" };

  const buffer = Buffer.from(await file.arrayBuffer());
  const detected = detectImageType(buffer);
  if (!detected) return { ok: false, error: "Sadece JPG, PNG veya WEBP formatında görsel yükleyebilirsiniz" };

  return { ok: true, value: { ...detected, buffer } };
}

/** Uploads to a random UUID-based path (never the client-supplied filename,
 * to avoid path traversal / collisions) and returns the public URL. */
export async function uploadImageToStorage(params: {
  bucket: (typeof BUCKETS)[keyof typeof BUCKETS];
  folder: string;
  image: ValidatedImage;
}): Promise<string> {
  const path = `${params.folder}/${randomUUID()}.${params.image.ext}`;
  const admin = getSupabaseAdmin();

  const { error } = await admin.storage
    .from(params.bucket)
    .upload(path, params.image.buffer, { contentType: params.image.contentType, upsert: false });
  if (error) throw new Error(`Görsel yüklenemedi: ${error.message}`);

  const { data } = admin.storage.from(params.bucket).getPublicUrl(path);
  return data.publicUrl;
}

const STORAGE_URL_RE = /\/storage\/v1\/object\/public\/(business-photos|avatars)\/(.+)$/;

/** Best-effort delete of a previously-uploaded file when it's replaced or
 * removed. Silently no-ops for URLs that don't match our own Storage buckets
 * (seed data / legacy externally-hosted image URLs) — nothing to clean up
 * there, and we must never try to delete someone else's object. */
export async function deleteImageFromStorage(url: string | null | undefined): Promise<void> {
  if (!url) return;
  const match = STORAGE_URL_RE.exec(url);
  if (!match) return;
  const [, bucket, path] = match;
  try {
    await getSupabaseAdmin().storage.from(bucket).remove([path]);
  } catch {
    // Non-fatal — the DB write already succeeded, an orphaned file is a
    // storage cost, not a correctness or security problem.
  }
}
