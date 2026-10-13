'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { safeNextPath } from '@/lib/auth/redirect'

export async function login(formData: FormData): Promise<void> {
  const supabase = await createClient()

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const next = safeNextPath(formData.get('next') as string | null)

  if (!email || !password) {
    redirect(`/login?error=${encodeURIComponent('Email and password are required')}&next=${encodeURIComponent(next)}`)
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

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

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

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

export async function loginWithOAuth(provider: 'google' | 'linkedin_oidc', requestedNext?: string): Promise<void> {
  const supabase = await createClient()
  const next = safeNextPath(requestedNext)
  
  // NOTE: Assuming your NEXT_PUBLIC_APP_URL is set in .env.local
  // Or fallback to localhost for development
  const callbackPath = `/auth/callback?flow=oauth&next=${encodeURIComponent(next)}`
  const redirectUrl = process.env.NEXT_PUBLIC_APP_URL 
    ? `${process.env.NEXT_PUBLIC_APP_URL}${callbackPath}`
    : `http://localhost:3000${callbackPath}`

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: redirectUrl,
    },
  })

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}&next=${encodeURIComponent(next)}`)
  }

  if (data.url) {
    redirect(data.url) // Navigate to the OAuth provider's authentication URL
  }
}

export async function requestPasswordReset(formData: FormData): Promise<void> {
  const supabase = await createClient()
  const email = String(formData.get('email') || '').trim()
  const next = safeNextPath(formData.get('next') as string | null)
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

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
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}
