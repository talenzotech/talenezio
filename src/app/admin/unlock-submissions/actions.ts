'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendUnlockStatusEmail } from '@/utils/email';

export async function reviewSubmission(
  submissionId: string,
  status: 'approved' | 'rejected',
  note?: string,
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };

  const admin = createAdminClient();
  const { data: profile } = await admin.from('profiles').select('is_admin').eq('id', user.id).single();
  if (!profile?.is_admin) return { error: 'Unauthorized' };

  const cleanNote = note?.trim().slice(0, 2000) || null;
  const { data: rawReview, error: reviewError } = await admin
    .rpc('review_unlock_submission', {
      p_submission_id: submissionId,
      p_reviewer_id: user.id,
      p_status: status,
      p_note: cleanNote,
    })
    .single();
  const review = rawReview as { reviewed_user_id: string } | null;

  if (reviewError || !review) {
    console.error('Unable to review unlock submission:', reviewError);
    return { error: 'The submission may already have been reviewed or could not be updated.' };
  }

  const { data: submissionProfile } = await admin
    .from('profiles')
    .select('full_name')
    .eq('id', review.reviewed_user_id)
    .maybeSingle();
  const { data: userData } = await admin.auth.admin.getUserById(review.reviewed_user_id);

  if (userData.user?.email) {
    const emailResult = await sendUnlockStatusEmail({
      to: userData.user.email,
      name: submissionProfile?.full_name || 'User',
      status,
      note: cleanNote || undefined,
    });
    if (!emailResult.success) console.error('Unlock status email failed:', emailResult.error);
  }

  revalidatePath('/admin/unlock-submissions');
  revalidatePath('/unlock-program');
  revalidatePath('/dashboard');
  return { success: true };
}
