'use server';

import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { FREE_UNLOCK_PRODUCT_CODE } from '@/lib/payments/products';
import { grantEntitlement } from '@/lib/payments/access';
import { sendUnlockStatusEmail } from '@/utils/email';
import { revalidatePath } from 'next/cache';

export async function reviewSubmission(
  submissionId: string, 
  status: 'approved' | 'rejected', 
  note?: string
) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };

  // Verify admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single();

  if (!profile?.is_admin) return { error: 'Unauthorized' };

  const adminClient = createAdminClient();

  // Get submission user details for email
  const { data: submission } = await adminClient
    .from('unlock_submissions')
    .select('user_id')
    .eq('id', submissionId)
    .single();
    
  if (!submission) return { error: 'Submission not found' };

  const { data: submissionProfile } = await adminClient
    .from('profiles')
    .select('full_name')
    .eq('id', submission.user_id)
    .maybeSingle();

  const { error: updateError } = await adminClient
    .from('unlock_submissions')
    .update({ 
      status, 
      reviewer_note: note, 
      reviewer_id: user.id, 
      reviewed_at: new Date().toISOString() 
    })
    .eq('id', submissionId);

  if (updateError) {
    console.error('Error updating submission:', updateError);
    return { error: 'Failed to update submission' };
  }

  if (status === 'approved') {
    await grantEntitlement({
      userId: submission.user_id,
      productCode: FREE_UNLOCK_PRODUCT_CODE,
      source: 'free_unlock',
      sourceId: submissionId,
    });

  } else {
    await adminClient
      .from('entitlements')
      .update({ status: 'revoked' })
      .eq('user_id', submission.user_id)
      .eq('source', 'free_unlock')
      .eq('product_code', FREE_UNLOCK_PRODUCT_CODE);
  }

  // Attempt to send email after the access decision is persisted.
  try {
    const { createClient: createSupabaseClient } = await import('@supabase/supabase-js');
    const adminAuthClient = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    const { data: userData, error: userError } = await adminAuthClient.auth.admin.getUserById(submission.user_id);
    if (!userError && userData?.user?.email) {
      const emailRes = await sendUnlockStatusEmail({
        to: userData.user.email,
        name: submissionProfile?.full_name || 'User',
        status,
        note
      });
      if (!emailRes.success) {
         console.error('Email failed to send, but status was updated.');
      }
    }
  } catch (err) {
    console.error('Failed to send email:', err);
  }

  revalidatePath('/admin/unlock-submissions');
  return { success: true };
}
