'use client'

import React, { useEffect } from 'react'
import {
  X,
  Calendar,
  MapPin,
  CheckCircle2,
  Briefcase,
  GraduationCap,
  Sparkles,
  PenTool,
  Code2,
  TrendingUp,
  Megaphone,
  Laptop,
  Coins,
  Lightbulb,
  Globe,
  Tag,
  Users,
} from 'lucide-react'
import {
  type InternshipOpportunity,
  type TrainingProgram,
} from '@/lib/internships-training/data'

interface OpportunityDetailsModalProps {
  opportunity: InternshipOpportunity | TrainingProgram | null
  isOpen: boolean
  onClose: () => void
  onApply: (opportunity: InternshipOpportunity | TrainingProgram) => void
}

export function OpportunityDetailsModal({
  opportunity,
  isOpen,
  onClose,
  onApply,
}: OpportunityDetailsModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen || !opportunity) return null

  const isInternship = opportunity.type === 'internship'
  const internship = isInternship ? (opportunity as InternshipOpportunity) : null
  const training = !isInternship ? (opportunity as TrainingProgram) : null

  // Render role-specific icon
  const renderIcon = () => {
    const iconType = opportunity.iconType
    switch (iconType) {
      case 'pen':
        return <PenTool className="h-6 w-6 text-purple-600" />
      case 'code':
        return <Code2 className="h-6 w-6 text-emerald-600" />
      case 'chart':
        return <TrendingUp className="h-6 w-6 text-amber-600" />
      case 'megaphone':
        return <Megaphone className="h-6 w-6 text-indigo-600" />
      case 'laptop':
        return <Laptop className="h-6 w-6 text-blue-600" />
      case 'finance':
        return <Coins className="h-6 w-6 text-emerald-600" />
      case 'lightbulb':
        return <Lightbulb className="h-6 w-6 text-rose-600" />
      default:
        return isInternship ? (
          <Briefcase className="h-6 w-6 text-blue-600" />
        ) : (
          <GraduationCap className="h-6 w-6 text-blue-600" />
        )
    }
  }

  // Render themed hero illustration banner for left column
  const renderIllustration = () => {
    if (opportunity.iconType === 'pen' || opportunity.id.includes('design')) {
      return (
        <div className="w-full h-44 rounded-2xl bg-gradient-to-br from-purple-100 via-pink-50 to-indigo-100 p-4 flex items-center justify-center relative overflow-hidden border border-purple-200/60 shadow-inner">
          <div className="absolute -top-6 -right-6 w-24 h-24 bg-purple-200/50 rounded-full blur-xl" />
          <div className="relative text-center">
            <div className="inline-flex p-3 rounded-2xl bg-white/90 shadow-md mb-2">
              <PenTool className="h-10 w-10 text-purple-600" />
            </div>
            <p className="text-xs font-bold text-purple-900 tracking-wide uppercase">Creative & Visual Arts</p>
            <p className="text-[11px] text-purple-700/80">Canva • Digital Branding • Creatives</p>
          </div>
        </div>
      )
    }

    if (opportunity.iconType === 'code' || opportunity.id.includes('web')) {
      return (
        <div className="w-full h-44 rounded-2xl bg-gradient-to-br from-emerald-100 via-teal-50 to-blue-100 p-4 flex items-center justify-center relative overflow-hidden border border-emerald-200/60 shadow-inner">
          <div className="absolute -top-6 -right-6 w-24 h-24 bg-emerald-200/50 rounded-full blur-xl" />
          <div className="relative text-center">
            <div className="inline-flex p-3 rounded-2xl bg-white/90 shadow-md mb-2">
              <Code2 className="h-10 w-10 text-emerald-600" />
            </div>
            <p className="text-xs font-bold text-emerald-900 tracking-wide uppercase">Web Development</p>
            <p className="text-[11px] text-emerald-700/80">HTML5 • CSS3 • JavaScript • Responsive UI</p>
          </div>
        </div>
      )
    }

    if (opportunity.iconType === 'chart' || opportunity.id.includes('business')) {
      return (
        <div className="w-full h-44 rounded-2xl bg-gradient-to-br from-amber-100 via-orange-50 to-yellow-100 p-4 flex items-center justify-center relative overflow-hidden border border-amber-200/60 shadow-inner">
          <div className="absolute -top-6 -right-6 w-24 h-24 bg-amber-200/50 rounded-full blur-xl" />
          <div className="relative text-center">
            <div className="inline-flex p-3 rounded-2xl bg-white/90 shadow-md mb-2">
              <TrendingUp className="h-10 w-10 text-amber-600" />
            </div>
            <p className="text-xs font-bold text-amber-900 tracking-wide uppercase">Business Growth</p>
            <p className="text-[11px] text-amber-700/80">Outreach • Partnerships • Market Expansion</p>
          </div>
        </div>
      )
    }

    if (opportunity.iconType === 'megaphone' || opportunity.id.includes('social')) {
      return (
        <div className="w-full h-44 rounded-2xl bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 p-4 flex items-center justify-center relative overflow-hidden border border-indigo-200/60 shadow-inner">
          <div className="absolute -top-6 -right-6 w-24 h-24 bg-indigo-200/50 rounded-full blur-xl" />
          <div className="relative text-center">
            <div className="inline-flex p-3 rounded-2xl bg-white/90 shadow-md mb-2">
              <Megaphone className="h-10 w-10 text-indigo-600" />
            </div>
            <p className="text-xs font-bold text-indigo-900 tracking-wide uppercase">Social Media & Community</p>
            <p className="text-[11px] text-indigo-700/80">Instagram • LinkedIn • Content Strategy</p>
          </div>
        </div>
      )
    }

    return (
      <div className="w-full h-44 rounded-2xl bg-gradient-to-br from-blue-100 via-sky-50 to-indigo-100 p-4 flex items-center justify-center relative overflow-hidden border border-blue-200/60 shadow-inner">
        <div className="absolute -top-6 -right-6 w-24 h-24 bg-blue-200/50 rounded-full blur-xl" />
        <div className="relative text-center">
          <div className="inline-flex p-3 rounded-2xl bg-white/90 shadow-md mb-2">
            <Laptop className="h-10 w-10 text-blue-600" />
          </div>
          <p className="text-xs font-bold text-blue-900 tracking-wide uppercase">Structured Learning</p>
          <p className="text-[11px] text-blue-700/80">Hands-on Projects • Expert Mentorship</p>
        </div>
      </div>
    )
  }

  const handleApplyClick = () => {
    onClose()
    onApply(opportunity)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative flex flex-col w-full max-w-4xl max-h-[92vh] bg-white rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden dark:bg-slate-900 dark:border-slate-800 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header Bar */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 z-10">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center shadow-sm dark:bg-slate-800 dark:border-slate-700">
              {renderIcon()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                  {opportunity.title}
                </h2>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800">
                  {isInternship ? 'Internship' : 'Training'}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-500 font-medium mt-1 dark:text-slate-400">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" />
                  {opportunity.duration}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-slate-400" />
                  {opportunity.workMode}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {training && (
              <span className="hidden sm:inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200/60 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800">
                {training.fee}
              </span>
            )}
            <button
              type="button"
              onClick={handleApplyClick}
              className="hidden sm:inline-flex items-center justify-center px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm cursor-pointer"
            >
              Apply Now
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800"
              aria-label="Close dialog"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8">
            {/* Left Column: Visual Banner & Key Details */}
            <div className="md:col-span-5 space-y-5">
              {renderIllustration()}

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-4 dark:bg-slate-800/50 dark:border-slate-800">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                  Key Details
                </h3>

                <div className="space-y-3 text-xs">
                  <div className="flex items-start gap-2.5">
                    <Calendar className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-slate-400 font-medium">Duration</p>
                      <p className="font-semibold text-slate-800 dark:text-slate-200">{opportunity.duration}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <MapPin className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-slate-400 font-medium">Work Mode</p>
                      <p className="font-semibold text-slate-800 dark:text-slate-200">{opportunity.workMode}</p>
                    </div>
                  </div>

                  {training && (
                    <div className="flex items-start gap-2.5">
                      <Tag className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-slate-400 font-medium">Program Fee</p>
                        <p className="font-semibold text-blue-700 dark:text-blue-400">{training.fee}</p>
                      </div>
                    </div>
                  )}

                  {training?.whoCanApply && (
                    <div className="flex items-start gap-2.5">
                      <Users className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-slate-400 font-medium">Who Can Apply</p>
                        <p className="font-semibold text-slate-800 dark:text-slate-200">{training.whoCanApply}</p>
                      </div>
                    </div>
                  )}

                  {isInternship && (
                    <div className="flex items-start gap-2.5">
                      <Sparkles className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-slate-400 font-medium">Application Fee</p>
                        <p className="font-semibold text-emerald-600 dark:text-emerald-400">100% Free to Apply</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Complete Original Content */}
            <div className="md:col-span-7 space-y-6">
              {/* About the Opportunity */}
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">
                  About the Opportunity
                </h3>
                <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                  {isInternship ? internship?.aboutRole : training?.aboutTraining}
                </p>
              </div>

              {/* Roles & Responsibilities / What You'll Learn */}
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2.5">
                  {isInternship ? 'Roles & Responsibilities' : 'What You Will Learn'}
                </h3>
                <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                  {(isInternship
                    ? internship?.responsibilities || []
                    : training?.whatYouWillLearn || []
                  ).map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <span className="text-blue-600 font-bold select-none shrink-0">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Requirements / Eligibility */}
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2.5">
                  Requirements
                </h3>
                <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                  {isInternship ? (
                    internship?.requirements.map((req, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <span className="text-blue-600 font-bold select-none shrink-0">•</span>
                        <span>{req}</span>
                      </li>
                    ))
                  ) : (
                    <li className="flex items-start gap-2.5">
                      <span className="text-blue-600 font-bold select-none shrink-0">•</span>
                      <span>{training?.whoCanApply}</span>
                    </li>
                  )}
                </ul>
              </div>

              {/* Benefits with Checkmarks */}
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2.5">
                  Benefits
                </h3>
                <ul className="space-y-2.5 text-sm text-slate-700 dark:text-slate-200">
                  {opportunity.benefits.map((benefit, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Bottom Action Footer Bar */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/70 dark:border-slate-800 dark:bg-slate-900/70 z-10">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 cursor-pointer"
          >
            Close
          </button>
          <button
            type="button"
            onClick={handleApplyClick}
            className="px-6 py-2.5 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 transition-all cursor-pointer"
          >
            Apply Now
          </button>
        </div>
      </div>
    </div>
  )
}

