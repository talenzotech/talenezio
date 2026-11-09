import assert from 'node:assert/strict'
import test from 'node:test'
import crypto from 'node:crypto'
import {
  verifyWebhookSignatureLogic,
  canVerifyPayment,
  handleModalDismissal,
  fulfillServiceOrder,
  ELIGIBLE_VERIFICATION_STATUSES,
} from '../src/lib/payments/lifecycle.ts'

// --- 1. Production Webhook Secret & Signature Verification Tests ---

test('verifyWebhookSignatureLogic fails closed when secret is missing, empty, or whitespace', () => {
  const body = JSON.stringify({ event: 'payment.captured' })
  const fakeSig = crypto.createHmac('sha256', 'temp').update(body).digest('hex')

  // Undefined secret must fail
  assert.equal(verifyWebhookSignatureLogic(body, fakeSig, undefined), false)

  // Empty string secret must fail
  assert.equal(verifyWebhookSignatureLogic(body, fakeSig, ''), false)

  // Whitespace only secret must fail
  assert.equal(verifyWebhookSignatureLogic(body, fakeSig, '   '), false)

  // Null secret must fail
  assert.equal(verifyWebhookSignatureLogic(body, fakeSig, null), false)

  // Missing body or signature must fail
  assert.equal(verifyWebhookSignatureLogic('', fakeSig, 'valid_secret'), false)
  assert.equal(verifyWebhookSignatureLogic(body, '', 'valid_secret'), false)
})

test('verifyWebhookSignatureLogic succeeds with valid HMAC signature and fails on tampering', () => {
  const secret = 'whsec_prod_live_test_secret_12345'
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

// --- 2. Production Modal Dismissal & Late Verification Race Condition Tests ---

test('handleModalDismissal preserves pending/created status and records dismissal metadata', () => {
  const pendingPayment = {
    id: 'pay_rec_001',
    user_id: 'user_abc',
    product_code: 'career:career-guidance',
    status: 'pending',
    metadata: { applicant_details: { name: 'Test Candidate' } },
  }

  const result = handleModalDismissal(pendingPayment, 'dismissed')
  assert.equal(result.shouldUpdate, true)
  assert.equal(result.newStatus, 'pending') // MUST stay pending, never transition to terminal failed
  assert.ok(result.newMetadata.last_dismissed_at)
  assert.deepEqual(result.newMetadata.applicant_details, { name: 'Test Candidate' })

  // Non-pending payment (e.g. already paid) should not update
  const paidPayment = { ...pendingPayment, status: 'paid' }
  const paidResult = handleModalDismissal(paidPayment, 'cancelled')
  assert.equal(paidResult.shouldUpdate, false)
})

test('canVerifyPayment enforces eligible verification statuses and valid signatures', () => {
  // Confirm eligible statuses match production specification
  assert.deepEqual(ELIGIBLE_VERIFICATION_STATUSES, ['pending', 'created', 'paid', 'failed'])

  // Invalid signature fails
  const sigFail = canVerifyPayment('pending', false)
  assert.equal(sigFail.ok, false)
  assert.equal(sigFail.error, 'Invalid payment signature')

  // Pending payment verifies
  const pendingResult = canVerifyPayment('pending', true)
  assert.equal(pendingResult.ok, true)
  assert.equal(pendingResult.newStatus, 'paid')

  // Late verification after transient gateway failure succeeds
  const failedResult = canVerifyPayment('failed', true)
  assert.equal(failedResult.ok, true)
  assert.equal(failedResult.newStatus, 'paid')

  // Already paid payment verifies idempotently
  const paidResult = canVerifyPayment('paid', true)
  assert.equal(paidResult.ok, true)

  // Terminal refunded payment cannot be verified
  const refundedResult = canVerifyPayment('refunded', true)
  assert.equal(refundedResult.ok, false)
  assert.equal(refundedResult.error, 'Payment is not eligible for verification')
})

// --- 3. Production Service Order Fulfillment Tests (Idempotency & Failure Handling) ---

function createMockAdmin(initialOrders = [], failureTrigger = null) {
  const db = [...initialOrders]

  return {
    db,
    from(table) {
      if (table !== 'service_orders') throw new Error(`Unexpected table ${table}`)
      return {
        select() {
          return {
            eq(field, val) {
              return {
                maybeSingle: async () => {
                  if (failureTrigger === 'select') throw new Error('Database connection failed')
                  const match = db.find((r) => r[field] === val)
                  return { data: match || null, error: null }
                },
              }
            },
          }
        },
        update(updates) {
          return {
            eq(idField, idVal) {
              return {
                in(statusField, allowedStatuses) {
                  return {
                    select: () => ({
                      maybeSingle: async () => {
                        if (failureTrigger === 'update') throw new Error('Update failed')
                        const match = db.find((r) => r[idField] === idVal && allowedStatuses.includes(r[statusField]))
                        if (match) Object.assign(match, updates)
                        return { data: match || null, error: null }
                      },
                    }),
                  }
                },
              }
            },
          }
        },
        insert(row) {
          return {
            select: () => ({
              maybeSingle: async () => {
                if (failureTrigger === 'insert') {
                  return { data: null, error: new Error('Could not insert service order') }
                }
                if (failureTrigger === 'unique_conflict') {
                  const err = new Error('duplicate key value violates unique constraint')
                  err.code = '23505'
                  return { data: null, error: err }
                }
                const newRow = { id: `so_${db.length + 1}`, ...row }
                db.push(newRow)
                return { data: newRow, error: null }
              },
            }),
          }
        },
      }
    },
  }
}

test('fulfillServiceOrder creates a new fulfilment record when none exists', async () => {
  const admin = createMockAdmin([])

  const payment = {
    id: 'pay_live_001',
    user_id: 'user_live_001',
    product_code: 'career:career-guidance',
    metadata: { applicant_details: { name: 'Bob Smith', phone: '9876543210' } },
  }

  const result = await fulfillServiceOrder({
    admin,
    payment,
    serviceDetails: {
      serviceCode: 'career-counseling',
      amountPaise: 19900,
      currency: 'INR',
    },
  })

  assert.equal(result.success, true)
  assert.equal(result.action, 'created')
  assert.equal(admin.db.length, 1)
  assert.equal(admin.db[0].status, 'paid')
  assert.equal(admin.db[0].payment_id, 'pay_live_001')
  assert.ok(admin.db[0].fulfilment_note.includes('Bob Smith'))
})

test('fulfillServiceOrder idempotently updates existing pending order and preserves completed/refunded orders', async () => {
  // Case A: Existing pending order transitions to paid
  const adminWithPending = createMockAdmin([
    {
      id: 'so_pending_1',
      payment_id: 'pay_existing_001',
      status: 'pending_payment',
      service_code: 'career-counseling',
    },
  ])

  const pendingResult = await fulfillServiceOrder({
    admin: adminWithPending,
    payment: { id: 'pay_existing_001', user_id: 'u1', product_code: 'career:career-guidance' },
    serviceDetails: { serviceCode: 'career-counseling', amountPaise: 19900, currency: 'INR' },
  })

  assert.equal(pendingResult.success, true)
  assert.equal(pendingResult.action, 'updated')
  assert.equal(adminWithPending.db[0].status, 'paid')

  // Case B: Existing completed or refunded order is preserved and NOT overwritten
  const adminWithCompleted = createMockAdmin([
    {
      id: 'so_completed_1',
      payment_id: 'pay_completed_001',
      status: 'completed',
      service_code: 'career-counseling',
    },
  ])

  const completedResult = await fulfillServiceOrder({
    admin: adminWithCompleted,
    payment: { id: 'pay_completed_001', user_id: 'u1', product_code: 'career:career-guidance' },
    serviceDetails: { serviceCode: 'career-counseling', amountPaise: 19900, currency: 'INR' },
  })

  assert.equal(completedResult.success, true)
  assert.equal(completedResult.action, 'preserved')
  assert.equal(adminWithCompleted.db[0].status, 'completed') // Did not revert to paid
})

test('fulfillServiceOrder handles concurrent race conditions (23505 unique conflict) gracefully without duplicates', async () => {
  const adminWithConflict = createMockAdmin([], 'unique_conflict')

  const result = await fulfillServiceOrder({
    admin: adminWithConflict,
    payment: { id: 'pay_race_001', user_id: 'u1', product_code: 'career:career-guidance' },
    serviceDetails: { serviceCode: 'career-counseling', amountPaise: 19900, currency: 'INR' },
  })

  // Recovered cleanly from duplicate key conflict
  assert.equal(result.success, true)
  assert.equal(result.action, 'updated')
})

test('fulfillServiceOrder throws on real database failure so webhooks fail closed and retry', async () => {
  const adminWithDbError = createMockAdmin([], 'insert')

  await assert.rejects(
    async () => {
      await fulfillServiceOrder({
        admin: adminWithDbError,
        payment: { id: 'pay_err_001', user_id: 'u1', product_code: 'career:career-guidance' },
        serviceDetails: { serviceCode: 'career-counseling', amountPaise: 19900, currency: 'INR' },
      })
    },
    {
      message: 'Failed to create service order fulfilment: Could not insert service order',
    }
  )
})
