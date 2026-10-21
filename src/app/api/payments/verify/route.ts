import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { grantEntitlement } from '@/lib/payments/access';
import { verifyPaymentSignature } from '@/lib/payments/razorpay';
import { isTestCategory, proTestProductCode } from '@/lib/payments/products';

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
    .select('id, user_id, product_code, amount_paise, currency, status')
    .eq('provider_order_id', body.razorpay_order_id)
    .maybeSingle();

  if (!payment || payment.user_id !== user.id) {
    return NextResponse.json({ error: 'Payment does not belong to this user' }, { status: 403 });
  }

  if (!['pending', 'created', 'paid'].includes(payment.status)) {
    return NextResponse.json({ error: 'Payment is not eligible for verification' }, { status: 409 });
  }

  if (payment.amount_paise !== 3200 || payment.currency !== 'INR') {
    return NextResponse.json({ error: 'Payment amount mismatch' }, { status: 400 });
  }

  const category = payment.product_code.replace('pro-test:', '');
  if (!isTestCategory(category)) {
    return NextResponse.json({ error: 'Invalid payment product' }, { status: 400 });
  }

  const { error } = await admin
    .from('payments')
    .update({
      status: 'paid',
      provider_payment_id: body.razorpay_payment_id,
      paid_at: new Date().toISOString(),
    })
    .eq('id', payment.id)
    .in('status', ['pending', 'created', 'paid']);

  if (error) return NextResponse.json({ error: 'Could not record payment' }, { status: 500 });

  await grantEntitlement({
    userId: user.id,
    productCode: proTestProductCode(category),
    source: 'payment',
    sourceId: payment.id,
  });

  return NextResponse.json({ verified: true });
}
