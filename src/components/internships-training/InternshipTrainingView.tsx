'use client'

import React, { useState } from 'react'
import {
  Briefcase,
  GraduationCap,
  Sparkles,
} from 'lucide-react'
import {
  INTERNSHIP_OPPORTUNITIES,
  TRAINING_PROGRAMS,
  type InternshipOpportunity,
  type TrainingProgram,
} from '@/lib/internships-training/data'
import { InternshipCard } from './InternshipCard'
import { TrainingCard } from './TrainingCard'
import { OpportunityDetailsModal } from './OpportunityDetailsModal'
import { InternshipApplyModal } from './InternshipApplyModal'
import { TrainingApplyModal } from './TrainingApplyModal'

interface InternshipTrainingViewProps {
  userProfile?: {
    fullName?: string
    email?: string
    collegeName?: string
  }
  defaultTab?: 'internships' | 'training'
}

export function InternshipTrainingView({
  userProfile,
  defaultTab = 'internships',
}: InternshipTrainingViewProps) {
  const [activeTab, setActiveTab] = useState<'internships' | 'training'>(defaultTab)
  const [selectedDetails, setSelectedDetails] = useState<
    InternshipOpportunity | TrainingProgram | null
  >(null)
  const [selectedInternship, setSelectedInternship] =
    useState<InternshipOpportunity | null>(null)
  const [selectedTraining, setSelectedTraining] =
    useState<TrainingProgram | null>(null)

  // Handles clicking "Apply Now" from the details modal or card
  const handleApply = (opportunity: InternshipOpportunity | TrainingProgram) => {
    if (opportunity.type === 'internship') {
      setSelectedInternship(opportunity as InternshipOpportunity)
    } else {
      setSelectedTraining(opportunity as TrainingProgram)
    }
  }

  return (
    <div className="w-full space-y-10">
      {/* Upper Hero Section matching reference image */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8 pt-2">
        <div className="max-w-2xl">
          {/* Badge */}
          <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3.5 py-1 text-xs font-bold text-blue-700 dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-300">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Talent &amp; Growth</span>
          </div>

          {/* Heading */}
          <h1 className="text-3xl sm:text-5xl font-black text-slate-950 dark:text-white tracking-tight leading-[1.12]">
            Internship &amp; Training<br className="hidden sm:inline" /> Opportunities
          </h1>

          {/* Subtitle */}
          <p className="mt-3.5 text-sm sm:text-base text-slate-500 dark:text-slate-400 font-normal leading-relaxed">
            Gain real-world experience, build in-demand skills and take the next step in your career journey. Explore our handpicked internship and training programs.
          </p>
        </div>

        {/* Right side Illustration: Books + Graduation Cap + Learn Practice Grow */}
        <div className="hidden lg:flex items-center gap-4 shrink-0 select-none">
          <svg
            className="w-48 h-36 drop-shadow-sm"
            viewBox="0 0 220 160"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Green Sprout Leaves */}
            <path
              d="M44 95C42 75 56 65 56 65C56 65 63 83 54 98C49 105 45 100 44 95Z"
              fill="#34D399"
              opacity="0.85"
            />
            <path
              d="M176 95C178 75 164 65 164 65C164 65 157 83 166 98C171 105 175 100 176 95Z"
              fill="#34D399"
              opacity="0.85"
            />
            <circle cx="36" cy="52" r="3.5" fill="#60A5FA" opacity="0.6" />
            <circle cx="184" cy="48" r="3" fill="#60A5FA" opacity="0.6" />

            {/* Bottom Book (Purple) */}
            <path d="M55 125L110 142L165 125L110 108L55 125Z" fill="#6366F1" />
            <path
              d="M55 125L55 137L110 154L165 137L165 125L110 142L55 125Z"
              fill="#4F46E5"
            />
            <path
              d="M62 135L110 150L158 135"
              stroke="#E0E7FF"
              strokeWidth="2"
              strokeLinecap="round"
            />

            {/* Top Book (Blue) */}
            <path d="M60 102L110 118L160 102L110 86L60 102Z" fill="#3B82F6" />
            <path
              d="M60 102L60 114L110 130L160 114L160 102L110 118L60 102Z"
              fill="#2563EB"
            />
            <path
              d="M66 112L110 126L154 112"
              stroke="#DBEAFE"
              strokeWidth="2"
              strokeLinecap="round"
            />

            {/* Mortarboard Skull Base */}
            <ellipse cx="110" cy="74" rx="28" ry="12" fill="#1E293B" />

            {/* Mortarboard Diamond Board */}
            <path d="M110 32L174 58L110 84L46 58L110 32Z" fill="#0F172A" />
            <path d="M110 35L168 58L110 81L52 58L110 35Z" fill="#1E293B" />
            <circle cx="110" cy="58" r="4" fill="#334155" />

            {/* Tassel */}
            <path
              d="M110 58C126 60 145 70 148 85"
              stroke="#F59E0B"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <circle cx="149" cy="88" r="3" fill="#D97706" />
          </svg>

          {/* Learn Practice Grow Typography */}
          <div className="flex flex-col text-blue-600 font-bold tracking-tight italic select-none">
            <span className="text-blue-500 text-lg">Learn</span>
            <span className="text-blue-600 text-xl font-extrabold ml-2">Practice</span>
            <span className="text-blue-700 text-2xl font-black ml-4">Grow</span>
            <svg
              className="w-16 h-3 text-blue-500 ml-4 -mt-0.5"
              viewBox="0 0 60 12"
              fill="none"
            >
              <path
                d="M2 9C16 2 42 2 58 8"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Tabs Row (Only Internship Opportunities and Training Programs - no All Opportunities) */}
      <div className="flex items-center gap-3 pt-2">
        <button
          type="button"
          onClick={() => setActiveTab('internships')}
          className={`inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === 'internships'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-800'
          }`}
        >
          <Briefcase className="h-4 w-4" />
          <span>Internship Opportunities</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[11px] font-extrabold ${
              activeTab === 'internships'
                ? 'bg-blue-700 text-white'
                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            {INTERNSHIP_OPPORTUNITIES.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('training')}
          className={`inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === 'training'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-800'
          }`}
        >
          <GraduationCap className="h-4 w-4" />
          <span>Training Programs</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[11px] font-extrabold ${
              activeTab === 'training'
                ? 'bg-blue-700 text-white'
                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            {TRAINING_PROGRAMS.length}
          </span>
        </button>
      </div>

      {/* Section 1: Internship Opportunities (2-Column Grid) */}
      {activeTab === 'internships' && (
        <section className="space-y-6 pt-2">
          {/* Section Header without View All */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm shrink-0">
              <Briefcase className="h-4.5 w-4.5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-950 dark:text-white tracking-tight">
                Internship Opportunities ({INTERNSHIP_OPPORTUNITIES.length})
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-normal mt-0.5">
                Work on real projects, gain hands-on experience and build your professional network.
              </p>
            </div>
          </div>

          {/* 2-Column Grid (2 cards per row) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {INTERNSHIP_OPPORTUNITIES.map((internship) => (
              <InternshipCard
                key={internship.id}
                internship={internship}
                onViewDetails={(item) => setSelectedDetails(item)}
                onApply={(item) => setSelectedInternship(item)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Section 2: Training Programs (3 on row 1, 2 on row 2) */}
      {activeTab === 'training' && (
        <section className="space-y-6 pt-2">
          {/* Section Header without View All */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm shrink-0">
              <GraduationCap className="h-4.5 w-4.5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-950 dark:text-white tracking-tight">
                Training Programs ({TRAINING_PROGRAMS.length})
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-normal mt-0.5">
                Develop in-demand industry skills through structured monthly training and hands-on projects.
              </p>
            </div>
          </div>

          {/* 3 cards on row 1, 2 cards on row 2 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
            {TRAINING_PROGRAMS.map((program, idx) => (
              <div
                key={program.id}
                className={idx < 3 ? 'lg:col-span-2' : 'lg:col-span-3'}
              >
                <TrainingCard
                  program={program}
                  onViewDetails={(item) => setSelectedDetails(item)}
                  onApply={(item) => setSelectedTraining(item)}
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 1. Complete Details Modal (Scrollable 2-column popup containing all PDF info) */}
      <OpportunityDetailsModal
        opportunity={selectedDetails}
        isOpen={Boolean(selectedDetails)}
        onClose={() => setSelectedDetails(null)}
        onApply={(opp) => handleApply(opp)}
      />

      {/* 2. Internship Application Flow (Resume Upload Modal) */}
      <InternshipApplyModal
        internship={selectedInternship}
        isOpen={Boolean(selectedInternship)}
        onClose={() => setSelectedInternship(null)}
        userProfile={userProfile}
      />

      {/* 3. Training Application Flow (Registration & Payment Modal) */}
      <TrainingApplyModal
        program={selectedTraining}
        isOpen={Boolean(selectedTraining)}
        onClose={() => setSelectedTraining(null)}
        userProfile={userProfile}
      />
    </div>
  )
}
