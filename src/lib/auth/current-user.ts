import { cache } from 'react'
import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'


export async function hasSupabaseAuthCookie() {
  const cookieStore = await cookies()
  return cookieStore.getAll().some(({ name }) =>
    name.startsWith('sb-') && name.includes('-auth-token')
  )
}

export const getCurrentUser = cache(async () => {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
})
