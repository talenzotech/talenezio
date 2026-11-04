import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json().catch(() => null) as {
      orderId?: string;
      status?: 'failed' | 'cancelled';
      code?: string;
      description?: string;
      reason?: string;
    } | null;

    if (!body?.orderId) {
      return NextResponse.json({ error: 'Missing orderId' }, { status: 400 });
    }

    const admin = createAdminClient();
    const failureCode = body.code || (body.status === 'cancelled' ? 'PAYMENT_CANCELLED' : 'PAYMENT_FAILED');
    const failureReason =
      body.description ||
      body.reason ||
      (body.status === 'cancelled' ? 'Payment was cancelled by the user' : 'Payment failed during checkout');

    await admin
      .from('payments')
      .update({
        status: 'failed',
        failure_code: failureCode,
        failure_reason: failureReason,
      })
      .eq('provider_order_id', body.orderId)
      .eq('user_id', user.id)
      .in('status', ['created', 'pending']);

    return NextResponse.json({ recorded: true });
  } catch (error) {
    console.error('Error recording payment failure/cancellation:', error);
    return NextResponse.json({ error: 'Could not record status' }, { status: 500 });
  }
}

