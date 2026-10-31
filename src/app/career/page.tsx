import React from 'react'
import { Sparkles } from 'lucide-react'
import FeatureBottomNav from '@/components/FeatureBottomNav'
import { CareerCardsView } from '@/components/career/CareerCardsView'
import { createClient } from '@/utils/supabase/server'
import { isLocalDemoSession } from '@/lib/auth/local-demo'

export const metadata = {
  title: 'Career Services | Talenezio',
  description: 'Accelerate your career with LinkedIn Optimization, Interview Preparation, and 1-on-1 Career Guidance.',
}

export default async function CareerPage() {
  const localDemoSession = await isLocalDemoSession()
  const supabase = localDemoSession ? null : await createClient()
  const {
    data: { user },
  } = supabase ? await supabase.auth.getUser() : { data: { user: null } }

  const userMetadata = user?.user_metadata || {}
  const fullName = userMetadata.full_name || (localDemoSession ? 'Demo User' : '')
  const email = user?.email || (localDemoSession ? 'demo@talenezio.local' : '')

  return (
    <div className="min-h-screen bg-gray-50 pb-24 pt-8 dark:bg-gray-950 sm:pb-28 sm:pt-12">
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3.5 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
            <Sparkles className="h-3.5 w-3.5" />
            Career Accelerators
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl lg:text-5xl">
            Career Services
          </h1>
          <p className="mt-4 text-base leading-relaxed text-gray-600 dark:text-gray-300 sm:text-lg">
            Propel your career with professional LinkedIn branding, an intensive 8-day interview program, and private 1-on-1 strategic guidance with resume review.
          </p>
        </div>

        {/* 3 Service Cards with Application & Payment Flow */}
        <CareerCardsView userProfile={{ fullName, email }} />

      </main>

      {/* Fixed Feature Bottom Navigation */}
      <FeatureBottomNav />
    </div>
  )
}
