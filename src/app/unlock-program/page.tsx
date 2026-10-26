'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, GraduationCap, Unlock } from 'lucide-react'
import FeatureBottomNav from '@/components/FeatureBottomNav'

export default function UnlockProgramPage() {
  const [feature, setFeature] = useState<'skill_test_pro' | 'linkedin_optimization'>('linkedin_optimization')
  const destination = feature === 'skill_test_pro'
    ? '/tests?type=pro'
    : '/unlock-program/linkedin-optimization'

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 pb-12 text-slate-900 sm:px-6 sm:py-12 sm:pb-16">
      <div className="mx-auto max-w-3xl space-y-5">
        <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <span className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-amber-900">
            <Unlock className="h-3.5 w-3.5" /> Free Access Pathway
          </span>
          <span className="ml-2 text-sm text-slate-500">Access follows manual approval</span>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">How to Get Features for Free</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
            Choose one feature. Complete its steps and submit eight screenshots as proof. Your selected feature stays locked until your request is reviewed and approved.
          </p>
        </header>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-800">Choose one feature to unlock for free:</h2>
          <div role="radiogroup" aria-label="Feature to unlock" className="mt-4 space-y-3">
            <FeatureOption
              selected={feature === 'skill_test_pro'}
              title="1. Paid Test (₹32 Value)"
              description="Premium skill assessment with ten skill-specific questions and scored results."
              icon={<GraduationCap className="h-4 w-4 text-blue-700" />}
              onSelect={() => setFeature('skill_test_pro')}
            />
            <FeatureOption
              selected={feature === 'linkedin_optimization'}
              title="2. LinkedIn Optimization (₹499 Value)"
              description="Submit the requested sharing proof for review by the Talenzo team."
              icon={<span className="text-sm font-black text-blue-700">in</span>}
              onSelect={() => setFeature('linkedin_optimization')}
            />
          </div>

          <Link
            href={destination}
            className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          >
            {feature === 'skill_test_pro' ? 'Continue to Skill Tests' : 'Continue to LinkedIn proof submission'}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </section>
      </div>

      <FeatureBottomNav />
    </main>
  )
}

function FeatureOption({
  selected,
  title,
  description,
  icon,
  onSelect,
}: {
  selected: boolean
  title: string
  description: string
  icon: React.ReactNode
  onSelect: () => void
}) {
  return (
    <label
      className={`flex w-full cursor-pointer items-start gap-3 rounded-xl border-2 p-4 text-left transition-colors focus-within:ring-2 focus-within:ring-blue-500 ${selected ? 'border-blue-600 bg-blue-50/60' : 'border-slate-200 bg-white hover:border-slate-300'}`}
    >
      <input
        type="radio"
        name="unlock-feature"
        checked={selected}
        onChange={onSelect}
        className="sr-only"
      />
      <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${selected ? 'border-blue-600' : 'border-slate-400'}`}>
        {selected && <span className="h-2.5 w-2.5 rounded-full bg-blue-600" />}
      </span>
      {icon}
      <span>
        <span className="block text-sm font-semibold text-slate-900">{title}</span>
        <span className="mt-1 block text-sm leading-5 text-slate-500">{description}</span>
      </span>
    </label>
  )
}
