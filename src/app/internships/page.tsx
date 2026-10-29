import { createClient } from '@/utils/supabase/server'
import { isLocalDemoSession } from '@/lib/auth/local-demo'
import FeatureBottomNav from '@/components/FeatureBottomNav'
import { InternshipTrainingView } from '@/components/internships-training/InternshipTrainingView'

export const metadata = {
  title: 'Internship Opportunities | Talenezio',
  description:
    'Explore verified remote internship opportunities in Graphic Design, Web Development, Business Development, and Social Media Management.',
}

export default async function InternshipsPage() {
  const localDemoSession = await isLocalDemoSession()
  const supabase = localDemoSession ? null : await createClient()
  const {
    data: { user },
  } = supabase ? await supabase.auth.getUser() : { data: { user: null } }

  const userMetadata = user?.user_metadata || {}
  const fullName = userMetadata.full_name || (localDemoSession ? 'Demo User' : '')
  const email = user?.email || (localDemoSession ? 'demo@talenezio.local' : '')
  const collegeName = userMetadata.college_name || ''

  return (
    <main className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 px-4 sm:px-6 lg:px-8 py-8 sm:py-12 pb-28 sm:pb-32">
      <div className="mx-auto max-w-7xl">
        <InternshipTrainingView
          defaultTab="internships"
          userProfile={{
            fullName,
            email,
            collegeName,
          }}
        />
      </div>

      <FeatureBottomNav />
    </main>
  )
}
