import assert from 'node:assert/strict'
import test from 'node:test'
import { safeNextPath } from '../src/lib/auth/redirect.ts'

test('accepts internal destinations', () => {
  assert.equal(safeNextPath('/resume-builder'), '/resume-builder')
  assert.equal(safeNextPath('/tests/ai?type=pro'), '/tests/ai?type=pro')
})

test('rejects unsafe destinations', () => {
  assert.equal(safeNextPath('https://example.com'), '/dashboard')
  assert.equal(safeNextPath('//example.com'), '/dashboard')
  assert.equal(safeNextPath(''), '/dashboard')
  assert.equal(safeNextPath(null, '/login'), '/login')
})
