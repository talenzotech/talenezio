import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { resolveOAuthCallbackRedirect } from '@/lib/auth/oauth'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const flow = searchParams.get('flow')
  const next = searchParams.get('next')
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')
  const rawForwardedHost = request.headers.get('x-forwarded-host')
  const forwardedHost = rawForwardedHost ? rawForwardedHost.split(',')[0].trim() : null
  const isLocalEnv = process.env.NODE_ENV === 'development'

  let isSuccessfulExchange = false
  let exchangeErrorMessage: string | null = null

  const cookieStore = await cookies()
  const cookiesToSetOnResponse: Array<{
    name: string
    value: string
    options?: Parameters<typeof cookieStore.set>[2]
  }> = []

  if (code) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key'

    const supabase = createServerClient(url, anonKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            try {
              cookieStore.set(name, value, options)
            } catch {
              // Ignore if context forbids cookie mutation
            }
            cookiesToSetOnResponse.push({ name, value, options })
          })
        },
      },
    })

    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
    if (!exchangeError) {
      isSuccessfulExchange = true
    } else {
      exchangeErrorMessage = exchangeError.message
    }
  }

  const redirectUrl = resolveOAuthCallbackRedirect({
    code,
    flow,
    next,
    error,
    errorDescription,
    origin,
    isSuccessfulExchange,
    exchangeErrorMessage,
    forwardedHost,
    isLocalEnv,
  })

  const response = NextResponse.redirect(redirectUrl)

  // Attach all cookies set during the session exchange to the outgoing redirect response
  // to prevent Next.js from dropping Set-Cookie headers on NextResponse.redirect
  cookiesToSetOnResponse.forEach(({ name, value, options }) => {
    response.cookies.set(name, value, options)
  })

  return response
}
