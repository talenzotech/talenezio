import assert from 'node:assert/strict'
import test from 'node:test'
import { getService } from '../src/lib/services/catalog.ts'

test('free unlock includes exactly the three approved service offers', () => {
  assert.equal(getService('interview-prep').freeUnlock, true)
  assert.equal(getService('linkedin-optimization').freeUnlock, true)
  assert.equal(getService('career-starter-pack').freeUnlock, true)
  assert.equal(getService('career-counseling').freeUnlock, false)
})
