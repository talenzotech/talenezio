'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Code2,
  TrendingUp,
  Megaphone,
  Sparkles,
  GraduationCap,
  ArrowRight,
  CheckCircle2,
  Award,
  Zap,
} from 'lucide-react'
import ProTestCheckout from '@/components/tests/ProTestCheckout'
import FeatureBottomNav from '@/components/FeatureBottomNav'

const TEST_CATEGORIES = [
  {
    id: 'technology',
    title: 'Technology & Software',
    subtitle: 'Algorithms, Data Structures, Modern Full-Stack Systems',
    icon: Code2,
    iconColor: 'text-blue-600 dark:text-blue-400',
    iconBg: 'bg-blue-50 dark:bg-blue-950/60',
    badgeColor: 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300',
    activeBorder: 'border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/20 dark:bg-blue-950/20',
  },
  {
    id: 'finance',
    title: 'Finance',
    subtitle: '3-Statement Financial Models, Valuation & Markets',
    icon: TrendingUp,
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    iconBg: 'bg-emerald-50 dark:bg-emerald-950/60',
    badgeColor: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
    activeBorder: 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/20 dark:bg-emerald-950/20',
  },
  {
    id: 'digital-marketing',
    title: 'Digital Marketing',
    subtitle: 'SEO Architecture, Performance Ad Auctions & Growth',
    icon: Megaphone,
    iconColor: 'text-rose-500 dark:text-rose-400',
    iconBg: 'bg-rose-50 dark:bg-rose-950/60',
    badgeColor: 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-950 dark:text-rose-300',
    activeBorder: 'border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/20 dark:bg-rose-950/20',
  },
  {
    id: 'ai',
    title: 'Artificial Intelligence',
    subtitle: 'Neural Networks, Transformer Mechanics, Deep Learning',
    icon: Sparkles,
    iconColor: 'text-purple-600 dark:text-purple-400',
    iconBg: 'bg-purple-50 dark:bg-purple-950/60',
    badgeColor: 'border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-800 dark:bg-purple-950 dark:text-purple-300',
    activeBorder: 'border-purple-500 ring-2 ring-purple-500/20 bg-purple-50/20 dark:bg-purple-950/20',
  },
]

export default function TestsClient({ error }: { error?: string }) {
  const [selectedCategory, setSelectedCategory] = useState<string>('technology')

  const activeCat = TEST_CATEGORIES.find(c => c.id === selectedCategory) || TEST_CATEGORIES[0]

  return (
    <div className="min-h-screen bg-gray-50 pb-28 pt-8 dark:bg-gray-950">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        
        {/* Header Section (matches screenshot) */}
        <div className="mb-8 space-y-3.5">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50/90 px-3.5 py-1 text-xs font-semibold text-blue-700 shadow-sm dark:border-blue-900/50 dark:bg-blue-950/50 dark:text-blue-300">
            <GraduationCap className="h-4 w-4" />
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

        {/* 2x2 Grid of Category Cards (matches screenshot) */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {TEST_CATEGORIES.map((category) => {
            const isSelected = selectedCategory === category.id
            const Icon = category.icon

            return (
              <div
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`group relative cursor-pointer rounded-3xl border p-6 transition-all duration-200 ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50/30 shadow-md ring-2 ring-blue-500/20 dark:bg-blue-950/20'
                    : 'border-gray-200 bg-white shadow-sm hover:border-gray-300 hover:shadow-md dark:border-gray-800 dark:bg-gray-900'
                }`}
              >
                <div className="flex flex-col gap-4">
                  <div className={`flex h-13 w-13 items-center justify-center rounded-2xl ${category.iconBg} ${category.iconColor}`}>
                    <Icon className="h-6 w-6" />
                  </div>

                  <div>
                    <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                      {category.title}
                    </h2>
                    <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                      {category.subtitle}
                    </p>
                  </div>

                  {/* Free / Pro Action Buttons */}
                  <div className="mt-2 flex items-center gap-2.5 pt-2 border-t border-gray-100 dark:border-gray-800/80">
                    <Link
                      href={`/tests/${category.id}?type=free`}
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-gray-800 shadow-sm transition hover:bg-gray-50 hover:text-blue-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700"
                    >
                      <Zap className="h-3.5 w-3.5 text-amber-500" />
                      Free Test
                    </Link>

                    <Link
                      href={`/tests/${category.id}?type=pro`}
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-3 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-blue-700"
                    >
                      <Award className="h-3.5 w-3.5 text-blue-200" />
                      Pro Test
                    </Link>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Selected Category Details Drawer */}
        <div className="mt-8 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-100 pb-5 dark:border-gray-800">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">Selected Track</span>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{activeCat.title}</h3>
              <p className="text-sm text-gray-500">{activeCat.subtitle}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                <CheckCircle2 className="h-3.5 w-3.5" /> 260 Official Questions
              </span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Free Tier Card */}
            <div className="rounded-2xl border border-gray-200 bg-gray-50/70 p-5 dark:border-gray-800 dark:bg-gray-950/50">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-bold text-gray-900 dark:text-white">Free Assessment</h4>
                <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-[11px] font-bold text-green-800 uppercase dark:bg-green-950 dark:text-green-300">Free</span>
              </div>
              <ul className="space-y-2 text-xs text-gray-600 dark:text-gray-400 mb-5">
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> 20 Random Questions</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Verified Accredited PDF Certificate</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Instant Results & Scoring</li>
              </ul>
              <Link
                href={`/tests/${activeCat.id}?type=free`}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-white"
              >
                Start Free Assessment <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* Pro Tier Card */}
            <div className="rounded-2xl border border-blue-200 bg-blue-50/40 p-5 dark:border-blue-900/50 dark:bg-blue-950/20">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-bold text-blue-900 dark:text-blue-100">Pro Industry Assessment</h4>
                <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-[11px] font-bold text-blue-800 uppercase dark:bg-blue-950 dark:text-blue-300">₹32 / Unlock</span>
              </div>
              <ul className="space-y-2 text-xs text-blue-900/80 dark:text-blue-200/80 mb-5">
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-blue-600" /> 45 Questions (3 Comprehensive Sections)</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-blue-600" /> Official Signature & Verification Code</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-blue-600" /> Priority Placement Credential</li>
              </ul>
              <div className="w-full">
                <ProTestCheckout category={activeCat.id} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation (matches screenshot) */}
      <FeatureBottomNav />
    </div>
  )
}

