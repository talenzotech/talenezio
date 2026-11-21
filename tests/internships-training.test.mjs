import assert from 'node:assert/strict'
import test from 'node:test'
import {
  INTERNSHIP_OPPORTUNITIES,
  TRAINING_PROGRAMS,
  getTraining,
  getTrainingByProductCode,
} from '../src/lib/internships-training/data.ts'
import {
  sendInternshipApplicationEmail,
  sendTrainingApplicationEmail,
} from '../src/utils/email.ts'

test('loads all 4 internship opportunities from the PDF', () => {
  assert.equal(INTERNSHIP_OPPORTUNITIES.length, 4)

  const titles = INTERNSHIP_OPPORTUNITIES.map((i) => i.title)
  assert.equal(titles.includes('Graphic Designing Intern'), true)
  assert.equal(titles.includes('Website Development Intern'), true)
  assert.equal(titles.includes('Business Development Intern'), true)
  assert.equal(titles.includes('Social Media Management Intern'), true)

  for (const item of INTERNSHIP_OPPORTUNITIES) {
    assert.ok(item.title, 'Title must not be empty')
    assert.ok(item.duration, 'Duration must not be empty')
    assert.ok(item.workMode, 'Work mode must not be empty')
    assert.ok(item.aboutRole, 'About role must not be empty')
    assert.ok(item.responsibilities.length > 0, 'Responsibilities must not be empty')
    assert.ok(item.requirements.length > 0, 'Requirements must not be empty')
    assert.ok(item.benefits.length > 0, 'Benefits must not be empty')
  }
})

test('loads all 5 training programs from the PDF with correct fees', () => {
  assert.equal(TRAINING_PROGRAMS.length, 5)

  const graphic = getTraining('graphic-designing-training')
  assert.ok(graphic)
  assert.equal(graphic.fee, '₹4999 per month')
  assert.equal(graphic.pricePaise, 499900)

  const marketing = getTraining('marketing-training')
  assert.ok(marketing)
  assert.equal(marketing.fee, '₹4999 per month')
  assert.equal(marketing.pricePaise, 499900)

  const smm = getTraining('social-media-marketing-training')
  assert.ok(smm)
  assert.equal(smm.fee, '₹4999 per month')
  assert.equal(smm.pricePaise, 499900)

  const dm = getTraining('digital-marketing-training')
  assert.ok(dm)
  assert.equal(dm.fee, '₹4999 per month')
  assert.equal(dm.pricePaise, 499900)

  const bd = getTraining('business-development-training')
  assert.ok(bd)
  assert.equal(bd.fee, '₹4999 per month')
  assert.equal(bd.pricePaise, 499900)

  for (const item of TRAINING_PROGRAMS) {
    assert.ok(item.title, 'Title must not be empty')
    assert.ok(item.duration, 'Duration must not be empty')
    assert.ok(item.workMode, 'Work mode must not be empty')
    assert.ok(item.aboutTraining, 'About training must not be empty')
    assert.ok(item.whatYouWillLearn.length > 0, 'What you will learn must not be empty')
    assert.ok(item.whoCanApply, 'Who can apply must not be empty')
    assert.ok(item.benefits.length > 0, 'Benefits must not be empty')
  }
})

test('finds training program by product code', () => {
  const graphic = getTrainingByProductCode('training:graphic-designing')
  assert.ok(graphic)
  assert.equal(graphic.pricePaise, 499900)

  const smm = getTrainingByProductCode('training:social-media-marketing')
  assert.ok(smm)
  assert.equal(smm.pricePaise, 499900)

  const invalid = getTrainingByProductCode('training:non-existent')
  assert.equal(invalid, undefined)
})

test('sendInternshipApplicationEmail dispatches email with applicant details and resume to taleneziocontact@gmail.com', async () => {
  process.env.MOCK_EMAIL = 'true'
  delete process.env.ADMIN_NOTIFICATION_EMAIL
  delete process.env.ADMIN_NOTIFICATION_CC_EMAIL

  const result = await sendInternshipApplicationEmail({
    internshipTitle: 'Website Development Intern',
    fullName: 'Aditya Verma',
    email: 'aditya@example.com',
    phone: '+91 9876543210',
    college: 'IIT Bombay',
    resumeFileName: 'aditya_resume.pdf',
    resumeBuffer: Buffer.from('%PDF-1.4 mock content'),
  })

  assert.equal(result.success, true)
  assert.ok(result.data)
  assert.equal(result.data.to, 'taleneziocontact@gmail.com')
  assert.equal(result.data.cc, undefined)

  delete process.env.MOCK_EMAIL
})

test('sendInternshipApplicationEmail supports custom to and cc recipients and environment variables', async () => {
  process.env.MOCK_EMAIL = 'true'
  process.env.ADMIN_NOTIFICATION_EMAIL = 'custom-admin@talenezio.com'
  process.env.ADMIN_NOTIFICATION_CC_EMAIL = 'custom-cc@talenezio.com'

  // Uses custom env vars by default
  const envResult = await sendInternshipApplicationEmail({
    internshipTitle: 'Business Development Intern',
    fullName: 'Rohan Sharma',
    email: 'rohan@example.com',
    phone: '+91 9876543210',
    resumeFileName: 'rohan_resume.docx',
    resumeBuffer: Buffer.from('mock docx'),
  })

  assert.equal(envResult.success, true)
  assert.equal(envResult.data.to, 'custom-admin@talenezio.com')
  assert.equal(envResult.data.cc, 'custom-cc@talenezio.com')

  // Explicit props override environment variables
  const overrideResult = await sendInternshipApplicationEmail({
    internshipTitle: 'Business Development Intern',
    fullName: 'Rohan Sharma',
    email: 'rohan@example.com',
    phone: '+91 9876543210',
    resumeFileName: 'rohan_resume.docx',
    resumeBuffer: Buffer.from('mock docx'),
    to: 'taleneziocontact@gmail.com',
    cc: 'shubh.talenezio@gmail.com',
  })

  assert.equal(overrideResult.success, true)
  assert.equal(overrideResult.data.to, 'taleneziocontact@gmail.com')
  assert.equal(overrideResult.data.cc, 'shubh.talenezio@gmail.com')

  delete process.env.MOCK_EMAIL
  delete process.env.ADMIN_NOTIFICATION_EMAIL
  delete process.env.ADMIN_NOTIFICATION_CC_EMAIL
})

test('sendInternshipApplicationEmail fails gracefully and returns error when RESEND_API_KEY is missing', async () => {
  delete process.env.MOCK_EMAIL
  const originalApiKey = process.env.RESEND_API_KEY
  delete process.env.RESEND_API_KEY

  const result = await sendInternshipApplicationEmail({
    internshipTitle: 'Graphic Designing Intern',
    fullName: 'Pooja Nair',
    email: 'pooja@example.com',
    phone: '+91 9123456789',
    college: 'NIFT',
    resumeFileName: 'pooja_resume.pdf',
    resumeBuffer: Buffer.from('mock resume'),
  })

  assert.equal(result.success, false)
  assert.ok(result.error.message.includes('RESEND_API_KEY'))

  if (originalApiKey) process.env.RESEND_API_KEY = originalApiKey
})

test('sendTrainingApplicationEmail dispatches email with program, batch, contact number, and resume attachment', async () => {
  process.env.MOCK_EMAIL = 'true'
  delete process.env.ADMIN_NOTIFICATION_EMAIL

  const result = await sendTrainingApplicationEmail({
    programTitle: 'Graphic Designing Training',
    fee: '₹4999 per month',
    fullName: 'Kavita Iyer',
    email: 'kavita@example.com',
    phone: '+91 9988776655',
    city: 'Pune',
    collegeOrCompany: 'MIT Pune',
    age: 22,
    batch: 'Weekend Intensive Batch (Saturday & Sunday)',
    resumeFileName: 'kavita_resume.pdf',
    resumeBuffer: Buffer.from('%PDF-1.4 mock resume'),
  })

  assert.equal(result.success, true)
  assert.ok(result.data)

  delete process.env.MOCK_EMAIL
})

test('sendTrainingApplicationEmail fails gracefully when RESEND_API_KEY is not configured', async () => {
  delete process.env.MOCK_EMAIL
  const originalApiKey = process.env.RESEND_API_KEY
  delete process.env.RESEND_API_KEY

  const result = await sendTrainingApplicationEmail({
    programTitle: 'Digital Marketing Training',
    fee: '₹4999 per month',
    fullName: 'Rohan Mehra',
    email: 'rohan@example.com',
    phone: '+91 9876543210',
    city: 'Delhi',
    collegeOrCompany: 'Delhi University',
    age: 23,
    batch: 'Weekday Evening Batch (Mon - Fri, 7 PM - 9 PM)',
  })

  assert.equal(result.success, false)
  assert.ok(result.error.message.includes('RESEND_API_KEY'))

  if (originalApiKey) process.env.RESEND_API_KEY = originalApiKey
})

test('sendInternshipApplicationEmail detects and reports Resend API error responses instead of falsely returning success', async () => {
  delete process.env.MOCK_EMAIL
  const originalApiKey = process.env.RESEND_API_KEY
  process.env.RESEND_API_KEY = 're_mock_test_key_123'

  const { Resend } = await import('resend')
  const dummyResend = new Resend('re_mock_test_key_123')
  const originalSend = dummyResend.emails.constructor.prototype.send

  let capturedPayload = null
  dummyResend.emails.constructor.prototype.send = async function (payload) {
    capturedPayload = payload
    return {
      data: null,
      error: {
        name: 'validation_error',
        message: 'The domain is not verified on your Resend account.',
        statusCode: 403,
      },
      headers: null,
    }
  }

  try {
    const result = await sendInternshipApplicationEmail({
      internshipTitle: 'Graphic Designing Intern',
      fullName: 'Pooja Nair',
      email: 'pooja@example.com',
      phone: '+91 9123456789',
      college: 'NIFT',
      resumeFileName: 'pooja_resume.pdf',
      resumeBuffer: Buffer.from('%PDF-1.4 mock content'),
    })

    assert.equal(result.success, false)
    assert.ok(result.error.message.includes('The domain is not verified'))
    assert.ok(result.resendError)
    assert.equal(result.resendError.statusCode, 403)
    assert.equal(capturedPayload.to, 'taleneziocontact@gmail.com')
    assert.equal(capturedPayload.cc, undefined)
    assert.equal(capturedPayload.attachments.length, 1)
    assert.equal(capturedPayload.attachments[0].filename, 'pooja_resume.pdf')
    assert.equal(capturedPayload.attachments[0].contentType, 'application/pdf')
    assert.ok(Buffer.isBuffer(capturedPayload.attachments[0].content))
  } finally {
    dummyResend.emails.constructor.prototype.send = originalSend
    if (originalApiKey) process.env.RESEND_API_KEY = originalApiKey
    else delete process.env.RESEND_API_KEY
  }
})

test('sendInternshipApplicationEmail successfully delivers when Resend API returns success', async () => {
  delete process.env.MOCK_EMAIL
  const originalApiKey = process.env.RESEND_API_KEY
  process.env.RESEND_API_KEY = 're_mock_test_key_123'

  const { Resend } = await import('resend')
  const dummyResend = new Resend('re_mock_test_key_123')
  const originalSend = dummyResend.emails.constructor.prototype.send

  let capturedPayload = null
  dummyResend.emails.constructor.prototype.send = async function (payload) {
    capturedPayload = payload
    return {
      data: { id: 'email_live_test_id_999' },
      error: null,
      headers: null,
    }
  }

  try {
    const result = await sendInternshipApplicationEmail({
      internshipTitle: 'Website Development Intern',
      fullName: 'Aniket Deshmukh',
      email: 'aniket@example.com',
      phone: '+91 9876543210',
      college: 'COEP',
      resumeFileName: 'aniket_resume.docx',
      resumeBuffer: Buffer.from('mock docx content'),
    })

    assert.equal(result.success, true)
    assert.equal(result.data.id, 'email_live_test_id_999')
    assert.equal(capturedPayload.to, 'taleneziocontact@gmail.com')
    assert.equal(capturedPayload.cc, undefined)
    assert.equal(capturedPayload.attachments[0].filename, 'aniket_resume.docx')
    assert.equal(capturedPayload.attachments[0].contentType, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')
  } finally {
    dummyResend.emails.constructor.prototype.send = originalSend
    if (originalApiKey) process.env.RESEND_API_KEY = originalApiKey
    else delete process.env.RESEND_API_KEY
  }
})
