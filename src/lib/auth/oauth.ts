import type { Provider } from '@supabase/supabase-js'

export type OAuthProvider = Extract<Provider, 'google' | 'linkedin_oidc' | 'linkedin'>

export function safeNextPath(value: string | null | undefined, fallback = '/dashboard'): string {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return fallback
  return value
}

export interface AppUrlEnv {
  NEXT_PUBLIC_APP_URL?: string
  NEXT_PUBLIC_SITE_URL?: string
  VERCEL_PROJECT_PRODUCTION_URL?: string
  VERCEL_URL?: string
  NODE_ENV?: string
}

/**
 * Verifies whether a given hostname belongs to trusted project domains
 * (canonical domain, custom www subdomain, Vercel deployments, or local development).
 */
export function isTrustedHost(host: string): boolean {
  if (!host) return false
  const cleanHost = host.toLowerCase().split(',')[0].trim().split(':')[0].trim()
  return (
    cleanHost === 'talenezio.com' ||
    cleanHost === 'www.talenezio.com' ||
    cleanHost === 'localhost' ||
    cleanHost === '127.0.0.1' ||
    cleanHost.endsWith('.vercel.app')
  )
}

/**
 * Resolves the canonical application URL for OAuth redirects.
 * Allows verified trusted request hosts (e.g. talenezio.com, preview vercel deployments)
 * so session cookies match the origin, and falls back to explicitly configured environment variables.
 */
export function getAppUrl(env: AppUrlEnv = process.env, requestHost?: string | null): string {
  // 1. If an explicit request host is provided and verified against trusted project domains,
  // use it so cookies set on preview deployments or custom domains match the callback origin.
  if (requestHost && isTrustedHost(requestHost)) {
    const rawClean = requestHost.trim().split(',')[0].trim()
    const cleanHostOnly = rawClean.split(':')[0]
    const isLocal = cleanHostOnly === 'localhost' || cleanHostOnly === '127.0.0.1'
    const protocol = isLocal ? 'http' : 'https'
    return `${protocol}://${rawClean.replace(/\/$/, '')}`
  }

  // 2. Explicitly configured application URL (Highest priority when no trusted request host)
  const configuredAppUrl = env.NEXT_PUBLIC_APP_URL?.trim() || env.NEXT_PUBLIC_SITE_URL?.trim()
  if (configuredAppUrl) {
    return configuredAppUrl.replace(/\/$/, '')
  }

  // 3. Trusted platform environment variables (Vercel system variables)
  if (env.VERCEL_PROJECT_PRODUCTION_URL?.trim()) {
    return `https://${env.VERCEL_PROJECT_PRODUCTION_URL.trim().replace(/\/$/, '')}`
  }
  if (env.VERCEL_URL?.trim()) {
    return `https://${env.VERCEL_URL.trim().replace(/\/$/, '')}`
  }

  // 4. Local development / test fallback
  if (env.NODE_ENV === 'development' || !env.NODE_ENV || env.NODE_ENV === 'test') {
    return 'http://localhost:3000'
  }

  // 5. In production without a configured URL, fail safely instead of trusting arbitrary host headers
  throw new Error('Canonical application URL is not configured. Please set NEXT_PUBLIC_APP_URL in your production environment.')
}

/**
 * Returns user-friendly error messages for OAuth failures, specifically handling
 * disabled providers in Supabase.
 */
export function formatOAuthErrorMessage(provider: OAuthProvider, rawMessage?: string): string {
  const isNotEnabled = Boolean(rawMessage && /provider.*not enabled/i.test(rawMessage))
  if (isNotEnabled) {
    if (provider === 'google') {
      return 'Google sign-in is not enabled in your Supabase project. Please enable Google in Supabase Dashboard > Authentication > Providers.'
    }
    return 'LinkedIn sign-in is not enabled in your Supabase project. Please enable LinkedIn (OIDC) in Supabase Dashboard > Authentication > Providers.'
  }
  return rawMessage || 'Could not initiate social authentication. Please try again.'
}

/**
 * Constructs the canonical OAuth callback URL with validated destination parameters.
 */
export function buildOAuthCallbackUrl(appUrl: string, requestedNext?: string): string {
  const next = safeNextPath(requestedNext)
  const cleanAppUrl = appUrl.replace(/\/$/, '')
  return `${cleanAppUrl}/auth/callback?flow=oauth&next=${encodeURIComponent(next)}`
}

export interface OAuthCallbackResolutionParams {
  code?: string | null
  flow?: string | null
  next?: string | null
  error?: string | null
  errorDescription?: string | null
  origin: string
  isSuccessfulExchange: boolean
  exchangeErrorMessage?: string | null
  forwardedHost?: string | null
  isLocalEnv?: boolean
}

/**
 * Formats callback and exchange error messages into friendly, user-facing text,
 * particularly for PKCE code verifier mismatches caused by in-app browsers or cross-device links.
 */
export function formatCallbackErrorMessage(rawMessage: string | null | undefined): string {
  if (!rawMessage) return 'Could not authenticate user'
  if (/pkce|code.*verifier/i.test(rawMessage)) {
    return 'Your sign-in session expired or was opened in a different browser. If you opened this link from WhatsApp, Instagram, or an email app, please open the website directly in your browser (Chrome or Safari) and try again.'
  }
  return rawMessage
}

/**
 * Resolves the destination redirect URL for auth callback requests across
 * OAuth, email verification, and recovery flows.
 */
export function resolveOAuthCallbackRedirect(params: OAuthCallbackResolutionParams): string {
  const {
    code,
    flow,
    next: rawNext,
    error,
    errorDescription,
    origin,
    isSuccessfulExchange,
    exchangeErrorMessage,
    forwardedHost,
    isLocalEnv,
  } = params

  const next = safeNextPath(rawNext)
  const oauthError = errorDescription || error

  if (code && isSuccessfulExchange) {
    if (flow === 'recovery') {
      return `${origin}/reset-password?next=${encodeURIComponent(next)}`
    }
    if (flow === 'email_verification') {
      return `${origin}/login?message=${encodeURIComponent('Your email has been verified. Please sign in.')}&next=${encodeURIComponent(next)}`
    }
    if (isLocalEnv) {
      return `${origin}${next}`
    } else if (forwardedHost) {
      const cleanHost = forwardedHost.split(':')[0].toLowerCase()
      const isLocal = cleanHost === 'localhost' || cleanHost === '127.0.0.1'
      const protocol = isLocal ? 'http' : 'https'
      return `${protocol}://${forwardedHost}${next}`
    } else {
      return `${origin}${next}`
    }
  }

  // Handle errors or missing code
  const errorPath = flow === 'recovery' ? '/forgot-password' : '/login'
  const failureMessage = flow === 'recovery'
    ? 'This reset link is invalid or expired. Request a new one.'
    : formatCallbackErrorMessage(exchangeErrorMessage || oauthError)

  return `${origin}${errorPath}?error=${encodeURIComponent(failureMessage)}&next=${encodeURIComponent(next)}`
}
