import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createClient() {
  const cookieStore = cookies()

  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const url = rawUrl.trim() ? rawUrl : 'https://placeholder.supabase.co';
  const rawKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  const key = rawKey.trim() ? rawKey : 'placeholder';

  return createServerClient(
    url.startsWith('http') ? url : `https://${url}`,
    key,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // The `delete` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}
