'use server'

import { createClient } from '@/utils/supabase/server'
import { sendUnlockStatusEmail } from '@/utils/email'
import { revalidatePath } from 'next/cache'

export async function reviewSubmission(
  submissionId: string,
  status: 'approved' | 'rejected',
  note?: string,
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()
  if (profileError || !profile?.is_admin) return { error: 'Unauthorized' }

  const { data: submission, error: submissionError } = await supabase
    .from('unlock_submissions')
    .select('user_id, profiles(full_name)')
    .eq('id', submissionId)
    .single()
  if (submissionError || !submission) {
    console.error('Could not load unlock request for review:', submissionError)
    return { error: 'Submission not found.' }
  }

  const { data: updated, error: updateError } = await supabase
    .from('unlock_submissions')
    .update({
      status,
      reviewer_note: note?.trim() || null,
      reviewer_id: user.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', submissionId)
    .eq('status', 'pending')
    .select('id')
    .maybeSingle()

  if (updateError) {
    console.error('Error reviewing unlock request:', updateError)
    return { error: 'Failed to update submission.' }
  }
  if (!updated) return { error: 'This submission is no longer pending.' }

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (serviceRoleKey && supabaseUrl) {
    try {
      const { createClient: createSupabaseClient } = await import('@supabase/supabase-js')
      const adminClient = createSupabaseClient(supabaseUrl, serviceRoleKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      })
      const { data: userData, error: userError } = await adminClient.auth.admin.getUserById(submission.user_id)
      if (userError) throw userError
      if (userData.user?.email) {
        const relation = submission.profiles
        const userProfile = Array.isArray(relation) ? relation[0] : relation
        const emailResult = await sendUnlockStatusEmail({
          to: userData.user.email,
          name: userProfile?.full_name || 'User',
          status,
          note,
        })
        if (!emailResult.success) console.error('Unlock status email could not be sent.')
      }
    } catch (emailError) {
      console.error('Failed to send unlock status email:', emailError)
    }
  }

  revalidatePath('/admin/unlock-submissions')
  revalidatePath('/unlock-program')
  return { success: true }
}
