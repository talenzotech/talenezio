import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { grantEntitlement } from '@/lib/payments/access';
import { verifyPaymentSignature } from '@/lib/payments/razorpay';
import { paidProductDetails } from '@/lib/payments/products';

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
  if (!['pending', 'created', 'paid', 'failed'].includes(payment.status)) {
    return NextResponse.json({ error: 'Payment is not eligible for verification' }, { status: 409 });
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
    const { data: updatedOrders, error: updateError } = await admin
      .from('service_orders')
      .update({ status: 'paid' })
      .eq('payment_id', payment.id)
      .in('status', ['pending_payment', 'requested', 'paid'])
      .select('id');

    if (updateError) {
      console.error('Unable to mark service order as paid:', updateError);
      return NextResponse.json({ error: 'Failed to update service order status' }, { status: 500 });
    }

    // Guarantee that every paid service purchase has a service_orders record
    if (!updatedOrders || updatedOrders.length === 0) {
      const metadata = payment.metadata && typeof payment.metadata === 'object'
        ? (payment.metadata as Record<string, any>)
        : null;
      const applicantDetails = metadata?.applicant_details;
      const fulfilmentNote = applicantDetails
        ? `Name: ${applicantDetails.fullName || applicantDetails.name || ''} | Details: ${applicantDetails.careerDetails || ''} | Interest: ${applicantDetails.areaOfInterest || ''}`
        : null;

      const { error: insertError } = await admin.from('service_orders').insert({
        user_id: user.id,
        service_code: product.serviceCode,
        product_code: payment.product_code,
        amount_paise: payment.amount_paise,
        currency: payment.currency,
        status: 'paid',
        payment_id: payment.id,
        fulfilment_note: fulfilmentNote,
      });

      if (insertError) {
        console.error('Unable to create service order fulfilment record on verification:', insertError);
        return NextResponse.json({ error: 'Failed to create service order fulfilment record' }, { status: 500 });
      }
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
