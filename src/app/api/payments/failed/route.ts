import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { handleModalDismissal } from '@/lib/payments/lifecycle';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json().catch(() => null) as {
      orderId?: string;
      status?: 'failed' | 'cancelled' | 'dismissed';
      code?: string;
      description?: string;
      reason?: string;
    } | null;

    if (!body?.orderId) {
      return NextResponse.json({ error: 'Missing orderId' }, { status: 400 });
    }

    const admin = createAdminClient();

    // Modal dismissal indicates the modal was closed on the client.
    // The payment may still complete asynchronously (e.g. UPI app confirmation, delayed bank webhook).
    // Therefore, do NOT transition status to 'failed', as that would lock out late verification.
    if (body.status === 'cancelled' || body.status === 'dismissed') {
      const { data: payment } = await admin
        .from('payments')
        .select('id, status, metadata')
        .eq('provider_order_id', body.orderId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (payment) {
        const { shouldUpdate, newMetadata } = handleModalDismissal(payment, body.status);

        if (shouldUpdate) {
          await admin
            .from('payments')
            .update({ metadata: newMetadata })
            .eq('id', payment.id)
            .in('status', ['created', 'pending']);
        }

        // Update linked enquiry payment status if present
        try {
          const { data: enquiries } = await admin.from('service_enquiries').select('id, message').order('created_at', { ascending: false }).limit(20);
          for (const enq of (enquiries || [])) {
            if (enq.message && enq.message.includes(body.orderId)) {
              let msgObj: Record<string, any> = {};
              try { msgObj = JSON.parse(enq.message); } catch { msgObj = {}; }
              if (msgObj.providerOrderId === body.orderId && msgObj.paymentStatus !== 'paid') {
                msgObj.paymentStatus = 'cancelled';
                await admin.from('service_enquiries').update({ message: JSON.stringify(msgObj) }).eq('id', enq.id);
                break;
              }
            }
          }
        } catch (enqErr) {
          console.warn('Notice: could not update enquiry cancellation status:', enqErr);
        }
      }

      return NextResponse.json({ recorded: true, state: 'dismissed' });
    }

    // Explicit payment failure reported by payment gateway (e.g. card declined)
    const failureCode = body.code || 'PAYMENT_FAILED';
    const failureReason = body.description || body.reason || 'Payment failed during checkout';

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

    // Update linked enquiry to failed
    try {
      const { data: enquiries } = await admin.from('service_enquiries').select('id, message').order('created_at', { ascending: false }).limit(20);
      for (const enq of (enquiries || [])) {
        if (enq.message && enq.message.includes(body.orderId)) {
          let msgObj: Record<string, any> = {};
          try { msgObj = JSON.parse(enq.message); } catch { msgObj = {}; }
          if (msgObj.providerOrderId === body.orderId && msgObj.paymentStatus !== 'paid') {
            msgObj.paymentStatus = 'failed';
            await admin.from('service_enquiries').update({ message: JSON.stringify(msgObj) }).eq('id', enq.id);
            break;
          }
        }
      }
    } catch (enqErr) {
      console.warn('Notice: could not update enquiry failure status:', enqErr);
    }

    return NextResponse.json({ recorded: true, state: 'failed' });
  } catch (error) {
    console.error('Error recording payment failure/cancellation:', error);
    return NextResponse.json({ error: 'Could not record status' }, { status: 500 });
  }
}
