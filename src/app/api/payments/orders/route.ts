import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import {
  isTestCategory,
  paidProductDetails,
  proTestProductCode,
} from '@/lib/payments/products';
import { createRazorpayOrder } from '@/lib/payments/razorpay';
import { env } from '@/lib/env';
import { hasServiceAccess } from '@/lib/payments/access';
import { getService } from '@/lib/services/catalog';

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

  const body = await request.json().catch(() => null) as { category?: string; productCode?: string } | null;
  const productCode = body?.category && isTestCategory(body.category)
    ? proTestProductCode(body.category)
    : body?.productCode;
  const product = productCode ? paidProductDetails(productCode) : null;
  if (!productCode || !product) {
    return NextResponse.json({ error: 'Invalid service or test product' }, { status: 400 });
  }
  const admin = createAdminClient();

  const service = product.serviceCode ? getService(product.serviceCode) : null;
  if (product.serviceCode && service?.freeUnlock && await hasServiceAccess(user.id, product.serviceCode)) {
    const { error } = await admin.from('service_orders').insert({
      user_id: user.id,
      service_code: product.serviceCode,
      product_code: productCode,
      amount_paise: product.amountPaise,
      currency: product.currency,
      status: 'requested',
    });

    if (error) {
      console.error('Unable to create free service order:', error);
      return NextResponse.json({ error: 'Unable to request service' }, { status: 500 });
    }

    return NextResponse.json({ freeAccess: true });
  }
  const { data: existing } = await admin
    .from('payments')
    .select('provider_order_id, amount_paise, currency')
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
      amount: existing.amount_paise,
      currency: existing.currency,
      productCode,
    });
  }

  const receipt = `talenzo_${user.id.slice(0, 8)}_${Date.now()}`;
  let order;
  try {
    order = await createRazorpayOrder({
      amount: product.amountPaise,
      currency: product.currency,
      receipt,
      notes: { user_id: user.id, product_code: productCode },
    });
  } catch (error) {
    console.error('Unable to create Razorpay order:', error);
    return NextResponse.json({ error: 'Unable to start payment' }, { status: 502 });
  }

  const { data: payment, error } = await admin.from('payments').insert({
    user_id: user.id,
    product_code: productCode,
    amount_paise: product.amountPaise,
    currency: product.currency,
    provider: 'razorpay',
    provider_order_id: order.id,
    status: 'pending',
    metadata: { category: product.category ?? null, service_code: product.serviceCode ?? null, receipt },
  }).select('id').single();

  if (error) {
    console.error('Unable to store payment order:', error);
    return NextResponse.json({ error: 'Unable to store payment order' }, { status: 500 });
  }

  if (product.serviceCode) {
    const { error: serviceOrderError } = await admin.from('service_orders').insert({
      user_id: user.id,
      service_code: product.serviceCode,
      product_code: productCode,
      amount_paise: product.amountPaise,
      currency: product.currency,
      status: 'pending_payment',
      payment_id: payment?.id,
    });

    if (serviceOrderError) {
      console.error('Unable to store service order:', serviceOrderError);
      return NextResponse.json({ error: 'Unable to store service order' }, { status: 500 });
    }
  }

  return NextResponse.json({
    keyId: env.razorpayKeyId(),
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    productCode,
  });
}
