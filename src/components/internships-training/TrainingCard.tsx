'use client'

import React from 'react'
import {
  Calendar,
  Globe,
  ArrowRight,
  Laptop,
  Coins,
  Megaphone,
  Code2,
  Lightbulb,
  GraduationCap,
} from 'lucide-react'
import { type TrainingProgram } from '@/lib/internships-training/data'

interface TrainingCardProps {
  program: TrainingProgram
  onViewDetails: (program: TrainingProgram) => void
  onApply: (program: TrainingProgram) => void
}

export function TrainingCard({
  program,
  onViewDetails,
  onApply,
}: TrainingCardProps) {
  const renderIcon = () => {
    switch (program.iconType) {
      case 'laptop':
        return <Laptop className="h-5 w-5 text-blue-600" />
      case 'finance':
        return <Coins className="h-5 w-5 text-emerald-600" />
      case 'megaphone':
        return <Megaphone className="h-5 w-5 text-purple-600" />
      case 'code':
        return <Code2 className="h-5 w-5 text-sky-600" />
      case 'lightbulb':
        return <Lightbulb className="h-5 w-5 text-rose-600" />
      default:
        return <GraduationCap className="h-5 w-5 text-blue-600" />
    }
  }

  const getIconContainerStyle = () => {
    switch (program.colorScheme) {
      case 'blue':
        return 'bg-blue-50 text-blue-600 border border-blue-100 dark:bg-blue-950/40 dark:border-blue-800'
      case 'emerald':
        return 'bg-emerald-50 text-emerald-600 border border-emerald-100 dark:bg-emerald-950/40 dark:border-emerald-800'
      case 'purple':
        return 'bg-purple-50 text-purple-600 border border-purple-100 dark:bg-purple-950/40 dark:border-purple-800'
      case 'sky':
        return 'bg-sky-50 text-sky-600 border border-sky-100 dark:bg-sky-950/40 dark:border-sky-800'
      case 'rose':
        return 'bg-rose-50 text-rose-600 border border-rose-100 dark:bg-rose-950/40 dark:border-rose-800'
      default:
        return 'bg-blue-50 text-blue-600 border border-blue-100 dark:bg-blue-950/40 dark:border-blue-800'
    }
  }

  // Extract clean price string (e.g. ₹5,000 or ₹4,999)
  const displayPrice = program.fee.split(' ')[0] || program.fee

  return (
    <article className="group flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-6 shadow-[0_2px_14px_rgba(0,0,0,0.03)] hover:shadow-lg hover:border-slate-300 transition-all duration-200 dark:border-slate-800 dark:bg-slate-900 h-full">
      <div>
        {/* Card Header: Icon + Title + Meta + Price Badge */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3.5">
            <div
              className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${getIconContainerStyle()}`}
            >
              {renderIcon()}
            </div>
            <div>
              <h3 className="font-bold text-slate-950 dark:text-white text-base leading-snug">
                {program.title}
              </h3>
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" />
                  Duration: {program.duration}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Globe className="h-3.5 w-3.5 text-slate-400" />
                  Work Mode: {program.workMode}
                </span>
              </div>
            </div>
          </div>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-black bg-blue-50 text-blue-700 border border-blue-200/60 shadow-xs shrink-0 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800">
            {displayPrice}
          </span>
        </div>

        {/* Short Description */}
        <p className="mt-4 text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed min-h-[38px]">
          {program.shortDescription}
        </p>
      </div>

      {/* Card Bottom: Both Buttons */}
      <div className="flex items-center gap-2.5 pt-5 mt-4 border-t border-slate-100 dark:border-slate-800">
        <button
          type="button"
          onClick={() => onViewDetails(program)}
          className="flex-1 py-2.5 px-3 text-xs font-bold rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors text-center cursor-pointer dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
        >
          View Details
        </button>
        <button
          type="button"
          onClick={() => onApply(program)}
          className="inline-flex items-center justify-center gap-1.5 flex-1 py-2.5 px-3 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-colors text-center cursor-pointer shadow-sm shadow-blue-500/20"
        >
          <span>Apply Now</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </article>
  )
}
