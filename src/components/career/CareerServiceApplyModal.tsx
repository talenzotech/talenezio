'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  X,
  Sparkles,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Lock,
  ArrowRight,
  User,
  Briefcase,
  Target,
  Phone,
  Calendar,
  Clock,
  Globe,
} from 'lucide-react'
import {
  isValidPhoneNumber,
  isValidLinkedInUrl,
  isValidBookingDate,
  BOOKING_TIME_SLOTS,
} from '@/lib/career/validation'
import { InterviewPrepApplyModal } from '@/components/services/InterviewPrepApplyModal'

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => {
      open: () => void
      on?: (event: string, callback: (response: any) => void) => void
    }
  }
}

export interface CareerServiceInfo {
  id: string
  title: string
  serviceName: 'Career Guidance' | 'LinkedIn Optimization' | 'Interview Preparation' | string
  price: string
  productCode: string
  tagline?: string
}

interface CareerServiceApplyModalProps {
  service: CareerServiceInfo | null
  isOpen: boolean
  onClose: () => void
  userProfile?: {
    fullName?: string
    email?: string
  }
}

export function CareerServiceApplyModal({
  service,
  isOpen,
  onClose,
  userProfile,
}: CareerServiceApplyModalProps) {
  const router = useRouter()
  const [fullName, setFullName] = useState(userProfile?.fullName || '')
  const [phone, setPhone] = useState('')
  const [careerDetails, setCareerDetails] = useState('')
  const [areaOfInterest, setAreaOfInterest] = useState('')
  const [bookingDate, setBookingDate] = useState('')
  const [bookingSlot, setBookingSlot] = useState<string>(BOOKING_TIME_SLOTS[0])
  const [linkedinUrl, setLinkedinUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)

  const isCareerGuidance = Boolean(
    service &&
    (service.id === 'career-guidance' ||
      service.serviceName.toLowerCase().includes('guidance') ||
      service.productCode === 'career:career-guidance')
  )

  const isLinkedInOptimization = Boolean(
    service &&
    (service.id === 'linkedin-optimization' ||
      service.serviceName.toLowerCase().includes('linkedin') ||
      service.productCode === 'career:linkedin-optimization')
  )

  // Compute minimum booking date (tomorrow) and maximum (30 days from now)
  const tomorrowStr = React.useMemo(() => {
    const d = new Date()
    d.setDate(d.getDate() + 1)
    return d.toISOString().split('T')[0]
  }, [])

  const maxDateStr = React.useMemo(() => {
    const d = new Date()
    d.setDate(d.getDate() + 30)
    return d.toISOString().split('T')[0]
  }, [])

  useEffect(() => {
    if (userProfile?.fullName && !fullName) {
      setFullName(userProfile.fullName)
    }
  }, [userProfile?.fullName, fullName])

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
      setErrorMessage(null)
      setIsSuccess(false)
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen || !service) return null

  if (
    service.id === 'interview-prep' ||
    service.serviceName === 'Interview Preparation' ||
    service.productCode === 'career:interview-prep' ||
    service.title?.toLowerCase().includes('interview')
  ) {
    return (
      <InterviewPrepApplyModal
        isOpen={isOpen}
        onClose={onClose}
        userProfile={userProfile}
      />
    )
  }

  const loadRazorpay = async () => {
    if (window.Razorpay) return

    await new Promise<void>((resolve, reject) => {
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.onload = () => resolve()
      script.onerror = () => reject(new Error('Could not load payment gateway checkout'))
      document.body.appendChild(script)
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    const trimmedName = fullName.trim()
    const trimmedPhone = phone.trim()
    const trimmedCareerDetails = careerDetails.trim()
    const trimmedAreaOfInterest = areaOfInterest.trim()
    const trimmedLinkedinUrl = linkedinUrl.trim()

    if (!trimmedName || trimmedName.length < 2) {
      setErrorMessage('Please enter your full name (at least 2 characters).')
      return
    }

    if (!trimmedPhone) {
      setErrorMessage('Contact number is required.')
      return
    }

    const phoneValidation = isValidPhoneNumber(trimmedPhone)
    if (!phoneValidation.valid) {
      setErrorMessage(phoneValidation.error || 'Please enter a valid contact number.')
      return
    }

    if (!trimmedCareerDetails || trimmedCareerDetails.length < 2) {
      setErrorMessage('Please provide your career details (e.g., current education, role, or background).')
      return
    }

    if (!trimmedAreaOfInterest || trimmedAreaOfInterest.length < 2) {
      setErrorMessage('Please provide your area of interest (e.g., Software Engineering, Product, Marketing).')
      return
    }

    // Career Guidance (1:1) specific validation: mandatory booking date
    let formattedBookingDate: string | undefined
    if (isCareerGuidance) {
      if (!bookingDate) {
        setErrorMessage('Please select a convenient date for your 1-on-1 session.')
        return
      }
      const dateValidation = isValidBookingDate(bookingDate)
      if (!dateValidation.valid) {
        setErrorMessage(dateValidation.error || 'Please choose a valid upcoming date.')
        return
      }
      formattedBookingDate = `${bookingDate} (${bookingSlot})`
    }

    // LinkedIn Optimization specific validation: mandatory LinkedIn Profile URL
    let normalizedLinkedInUrl: string | undefined
    if (isLinkedInOptimization) {
      if (!trimmedLinkedinUrl) {
        setErrorMessage('Please enter your LinkedIn profile URL.')
        return
      }
      const linkedInValidation = isValidLinkedInUrl(trimmedLinkedinUrl)
      if (!linkedInValidation.valid) {
        setErrorMessage(linkedInValidation.error || 'Please enter a valid LinkedIn profile URL.')
        return
      }
      normalizedLinkedInUrl = linkedInValidation.normalized
    }

    setIsLoading(true)

    try {
      // 1. Submit registration and initialize payment order
      const response = await fetch('/api/payments/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productCode: service.productCode,
          applicantDetails: {
            fullName: trimmedName,
            name: trimmedName,
            phone: phoneValidation.normalized || trimmedPhone,
            contactNumber: phoneValidation.normalized || trimmedPhone,
            careerDetails: trimmedCareerDetails,
            areaOfInterest: trimmedAreaOfInterest,
            serviceName: service.serviceName,
            email: userProfile?.email,
            bookingDate: formattedBookingDate,
            selectedBookingDate: formattedBookingDate,
            scheduledFor: bookingDate ? new Date(bookingDate).toISOString() : undefined,
            linkedinUrl: normalizedLinkedInUrl || trimmedLinkedinUrl,
          },
        }),
      })

      if (response.status === 401) {
        router.push('/login?next=/career')
        return
      }

      let order: Record<string, any> = {}
      try {
        const text = await response.text()
        order = text ? JSON.parse(text) : {}
      } catch {
        order = {}
      }

      if (!response.ok) {
        throw new Error(
          order.error ||
            (response.status >= 500
              ? 'Payment service is temporarily unavailable. Please try again later.'
              : 'Failed to initiate application.')
        )
      }

      // If user is eligible for free access entitlement
      if (order.freeAccess) {
        setIsSuccess(true)
        setTimeout(() => {
          router.push('/dashboard')
        }, 1500)
        return
      }

      // 2. Load Razorpay script
      await loadRazorpay()

      // 3. Launch Razorpay payment gateway
      const checkout = new window.Razorpay({
        key: order.keyId,
        order_id: order.orderId,
        amount: order.amount,
        currency: order.currency || 'INR',
        name: 'Talenezio',
        description: `${service.title} Registration`,
        prefill: {
          name: trimmedName,
          email: userProfile?.email || undefined,
          contact: phoneValidation.normalized || trimmedPhone,
        },
        handler: async (paymentResult: Record<string, string>) => {
          try {
            const verifyRes = await fetch('/api/payments/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(paymentResult),
            })

            let verifyData: Record<string, any> = {}
            try {
              const text = await verifyRes.text()
              verifyData = text ? JSON.parse(text) : {}
            } catch {
              verifyData = {}
            }

            if (!verifyRes.ok) {
              setErrorMessage(verifyData.error || 'Payment verification could not be completed.')
              setIsLoading(false)
              return
            }

            setIsSuccess(true)
            setTimeout(() => {
              router.push('/dashboard')
            }, 1800)
          } catch (verifyErr) {
            setErrorMessage('Network error while verifying payment. Please refresh or contact support.')
            setIsLoading(false)
          }
        },
        modal: {
          ondismiss: () => {
            setIsLoading(false)
            setErrorMessage('Payment was cancelled. Your details are saved and you can retry whenever you are ready.')
            void fetch('/api/payments/failed', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ orderId: order.orderId, status: 'cancelled' }),
            }).catch(() => null)
          },
        },
      })

      checkout.on?.('payment.failed', (failedRes: any) => {
        setIsLoading(false)
        const desc = failedRes?.error?.description || failedRes?.error?.reason || 'Payment failed. Please try another payment method or retry.'
        setErrorMessage(desc)
        void fetch('/api/payments/failed', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: failedRes?.error?.metadata?.order_id || order.orderId,
            status: 'failed',
            code: failedRes?.error?.code,
            description: failedRes?.error?.description,
            reason: failedRes?.error?.reason,
          }),
        }).catch(() => null)
      })

      checkout.open()
    } catch (err: any) {
      setErrorMessage(err.message || 'Something went wrong. Please try again.')
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="career-modal-title"
      >
        {/* Header Banner */}
        <div className="relative bg-gradient-to-r from-blue-600 to-indigo-700 px-6 sm:px-8 py-6 text-white shrink-0">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/20 text-xs font-semibold backdrop-blur-sm text-blue-50">
              <Sparkles className="w-3.5 h-3.5" />
              Service Registration
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-emerald-500/30 text-emerald-100 text-xs font-bold border border-emerald-400/30">
              {service.price}
            </span>
          </div>

          <h2 id="career-modal-title" className="text-2xl font-bold tracking-tight text-white">
            {service.title}
          </h2>
          <p className="text-blue-100 text-xs mt-1">
            {isCareerGuidance
              ? 'Enter your details and choose your preferred date for a 1-on-1 session.'
              : isLinkedInOptimization
              ? 'Provide your profile URL and career background for branding optimization.'
              : 'Complete the form below to register and proceed to secure checkout.'}
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 overflow-y-auto">
          {isSuccess ? (
            <div className="py-8 text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Application Submitted Successfully!
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 max-w-sm mx-auto leading-relaxed">
                Your application for <strong>{service.title}</strong> has been submitted successfully. Our team will review your details and reach out to you shortly.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="mt-4 px-6 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 transition-colors shadow-md"
              >
                Done
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMessage && (
                <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-2xl text-red-700 dark:text-red-300 text-sm">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Full Name & Contact Number */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-blue-600" />
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-blue-600" />
                    Contact Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                  />
                </div>
              </div>

              {/* LinkedIn URL (for LinkedIn Optimization) */}
              {isLinkedInOptimization && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-blue-600" />
                    LinkedIn Profile URL <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="url"
                    required
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                    placeholder="https://www.linkedin.com/in/yourprofile"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Enter your public profile URL (e.g., https://linkedin.com/in/username).
                  </p>
                </div>
              )}

              {/* Booking Section: Convenient Date & Time Slot (for Career Guidance 1:1) */}
              {isCareerGuidance && (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 dark:border-emerald-900/50 dark:bg-emerald-950/20 p-4 space-y-3">
                  <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-xs uppercase tracking-wider">
                    <Calendar className="w-4 h-4 text-emerald-600" />
                    <span>Booking Section: Choose Date &amp; Time Slot</span>
                    <span className="text-red-500">*</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                        Select Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        required
                        min={tomorrowStr}
                        max={maxDateStr}
                        value={bookingDate}
                        onChange={(e) => setBookingDate(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-emerald-600" />
                        Preferred Time Slot
                      </label>
                      <select
                        value={bookingSlot}
                        onChange={(e) => setBookingSlot(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      >
                        {BOOKING_TIME_SLOTS.map((slot) => (
                          <option key={slot} value={slot}>
                            {slot}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
                    Sessions are conducted 1-on-1 via Google Meet. Link will be shared upon booking confirmation.
                  </p>
                </div>
              )}

              {/* Area of Interest */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-blue-600" />
                  Area of Interest <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={areaOfInterest}
                  onChange={(e) => setAreaOfInterest(e.target.value)}
                  placeholder="e.g. Software Engineering, Digital Marketing, AI/ML, Product"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                />
              </div>

              {/* Career Details */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-blue-600" />
                  Career Details <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={2}
                  value={careerDetails}
                  onChange={(e) => setCareerDetails(e.target.value)}
                  placeholder="e.g. Final year B.Tech student / Working as Frontend Developer (1 yr exp) / Looking to transition to Product"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm resize-none"
                />
              </div>

              {/* Security Note */}
              <div className="rounded-xl bg-blue-50 dark:bg-blue-950/30 p-3 border border-blue-100 dark:border-blue-900/40 text-xs text-blue-800 dark:text-blue-200 flex items-center gap-2">
                <Lock className="w-4 h-4 text-blue-600 shrink-0" />
                <span>
                  Your application details and contact number are securely encrypted and reviewed by our admissions team.
                </span>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col-reverse sm:flex-row items-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isLoading}
                  className="w-full sm:w-auto px-5 py-3 rounded-xl border border-gray-200 dark:border-gray-700 font-semibold text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full sm:flex-1 py-3 px-6 rounded-xl font-bold text-sm text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Confirming &amp; Opening Payment Gateway...</span>
                    </>
                  ) : (
                    <>
                      <span>Proceed to Payment ({service.price})</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}


