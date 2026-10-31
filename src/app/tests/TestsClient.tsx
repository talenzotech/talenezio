'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import {
  Code,
  TrendingUp,
  Megaphone,
  Brain,
  GraduationCap,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react'
import FeatureBottomNav from '@/components/FeatureBottomNav'
import ProTestCheckout from '@/components/tests/ProTestCheckout'

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
  const [selectedCategory, setSelectedCategory] = useState('technology')
  const activeCategory = TEST_CATEGORIES.find((category) => category.id === selectedCategory) ?? TEST_CATEGORIES[0]

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
              <button
                type="button"
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                aria-pressed={selectedCategory === category.id}
                className={`group relative flex flex-col justify-between cursor-pointer rounded-3xl border bg-white p-5 text-left sm:p-6 shadow-sm transition-all duration-200 dark:bg-gray-900 ${selectedCategory === category.id ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-gray-200 hover:border-blue-400 dark:border-gray-800 dark:hover:border-blue-500'}`}
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
              </button>
            )
          })}
        </div>

        <section className="mt-8 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900" aria-labelledby="selected-track-title">
          <div className="flex flex-col gap-4 border-b border-gray-100 pb-5 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">Selected Track</span>
              <h3 id="selected-track-title" className="text-2xl font-bold text-gray-900 dark:text-white">{activeCategory.title}</h3>
              <p className="text-sm text-gray-500">{activeCategory.subtitle}</p>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-gray-200 bg-gray-50/70 p-5 dark:border-gray-800 dark:bg-gray-950/50">
              <div className="mb-3 flex items-center justify-between">
                <h4 className="font-bold text-gray-900 dark:text-white">Free Assessment</h4>
                <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-[11px] font-bold uppercase text-green-800 dark:bg-green-950 dark:text-green-300">Free</span>
              </div>
              <ul className="mb-5 space-y-2 text-xs text-gray-600 dark:text-gray-400">
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> 20 Random Questions</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> PDF Certificate</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Instant Results &amp; Scoring</li>
              </ul>
              <Link href={`/tests/${activeCategory.id}?type=free`} className="flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-white">
                Start Free Assessment <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="rounded-2xl border border-blue-200 bg-blue-50/40 p-5 dark:border-blue-900/50 dark:bg-blue-950/20">
              <div className="mb-3 flex items-center justify-between">
                <h4 className="font-bold text-blue-900 dark:text-blue-100">Pro Industry Assessment</h4>
                <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-[11px] font-bold uppercase text-blue-800 dark:bg-blue-950 dark:text-blue-300">₹32 / Unlock</span>
              </div>
              <ul className="mb-5 space-y-2 text-xs text-blue-900/80 dark:text-blue-200/80">
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-blue-600" /> 45 Questions (3 Comprehensive Sections)</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-blue-600" /> PDF Certificate</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-blue-600" /> Instant Results &amp; Scoring</li>
              </ul>
              <ProTestCheckout category={activeCategory.id} />
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-3xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-6" aria-labelledby="certificate-preview-title">
          <div className="mb-5">
            <h2 id="certificate-preview-title" className="text-lg font-bold text-gray-900 dark:text-white">Your certificate, at a glance</h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">A preview of the certificate you can earn after completing your assessment.</p>
          </div>
          <figure className="mx-auto max-w-3xl">
            <Image
              src="/talenezio-certificate-blank-template-hd.png"
              alt="Blank Talenezio Certificate of Completion showing the certificate design, with name, topic, score, date, and certificate number left empty."
              width={1536}
              height={1024}
              sizes="(max-width: 639px) calc(100vw - 66px), (max-width: 895px) calc(100vw - 98px), 768px"
              className="h-auto w-full rounded-lg border border-gray-100 bg-white shadow-sm"
            />
            <figcaption className="mt-3 text-center text-xs leading-relaxed text-gray-500 dark:text-gray-400">Your name and assessment details will appear on your issued certificate</figcaption>
          </figure>
        </section>
      </div>

      {/* Bottom Navigation */}
      <FeatureBottomNav />
    </div>
  )
}
