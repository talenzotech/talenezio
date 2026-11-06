import crypto from 'node:crypto';

export type PaymentRecord = {
  id: string;
  status: string;
  user_id?: string;
  product_code?: string;
  amount_paise?: number;
  currency?: string;
  metadata?: Record<string, unknown> | null;
  provider_order_id?: string;
};

export const ELIGIBLE_VERIFICATION_STATUSES = ['pending', 'created', 'paid', 'failed'] as const;

/**
 * Webhook signature verification logic with strict fail-closed security.
 */
export function verifyWebhookSignatureLogic(
  body: string,
  signature: string,
  secret?: string | null
): boolean {
  if (!signature || !body) return false;
  if (!secret || typeof secret !== 'string' || secret.trim() === '') {
    return false;
  }

  const expected = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex');

  return (
    signature.length === expected.length &&
    crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
  );
}

/**
 * Determines whether a payment is eligible for client verification.
 * A cryptographic signature verification proves genuine charge, preventing
 * entitlement loss from late verification even if an intermediate failure occurred.
 */
export function canVerifyPayment(
  status: string,
  signatureValid: boolean
): { ok: boolean; error?: string; newStatus?: string } {
  if (!signatureValid) {
    return { ok: false, error: 'Invalid payment signature' };
  }
  if (!ELIGIBLE_VERIFICATION_STATUSES.includes(status as any)) {
    return { ok: false, error: 'Payment is not eligible for verification' };
  }
  return { ok: true, newStatus: 'paid' };
}

/**
 * Handles modal dismissal/cancellation on client.
 * Must preserve pending/created status and NEVER lock into terminal failed state,
 * because UPI/bank app approvals may still arrive asynchronously.
 */
export function handleModalDismissal(
  payment: PaymentRecord,
  actionStatus: 'cancelled' | 'dismissed' | string
): {
  shouldUpdate: boolean;
  newStatus: string;
  newMetadata: Record<string, unknown>;
} {
  const currentMeta =
    payment.metadata && typeof payment.metadata === 'object'
      ? { ...payment.metadata }
      : {};

  const shouldUpdate = ['created', 'pending'].includes(payment.status);

  return {
    shouldUpdate,
    newStatus: payment.status, // Preserve status, do not transition to failed
    newMetadata: {
      ...currentMeta,
      last_dismissed_at: new Date().toISOString(),
    },
  };
}

export interface SupabaseAdminClientLike {
  from(table: string): any;
}

export interface FulfillServiceOrderParams {
  admin: SupabaseAdminClientLike;
  payment: {
    id: string;
    user_id: string;
    product_code: string;
    amount_paise?: number;
    currency?: string;
    metadata?: Record<string, unknown> | null;
  };
  serviceDetails: {
    serviceCode: string;
    amountPaise: number;
    currency: string;
    scheduledFor?: string | null;
  };
}

export type FulfillResult = {
  success: boolean;
  orderId?: string;
  action: 'created' | 'updated' | 'preserved';
};

/**
 * Fully idempotent service order fulfillment.
 * 1. Checks existing service order by unique payment_id.
 * 2. If already completed, refunded, or in-progress, preserves existing status (no-op).
 * 3. If pending or requested, marks as paid.
 * 4. If absent, inserts fulfillment row. Handles duplicate key (23505) race condition gracefully.
 * 5. Fails closed on database errors (throws) so webhook and verify handlers do not silently lose fulfillment.
 */
export async function fulfillServiceOrder(
  params: FulfillServiceOrderParams
): Promise<FulfillResult> {
  const { admin, payment, serviceDetails } = params;

  // 1. Check existing service order
  const { data: existing, error: fetchError } = await admin
    .from('service_orders')
    .select('id, status')
    .eq('payment_id', payment.id)
    .maybeSingle();

  if (fetchError) {
    throw new Error(`Failed to check existing service order: ${fetchError.message}`);
  }

  if (existing) {
    // Preserve terminal or progressive statuses (never revert completed/refunded to paid)
    if (['completed', 'refunded', 'cancelled', 'paid', 'scheduled', 'in_progress'].includes(existing.status)) {
      return { success: true, orderId: existing.id, action: 'preserved' };
    }

    // Update pending order to paid
    const { data: updated, error: updateError } = await admin
      .from('service_orders')
      .update({ status: 'paid' })
      .eq('id', existing.id)
      .in('status', ['pending_payment', 'requested'])
      .select('id')
      .maybeSingle();

    if (updateError) {
      throw new Error(`Failed to update service order to paid: ${updateError.message}`);
    }

    return { success: true, orderId: updated?.id || existing.id, action: 'updated' };
  }

  // 2. Build fulfilment note
  const metadata = payment.metadata && typeof payment.metadata === 'object'
    ? (payment.metadata as Record<string, any>)
    : null;
  const applicant = (metadata?.applicant_details || metadata) as Record<string, any> | undefined;

  const noteParts = [
    applicant?.fullName || applicant?.name ? `Candidate: ${applicant.fullName || applicant.name}` : null,
    applicant?.phone ? `Phone: ${applicant.phone}` : null,
    applicant?.linkedinUrl ? `LinkedIn: ${applicant.linkedinUrl}` : null,
    applicant?.areaOfInterest ? `Area: ${applicant.areaOfInterest}` : null,
    applicant?.careerDetails ? `Career: ${applicant.careerDetails}` : null,
  ].filter(Boolean);

  const fulfilmentNote = noteParts.length > 0 ? noteParts.join(' | ') : null;

  // 3. Insert new fulfilment row
  const { data: inserted, error: insertError } = await admin
    .from('service_orders')
    .insert({
      user_id: payment.user_id,
      service_code: serviceDetails.serviceCode,
      product_code: payment.product_code,
      amount_paise: serviceDetails.amountPaise,
      currency: serviceDetails.currency,
      status: 'paid',
      payment_id: payment.id,
      scheduled_for: serviceDetails.scheduledFor || null,
      fulfilment_note: fulfilmentNote,
    })
    .select('id')
    .maybeSingle();

  if (insertError) {
    // Unique violation (concurrent verify/webhook request already inserted)
    if (insertError.code === '23505' || String(insertError.message).includes('duplicate key')) {
      await admin
        .from('service_orders')
        .update({ status: 'paid' })
        .eq('payment_id', payment.id)
        .in('status', ['pending_payment', 'requested']);
      return { success: true, action: 'updated' };
    }

    throw new Error(`Failed to create service order fulfilment: ${insertError.message}`);
  }

  return { success: true, orderId: inserted?.id, action: 'created' };
}
