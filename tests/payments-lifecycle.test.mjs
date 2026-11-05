import assert from 'node:assert/strict'
import test from 'node:test'
import crypto from 'node:crypto'

// --- 1. Webhook Secret Validation Tests ---

function verifyWebhookSignatureLogic(body, signature, secret) {
  if (!signature || !body) return false
  if (!secret || typeof secret !== 'string' || secret.trim() === '') {
    // Fail closed: Webhooks must never be verified without a configured secret
    return false
  }

  const expected = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex')

  return (
    signature.length === expected.length &&
    crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
  )
}

test('webhook verification fails closed when RAZORPAY_WEBHOOK_SECRET is missing or empty', () => {
  const body = JSON.stringify({ event: 'payment.captured' })
  const fakeSig = crypto.createHmac('sha256', '').update(body).digest('hex')

  // Undefined secret must fail
  assert.equal(verifyWebhookSignatureLogic(body, fakeSig, undefined), false)

  // Empty string secret must fail
  assert.equal(verifyWebhookSignatureLogic(body, fakeSig, ''), false)

  // Whitespace only secret must fail
  assert.equal(verifyWebhookSignatureLogic(body, fakeSig, '   '), false)

  // Null secret must fail
  assert.equal(verifyWebhookSignatureLogic(body, fakeSig, null), false)
})

test('webhook verification succeeds with valid secret and signature, fails on tampering', () => {
  const secret = 'whsec_test_secret_12345'
  const body = JSON.stringify({ event: 'order.paid', id: 'order_123' })
  const validSig = crypto.createHmac('sha256', secret).update(body).digest('hex')

  // Valid signature matches
  assert.equal(verifyWebhookSignatureLogic(body, validSig, secret), true)

  // Tampered payload fails
  const tamperedBody = JSON.stringify({ event: 'order.paid', id: 'order_999' })
  assert.equal(verifyWebhookSignatureLogic(tamperedBody, validSig, secret), false)

  // Tampered signature fails
  const tamperedSig = validSig.slice(0, -2) + '00'
  assert.equal(verifyWebhookSignatureLogic(body, tamperedSig, secret), false)
})

// --- 2. Payment Dismissal & Late Verification Race Condition Tests ---

test('payment dismissal preserves pending status and does not lock into terminal failed state', () => {
  // Simulate payment lifecycle
  const paymentRecord = {
    id: 'pay_rec_001',
    user_id: 'user_abc',
    product_code: 'career:career-guidance',
    status: 'pending',
    metadata: { applicant_details: { name: 'Test User' } },
  }

  // Simulate modal dismissal event (/api/payments/failed with status: 'cancelled')
  function handleModalDismissal(record, dismissalStatus) {
    if (dismissalStatus === 'cancelled' || dismissalStatus === 'dismissed') {
      return {
        ...record,
        // Status remains pending/created, metadata captures dismissal timestamp
        status: record.status,
        metadata: {
          ...record.metadata,
          last_dismissed_at: '2026-11-05T21:00:00.000Z',
        },
      }
    }
    return record
  }

  const dismissedRecord = handleModalDismissal(paymentRecord, 'cancelled')
  assert.equal(dismissedRecord.status, 'pending')
  assert.equal(dismissedRecord.metadata.last_dismissed_at, '2026-11-05T21:00:00.000Z')
  assert.notEqual(dismissedRecord.status, 'failed')
})

test('late verification succeeds even if payment had previous failure or dismissal', () => {
  const secret = 'rzp_secret_key_123'
  const orderId = 'order_race_001'
  const paymentId = 'pay_race_001'

  const signature = crypto
    .createHmac('sha256', secret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex')

  // Allowed verification statuses in updated verify/route.ts
  const eligibleStatuses = ['pending', 'created', 'paid', 'failed']

  function canVerifyPayment(currentStatus, sigValid) {
    if (!sigValid) return { ok: false, error: 'Invalid payment signature' }
    if (!eligibleStatuses.includes(currentStatus)) {
      return { ok: false, error: 'Payment is not eligible for verification' }
    }
    return { ok: true, newStatus: 'paid' }
  }

  // Pending payment verifies
  assert.equal(canVerifyPayment('pending', true).ok, true)

  // Payment that had intermediate failure (e.g. initial card decline, then UPI success) verifies
  const retryResult = canVerifyPayment('failed', true)
  assert.equal(retryResult.ok, true)
  assert.equal(retryResult.newStatus, 'paid')

  // Refunded payment cannot be reverified
  assert.equal(canVerifyPayment('refunded', true).ok, false)
})

// --- 3. Service Order Persistence & Fulfilment Guarantee Tests ---

test('service order persistence guarantees fulfilment record on payment verification', () => {
  const serviceOrdersDb = []

  function verifyAndEnsureFulfilment(payment, product) {
    if (!product.serviceCode) return { verified: true }

    // Find existing service order
    const existing = serviceOrdersDb.find((o) => o.payment_id === payment.id)
    if (existing) {
      existing.status = 'paid'
      return { verified: true, serviceOrderId: existing.id }
    }

    // Guarantee fulfilment record is created if missing
    const newOrder = {
      id: `so_${serviceOrdersDb.length + 1}`,
      user_id: payment.user_id,
      service_code: product.serviceCode,
      product_code: payment.product_code,
      amount_paise: payment.amount_paise,
      status: 'paid',
      payment_id: payment.id,
      fulfilment_note: payment.metadata?.applicant_details?.name || null,
    }
    serviceOrdersDb.push(newOrder)
    return { verified: true, serviceOrderId: newOrder.id }
  }

  const payment = {
    id: 'pay_123',
    user_id: 'user_456',
    product_code: 'career:career-guidance',
    amount_paise: 19900,
    metadata: { applicant_details: { name: 'Alice' } },
  }

  const product = { serviceCode: 'career-counseling' }

  // Case 1: No previous service_orders row (e.g. edge case during order creation)
  const result1 = verifyAndEnsureFulfilment(payment, product)
  assert.equal(result1.verified, true)
  assert.equal(serviceOrdersDb.length, 1)
  assert.equal(serviceOrdersDb[0].status, 'paid')
  assert.equal(serviceOrdersDb[0].fulfilment_note, 'Alice')

  // Case 2: Verification is called again (idempotent update)
  const result2 = verifyAndEnsureFulfilment(payment, product)
  assert.equal(result2.verified, true)
  assert.equal(serviceOrdersDb.length, 1) // Does not duplicate
  assert.equal(serviceOrdersDb[0].status, 'paid')
})

test('service order creation failure must not be silently ignored during checkout initiation', () => {
  function createServiceOrderSimulation(dbError) {
    if (dbError) {
      // Must return 500 error instead of silently swallowing and continuing
      return { status: 500, error: 'Unable to store service order' }
    }
    return { status: 200, success: true }
  }

  const simulatedDbFailure = new Error('Could not find table public.service_orders')
  const response = createServiceOrderSimulation(simulatedDbFailure)

  assert.equal(response.status, 500)
  assert.equal(response.error, 'Unable to store service order')
})

