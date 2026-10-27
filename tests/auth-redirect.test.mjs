import assert from 'node:assert/strict'
import test from 'node:test'
import { safeNextPath } from '../src/lib/auth/redirect.ts'
import { hasLocalDemoCookie } from '../src/lib/auth/local-demo-config.ts'

test('accepts internal destinations', () => {
  assert.equal(safeNextPath('/resume-builder'), '/resume-builder')
  assert.equal(safeNextPath('/tests/ai?type=pro'), '/tests/ai?type=pro')
  assert.equal(safeNextPath('/career'), '/career')
})

test('rejects unsafe destinations', () => {
  assert.equal(safeNextPath('https://example.com'), '/dashboard')
  assert.equal(safeNextPath('//example.com'), '/dashboard')
  assert.equal(safeNextPath(''), '/dashboard')
  assert.equal(safeNextPath(null, '/login'), '/login')
})

test('accepts local demo sessions only in development', () => {
  const originalNodeEnv = process.env.NODE_ENV

  try {
    process.env.NODE_ENV = 'development'
    assert.equal(hasLocalDemoCookie('authenticated'), true)
    assert.equal(hasLocalDemoCookie('invalid'), false)

    process.env.NODE_ENV = 'production'
    assert.equal(hasLocalDemoCookie('authenticated'), false)
  } finally {
    if (originalNodeEnv === undefined) {
      delete process.env.NODE_ENV
    } else {
      process.env.NODE_ENV = originalNodeEnv
    }
  }
})
