import assert from 'node:assert/strict'
import test from 'node:test'
import { scoreAnswers, isAttemptExpired, SUBMISSION_GRACE_PERIOD_MS } from '../src/lib/tests/scoring.ts'

const questions = [
  { id: 'q1', correct: 1 },
  { id: 'q2', correct: 0 },
]

test('scores answers against the server snapshot', () => {
  assert.equal(scoreAnswers(questions, { q1: 1, q2: 2 }), 1)
})

test('unanswered questions do not receive credit', () => {
  assert.equal(scoreAnswers(questions, { q1: 1 }), 1)
})

test('rejects answers for unknown questions or invalid options', () => {
  assert.throws(() => scoreAnswers(questions, { q3: 1 }), /Invalid answer payload/)
  assert.throws(() => scoreAnswers(questions, { q1: 4 }), /Invalid answer payload/)
})

test('auto-submit expiry accommodates network transit within grace period', () => {
  const expiryTime = new Date('2026-11-18T12:00:00.000Z')
  const expiryMs = expiryTime.getTime()

  // 1. While timer is active (before expiry): NOT expired
  assert.equal(isAttemptExpired(expiryTime, expiryMs - 5000), false)

  // 2. Exact countdown moment (0s remaining): NOT expired (grace period active)
  assert.equal(isAttemptExpired(expiryTime, expiryMs), false)

  // 3. Network latency transit (10s and 25s after timer hit 0): NOT expired within 30s grace period
  assert.equal(isAttemptExpired(expiryTime, expiryMs + 10000), false)
  assert.equal(isAttemptExpired(expiryTime, expiryMs + 25000), false)
  assert.equal(isAttemptExpired(expiryTime.toISOString(), expiryMs + SUBMISSION_GRACE_PERIOD_MS), false)

  // 4. Past grace period (31s after timer hit 0): EXPIRED
  assert.equal(isAttemptExpired(expiryTime, expiryMs + SUBMISSION_GRACE_PERIOD_MS + 1000), true)
  assert.equal(isAttemptExpired(expiryTime.toISOString(), expiryMs + 60000), true)

  // 5. Invalid date string: fails safely as expired
  assert.equal(isAttemptExpired('invalid-date', expiryMs), true)
})
