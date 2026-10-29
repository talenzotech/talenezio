'use client'

import React from 'react'
import {
  Calendar,
  Home,
  ArrowRight,
  PenTool,
  Code2,
  TrendingUp,
  Megaphone,
  Briefcase,
} from 'lucide-react'
import { type InternshipOpportunity } from '@/lib/internships-training/data'

interface InternshipCardProps {
  internship: InternshipOpportunity
  onViewDetails: (internship: InternshipOpportunity) => void
  onApply: (internship: InternshipOpportunity) => void
}

export function InternshipCard({
  internship,
  onViewDetails,
  onApply,
}: InternshipCardProps) {
  const renderIcon = () => {
    switch (internship.iconType) {
      case 'pen':
        return <PenTool className="h-5 w-5 text-purple-600" />
      case 'code':
        return <Code2 className="h-5 w-5 text-emerald-600" />
      case 'chart':
        return <TrendingUp className="h-5 w-5 text-amber-600" />
      case 'megaphone':
        return <Megaphone className="h-5 w-5 text-indigo-600" />
      default:
        return <Briefcase className="h-5 w-5 text-blue-600" />
    }
  }

  const getIconContainerStyle = () => {
    switch (internship.colorScheme) {
      case 'purple':
        return 'bg-purple-50 text-purple-600 border border-purple-100 dark:bg-purple-950/40 dark:border-purple-800'
      case 'emerald':
        return 'bg-emerald-50 text-emerald-600 border border-emerald-100 dark:bg-emerald-950/40 dark:border-emerald-800'
      case 'amber':
        return 'bg-amber-50 text-amber-600 border border-amber-100 dark:bg-amber-950/40 dark:border-amber-800'
      case 'indigo':
        return 'bg-indigo-50 text-indigo-600 border border-indigo-100 dark:bg-indigo-950/40 dark:border-indigo-800'
      default:
        return 'bg-blue-50 text-blue-600 border border-blue-100 dark:bg-blue-950/40 dark:border-blue-800'
    }
  }

  const getTagStyle = () => {
    switch (internship.colorScheme) {
      case 'purple':
        return 'bg-purple-50 text-purple-700 border border-purple-200/60 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800'
      case 'emerald':
        return 'bg-emerald-50 text-emerald-700 border border-emerald-200/60 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800'
      case 'amber':
        return 'bg-amber-50 text-amber-700 border border-amber-200/60 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800'
      case 'indigo':
        return 'bg-indigo-50 text-indigo-700 border border-indigo-200/60 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-800'
      default:
        return 'bg-blue-50 text-blue-700 border border-blue-200/60 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800'
    }
  }

  return (
    <article className="group flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-6 shadow-[0_2px_14px_rgba(0,0,0,0.03)] hover:shadow-lg hover:border-slate-300 transition-all duration-200 dark:border-slate-800 dark:bg-slate-900 h-full">
      <div>
        {/* Card Header: Icon + Title + Meta + Arrow */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3.5">
            <div
              className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${getIconContainerStyle()}`}
            >
              {renderIcon()}
            </div>
            <div>
              <h3 className="font-bold text-slate-950 dark:text-white text-base sm:text-lg leading-snug">
                {internship.title}
              </h3>
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" />
                  Duration: {internship.duration}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Home className="h-3.5 w-3.5 text-slate-400" />
                  Work Mode: {internship.workMode}
                </span>
              </div>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-slate-500 transition-colors shrink-0 mt-1" />
        </div>

        {/* Short Description */}
        <p className="mt-4 text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed min-h-[38px]">
          {internship.shortDescription}
        </p>
      </div>

      {/* Card Bottom: Tags on Left, Buttons on Right */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-5 mt-4 border-t border-slate-100 dark:border-slate-800">
        <div className="flex flex-wrap gap-1.5">
          {internship.tags.map((tag) => (
            <span
              key={tag}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium ${getTagStyle()}`}
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => onViewDetails(internship)}
            className="px-3.5 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            View Details
          </button>
          <button
            type="button"
            onClick={() => onApply(internship)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-colors cursor-pointer shadow-sm shadow-blue-500/20"
          >
            <span>Apply Now</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </article>
  )
}
