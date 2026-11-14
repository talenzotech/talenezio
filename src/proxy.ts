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
  // If an OAuth code arrives at any non-auth route (e.g. root fallback /?code=...),
  // seamlessly forward it to /auth/callback so the session exchange occurs
  const code = request.nextUrl.searchParams.get('code')
  if (code && !request.nextUrl.pathname.startsWith('/auth')) {
    const callbackUrl = new URL('/auth/callback', request.url)
    request.nextUrl.searchParams.forEach((val, key) => {
      callbackUrl.searchParams.set(key, val)
    })
    return NextResponse.redirect(callbackUrl)
  }

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
    '/services/:path*',
    '/tests/:path*',
    '/resume-builder/:path*',
    '/dashboard/:path*',
    '/admin/:path*',
  ],
}
