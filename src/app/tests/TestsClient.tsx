'use client'

import Link from 'next/link'
import {
  Code,
  TrendingUp,
  Megaphone,
  Brain,
  GraduationCap,
} from 'lucide-react'
import FeatureBottomNav from '@/components/FeatureBottomNav'

export const TEST_CATEGORIES = [
  {
    id: 'technology',
    title: 'Technology & Software',
    subtitle: 'Algorithms, Data Structures, Modern Full-...',
    icon: Code,
    iconColor: 'text-blue-600 dark:text-blue-400',
    iconBg: 'bg-blue-50 dark:bg-blue-950/60',
  },
  {
    id: 'finance',
    title: 'Finance',
    subtitle: '3-Statement Financial Models, Valuation...',
    icon: TrendingUp,
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    iconBg: 'bg-emerald-50 dark:bg-emerald-950/60',
  },
  {
    id: 'digital-marketing',
    title: 'Digital Marketing',
    subtitle: 'SEO Architecture, Performance Ad Auctions...',
    icon: Megaphone,
    iconColor: 'text-rose-500 dark:text-rose-400',
    iconBg: 'bg-rose-50 dark:bg-rose-950/60',
  },
  {
    id: 'ai',
    title: 'Artificial Intelligence',
    subtitle: 'Neural Networks, Transformer Mechanics,...',
    icon: Brain,
    iconColor: 'text-purple-600 dark:text-purple-400',
    iconBg: 'bg-purple-50 dark:bg-purple-950/60',
  },
]

export default function TestsClient({ error }: { error?: string }) {
  return (
    <div className="min-h-screen bg-white pb-24 pt-8 dark:bg-gray-950 sm:pb-28">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        
        {/* Header Section (matches reference design) */}
        <div className="mb-8 space-y-3.5">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50/90 px-3.5 py-1 text-xs font-semibold text-blue-700 shadow-sm dark:border-blue-900/50 dark:bg-blue-950/50 dark:text-blue-300">
            <GraduationCap className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span>Accredited Skill Certifications</span>
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Industry–Standard Skill Tests
          </h1>

          <p className="max-w-2xl text-sm leading-relaxed text-gray-600 dark:text-gray-400 sm:text-base">
            Take our industry-standard tests to evaluate your proficiency, earn verified certificates accredited with company logo and signature, and boost your resume credentials.
          </p>
        </div>

        {error && (
          <div
            role="alert"
            className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-center text-sm font-medium text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/40 dark:text-amber-300"
          >
            {error === 'payment_required'
              ? 'Pro assessment requires payment or an approved free unlock. Please purchase Pro access or take the free test below.'
              : decodeURIComponent(error)}
          </div>
        )}

        {/* 2x2 Grid of Category Cards (matches reference screenshot, clicking opens category page) */}
        <div className="grid grid-cols-2 gap-3.5 sm:gap-5">
          {TEST_CATEGORIES.map((category) => {
            const Icon = category.icon

            return (
              <Link
                key={category.id}
                href={`/tests/${category.id}`}
                className="group relative flex flex-col justify-between cursor-pointer rounded-3xl border border-gray-200 bg-white p-5 sm:p-6 shadow-sm transition-all duration-200 hover:border-blue-400 hover:bg-[#f0f7ff]/40 hover:shadow-md dark:border-gray-800 dark:bg-gray-900 dark:hover:border-blue-500 dark:hover:bg-blue-950/20"
              >
                <div>
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${category.iconBg} ${category.iconColor}`}>
                    <Icon className="h-6 w-6 stroke-[2.2]" />
                  </div>

                  <h2 className="mt-4 text-base font-bold tracking-tight text-gray-900 dark:text-white sm:text-lg group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {category.title}
                  </h2>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                    {category.subtitle}
                  </p>
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Bottom Navigation */}
      <FeatureBottomNav />
    </div>
  )
}
