import assert from 'node:assert/strict'
import test from 'node:test'
import {
  isValidPhoneNumber,
  isValidLinkedInUrl,
  isValidBookingDate,
} from '../src/lib/career/validation.ts'
import {
  sendCareerGuidanceBookingEmail,
  sendLinkedInOptimizationEmail,
  sendCareerServiceRegistrationEmail,
} from '../src/utils/email.ts'

test('isValidPhoneNumber validates standard and international phone numbers', () => {
  // Valid standard 10-digit numbers
  assert.equal(isValidPhoneNumber('9876543210').valid, true)
  assert.equal(isValidPhoneNumber('+919876543210').valid, true)
  assert.equal(isValidPhoneNumber('+91 98765 43210').valid, true)
  assert.equal(isValidPhoneNumber('(987) 654-3210').valid, true)
  assert.equal(isValidPhoneNumber('+1 415 555 2671').valid, true)

  // Invalid numbers
  assert.equal(isValidPhoneNumber('').valid, false)
  assert.equal(isValidPhoneNumber('12345').valid, false) // Too short (< 10 digits)
  assert.equal(isValidPhoneNumber('abcdefghij').valid, false)
  assert.equal(isValidPhoneNumber('+91 98765-ABCDE').valid, false)
  assert.equal(isValidPhoneNumber('12345678901234567890').valid, false) // Too long (> 15 digits)
})

test('isValidLinkedInUrl validates and normalizes LinkedIn profile URLs', () => {
  // Valid URLs
  const valid1 = isValidLinkedInUrl('https://www.linkedin.com/in/rahul-sharma')
  assert.equal(valid1.valid, true)
  assert.equal(valid1.normalized, 'https://www.linkedin.com/in/rahul-sharma')

  const valid2 = isValidLinkedInUrl('linkedin.com/in/aditi_verma/')
  assert.equal(valid2.valid, true)
  assert.equal(valid2.normalized, 'https://www.linkedin.com/in/aditi_verma')

  const valid3 = isValidLinkedInUrl('https://in.linkedin.com/in/priya-patel-12345678')
  assert.equal(valid3.valid, true)
  assert.equal(valid3.normalized, 'https://www.linkedin.com/in/priya-patel-12345678')

  // Invalid URLs
  assert.equal(isValidLinkedInUrl('').valid, false)
  assert.equal(isValidLinkedInUrl('https://twitter.com/rahul').valid, false)
  assert.equal(isValidLinkedInUrl('https://www.facebook.com/in/rahul').valid, false)
  assert.equal(isValidLinkedInUrl('not-a-url').valid, false)
  assert.equal(isValidLinkedInUrl('https://www.linkedin.com/feed').valid, false)
})

test('isValidBookingDate enforces future dates and validates formats', () => {
  // Tomorrow's date is valid
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 2)
  const tomorrowStr = tomorrow.toISOString().split('T')[0]
  assert.equal(isValidBookingDate(tomorrowStr).valid, true)

  // Past date is invalid
  assert.equal(isValidBookingDate('2020-01-01').valid, false)

  // Empty or malformed date is invalid
  assert.equal(isValidBookingDate('').valid, false)
  assert.equal(isValidBookingDate('not-a-date').valid, false)
})

test('sendCareerGuidanceBookingEmail dispatches email with booking date, phone, and candidate details', async () => {
  process.env.MOCK_EMAIL = 'true'
  delete process.env.ADMIN_NOTIFICATION_EMAIL

  const result = await sendCareerGuidanceBookingEmail({
    fullName: 'Rahul Sharma',
    email: 'rahul@example.com',
    phone: '+91 98765 43210',
    selectedBookingDate: '2026-11-20 (10:00 AM - 12:00 PM)',
    careerDetails: 'Final year CSE student preparing for product company interviews.',
    areaOfInterest: 'Software Engineering / Backend',
    price: '₹199',
  })

  assert.equal(result.success, true)
  assert.ok(result.data)

  delete process.env.MOCK_EMAIL
})

test('sendCareerGuidanceBookingEmail fails closed when RESEND_API_KEY is not configured', async () => {
  delete process.env.MOCK_EMAIL
  const originalApiKey = process.env.RESEND_API_KEY
  delete process.env.RESEND_API_KEY

  const result = await sendCareerGuidanceBookingEmail({
    fullName: 'Test Candidate',
    email: 'test@example.com',
    phone: '+91 9876543210',
    selectedBookingDate: '2026-11-25',
    careerDetails: 'Test details',
    areaOfInterest: 'Testing',
  })

  assert.equal(result.success, false)
  assert.ok(result.error.message.includes('RESEND_API_KEY'))

  if (originalApiKey) process.env.RESEND_API_KEY = originalApiKey
})

test('sendLinkedInOptimizationEmail dispatches email with LinkedIn profile URL and phone', async () => {
  process.env.MOCK_EMAIL = 'true'
  delete process.env.ADMIN_NOTIFICATION_EMAIL

  const result = await sendLinkedInOptimizationEmail({
    fullName: 'Aditi Verma',
    email: 'aditi@example.com',
    phone: '+91 91234 56789',
    linkedinUrl: 'https://www.linkedin.com/in/aditi-verma',
    careerDetails: 'Frontend Engineer with 2 years experience looking to transition to Full Stack.',
    areaOfInterest: 'Web Development & Personal Branding',
    price: '₹499',
  })

  assert.equal(result.success, true)
  assert.ok(result.data)

  delete process.env.MOCK_EMAIL
})

test('sendLinkedInOptimizationEmail fails closed when RESEND_API_KEY is not configured', async () => {
  delete process.env.MOCK_EMAIL
  const originalApiKey = process.env.RESEND_API_KEY
  delete process.env.RESEND_API_KEY

  const result = await sendLinkedInOptimizationEmail({
    fullName: 'Test Candidate',
    email: 'test@example.com',
    phone: '+91 9876543210',
    linkedinUrl: 'https://www.linkedin.com/in/test-candidate',
    careerDetails: 'Test details',
    areaOfInterest: 'Branding',
  })

  assert.equal(result.success, false)
  assert.ok(result.error.message.includes('RESEND_API_KEY'))

  if (originalApiKey) process.env.RESEND_API_KEY = originalApiKey
})

test('sendCareerServiceRegistrationEmail delegates appropriately based on service name', async () => {
  process.env.MOCK_EMAIL = 'true'

  // Guidance delegation
  const guidanceResult = await sendCareerServiceRegistrationEmail({
    serviceName: 'Career Guidance',
    fullName: 'Rohan Mehra',
    email: 'rohan@example.com',
    phone: '+91 9988776655',
    selectedBookingDate: '2026-11-22 (02:00 PM - 04:00 PM)',
    careerDetails: 'Looking for advice on AI careers.',
    areaOfInterest: 'Artificial Intelligence',
  })
  assert.equal(guidanceResult.success, true)

  // LinkedIn delegation
  const linkedInResult = await sendCareerServiceRegistrationEmail({
    serviceName: 'LinkedIn Optimization',
    fullName: 'Sneha Patel',
    email: 'sneha@example.com',
    phone: '+91 9876501234',
    linkedinUrl: 'https://www.linkedin.com/in/sneha-patel',
    careerDetails: 'MBA marketing graduate.',
    areaOfInterest: 'Brand Marketing',
  })
  assert.equal(linkedInResult.success, true)

  delete process.env.MOCK_EMAIL
})

