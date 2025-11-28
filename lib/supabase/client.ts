// lib/supabase/client.ts
// BarrelVerse Supabase Client - Browser

'use client'

import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/lib/types/database'

// Check if we're in a build environment without env vars
const isBuildTime = typeof window === 'undefined' && !process.env.NEXT_PUBLIC_SUPABASE_URL

export function createClient() {
  // Return null client during build if env vars not set
  if (isBuildTime) {
    return null as unknown as ReturnType<typeof createBrowserClient<Database>>
  }
  
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// Singleton instance for client-side use
let clientInstance: ReturnType<typeof createBrowserClient<Database>> | null = null

export function getClient() {
  if (isBuildTime) {
    return null as unknown as ReturnType<typeof createBrowserClient<Database>>
  }
  
  if (!clientInstance) {
    clientInstance = createClient()
  }
  return clientInstance
}
