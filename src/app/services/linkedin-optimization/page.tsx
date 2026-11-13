import React from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { isLocalDemoSession } from '@/lib/auth/local-demo'
import { getCurrentUser } from '@/lib/auth/current-user'
import FeatureBottomNav from '@/components/FeatureBottomNav'
import { LinkedInOptimizationRegistration } from '@/components/services/LinkedInOptimizationRegistration'

export const metadata = {
  title: 'LinkedIn Optimization | Talenezio',
  description:
    'Register for personalized LinkedIn profile optimization, executive branding, custom banner design, and high-impact content strategy.',
}

export default async function LinkedInOptimizationPage() {
  const localDemoSession = await isLocalDemoSession()
  const user = localDemoSession ? null : await getCurrentUser()

  const userMetadata = user?.user_metadata || {}
  const fullName = userMetadata.full_name || (localDemoSession ? 'Demo User' : '')
  const email = user?.email || (localDemoSession ? 'demo@talenezio.local' : '')

  return (
    <div className="min-h-screen bg-gray-50 pb-24 dark:bg-gray-950 sm:pb-28">
      {/* Top Navigation */}
      <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 px-6 py-4 backdrop-blur-md dark:border-gray-800 dark:bg-gray-900/80 sm:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
              aria-label="Back to dashboard"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 shadow-md shadow-blue-500/20">
                <span className="text-lg font-bold text-white">T</span>
              </div>
              <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                Talenezio
              </span>
            </div>
          </div>
          <Link
            href="/career"
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400"
          >
            All Career Services →
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <main className="px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <LinkedInOptimizationRegistration userProfile={{ fullName, email }} />
      </main>

      <FeatureBottomNav />
    </div>
  )
}
