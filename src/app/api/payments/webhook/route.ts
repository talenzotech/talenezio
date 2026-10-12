import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { grantEntitlement } from '@/lib/payments/access';
import { verifyWebhookSignature } from '@/lib/payments/razorpay';

type RazorpayWebhook = {
  event?: string;
  payload?: {
    payment?: { entity?: { id?: string; order_id?: string; error_code?: string; error_description?: string } };
    order?: { entity?: { id?: string; payment_id?: string } };
    refund?: { entity?: { id?: string; payment_id?: string } };
  };
};

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get('x-razorpay-signature');
  const eventId = request.headers.get('x-razorpay-event-id');

  if (!signature || !eventId || !verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 });
  }

  let body: RazorpayWebhook;
  try {
    body = JSON.parse(rawBody) as RazorpayWebhook;
  } catch {
    return NextResponse.json({ error: 'Invalid webhook body' }, { status: 400 });
  }
  const admin = createAdminClient();
  const { error: eventError } = await admin
    .from('payment_webhook_events')
    .insert({ provider_event_id: eventId, event_type: body.event ?? 'unknown' });

  const isDuplicateEvent = eventError?.code === '23505';
  if (isDuplicateEvent) {
    const { data: existingEvent } = await admin
      .from('payment_webhook_events')
      .select('processed_at')
      .eq('provider_event_id', eventId)
      .maybeSingle();
    if (existingEvent?.processed_at) return NextResponse.json({ received: true });
  }
  if (eventError && !isDuplicateEvent) return NextResponse.json({ error: 'Could not record webhook' }, { status: 500 });

  const paymentEntity = body.payload?.payment?.entity;
  const refundEntity = body.payload?.refund?.entity;
  const providerOrderId = paymentEntity?.order_id ?? body.payload?.order?.entity?.id;
  const providerPaymentId = paymentEntity?.id ?? body.payload?.order?.entity?.payment_id;

  if (body.event === 'payment.captured' || body.event === 'order.paid') {
    if (!providerOrderId || !providerPaymentId) {
      await admin.from('payment_webhook_events').update({ processed_at: new Date().toISOString() }).eq('provider_event_id', eventId);
      return NextResponse.json({ received: true });
    }

    const { data: payment } = await admin
      .from('payments')
      .select('id, user_id, product_code')
      .eq('provider_order_id', providerOrderId)
      .maybeSingle();

    if (payment) {
      await admin.from('payments').update({
        status: 'paid',
        provider_payment_id: providerPaymentId,
        paid_at: new Date().toISOString(),
      }).eq('id', payment.id).in('status', ['pending', 'created', 'paid']);

      await grantEntitlement({
        userId: payment.user_id,
        productCode: payment.product_code,
        source: 'payment',
        sourceId: payment.id,
      });
    }
  } else if (body.event === 'payment.failed' && providerOrderId) {
    await admin.from('payments').update({
      status: 'failed',
      failure_code: paymentEntity?.error_code ?? null,
      failure_reason: paymentEntity?.error_description ?? null,
    }).eq('provider_order_id', providerOrderId).in('status', ['pending', 'created']);
  } else if (body.event === 'refund.processed' && refundEntity?.payment_id) {
    const { data: refundedPayment } = await admin.from('payments').update({
      status: 'refunded',
      refund_id: refundEntity.id ?? null,
      refunded_at: new Date().toISOString(),
    }).eq('provider_payment_id', refundEntity.payment_id).eq('status', 'paid').select('id').maybeSingle();

    if (refundedPayment) {
      await admin.from('entitlements')
        .update({ status: 'revoked' })
        .eq('source', 'payment')
        .eq('source_id', refundedPayment.id);
    }
  }

  await admin
    .from('payment_webhook_events')
    .update({ processed_at: new Date().toISOString() })
    .eq('provider_event_id', eventId);

  return NextResponse.json({ received: true });
}
