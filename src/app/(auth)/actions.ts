'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData): Promise<void> {
  const supabase = await createClient()

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    redirect('/login?error=' + encodeURIComponent('Email and password are required'))
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    redirect('/login?error=' + encodeURIComponent(error.message))
  }

  revalidatePath('/', 'layout')
  const nextPath = formData.get('next')
  const returnPath = typeof nextPath === 'string'
    && nextPath.startsWith('/')
    && !nextPath.startsWith('//')
    && !nextPath.includes('\\')
    ? nextPath
    : '/dashboard'
  redirect(returnPath)
}

export async function signup(formData: FormData): Promise<void> {
  const supabase = await createClient()

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = formData.get('fullName') as string
  const referralCode = formData.get('referralCode') as string

  if (!email || !password || !fullName) {
    redirect('/register?error=' + encodeURIComponent('All fields are required'))
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
    redirect('/register?error=' + encodeURIComponent(error.message))
  }
  
  if (data.session) {
    revalidatePath('/', 'layout')
    redirect('/dashboard')
  }

  redirect('/login?message=' + encodeURIComponent('Check your email for the confirmation link.'))
}

export async function loginWithOAuth(provider: 'google' | 'linkedin_oidc'): Promise<void> {
  const supabase = await createClient()
  
  // NOTE: Assuming your NEXT_PUBLIC_APP_URL is set in .env.local
  // Or fallback to localhost for development
  const redirectUrl = process.env.NEXT_PUBLIC_APP_URL 
    ? `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback` 
    : 'http://localhost:3000/auth/callback'

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
