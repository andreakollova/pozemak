import { createClient } from '@supabase/supabase-js'

// Server-side client — používa service role key (nie anon)
// Pre jednoduchost použijeme rovnaký anon key — článok môže editovať
// aj anon ak má RLS vypnutý, alebo pridáme SUPABASE_SERVICE_KEY
export function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}
