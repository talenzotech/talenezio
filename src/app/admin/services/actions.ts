'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

const statuses = ['requested', 'paid', 'scheduled', 'in_progress', 'completed', 'cancelled'] as const;
type ServiceOrderStatus = (typeof statuses)[number];

export async function updateServiceOrder(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const admin = createAdminClient();
  const { data: profile } = await admin.from('profiles').select('is_admin').eq('id', user.id).single();
  if (!profile?.is_admin) return;

  const orderId = String(formData.get('orderId') || '');
  const status = String(formData.get('status') || '') as ServiceOrderStatus;
  if (!orderId || !statuses.includes(status)) return;

  const { data: order, error: orderError } = await admin
    .from('service_orders')
    .select('id, user_id, service_code')
    .eq('id', orderId)
    .single();
  if (orderError || !order) return;

  const scheduledFor = String(formData.get('scheduledFor') || '').trim();
  const meetingUrl = String(formData.get('meetingUrl') || '').trim();
  const note = String(formData.get('note') || '').trim();
  const { error } = await admin.from('service_orders').update({
    status,
    scheduled_for: scheduledFor ? new Date(scheduledFor).toISOString() : null,
    meeting_url: meetingUrl || null,
    fulfilment_note: note || null,
    completed_at: status === 'completed' ? new Date().toISOString() : null,
  }).eq('id', orderId);
  if (error) return;

  if (status === 'completed' && ['career-counseling', 'career-starter-pack', 'interview-prep'].includes(order.service_code)) {
    await admin.from('certificates').upsert({
      user_id: order.user_id,
      service_order_id: order.id,
      certificate_number: `TAL-SVC-${order.id.slice(0, 8).toUpperCase()}`,
      certificate_type: order.service_code === 'career-counseling' ? 'participation' : 'completion',
      topic: order.service_code,
      performance_statement: order.service_code === 'career-counseling' ? 'Participated in a Talenezio career counselling session.' : `Completed the Talenezio ${order.service_code === 'interview-prep' ? 'Interview Preparation' : 'Career Starter Pack'} program.`,
    }, { onConflict: 'service_order_id' });
  }

  revalidatePath('/admin/services');
  revalidatePath('/dashboard');
}
