import React from 'react'
import { createClient } from '@/utils/supabase/server'
import { isLocalDemoSession } from '@/lib/auth/local-demo'
import FeatureBottomNav from '@/components/FeatureBottomNav'
import { LinkedInOptimizationRegistration } from '@/components/services/LinkedInOptimizationRegistration'

export const metadata = {
  title: 'LinkedIn Optimization | Talenezio',
  description:
    'Register for personalized LinkedIn profile optimization, executive branding, custom banner design, and high-impact content strategy.',
}

export default async function LinkedInOptimizationPage() {
  const localDemoSession = await isLocalDemoSession()
  const supabase = localDemoSession ? null : await createClient()
  const {
    data: { user },
  } = supabase ? await supabase.auth.getUser() : { data: { user: null } }

  const userMetadata = user?.user_metadata || {}
  const fullName = userMetadata.full_name || (localDemoSession ? 'Demo User' : '')
  const email = user?.email || (localDemoSession ? 'demo@talenezio.local' : '')

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 pb-24 dark:bg-gray-950 sm:px-6 sm:py-12 sm:pb-28 lg:px-8">
      <LinkedInOptimizationRegistration userProfile={{ fullName, email }} />
      <FeatureBottomNav />
    </main>
  )
}
