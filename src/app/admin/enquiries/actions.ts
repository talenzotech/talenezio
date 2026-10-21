'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function updateEnquiry(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  const admin = createAdminClient();
  const { data: profile } = await admin.from('profiles').select('is_admin').eq('id', user.id).single();
  if (!profile?.is_admin) return;

  const id = String(formData.get('id') || '');
  const status = String(formData.get('status') || 'new');
  const note = String(formData.get('note') || '').trim();
  if (!id || !['new', 'contacted', 'closed'].includes(status)) return;

  const { error } = await admin.from('service_enquiries').update({ status, admin_note: note || null }).eq('id', id);
  if (error) return;
  revalidatePath('/admin/enquiries');
}
