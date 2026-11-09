'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowRight,
  CheckCircle2,
  Lock,
  Loader2,
  AlertCircle,
  User,
  Briefcase,
  Target,
  Sparkles,
  Phone,
  Globe,
} from 'lucide-react'
import { isValidPhoneNumber, isValidLinkedInUrl } from '@/lib/career/validation'
import type { PaymentApiResponse, PaymentOrderResponse, RazorpayPaymentFailure } from '@/lib/payments/client-types'

interface LinkedInOptimizationRegistrationProps {
  userProfile?: {
    fullName?: string
    email?: string
  }
}

export function LinkedInOptimizationRegistration({
  userProfile,
}: LinkedInOptimizationRegistrationProps) {
  const router = useRouter()
  const [fullName, setFullName] = useState(userProfile?.fullName || '')
  const [phone, setPhone] = useState('')
  const [linkedinUrl, setLinkedinUrl] = useState('')
  const [careerDetails, setCareerDetails] = useState('')
  const [areaOfInterest, setAreaOfInterest] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)

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
    const trimmedLinkedin = linkedinUrl.trim()
    const trimmedCareerDetails = careerDetails.trim()
    const trimmedAreaOfInterest = areaOfInterest.trim()

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

    if (!trimmedLinkedin) {
      setErrorMessage('LinkedIn profile URL is required.')
      return
    }

    const linkedInValidation = isValidLinkedInUrl(trimmedLinkedin)
    if (!linkedInValidation.valid) {
      setErrorMessage(linkedInValidation.error || 'Please enter a valid LinkedIn profile URL.')
      return
    }

    if (!trimmedCareerDetails || trimmedCareerDetails.length < 2) {
      setErrorMessage('Please provide your career details (e.g., current education, role, or background).')
      return
    }

    if (!trimmedAreaOfInterest || trimmedAreaOfInterest.length < 2) {
      setErrorMessage('Please provide your area of interest (e.g., target industry, domain, or skills).')
      return
    }

    setIsLoading(true)

    try {
      // 1. Submit registration and initialize payment order
      const response = await fetch('/api/payments/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productCode: 'career:linkedin-optimization',
          applicantDetails: {
            fullName: trimmedName,
            name: trimmedName,
            phone: phoneValidation.normalized || trimmedPhone,
            contactNumber: phoneValidation.normalized || trimmedPhone,
            linkedinUrl: linkedInValidation.normalized || trimmedLinkedin,
            careerDetails: trimmedCareerDetails,
            areaOfInterest: trimmedAreaOfInterest,
            serviceName: 'LinkedIn Optimization',
            email: userProfile?.email,
          },
        }),
      })

      if (response.status === 401) {
        router.push('/login?next=/services/linkedin-optimization')
        return
      }

       let order: PaymentOrderResponse = {}
      try {
        const text = await response.text()
         order = (text ? JSON.parse(text) : {}) as PaymentOrderResponse
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

      // If user has an approved free unlock entitlement
      if (order.freeAccess) {
        setIsSuccess(true)
        setTimeout(() => {
          router.push('/dashboard')
        }, 1500)
        return
      }

      // 2. Load Razorpay script
      await loadRazorpay()

      // 3. Launch Razorpay payment gateway for ₹499
      const checkout = new window.Razorpay({
        key: order.keyId,
        order_id: order.orderId,
        amount: order.amount,
        currency: order.currency || 'INR',
        name: 'Talenezio',
        description: 'LinkedIn Optimization Registration',
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

             let verifyData: PaymentApiResponse = {}
            try {
              const text = await verifyRes.text()
               verifyData = (text ? JSON.parse(text) : {}) as PaymentApiResponse
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
           } catch {
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

       checkout.on?.('payment.failed', (failedRes: RazorpayPaymentFailure) => {
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
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
      setIsLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="rounded-3xl border border-gray-200 bg-white p-7 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-10">
        {/* Header */}
        <div className="mb-8 border-b border-gray-100 pb-6 dark:border-gray-800">
          <div className="flex items-center justify-between gap-3 mb-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
              <Sparkles className="h-3.5 w-3.5" />
              Pro Career Service
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-bold">
              ₹499
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            LinkedIn Optimization
          </h1>
          <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">
            Complete your registration details to proceed to secure checkout.
          </p>
        </div>

        {isSuccess ? (
          <div className="py-12 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Application Submitted Successfully!
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 max-w-md mx-auto leading-relaxed">
              Your application for <strong>LinkedIn Optimization</strong> has been submitted successfully. Our team will review your profile and reach out to you shortly.
            </p>
            <button
              type="button"
              onClick={() => router.push('/dashboard')}
              className="mt-6 px-8 py-3 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 transition-colors shadow-md"
            >
              Return to Dashboard
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {errorMessage && (
              <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-2xl text-red-700 dark:text-red-300 text-sm">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Full Name & Contact Number */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1.5">
                  <User className="w-4 h-4 text-blue-600" />
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full px-4 py-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1.5">
                  <Phone className="w-4 h-4 text-blue-600" />
                  Contact Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-4 py-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                />
              </div>
            </div>

            {/* LinkedIn Profile URL */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-blue-600" />
                LinkedIn Profile URL <span className="text-red-500">*</span>
              </label>
              <input
                type="url"
                required
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                placeholder="https://www.linkedin.com/in/yourprofile"
                className="w-full px-4 py-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
              />
              <p className="mt-1.5 text-xs text-gray-400">
                Enter your current public LinkedIn profile URL (e.g., https://www.linkedin.com/in/username).
              </p>
            </div>

            {/* Career Details */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1.5">
                <Briefcase className="w-4 h-4 text-blue-600" />
                Career Details <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                rows={3}
                value={careerDetails}
                onChange={(e) => setCareerDetails(e.target.value)}
                placeholder="e.g. Final year B.Tech student / Working as Frontend Developer (2 yrs exp) / Looking to transition into Product Management"
                className="w-full px-4 py-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm resize-none"
              />
              <p className="mt-1.5 text-xs text-gray-400">
                Share your current education, job role, or years of experience.
              </p>
            </div>

            {/* Area of Interest */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1.5">
                <Target className="w-4 h-4 text-blue-600" />
                Target Domain / Area of Interest <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={areaOfInterest}
                onChange={(e) => setAreaOfInterest(e.target.value)}
                placeholder="e.g. Software Engineering, Digital Marketing, AI/ML, Finance"
                className="w-full px-4 py-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
              />
              <p className="mt-1.5 text-xs text-gray-400">
                Mention your targeted industry, roles, or areas where you want your LinkedIn profile positioned.
              </p>
            </div>

            {/* Security Note */}
            <div className="rounded-2xl bg-blue-50 dark:bg-blue-950/30 p-4 border border-blue-100 dark:border-blue-900/40 text-xs text-blue-800 dark:text-blue-200 flex items-start gap-2.5">
              <Lock className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <span>
                Your application details and contact number are securely encrypted and reviewed by our admissions team.
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 px-6 rounded-2xl font-bold text-base text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2.5 disabled:opacity-60 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Confirming &amp; Opening Payment Gateway...</span>
                </>
              ) : (
                <>
                  <span>Proceed to Payment (₹499)</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
