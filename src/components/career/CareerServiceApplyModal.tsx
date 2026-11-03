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
} from 'lucide-react'

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open: () => void }
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
  const [careerDetails, setCareerDetails] = useState('')
  const [areaOfInterest, setAreaOfInterest] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)

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
    const trimmedCareerDetails = careerDetails.trim()
    const trimmedAreaOfInterest = areaOfInterest.trim()

    if (!trimmedName || trimmedName.length < 2) {
      setErrorMessage('Please enter your full name (at least 2 characters).')
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
            careerDetails: trimmedCareerDetails,
            areaOfInterest: trimmedAreaOfInterest,
            serviceName: service.serviceName,
            email: userProfile?.email,
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
          },
        },
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
            Complete the form below to register and proceed to secure checkout.
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
                Registration Successful!
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 max-w-sm mx-auto">
                Your registration for <strong>{service.title}</strong> has been confirmed. Redirecting to your dashboard...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {errorMessage && (
                <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-2xl text-red-700 dark:text-red-300 text-sm">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Full Name */}
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
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
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
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm resize-none"
                />
              </div>

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
                  placeholder="e.g. Software Engineering, Digital Marketing, AI/ML, Finance"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                />
              </div>

              {/* Summary Note */}
              <div className="rounded-xl bg-blue-50 dark:bg-blue-950/30 p-3.5 border border-blue-100 dark:border-blue-900/40 text-xs text-blue-800 dark:text-blue-200 flex items-center gap-2">
                <Lock className="w-4 h-4 text-blue-600 shrink-0" />
                <span>
                  Your registration details are securely recorded and dispatched to our onboarding team before payment checkout.
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
                      <span>Opening Payment Gateway...</span>
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

