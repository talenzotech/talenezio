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
 * Resolves the canonical application URL for OAuth redirects.
 * Prioritizes explicitly configured environment variables and trusted platform deployment
 * variables to prevent host header injection vulnerabilities.
 */
export function getAppUrl(env: AppUrlEnv = process.env): string {
  // 1. Explicitly configured application URL (Highest priority)
  const configuredAppUrl = env.NEXT_PUBLIC_APP_URL?.trim() || env.NEXT_PUBLIC_SITE_URL?.trim()
  if (configuredAppUrl) {
    return configuredAppUrl.replace(/\/$/, '')
  }

  // 2. Trusted platform environment variables (Vercel system variables)
  if (env.VERCEL_PROJECT_PRODUCTION_URL?.trim()) {
    return `https://${env.VERCEL_PROJECT_PRODUCTION_URL.trim().replace(/\/$/, '')}`
  }
  if (env.VERCEL_URL?.trim()) {
    return `https://${env.VERCEL_URL.trim().replace(/\/$/, '')}`
  }

  // 3. Local development / test fallback
  if (env.NODE_ENV === 'development' || !env.NODE_ENV || env.NODE_ENV === 'test') {
    return 'http://localhost:3000'
  }

  // 4. In production without a configured URL, fail safely instead of trusting arbitrary host headers
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
      return `https://${forwardedHost}${next}`
    } else {
      return `${origin}${next}`
    }
  }

  // Handle errors or missing code
  const errorPath = flow === 'recovery' ? '/forgot-password' : '/login'
  const failureMessage = flow === 'recovery'
    ? 'This reset link is invalid or expired. Request a new one.'
    : (exchangeErrorMessage || oauthError || 'Could not authenticate user')

  return `${origin}${errorPath}?error=${encodeURIComponent(failureMessage)}&next=${encodeURIComponent(next)}`
}
