import assert from 'node:assert/strict'
import test from 'node:test'
import { safeNextPath } from '../src/lib/auth/redirect.ts'

test('safeNextPath validates destination paths correctly', () => {
  assert.equal(safeNextPath('/dashboard'), '/dashboard')
  assert.equal(safeNextPath('/career'), '/career')
  assert.equal(safeNextPath('/tests/ai'), '/tests/ai')
  assert.equal(safeNextPath('https://malicious.com'), '/dashboard')
  assert.equal(safeNextPath('//malicious.com'), '/dashboard')
  assert.equal(safeNextPath(null, '/login'), '/login')
})

test('OAuth callback search params error extraction', () => {
  const url = new URL('https://talenezio.com/auth/callback?error=access_denied&error_description=The+user+denied+the+request')
  const oauthError = url.searchParams.get('error_description') || url.searchParams.get('error')
  assert.equal(oauthError, 'The user denied the request')
})

test('OAuth callback missing code handling', () => {
  const url = new URL('https://talenezio.com/auth/callback?flow=oauth&next=%2Fdashboard')
  assert.equal(url.searchParams.get('code'), null)
  assert.equal(safeNextPath(url.searchParams.get('next')), '/dashboard')
})

test('Supabase unsupported provider error detection pattern', () => {
  const isNotEnabled = (msg) => /provider.*not enabled/i.test(msg)
  assert.equal(isNotEnabled('Unsupported provider: provider is not enabled'), true)
  assert.equal(isNotEnabled('Validation failed: provider not enabled'), true)
  assert.equal(isNotEnabled('Invalid credentials'), false)
})
