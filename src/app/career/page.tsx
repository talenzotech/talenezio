import FeatureBottomNav from '@/components/FeatureBottomNav'
import { Compass } from 'lucide-react'

export default function CareerPage() {
  return (
    <div className="min-h-screen bg-gray-50 pb-28 pt-16 dark:bg-gray-950">
      <div className="mx-auto max-w-xl px-4 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
          <Compass className="h-8 w-8" />
        </div>
        <h1 className="mt-4 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          Career Opportunities
        </h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Career pathways and opportunity tracking will be available here soon.
        </p>
      </div>
      <FeatureBottomNav />
    </div>
  )
}

