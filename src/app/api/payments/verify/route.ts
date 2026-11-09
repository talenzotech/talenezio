import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { grantEntitlement } from '@/lib/payments/access';
import { verifyPaymentSignature } from '@/lib/payments/razorpay';
import { paidProductDetails } from '@/lib/payments/products';
import { canVerifyPayment, fulfillServiceOrder } from '@/lib/payments/lifecycle';

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

  const body = await request.json().catch(() => null) as {
    razorpay_order_id?: string;
    razorpay_payment_id?: string;
    razorpay_signature?: string;
  } | null;

  if (!body?.razorpay_order_id || !body.razorpay_payment_id || !body.razorpay_signature) {
    return NextResponse.json({ error: 'Incomplete payment response' }, { status: 400 });
  }

  if (!verifyPaymentSignature({
    orderId: body.razorpay_order_id,
    paymentId: body.razorpay_payment_id,
    signature: body.razorpay_signature,
  })) {
    return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: payment } = await admin
    .from('payments')
    .select('id, user_id, product_code, amount_paise, currency, status, metadata')
    .eq('provider_order_id', body.razorpay_order_id)
    .maybeSingle();

  if (!payment || payment.user_id !== user.id) {
    return NextResponse.json({ error: 'Payment does not belong to this user' }, { status: 403 });
  }

  // Allow verification for pending, created, already-paid (idempotent), or previously failed states.
  // A verified cryptographic signature proves genuine charge, preventing entitlement loss from late verification.
  const verificationEligibility = canVerifyPayment(payment.status, true);
  if (!verificationEligibility.ok) {
    return NextResponse.json({ error: verificationEligibility.error }, { status: 409 });
  }

  const product = paidProductDetails(payment.product_code);
  if (!product || payment.amount_paise !== product.amountPaise || payment.currency !== product.currency) {
    return NextResponse.json({ error: 'Payment amount mismatch' }, { status: 400 });
  }

  const { error } = await admin
    .from('payments')
    .update({
      status: 'paid',
      provider_payment_id: body.razorpay_payment_id,
      paid_at: new Date().toISOString(),
      failure_code: null,
      failure_reason: null,
    })
    .eq('id', payment.id)
    .in('status', ['pending', 'created', 'paid', 'failed']);

  if (error) {
    console.error('Could not record payment verification:', error);
    return NextResponse.json({ error: 'Could not record payment' }, { status: 500 });
  }

  await grantEntitlement({
    userId: user.id,
    productCode: payment.product_code,
    source: 'payment',
    sourceId: payment.id,
  });

  if (product.serviceCode) {
    try {
      await fulfillServiceOrder({
        admin,
        payment,
        serviceDetails: {
          serviceCode: product.serviceCode,
          amountPaise: product.amountPaise,
          currency: product.currency,
        },
      });
    } catch (fulfillError: unknown) {
      console.error('Service order fulfilment failed during verification:', fulfillError);
      return NextResponse.json({ error: 'Failed to record service order fulfilment' }, { status: 500 });
    }

    if (product.serviceCode === 'career-starter-pack') {
      await grantEntitlement({
        userId: user.id,
        productCode: 'pro-test:attempts',
        source: 'payment',
        sourceId: payment.id,
        remainingUses: 10,
      });
    }
  }

  return NextResponse.json({ verified: true });
}
