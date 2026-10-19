import 'server-only'

import type { SupabaseClient } from '@supabase/supabase-js'
import { FREE_UNLOCK_SKILL_TEST_CODE, PAID_TEST_PRODUCT_CODE, TestCategoryId } from './catalog'

export type TestAccessResult =
  | { allowed: true; source: 'free' | 'payment' | 'approved_unlock' }
  | { allowed: false; reason: 'payment_required' }
  | { allowed: false; reason: 'verification_unavailable' }

export async function checkTestAccess(
  supabase: SupabaseClient,
  userId: string,
  category: TestCategoryId,
  type: 'free' | 'pro',
): Promise<TestAccessResult> {
  if (type === 'free') return { allowed: true, source: 'free' }

  const { data: payment, error: paymentError } = await supabase
    .from('payments')
    .select('id')
    .eq('user_id', userId)
    .eq('product_code', PAID_TEST_PRODUCT_CODE(category))
    .eq('status', 'paid')
    .limit(1)
    .maybeSingle()

  if (paymentError) {
    console.error('Could not verify the paid skill-test record.', paymentError)
    return { allowed: false, reason: 'verification_unavailable' }
  }
  if (payment) return { allowed: true, source: 'payment' }

  const { data: unlock, error: unlockError } = await supabase
    .from('unlock_submissions')
    .select('id')
    .eq('user_id', userId)
    .eq('feature_code', FREE_UNLOCK_SKILL_TEST_CODE)
    .eq('status', 'approved')
    .limit(1)
    .maybeSingle()

  if (unlockError) {
    console.error('Could not verify the approved free skill-test unlock.', unlockError)
    return { allowed: false, reason: 'verification_unavailable' }
  }

  return unlock
    ? { allowed: true, source: 'approved_unlock' }
    : { allowed: false, reason: 'payment_required' }
}
