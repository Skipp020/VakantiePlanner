import "server-only";
import { createClient } from "@supabase/supabase-js";

/**
 * Server-only client using the service role key. It bypasses Row Level
 * Security, so every caller is responsible for enforcing "only your own
 * row is writable" itself (see lib/session.ts).
 */
export function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      "Supabase env vars ontbreken: NEXT_PUBLIC_SUPABASE_URL en SUPABASE_SERVICE_ROLE_KEY zijn verplicht."
    );
  }

  return createClient(url, serviceKey, {
    auth: { persistSession: false },
  });
}
