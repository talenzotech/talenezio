import { type NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { hasLocalDemoCookie, LOCAL_DEMO_COOKIE } from '@/lib/auth/local-demo-config'
import { updateSession } from '@/utils/supabase/middleware'

export async function proxy(request: NextRequest) {
  if (
    hasLocalDemoCookie(request.cookies.get(LOCAL_DEMO_COOKIE)?.value) ||
    (process.env.NODE_ENV === 'development' &&
      (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY))
  ) {
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
