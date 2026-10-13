'use server'

import { createClient } from '@/utils/supabase/server'
import { consumeTestAttempt } from '@/lib/payments/access'

export async function consumeAttemptForSubmission(): Promise<{ success: boolean }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false }
  return { success: await consumeTestAttempt(user.id) }
}
