import { cache } from 'react'
import { createClient } from '@/utils/supabase/server'

// Deduplicate auth lookups shared by a layout and its page during one render.
export const getCurrentUser = cache(async () => {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
})
