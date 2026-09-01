// Pure SPA: no server actions / route handlers. Only the browser client is used.
// If you ever add RSC code that needs auth (e.g. protected route handler), create
// `web/src/lib/supabase/server.ts` using `createServerClient` from `@supabase/ssr`
// with cookies — until then, no server client is needed.

import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/lib/supabase/types'

export function createSupabaseBrowser() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
  )
}

export const supabase = createSupabaseBrowser()