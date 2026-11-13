import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

function isInvalidRefreshTokenError(error: { code?: string } | null): boolean {
  return error?.code === 'refresh_token_not_found' || error?.code === 'invalid_refresh_token'
}

function clearSupabaseAuthCookies(response: NextResponse, request: NextRequest): void {
  request.cookies.getAll()
    .filter(({ name }) => name.startsWith('sb-') && name.includes('-auth-token'))
    .forEach(({ name }) => {
      response.cookies.set(name, '', {
        expires: new Date(0),
        maxAge: 0,
        path: '/',
      })
    })
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key'

  const supabase = createServerClient(
    url,
    anonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Do not run code between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  // IMPORTANT: DO NOT REMOVE auth.getUser()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (isInvalidRefreshTokenError(authError)) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set(
      'next',
      request.nextUrl.pathname + request.nextUrl.search,
    )
    const loginResponse = NextResponse.redirect(loginUrl)
    clearSupabaseAuthCookies(loginResponse, request)
    return loginResponse
  }

  if (
    !user &&
    !request.nextUrl.pathname.startsWith('/login') &&
    !request.nextUrl.pathname.startsWith('/register') &&
    !request.nextUrl.pathname.startsWith('/auth')
  ) {
    const pathname = request.nextUrl.pathname
    const isProtected =
      pathname === '/services' ||
      pathname.startsWith('/services/') ||
      pathname === '/tests' ||
      pathname.startsWith('/tests/') ||
      pathname === '/resume-builder' ||
      pathname.startsWith('/resume-builder/') ||
      pathname === '/dashboard' ||
      pathname.startsWith('/dashboard/')

    if (isProtected) {
      const target = encodeURIComponent(pathname + request.nextUrl.search)
      const url = new URL(`/login?next=${target}`, request.url)
      return NextResponse.redirect(url)
    }
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is. If you're
  // creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely!

  return supabaseResponse
}
