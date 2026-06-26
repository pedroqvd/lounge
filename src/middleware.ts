import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const url = rawUrl.trim() ? rawUrl : 'https://placeholder.supabase.co';
  const rawKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  const key = rawKey.trim() ? rawKey : 'placeholder';

  const supabase = createServerClient(
    url.startsWith('http') ? url : `https://${url}`,
    key,
    {
      cookies: {
        get(name: string) { return request.cookies.get(name)?.value },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname;
  const isPublicRoute = path === '/' || path.startsWith('/acesso') || path.startsWith('/api/hub') || path.startsWith('/voluntarios');
  
  if (!isPublicRoute && !user) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/acesso'
    return NextResponse.redirect(loginUrl)
  }

  if (path === '/acesso' && user) {
    const dashboardUrl = request.nextUrl.clone()
    dashboardUrl.pathname = '/painel'
    return NextResponse.redirect(dashboardUrl)
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
