'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { safeNextPath } from '@/lib/auth/redirect'
import {
  endLocalDemoSession,
  isLocalDemoSession,
} from '@/lib/auth/local-demo'
import {
  getAppUrl,
  formatOAuthErrorMessage,
  buildOAuthCallbackUrl,
  type OAuthProvider,
} from '@/lib/auth/oauth'

export { getAppUrl, formatOAuthErrorMessage, buildOAuthCallbackUrl, type OAuthProvider }

export async function login(formData: FormData): Promise<void> {
  // type-casting here for convenience
  // in practice, you should validate your inputs
  const email = String(formData.get('email') || '').trim()
  const password = String(formData.get('password') || '')
  const next = safeNextPath(formData.get('next') as string | null)

  if (!email || !password) {
    redirect(`/login?error=${encodeURIComponent('Email and password are required')}&next=${encodeURIComponent(next)}`)
  }

  let error: { message: string } | null = null
  try {
    const supabase = await createClient()
    const result = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    error = result.error
  } catch {
    redirect(`/login?error=${encodeURIComponent('Unable to sign in right now. Please try again.')}&next=${encodeURIComponent(next)}`)
  }

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}&next=${encodeURIComponent(next)}`)
  }

  revalidatePath('/', 'layout')
  redirect(next)
}

export async function signup(formData: FormData): Promise<void> {
  const supabase = await createClient()

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string
  const fullName = formData.get('fullName') as string
  const referralCode = formData.get('referralCode') as string
  const next = safeNextPath(formData.get('next') as string | null)

  if (!email || !password || !confirmPassword || !fullName) {
    redirect(`/register?error=${encodeURIComponent('All fields are required')}&next=${encodeURIComponent(next)}`)
  }

  if (password.length < 8) {
    redirect(`/register?error=${encodeURIComponent('Password must be at least 8 characters')}&next=${encodeURIComponent(next)}`)
  }

  if (password !== confirmPassword) {
    redirect(`/register?error=${encodeURIComponent('Passwords do not match')}&next=${encodeURIComponent(next)}`)
  }

  const appUrl = await getAppUrl()

  const { error, data } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${appUrl}/auth/callback?flow=email_verification&next=${encodeURIComponent(next)}`,
      data: {
        full_name: fullName,
        referral_code: referralCode || null,
      },
    },
  })

  if (error) {
    redirect(`/register?error=${encodeURIComponent(error.message)}&next=${encodeURIComponent(next)}`)
  }
  
  if (data.session) {
    revalidatePath('/', 'layout')
    redirect(next)
  }

  redirect(`/login?message=${encodeURIComponent('Check your email for the confirmation link.')}&next=${encodeURIComponent(next)}`)
}

export async function loginWithOAuth(
  provider: OAuthProvider,
  requestedNext?: string
): Promise<void> {
  const next = safeNextPath(requestedNext)
  const supabase = await createClient()
  const appUrl = await getAppUrl()
  const redirectUrl = buildOAuthCallbackUrl(appUrl, next)

  let targetProvider: OAuthProvider = provider
  let { data, error } = await supabase.auth.signInWithOAuth({
    provider: targetProvider,
    options: {
      redirectTo: redirectUrl,
      queryParams: targetProvider === 'google' ? {
        access_type: 'offline',
        prompt: 'select_account',
      } : undefined,
    },
  })

  // If linkedin_oidc failed because it's not enabled, attempt fallback to legacy linkedin provider
  if (error && targetProvider === 'linkedin_oidc' && /provider.*not enabled/i.test(error.message)) {
    const fallbackResult = await supabase.auth.signInWithOAuth({
      provider: 'linkedin',
      options: {
        redirectTo: redirectUrl,
      },
    })
    if (!fallbackResult.error && fallbackResult.data?.url) {
      targetProvider = 'linkedin'
      data = fallbackResult.data
      error = null
    }
  }

  if (error) {
    redirect(`/login?error=${encodeURIComponent(formatOAuthErrorMessage(targetProvider, error.message))}&next=${encodeURIComponent(next)}`)
  }

  if (data?.url) {
    redirect(data.url)
  }

  redirect(`/login?error=${encodeURIComponent('Could not generate authentication redirect URL')}&next=${encodeURIComponent(next)}`)
}

export async function requestPasswordReset(formData: FormData): Promise<void> {
  const supabase = await createClient()
  const email = String(formData.get('email') || '').trim()
  const next = safeNextPath(formData.get('next') as string | null)
  const appUrl = await getAppUrl()

  if (!email) {
    redirect(`/forgot-password?error=${encodeURIComponent('Email is required')}&next=${encodeURIComponent(next)}`)
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${appUrl}/auth/callback?flow=recovery&next=${encodeURIComponent(next)}`,
  })

  if (error) {
    redirect(`/forgot-password?error=${encodeURIComponent('Could not send the reset email. Please try again.')}&next=${encodeURIComponent(next)}`)
  }

  redirect(`/forgot-password?message=${encodeURIComponent('If an account exists for that email, a password reset link has been sent.')}&next=${encodeURIComponent(next)}`)
}

export async function updatePassword(formData: FormData): Promise<void> {
  const supabase = await createClient()
  const password = String(formData.get('password') || '')
  const confirmPassword = String(formData.get('confirmPassword') || '')
  const next = safeNextPath(formData.get('next') as string | null)

  if (password.length < 8) {
    redirect(`/reset-password?error=${encodeURIComponent('Password must be at least 8 characters')}&next=${encodeURIComponent(next)}`)
  }
  if (password !== confirmPassword) {
    redirect(`/reset-password?error=${encodeURIComponent('Passwords do not match')}&next=${encodeURIComponent(next)}`)
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect(`/forgot-password?error=${encodeURIComponent('This reset link is invalid or expired. Request a new one.')}&next=${encodeURIComponent(next)}`)
  }

  const { error } = await supabase.auth.updateUser({ password })
  if (error) {
    redirect(`/reset-password?error=${encodeURIComponent(error.message)}&next=${encodeURIComponent(next)}`)
  }

  await supabase.auth.signOut()
  redirect(`/login?message=${encodeURIComponent('Your password was updated. Please sign in.')}&next=${encodeURIComponent(next)}`)
}

export async function signout() {
  if (await isLocalDemoSession()) {
    await endLocalDemoSession()
    revalidatePath('/', 'layout')
    redirect('/login')
  }

  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}
