import assert from 'node:assert/strict'
import test from 'node:test'
import { scoreAnswers } from '../src/lib/tests/scoring.ts'

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
