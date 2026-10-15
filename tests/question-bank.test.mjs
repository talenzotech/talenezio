import assert from 'node:assert/strict'
import test from 'node:test'
import { parseQuestionRows, QuestionBankError } from '../src/lib/tests/questionBank.ts'
import { selectQuestions, QuestionSelectionError } from '../src/lib/tests/questionSelection.ts'

const headers = ['id', 'category', 'section', 'question', 'option_a', 'option_b', 'option_c', 'option_d', 'correct_option', 'difficulty', 'is_active']
const row = (id, section = 'section-1', active = 'TRUE') => [id, 'AI', section, `Question ${id}`, 'A', 'B', 'C', 'D', 'B', 'easy', active]

test('parses by headers, maps categories, and filters inactive questions', () => {
  const questions = parseQuestionRows([headers, row('active'), row('inactive', 'section-2', 'FALSE')])
  assert.equal(questions.length, 2)
  assert.equal(questions[0].category, 'ai')
  assert.equal(questions[0].correct, 1)
  assert.equal(questions[1].isActive, false)
})

test('rejects malformed rows instead of silently skipping them', () => {
  assert.throws(
    () => parseQuestionRows([headers, ['bad', 'AI', 'section-1', 'Question', 'A', '', 'C', 'D', 'E', 'easy', 'TRUE']]),
    (error) => error instanceof QuestionBankError && error.message.includes('all four options'),
  )
  assert.throws(
    () => parseQuestionRows([headers, ['bad', 'AI', 'section-1', 'Question', 'A', 'B', 'C', 'D', 'E', 'easy', 'TRUE']]),
    (error) => error instanceof QuestionBankError && error.message.includes('correct_option'),
  )
})

test('selects 20 random free questions and 15 per Pro section', () => {
  const questions = Array.from({ length: 20 }, (_, index) => ({ ...parseQuestionRows([headers, row(`free-${index}`)])[0] }))
  assert.equal(selectQuestions(questions, 'free', () => 0).length, 20)

  const proQuestions = ['section-1', 'section-2', 'section-3'].flatMap((section) => (
    Array.from({ length: 15 }, (_, index) => parseQuestionRows([headers, row(`${section}-${index}`, section)])[0])
  ))
  const selected = selectQuestions(proQuestions, 'pro', () => 0)
  assert.equal(selected.length, 45)
  for (const section of ['section-1', 'section-2', 'section-3']) {
    assert.equal(selected.filter((question) => question.section === section).length, 15)
  }
})

test('rejects incomplete free and Pro pools', () => {
  const questions = Array.from({ length: 19 }, (_, index) => parseQuestionRows([headers, row(`free-${index}`)])[0])
  assert.throws(() => selectQuestions(questions, 'free'), QuestionSelectionError)
  assert.throws(() => selectQuestions(questions, 'pro'), QuestionSelectionError)
})
