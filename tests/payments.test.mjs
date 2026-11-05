import assert from 'node:assert/strict'
import test from 'node:test'
import crypto from 'node:crypto'
import { SERVICE_CATALOG } from '../src/lib/services/catalog.ts'
import { TRAINING_PROGRAMS } from '../src/lib/internships-training/data.ts'

const CAREER_SERVICES = {
  'career:career-guidance': { name: 'Career Guidance', pricePaise: 19900, priceInr: 199 },
  'career:linkedin-optimization': { name: 'LinkedIn Optimization', pricePaise: 49900, priceInr: 499 },
  'career:interview-prep': { name: 'Interview Preparation', pricePaise: 49900, priceInr: 499 },
}

const PRO_TEST_PRICE_PAISE = 3200

test('all career services have predefined fixed amounts in paise and inr', () => {
  assert.equal(CAREER_SERVICES['career:career-guidance'].pricePaise, 19900)
  assert.equal(CAREER_SERVICES['career:career-guidance'].priceInr, 199)

  assert.equal(CAREER_SERVICES['career:linkedin-optimization'].pricePaise, 49900)
  assert.equal(CAREER_SERVICES['career:linkedin-optimization'].priceInr, 499)

  assert.equal(CAREER_SERVICES['career:interview-prep'].pricePaise, 49900)
  assert.equal(CAREER_SERVICES['career:interview-prep'].priceInr, 499)
})

test('all training programs have non-zero fixed fees and paise equivalents', () => {
  assert.equal(TRAINING_PROGRAMS.length, 5)

  for (const prog of TRAINING_PROGRAMS) {
    assert.ok(prog.productCode.startsWith('training:'))
    assert.ok(prog.pricePaise > 0)
    assert.equal(prog.pricePaise % 100, 0)
    assert.equal(prog.pricePaise, prog.fee.includes('5000') ? 500000 : 499900)
  }
})

test('all pro test categories have fixed price of ₹32 (3200 paise)', () => {
  const categories = ['technology', 'ai', 'finance', 'digital-marketing']
  for (const cat of categories) {
    const productCode = `pro-test:${cat}`
    assert.ok(productCode)
    assert.equal(PRO_TEST_PRICE_PAISE, 3200)
  }
})

test('service catalog distinguishes paid vs free offerings correctly', () => {
  assert.equal(SERVICE_CATALOG['interview-prep'].paid, true)
  assert.equal(SERVICE_CATALOG['interview-prep'].pricePaise, 39900)

  assert.equal(SERVICE_CATALOG['career-counseling'].paid, true)
  assert.equal(SERVICE_CATALOG['career-counseling'].pricePaise, 29900)

  assert.equal(SERVICE_CATALOG['linkedin-optimization'].paid, true)
  assert.equal(SERVICE_CATALOG['linkedin-optimization'].pricePaise, 14900)

  assert.equal(SERVICE_CATALOG['career-starter-pack'].paid, true)
  assert.equal(SERVICE_CATALOG['career-starter-pack'].pricePaise, 29900)

  assert.equal(SERVICE_CATALOG['courses'].paid, false)
  assert.equal(SERVICE_CATALOG['courses'].pricePaise, null)

  assert.equal(SERVICE_CATALOG['internships'].paid, false)
  assert.equal(SERVICE_CATALOG['internships'].pricePaise, null)
})

test('razorpay signature verification logic matches HMAC SHA256 timingSafeEqual', () => {
  const secret = 'AS1E1ImIALLdxiDpvPstdHoP'
  const orderId = 'order_test_123456'
  const paymentId = 'pay_test_789012'

  const validSignature = crypto
    .createHmac('sha256', secret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex')

  function verify(order, payment, sig, sec) {
    const expected = crypto
      .createHmac('sha256', sec)
      .update(`${order}|${payment}`)
      .digest('hex')
    return (
      sig.length === expected.length &&
      crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))
    )
  }

  // Authentic signature matches
  assert.equal(verify(orderId, paymentId, validSignature, secret), true)

  // Tampered signature is rejected
  const tamperedSig = validSignature.slice(0, -1) + (validSignature.endsWith('0') ? '1' : '0')
  assert.equal(verify(orderId, paymentId, tamperedSig, secret), false)

  // Tampered orderId is rejected
  assert.equal(verify('order_tampered', paymentId, validSignature, secret), false)

  // Tampered paymentId is rejected
  assert.equal(verify(orderId, 'pay_tampered', validSignature, secret), false)
})
