'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  CheckCircle2,
  FileText,
  ShieldCheck,
  Sparkles,
  Video,
  Award,
} from 'lucide-react'
import { CareerServiceApplyModal, type CareerServiceInfo } from './CareerServiceApplyModal'

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      width="24"
      height="24"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  )
}

interface ServicePoint {
  primary: string
  subpoints?: string[]
}

interface CareerServiceCardItem extends CareerServiceInfo {
  tagline: string
  priceSubtitle: string
  popular: boolean
  badge: string
  badgeColor: string
  icon: React.ComponentType<{ className?: string }>
  iconColor: string
  accentBorder: string
  description: string
  points: ServicePoint[]
  ctaText: string
  deliveryTime: string
}

interface CareerCardsViewProps {
  userProfile?: {
    fullName?: string
    email?: string
  }
}

export function CareerCardsView({ userProfile }: CareerCardsViewProps) {
  const [selectedService, setSelectedService] = useState<CareerServiceInfo | null>(null)

  const services: CareerServiceCardItem[] = [
    {
      id: 'career-guidance',
      title: 'Career Guidance (1-on-1)',
      serviceName: 'Career Guidance',
      productCode: 'career:career-guidance',
      tagline: 'Resume Review & 1-on-1 Strategy Session',
      price: '₹199',
      priceSubtitle: 'per 2-hour session',
      popular: false,
      badge: 'Resume Review Included',
      badgeColor:
        'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800',
      icon: FileText,
      iconColor: 'bg-emerald-600 text-white',
      accentBorder: 'border-emerald-200 dark:border-emerald-800/60',
      description:
        'Gain absolute clarity on your career trajectory, receive live resume critique from an expert, and walk away with a proven roadmap.',
      points: [
        { primary: 'Resume review.' },
        { primary: 'A 2-hour session.' },
        { primary: 'Personalized career guidance.' },
      ],
      ctaText: 'Book Now',
      deliveryTime: 'Schedule at your preferred time',
    },
    {
      id: 'linkedin-optimization',
      title: 'LinkedIn Optimization',
      serviceName: 'LinkedIn Optimization',
      productCode: 'career:linkedin-optimization',
      tagline: 'Personal Branding & Executive Presence',
      price: '₹499',
      priceSubtitle: 'one-time package',
      popular: false,
      badge: 'Profile Boost',
      badgeColor:
        'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800',
      icon: LinkedInIcon,
      iconColor: 'bg-blue-600 text-white',
      accentBorder: 'border-blue-200 dark:border-blue-800/60',
      description:
        'Transform your LinkedIn profile into a recruiter magnet with tailored visuals and a month of high-engagement content.',
      points: [
        { primary: 'Profile picture (DP) optimization.' },
        { primary: 'LinkedIn banner design.' },
        { primary: 'One month of LinkedIn content, including 20 post ideas.' },
      ],
      ctaText: 'Get Started',
      deliveryTime: '3-5 business days delivery',
    },
    {
      id: 'interview-prep',
      title: 'Interview Preparation',
      serviceName: 'Interview Preparation',
      productCode: 'career:interview-prep',
      tagline: '8-Day Comprehensive Program',
      price: '₹499',
      priceSubtitle: 'complete 8-day program',
      popular: true,
      badge: 'Most Popular',
      badgeColor: 'bg-purple-600 text-white border-transparent',
      icon: Video,
      iconColor: 'bg-purple-600 text-white',
      accentBorder:
        'border-purple-300 dark:border-purple-700 shadow-xl shadow-purple-500/10 ring-2 ring-purple-500/20',
      description:
        'Master technical and behavioral rounds through targeted curriculum and realistic mock interview simulations.',
      points: [
        { primary: 'Available for Software Engineering, Marketing, and Finance.' },
        {
          primary: 'An 8-day preparation program:',
          subpoints: [
            'First 3 days: Interview preparation.',
            'Next 5 days: Mock interviews.',
          ],
        },
      ],
      ctaText: 'Book Now',
      deliveryTime: 'Interactive live cohort sessions',
    },
  ]

  const highlights = [
    {
      icon: ShieldCheck,
      title: 'Verified Industry Mentors',
      desc: 'Learn directly from experienced practitioners who know the current hiring benchmarks.',
    },
    {
      icon: Award,
      title: 'Outcome-Driven Results',
      desc: 'Actionable feedback and customized materials you can put to work immediately.',
    },
    {
      icon: Sparkles,
      title: 'Transparent Pricing',
      desc: 'All-inclusive pricing in INR with no hidden platform fees or recurring surprises.',
    },
  ]

  return (
    <>
      {/* 3 Service Cards Grid */}
      <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => {
          const Icon = service.icon
          return (
            <div
              key={service.id}
              className={`relative flex flex-col justify-between rounded-3xl bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:bg-gray-900 ${
                service.popular
                  ? service.accentBorder
                  : 'border border-gray-200 dark:border-gray-800'
              }`}
            >
              {/* Popular / Feature Pill */}
              <div className="mb-6 flex items-center justify-between">
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl shadow-md ${service.iconColor}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <span className={`rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wider ${service.badgeColor}`}>
                  {service.badge}
                </span>
              </div>

              {/* Service Details */}
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                  {service.title}
                </h2>
                <p className="mt-1 text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  {service.tagline}
                </p>

                {/* Price */}
                <div className="my-6 rounded-2xl bg-gray-50 p-4 dark:bg-gray-800/60">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                      {service.price}
                    </span>
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                      {service.priceSubtitle}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {service.deliveryTime}
                  </p>
                </div>

                <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                  {service.description}
                </p>

                {/* Inclusions / Bullet Points */}
                <div className="my-6 border-t border-gray-100 pt-6 dark:border-gray-800">
                  <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-gray-400">
                    What&apos;s Included:
                  </h3>
                  <ul className="space-y-3.5">
                    {service.points.map((pt, idx) => (
                      <li key={idx} className="text-sm text-gray-700 dark:text-gray-200">
                        <div className="flex items-start gap-2.5">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" />
                          <span className="font-medium">{pt.primary}</span>
                        </div>
                        {pt.subpoints && (
                          <ul className="ml-6 mt-2 space-y-1.5 border-l-2 border-purple-200 pl-3 dark:border-purple-900">
                            {pt.subpoints.map((sub, sIdx) => (
                              <li key={sIdx} className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                • {sub}
                              </li>
                            ))}
                          </ul>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action CTA Button */}
              <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() =>
                    setSelectedService({
                      id: service.id,
                      title: service.title,
                      serviceName: service.serviceName,
                      price: service.price,
                      productCode: service.productCode,
                    })
                  }
                  className={`flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-bold shadow-md transition-all cursor-pointer ${
                    service.popular
                      ? 'bg-purple-600 text-white hover:bg-purple-700 shadow-purple-600/20'
                      : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-600/20'
                  }`}
                >
                  <span>{service.ctaText}</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Free Resume Builder Quick-Access Banner */}
      <div className="mt-12 rounded-3xl bg-gradient-to-r from-emerald-600 to-teal-700 p-8 text-white shadow-xl dark:from-emerald-700 dark:to-teal-900 sm:p-10">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3.5 py-1 text-xs font-semibold backdrop-blur-sm">
              <FileText className="h-3.5 w-3.5" />
              Free Resume Builder
            </div>
            <h3 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
              Need to build or update your resume?
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-emerald-100 sm:text-base">
              Create a professional, ATS-friendly one-page resume directly in your browser. Export instantly to PDF for free.
            </p>
          </div>
          <Link
            href="/resume-builder"
            className="inline-flex shrink-0 items-center gap-2 rounded-2xl bg-white px-6 py-3.5 text-sm font-bold text-emerald-800 shadow-md transition hover:bg-emerald-50"
          >
            <span>Build Resume Free</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Feature Highlights Section */}
      <div className="mt-16 rounded-3xl border border-gray-200 bg-white p-8 dark:border-gray-800 dark:bg-gray-900/60 sm:p-10">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {highlights.map((item, idx) => {
            const ItemIcon = item.icon
            return (
              <div key={idx} className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400">
                  <ItemIcon className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-gray-900 dark:text-white">
                    {item.title}
                  </h4>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {item.desc}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Career Registration Modal */}
      <CareerServiceApplyModal
        service={selectedService}
        isOpen={!!selectedService}
        onClose={() => setSelectedService(null)}
        userProfile={userProfile}
      />
    </>
  )
}

