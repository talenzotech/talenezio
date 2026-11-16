import TestsClient from './TestsClient'
import { getCurrentUser } from '@/lib/auth/current-user'
import { isLocalDemoSession } from '@/lib/auth/local-demo'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export default async function TestsPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string }>
}) {
  const params = await searchParams
  const error = params?.error

  const localDemoSession = await isLocalDemoSession()
  const user = localDemoSession ? null : await getCurrentUser()

  let initialUserName = ''

  if (localDemoSession) {
    const cookieStore = await cookies()
    const rawDemoProfile = cookieStore.get('talenezio-local-demo-profile')?.value
    if (rawDemoProfile) {
      try {
        const demoProfile = JSON.parse(decodeURIComponent(rawDemoProfile))
        if (demoProfile?.fullName) {
          initialUserName = demoProfile.fullName
        }
      } catch {
        // ignore
      }
    }
    if (!initialUserName) initialUserName = 'Demo User'
  } else if (user) {
    const supabase = await createClient()
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .maybeSingle()

    initialUserName =
      profile?.full_name ||
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      (user.email ? user.email.split('@')[0] : '') ||
      'Talenezio Learner'
  }

  const now = new Date()
  const day = now.getDate()
  const suffix = day % 100 >= 11 && day % 100 <= 13 ? 'th' : ({ 1: 'st', 2: 'nd', 3: 'rd' } as Record<number, string>)[day % 10] || 'th'
  const initialDate = `${day}${suffix} ${now.toLocaleString('en-GB', { month: 'long', timeZone: 'Asia/Kolkata' })} ${now.getFullYear()}`

  return <TestsClient error={error} initialUserName={initialUserName} initialDate={initialDate} />
}

