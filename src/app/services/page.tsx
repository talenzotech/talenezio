import { isLocalDemoSession } from '@/lib/auth/local-demo'
import { getCurrentUser } from '@/lib/auth/current-user'
import FeatureBottomNav from '@/components/FeatureBottomNav'
import { InternshipTrainingView } from '@/components/internships-training/InternshipTrainingView'

export const metadata = {
  title: 'Internship & Training Opportunities | Talenezio',
  description:
    'Explore verified remote internship opportunities and structured monthly training programs in Graphic Design, Web Development, Marketing, and Business.',
}

export default async function ServicesPage() {
  const localDemoSession = await isLocalDemoSession()
  const user = localDemoSession ? null : await getCurrentUser()

  const userMetadata = user?.user_metadata || {}
  const fullName = userMetadata.full_name || (localDemoSession ? 'Demo User' : '')
  const email = user?.email || (localDemoSession ? 'demo@talenezio.local' : '')
  const collegeName = userMetadata.college_name || ''

  return (
    <main className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 px-4 sm:px-6 lg:px-8 py-8 sm:py-12 pb-28 sm:pb-32">
      <div className="mx-auto max-w-7xl">
        <InternshipTrainingView
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
