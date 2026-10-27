import { type NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { hasLocalDemoCookie, LOCAL_DEMO_COOKIE } from '@/lib/auth/local-demo-config'
import { updateSession } from '@/utils/supabase/middleware'

const PROTECTED_PREFIXES = [
  '/services',
  '/tests',
  '/resume-builder',
  '/dashboard',
]

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(prefix + '/')
  )
}

export async function proxy(request: NextRequest) {
  // Allow local demo session if active
  if (hasLocalDemoCookie(request.cookies.get(LOCAL_DEMO_COOKIE)?.value)) {
    return NextResponse.next()
  }

  // If Supabase keys are missing and destination is protected, redirect to login
  const hasSupabase = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
  if (!hasSupabase) {
    if (isProtectedPath(request.nextUrl.pathname)) {
      const target = encodeURIComponent(request.nextUrl.pathname + request.nextUrl.search)
      return NextResponse.redirect(new URL(`/login?next=${target}`, request.url))
    }
    return NextResponse.next()
  }

  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
