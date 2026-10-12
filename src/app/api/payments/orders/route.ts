import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import {
  PRO_TEST_CURRENCY,
  PRO_TEST_PRICE_PAISE,
  isTestCategory,
  proTestProductCode,
} from '@/lib/payments/products';
import { createRazorpayOrder } from '@/lib/payments/razorpay';
import { env } from '@/lib/env';

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

  const body = await request.json().catch(() => null) as { category?: string } | null;
  if (!body?.category || !isTestCategory(body.category)) {
    return NextResponse.json({ error: 'Invalid test category' }, { status: 400 });
  }

  const productCode = proTestProductCode(body.category);
  const admin = createAdminClient();
  const { data: existing } = await admin
    .from('payments')
    .select('provider_order_id')
    .eq('user_id', user.id)
    .eq('product_code', productCode)
    .in('status', ['created', 'pending'])
    .not('provider_order_id', 'is', null)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existing?.provider_order_id) {
    return NextResponse.json({
      keyId: env.razorpayKeyId(),
      orderId: existing.provider_order_id,
      amount: PRO_TEST_PRICE_PAISE,
      currency: PRO_TEST_CURRENCY,
      productCode,
    });
  }

  const receipt = `talenzo_${user.id.slice(0, 8)}_${Date.now()}`;
  let order;
  try {
    order = await createRazorpayOrder({
      amount: PRO_TEST_PRICE_PAISE,
      currency: PRO_TEST_CURRENCY,
      receipt,
      notes: { user_id: user.id, product_code: productCode },
    });
  } catch (error) {
    console.error('Unable to create Razorpay order:', error);
    return NextResponse.json({ error: 'Unable to start payment' }, { status: 502 });
  }

  const { error } = await admin.from('payments').insert({
    user_id: user.id,
    product_code: productCode,
    amount_paise: PRO_TEST_PRICE_PAISE,
    currency: PRO_TEST_CURRENCY,
    provider: 'razorpay',
    provider_order_id: order.id,
    status: 'pending',
    metadata: { category: body.category, receipt },
  });

  if (error) {
    console.error('Unable to store payment order:', error);
    return NextResponse.json({ error: 'Unable to store payment order' }, { status: 500 });
  }

  return NextResponse.json({
    keyId: env.razorpayKeyId(),
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    productCode,
  });
}
