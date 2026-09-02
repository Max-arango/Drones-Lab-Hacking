// Pure SPA: no server actions / route handlers. Only the browser client is used.
// If you ever add RSC code that needs auth (e.g. protected route handler), create
// `web/src/lib/supabase/server.ts` using `createServerClient` from `@supabase/ssr`
// with cookies — until then, no server client is needed.
//
// ponytail: the client is exposed as a lazy Proxy so it can be imported
// freely without triggering `createBrowserClient` at module-load time.
// `createBrowserClient` throws if the URL/key are empty, which would
// crash the Vercel build when env vars aren't set. The Proxy defers
// instantiation to first property access, which only happens in the
// browser at runtime.

import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/lib/supabase/types'

function createSupabaseBrowser() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
  )
}

type SupabaseClient = ReturnType<typeof createSupabaseBrowser>

let _client: SupabaseClient | null = null

function getClient(): SupabaseClient {
  if (!_client) _client = createSupabaseBrowser()
  return _client
}

// Proxy: any property access on `supabase` triggers `getClient()` lazily.
// Also makes it tree-shake-friendly: nothing happens at import time.
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop, _receiver) {
    const client = getClient()
    const value = Reflect.get(client, prop, client)
    return typeof value === 'function' ? value.bind(client) : value
  },
})
