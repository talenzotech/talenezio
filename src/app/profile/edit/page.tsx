import { createClient } from '@/utils/supabase/server'
import Image from 'next/image'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { ArrowLeft } from 'lucide-react'
import { isLocalDemoSession } from '@/lib/auth/local-demo'
import FeatureBottomNav from '@/components/FeatureBottomNav'
import { EditProfileForm } from '@/components/profile/EditProfileForm'
import { type ExperienceLevel } from '@/lib/profile/validation'

export const metadata = {
  title: 'Edit Profile | Talenezio',
  description: 'Update your personal details, academic background, and career interests.',
}

export default async function EditProfilePage() {
  const localDemoSession = await isLocalDemoSession()
  const supabase = localDemoSession ? null : await createClient()
  const {
    data: { user },
  } = supabase ? await supabase.auth.getUser() : { data: { user: null } }

  // Protected route - only authenticated users can access
  if (!user && !localDemoSession) {
    redirect('/login?next=/profile/edit')
  }

  let demoProfile: {
    fullName?: string
    collegeName?: string
    experience?: ExperienceLevel
    interests?: string[]
  } | null = null

  if (localDemoSession) {
    const cookieStore = await cookies()
    const rawDemoProfile = cookieStore.get('talenezio-local-demo-profile')?.value
    if (rawDemoProfile) {
      try {
        demoProfile = JSON.parse(decodeURIComponent(rawDemoProfile))
      } catch {
        // ignore parse error
      }
    }
  }

  const profileQuery = supabase
    ? supabase.from('profiles').select('full_name, avatar_url').eq('id', user?.id || '').maybeSingle()
    : null
  const { data: dbProfile } = profileQuery ? await profileQuery : { data: null }

  const userMetadata = user?.user_metadata || {}
  const fullName =
    (localDemoSession
      ? demoProfile?.fullName
      : dbProfile?.full_name || userMetadata.full_name) ||
    (localDemoSession ? 'Demo User' : '')
  const collegeName =
    (localDemoSession ? demoProfile?.collegeName : userMetadata.college_name) || ''
  const experience: ExperienceLevel =
    (localDemoSession ? demoProfile?.experience : userMetadata.experience) || 'Fresher'
  const rawInterests = localDemoSession ? demoProfile?.interests : userMetadata.interests
  const interests: string[] = Array.isArray(rawInterests)
    ? rawInterests
    : typeof rawInterests === 'string' && rawInterests
    ? [rawInterests]
    : []
  const avatarUrl = dbProfile?.avatar_url || userMetadata.avatar_url || null
  const email = user?.email || (localDemoSession ? 'demo@talenezio.local' : undefined)

  return (
    <div className="min-h-screen bg-gray-50 pb-24 sm:pb-28 dark:bg-gray-950">
      {/* Top Header Navigation */}
      <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 px-6 py-4 backdrop-blur-md dark:border-gray-800 dark:bg-gray-900/80 sm:px-8">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2.5" aria-label="Talenezio dashboard">
            <Image
              src="/talenezio-wordmark-transparent.png?v=3"
              alt="Talenezio Logo"
              width={180}
              height={40}
              priority
              className="h-9 w-auto sm:h-10 object-contain"
              style={{ width: 'auto' }}
            />
            <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
              Talenezio
            </span>
          </Link>

          <Link
            href="/dashboard"
            className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-xs sm:text-sm font-semibold text-gray-700 shadow-sm transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back to Dashboard</span>
            <span className="sm:hidden">Back</span>
          </Link>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="mx-auto max-w-5xl px-4 pt-8 sm:px-6 sm:pt-10">
        <EditProfileForm
          initialProfile={{
            fullName,
            collegeName,
            experience,
            interests,
            avatarUrl,
            email,
          }}
        />
      </main>

      <FeatureBottomNav />
    </div>
  )
}

