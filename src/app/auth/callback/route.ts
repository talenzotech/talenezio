import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { safeNextPath } from '@/lib/auth/redirect'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const flow = searchParams.get('flow')
  // if "next" is in param, use it as the redirect URL
  const next = safeNextPath(searchParams.get('next'))

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      if (flow === 'recovery') {
        return NextResponse.redirect(`${origin}/reset-password?next=${encodeURIComponent(next)}`)
      }
      if (flow === 'email_verification') {
        return NextResponse.redirect(`${origin}/login?message=${encodeURIComponent('Your email has been verified. Please sign in.')}&next=${encodeURIComponent(next)}`)
      }
      const forwardedHost = request.headers.get('x-forwarded-host') // original origin before load balancer
      const isLocalEnv = process.env.NODE_ENV === 'development'
      if (isLocalEnv) {
        // we can be sure that there is no load balancer in between, so no need to watch for X-Forwarded-Host
        return NextResponse.redirect(`${origin}${next}`)
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`)
      } else {
        return NextResponse.redirect(`${origin}${next}`)
      }
    }
  }

  // return the user to an error page with instructions
  const errorPath = flow === 'recovery' ? '/forgot-password' : '/login'
  return NextResponse.redirect(`${origin}${errorPath}?error=${encodeURIComponent(flow === 'recovery' ? 'This reset link is invalid or expired. Request a new one.' : 'Could not authenticate user')}&next=${encodeURIComponent(next)}`)
}
