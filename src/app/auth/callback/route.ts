import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { resolveOAuthCallbackRedirect } from '@/lib/auth/oauth'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const flow = searchParams.get('flow')
  const next = searchParams.get('next')
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')
  const forwardedHost = request.headers.get('x-forwarded-host')
  const isLocalEnv = process.env.NODE_ENV === 'development'

  let isSuccessfulExchange = false
  let exchangeErrorMessage: string | null = null

  if (code) {
    const supabase = await createClient()
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

  return NextResponse.redirect(redirectUrl)
}
