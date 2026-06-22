import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const url = rawUrl.trim() ? rawUrl : 'https://placeholder.supabase.co';
  const rawKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  const key = rawKey.trim() ? rawKey : 'placeholder';

  return createBrowserClient(
    url.startsWith('http') ? url : `https://${url}`,
    key
  )
}
