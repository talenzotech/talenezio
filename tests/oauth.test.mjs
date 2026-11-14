import assert from 'node:assert/strict'
import test from 'node:test'
import { safeNextPath } from '../src/lib/auth/redirect.ts'
import {
  getAppUrl,
  formatOAuthErrorMessage,
  buildOAuthCallbackUrl,
  resolveOAuthCallbackRedirect,
} from '../src/lib/auth/oauth.ts'

test('safeNextPath validates destination paths correctly and blocks open redirects', () => {
  assert.equal(safeNextPath('/dashboard'), '/dashboard')
  assert.equal(safeNextPath('/career'), '/career')
  assert.equal(safeNextPath('/tests/ai'), '/tests/ai')
  assert.equal(safeNextPath('https://malicious.com'), '/dashboard')
  assert.equal(safeNextPath('//malicious.com'), '/dashboard')
  assert.equal(safeNextPath(null, '/login'), '/login')
})

test('getAppUrl prioritizes explicit application environment variables', () => {
  assert.equal(
    getAppUrl({ NEXT_PUBLIC_APP_URL: 'https://talenezio.com/' }),
    'https://talenezio.com'
  )
  assert.equal(
    getAppUrl({ NEXT_PUBLIC_SITE_URL: 'https://talenezio.com' }),
    'https://talenezio.com'
  )
})

test('getAppUrl uses trusted platform deployment variables when app URL is unset', () => {
  assert.equal(
    getAppUrl({ VERCEL_PROJECT_PRODUCTION_URL: 'talenezio.vercel.app/' }),
    'https://talenezio.vercel.app'
  )
  assert.equal(
    getAppUrl({ VERCEL_URL: 'talenezio-preview-123.vercel.app' }),
    'https://talenezio-preview-123.vercel.app'
  )
})

test('getAppUrl falls back to localhost:3000 in development environment', () => {
  assert.equal(getAppUrl({ NODE_ENV: 'development' }), 'http://localhost:3000')
  assert.equal(getAppUrl({ NODE_ENV: 'test' }), 'http://localhost:3000')
})

test('getAppUrl fails safely in production when no canonical URL is configured', () => {
  assert.throws(
    () => getAppUrl({ NODE_ENV: 'production' }),
    /Canonical application URL is not configured/
  )
})

test('formatOAuthErrorMessage handles disabled provider errors gracefully', () => {
  assert.equal(
    formatOAuthErrorMessage('google', 'Unsupported provider: provider is not enabled'),
    'Google sign-in is not enabled in your Supabase project. Please enable Google in Supabase Dashboard > Authentication > Providers.'
  )
  assert.equal(
    formatOAuthErrorMessage('linkedin_oidc', 'validation_failed: provider is not enabled'),
    'LinkedIn sign-in is not enabled in your Supabase project. Please enable LinkedIn (OIDC) in Supabase Dashboard > Authentication > Providers.'
  )
  assert.equal(
    formatOAuthErrorMessage('google', 'Invalid client secret'),
    'Invalid client secret'
  )
})

test('buildOAuthCallbackUrl formats callback URL with validated next parameter', () => {
  assert.equal(
    buildOAuthCallbackUrl('https://talenezio.com', '/career'),
    'https://talenezio.com/auth/callback?flow=oauth&next=%2Fcareer'
  )
  assert.equal(
    buildOAuthCallbackUrl('https://talenezio.com/', 'https://evil.com'),
    'https://talenezio.com/auth/callback?flow=oauth&next=%2Fdashboard'
  )
})

test('resolveOAuthCallbackRedirect handles successful OAuth and role flows', () => {
  // Standard OAuth success in local dev
  const localRedirect = resolveOAuthCallbackRedirect({
    code: 'valid-code',
    flow: 'oauth',
    next: '/dashboard',
    origin: 'http://localhost:3000',
    isSuccessfulExchange: true,
    isLocalEnv: true,
  })
  assert.equal(localRedirect, 'http://localhost:3000/dashboard')

  // Standard OAuth success behind load balancer
  const prodRedirect = resolveOAuthCallbackRedirect({
    code: 'valid-code',
    flow: 'oauth',
    next: '/tests',
    origin: 'http://internal-cluster',
    isSuccessfulExchange: true,
    forwardedHost: 'talenezio.com',
    isLocalEnv: false,
  })
  assert.equal(prodRedirect, 'https://talenezio.com/tests')

  // Password recovery flow
  const recoveryRedirect = resolveOAuthCallbackRedirect({
    code: 'valid-code',
    flow: 'recovery',
    next: '/dashboard',
    origin: 'https://talenezio.com',
    isSuccessfulExchange: true,
  })
  assert.equal(recoveryRedirect, 'https://talenezio.com/reset-password?next=%2Fdashboard')

  // Email verification flow
  const emailRedirect = resolveOAuthCallbackRedirect({
    code: 'valid-code',
    flow: 'email_verification',
    next: '/dashboard',
    origin: 'https://talenezio.com',
    isSuccessfulExchange: true,
  })
  assert.match(emailRedirect, /login\?message=Your%20email%20has%20been%20verified/)
})

test('resolveOAuthCallbackRedirect handles error states and provider failures safely', () => {
  // OAuth error description from provider
  const providerErrorRedirect = resolveOAuthCallbackRedirect({
    code: null,
    error: 'access_denied',
    errorDescription: 'User denied authorization',
    origin: 'https://talenezio.com',
    isSuccessfulExchange: false,
  })
  assert.equal(
    providerErrorRedirect,
    'https://talenezio.com/login?error=User%20denied%20authorization&next=%2Fdashboard'
  )

  // Code exchange failure on Supabase
  const exchangeErrorRedirect = resolveOAuthCallbackRedirect({
    code: 'bad-code',
    origin: 'https://talenezio.com',
    isSuccessfulExchange: false,
    exchangeErrorMessage: 'Token expired',
  })
  assert.equal(
    exchangeErrorRedirect,
    'https://talenezio.com/login?error=Token%20expired&next=%2Fdashboard'
  )
})
