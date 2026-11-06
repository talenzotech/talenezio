import assert from 'node:assert/strict'
import test from 'node:test'
import {
  INTERVIEW_PREP_BATCHES,
  isValidPhoneNumber,
  isValidResumeFile,
} from '../src/lib/interview-prep/batches.ts'
import { sendInterviewPrepApplicationEmail } from '../src/utils/email.ts'

test('validates interview preparation batches', () => {
  assert.equal(INTERVIEW_PREP_BATCHES.length, 3)
  assert.ok(INTERVIEW_PREP_BATCHES.includes('23 November to 30 November'))
  assert.ok(INTERVIEW_PREP_BATCHES.includes('1 October to 8 October'))
  assert.ok(INTERVIEW_PREP_BATCHES.includes('9 October to 16 October'))
})

test('validates mandatory contact phone numbers', () => {
  // Valid phone numbers (10 to 15 digits)
  assert.equal(isValidPhoneNumber('9876543210'), true)
  assert.equal(isValidPhoneNumber('+91 9876543210'), true)
  assert.equal(isValidPhoneNumber('+1 (555) 234-5678'), true)
  assert.equal(isValidPhoneNumber('09876543210'), true)

  // Invalid numbers
  assert.equal(isValidPhoneNumber(''), false)
  assert.equal(isValidPhoneNumber('12345'), false)
  assert.equal(isValidPhoneNumber('abcdefghij'), false)
  assert.equal(isValidPhoneNumber(null), false)
  assert.equal(isValidPhoneNumber(undefined), false)
})

test('enforces mandatory resume upload with type and size validation', () => {
  // Valid PDF and DOCX within 5MB
  assert.deepEqual(isValidResumeFile({ name: 'candidate_resume.pdf', size: 1024 * 1024 }), { valid: true })
  assert.deepEqual(isValidResumeFile({ name: 'candidate_resume.docx', size: 2 * 1024 * 1024 }), { valid: true })
  assert.deepEqual(isValidResumeFile({ name: 'candidate_resume.doc', size: 500 * 1024 }), { valid: true })

  // Mandatory: missing or empty file
  const emptyRes = isValidResumeFile(null)
  assert.equal(emptyRes.valid, false)
  assert.ok(emptyRes.error.includes('mandatory'))

  const zeroSizeRes = isValidResumeFile({ name: 'empty.pdf', size: 0 })
  assert.equal(zeroSizeRes.valid, false)
  assert.ok(zeroSizeRes.error.includes('mandatory'))

  // Invalid extension
  const invalidExt = isValidResumeFile({ name: 'resume.png', size: 500 * 1024 })
  assert.equal(invalidExt.valid, false)
  assert.ok(invalidExt.error.includes('PDF or DOCX'))

  // Size exceeding 5MB
  const tooLarge = isValidResumeFile({ name: 'large.pdf', size: 6 * 1024 * 1024 })
  assert.equal(tooLarge.valid, false)
  assert.ok(tooLarge.error.includes('5MB'))
})

test('sendInterviewPrepApplicationEmail respects MOCK_EMAIL and sends to taleneziocontact@gmail.com', async () => {
  process.env.MOCK_EMAIL = 'true'
  delete process.env.ADMIN_NOTIFICATION_EMAIL

  const result = await sendInterviewPrepApplicationEmail({
    fullName: 'Ananya Sharma',
    email: 'ananya@example.com',
    phone: '+91 9876543210',
    batch: '23 November to 30 November',
    domain: 'Software Engineering',
    resumeFileName: 'ananya_resume.pdf',
    resumeBuffer: Buffer.from('mock-pdf-content'),
  })

  assert.equal(result.success, true)
  assert.ok(result.data)

  delete process.env.MOCK_EMAIL
})

test('sendInterviewPrepApplicationEmail returns error when RESEND_API_KEY is not configured', async () => {
  delete process.env.MOCK_EMAIL
  const originalApiKey = process.env.RESEND_API_KEY
  delete process.env.RESEND_API_KEY

  const result = await sendInterviewPrepApplicationEmail({
    fullName: 'Ananya Sharma',
    email: 'ananya@example.com',
    phone: '+91 9876543210',
    batch: '23 November to 30 November',
    domain: 'Software Engineering',
    resumeFileName: 'ananya_resume.pdf',
    resumeBuffer: Buffer.from('mock-pdf-content'),
  })

  assert.equal(result.success, false)
  assert.ok(result.error.message.includes('RESEND_API_KEY'))

  if (originalApiKey) process.env.RESEND_API_KEY = originalApiKey
})

