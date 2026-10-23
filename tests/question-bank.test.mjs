import assert from 'node:assert/strict'
import test from 'node:test'
import { parseQuestionRows, QuestionBankError } from '../src/lib/tests/questionBank.ts'
import { selectQuestions, QuestionSelectionError } from '../src/lib/tests/questionSelection.ts'

const headers = ['id', 'category', 'section', 'question', 'option_a', 'option_b', 'option_c', 'option_d', 'correct_option', 'difficulty', 'is_active']
const row = (id, section = 'section-1', active = 'TRUE', category = 'AI', difficulty = 'easy') => [id, category, section, `Question ${id}`, 'A', 'B', 'C', 'D', 'B', difficulty, active]

test('parses by headers, maps categories, and filters inactive questions', () => {
  const questions = parseQuestionRows([headers, row('active'), row('inactive', 'section-2', 'FALSE')])
  assert.equal(questions.length, 2)
  assert.equal(questions[0].category, 'ai')
  assert.equal(questions[0].correct, 1)
  assert.equal(questions[1].isActive, false)
})

test('accepts workbook values and maps Software Engineering to technology', () => {
  const [question] = parseQuestionRows([headers, row('software-1', 'section-2', '1', 'Software Engineering', '')])
  assert.equal(question.category, 'technology')
  assert.equal(question.difficulty, '')
  assert.equal(question.isActive, true)
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

test('selects 20 free questions and 45 paid questions', () => {
  const questions = Array.from({ length: 20 }, (_, index) => ({ ...parseQuestionRows([headers, row(`free-${index}`)])[0] }))
  assert.equal(selectQuestions(questions, 'free', () => 0).length, 20)

  const proQuestions = Array.from({ length: 45 }, (_, index) => parseQuestionRows([headers, row(`paid-${index}`, 'section-2')])[0])
  const selected = selectQuestions(proQuestions, 'pro', () => 0)
  assert.equal(selected.length, 45)
})

test('temporarily repeats an incomplete free pool with unique IDs', () => {
  const questions = Array.from({ length: 19 }, (_, index) => parseQuestionRows([headers, row(`free-${index}`)])[0])
  const selected = selectQuestions(questions, 'free', () => 0)
  assert.equal(selected.length, 20)
  assert.equal(new Set(selected.map((question) => question.id)).size, 20)
})

test('rejects incomplete paid pools', () => {
  const questions = Array.from({ length: 44 }, (_, index) => parseQuestionRows([headers, row(`paid-${index}`)])[0])
  assert.throws(() => selectQuestions(questions, 'pro'), QuestionSelectionError)
})
