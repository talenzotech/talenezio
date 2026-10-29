'use server'

import { createClient } from '@/utils/supabase/server'
import { isLocalDemoSession } from '@/lib/auth/local-demo'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import {
  type ProfileData,
  type ProfileActionResult,
  validateProfileData,
} from '@/lib/profile/validation'

export async function updateUserProfile(data: ProfileData): Promise<ProfileActionResult> {
  const fullName = (data.fullName || '').trim()
  const collegeName = (data.collegeName || '').trim()
  const experience = data.experience || 'Fresher'
  const interests = Array.isArray(data.interests)
    ? data.interests.filter(Boolean)
    : []

  const validation = validateProfileData({
    fullName,
    collegeName,
    experience,
    interests,
  })

  if (!validation.isValid) {
    return {
      success: false,
      error: validation.error,
    }
  }

  const isDemo = await isLocalDemoSession()

  if (isDemo) {
    const cookieStore = await cookies()
    const demoProfile: ProfileData = {
      fullName,
      collegeName,
      experience,
      interests,
    }

    cookieStore.set('talenezio-local-demo-profile', encodeURIComponent(JSON.stringify(demoProfile)), {
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    })

    revalidatePath('/dashboard')
    revalidatePath('/profile/edit')
    revalidatePath('/', 'layout')

    return {
      success: true,
      profile: demoProfile,
    }
  }

  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return {
        success: false,
        error: 'You must be signed in to update your profile.',
      }
    }

    // 1. Update Supabase Auth user metadata
    const { error: updateAuthError } = await supabase.auth.updateUser({
      data: {
        full_name: fullName,
        college_name: collegeName,
        experience,
        interests,
      },
    })

    if (updateAuthError) {
      console.error('Failed to update user_metadata:', updateAuthError)
      return {
        success: false,
        error: updateAuthError.message || 'Could not save profile changes.',
      }
    }

    // 2. Keep public.profiles table full_name synchronized (safely)
    try {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ full_name: fullName })
        .eq('id', user.id)

      if (profileError) {
        console.warn('Notice: full_name update on public.profiles returned:', profileError.message)
      }
    } catch (profileCatchErr) {
      console.warn('Notice: error attempting public.profiles update:', profileCatchErr)
    }

    revalidatePath('/dashboard')
    revalidatePath('/profile/edit')
    revalidatePath('/', 'layout')

    return {
      success: true,
      profile: {
        fullName,
        collegeName,
        experience,
        interests,
      },
    }
  } catch (err: unknown) {
    console.error('Unexpected error updating profile:', err)
    const message = err instanceof Error ? err.message : String(err)
    return {
      success: false,
      error: message || 'An unexpected error occurred while saving your profile.',
    }
  }
}
