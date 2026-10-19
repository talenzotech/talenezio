'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export type UnlockFeature = 'skill_test_pro' | 'linkedin_optimization'

export async function submitUnlockRequest(input: {
  featureCode: UnlockFeature
  contactEmail: string
  whatsappPhone: string
  paths: string[]
}) {
  if (!input || typeof input !== 'object'
    || !['skill_test_pro', 'linkedin_optimization'].includes(input.featureCode)
    || typeof input.contactEmail !== 'string'
    || typeof input.whatsappPhone !== 'string'
    || !Array.isArray(input.paths)
    || input.paths.some(path => typeof path !== 'string')) {
    return { error: 'The free-access request is invalid.' }
  }
  if (input.paths.length !== 8) return { error: 'Exactly 8 screenshots are required.' }
  if (new Set(input.paths).size !== 8) return { error: 'Upload 8 different screenshots.' }
  if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(input.contactEmail.trim())) {
    return { error: 'Enter a valid email address.' }
  }
  const phoneDigits = input.whatsappPhone.replace(/\D/g, '')
  if (phoneDigits.length < 8 || phoneDigits.length > 15) {
    return { error: 'Enter a valid WhatsApp phone number.' }
  }

  const supabase = await createClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) return { error: 'You must be logged in to submit.' }

  if (input.paths.some(path => {
    const parts = path.split('/')
    return parts.length !== 2 || parts[0] !== user.id || !parts[1]
  })) {
    return { error: 'Evidence must be uploaded to your own account.' }
  }
  const { error } = await supabase.rpc('submit_unlock_request', {
    p_feature_code: input.featureCode,
    p_contact_email: input.contactEmail.trim(),
    p_whatsapp_phone: input.whatsappPhone.trim(),
    p_storage_paths: input.paths,
  })

  if (error) {
    console.error('Could not submit free-access request:', error)
    if (error.code === '23505') return { error: 'You already have a pending or approved request for this feature.' }
    return { error: error.message || 'Failed to submit your free-access request.' }
  }

  revalidatePath('/unlock-program')
  return { success: true }
}

export async function getSubmissionStatus(featureCode: UnlockFeature) {
  if (featureCode !== 'skill_test_pro' && featureCode !== 'linkedin_optimization') {
    throw new Error('Select an eligible feature.')
  }

  const supabase = await createClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) return null

  const { data, error } = await supabase
    .from('unlock_submissions')
    .select('status, reviewer_note, created_at, feature_code, contact_email, whatsapp_phone')
    .eq('user_id', user.id)
    .eq('feature_code', featureCode)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    console.error('Could not load free-access request status:', error)
    throw new Error('Could not load your submission status.')
  }
  return data
}
