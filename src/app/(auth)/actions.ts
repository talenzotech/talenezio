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
  const fullName = formData.get('fullName') as string
  const referralCode = formData.get('referralCode') as string
  const next = safeNextPath(formData.get('next') as string | null)

  if (!email || !password || !fullName) {
    redirect(`/register?error=${encodeURIComponent('All fields are required')}&next=${encodeURIComponent(next)}`)
  }

  const { error, data } = await supabase.auth.signUp({
    email,
    password,
    options: {
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
  const callbackPath = `/auth/callback?next=${encodeURIComponent(next)}`
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
    redirect('/login?error=' + encodeURIComponent(error.message))
  }

  if (data.url) {
    redirect(data.url) // Navigate to the OAuth provider's authentication URL
  }
}

export async function signout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}
