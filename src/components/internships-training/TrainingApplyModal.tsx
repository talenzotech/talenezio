'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  X,
  GraduationCap,
  Sparkles,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  CreditCard,
} from 'lucide-react'
import { type TrainingProgram } from '@/lib/internships-training/data'

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open: () => void }
  }
}

interface TrainingApplyModalProps {
  program: TrainingProgram | null
  isOpen: boolean
  onClose: () => void
  userProfile?: {
    fullName?: string
    collegeName?: string
  }
}

export function TrainingApplyModal({
  program,
  isOpen,
  onClose,
  userProfile,
}: TrainingApplyModalProps) {
  const router = useRouter()
  const [name, setName] = useState(userProfile?.fullName || '')
  const [city, setCity] = useState('')
  const [collegeOrCompany, setCollegeOrCompany] = useState(
    userProfile?.collegeName || ''
  )
  const [age, setAge] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)

  if (!isOpen || !program) return null

  const loadRazorpay = async () => {
    if (window.Razorpay) return

    await new Promise<void>((resolve, reject) => {
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.onload = () => resolve()
      script.onerror = () => reject(new Error('Could not load payment gateway'))
      document.body.appendChild(script)
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    const trimmedName = name.trim()
    const trimmedCity = city.trim()
    const trimmedCollegeOrCompany = collegeOrCompany.trim()
    const parsedAge = parseInt(age, 10)

    // Form Validation as requested in prompt
    if (!trimmedName || trimmedName.length < 2) {
      setErrorMessage('Please enter your full name.')
      return
    }

    if (!trimmedCity || trimmedCity.length < 2) {
      setErrorMessage('Please enter your city.')
      return
    }

    if (!trimmedCollegeOrCompany) {
      setErrorMessage('Please enter your College Name or Company Name.')
      return
    }

    if (isNaN(parsedAge) || parsedAge < 15 || parsedAge > 90) {
      setErrorMessage('Please enter a valid age (between 15 and 90).')
      return
    }

    setIsLoading(true)

    try {
      // 1. Create order and store applicant details
      const response = await fetch('/api/payments/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productCode: program.productCode,
          applicantDetails: {
            name: trimmedName,
            city: trimmedCity,
            collegeOrCompany: trimmedCollegeOrCompany,
            age: parsedAge,
            programTitle: program.title,
            fee: program.fee,
          },
        }),
      })

      if (response.status === 401) {
        router.push('/login?next=/services')
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
              : 'Failed to initiate application payment.')
        )
      }

      // 2. Load Razorpay script
      await loadRazorpay()

      // 3. Open Razorpay payment gateway
      const checkout = new window.Razorpay({
        key: order.keyId,
        order_id: order.orderId,
        amount: order.amount,
        currency: order.currency || 'INR',
        name: 'Talenezio',
        description: `${program.title} (${program.duration})`,
        prefill: {
          name: trimmedName,
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
            setIsLoading(false)
          } catch {
            setErrorMessage('Unable to verify payment signature. Please contact support.')
            setIsLoading(false)
          }
        },
        modal: {
          ondismiss: () => {
            setIsLoading(false)
          },
        },
        theme: {
          color: '#2563EB',
        },
      })

      checkout.open()
    } catch (err: unknown) {
      console.error('Payment checkout error:', err)
      const message = err instanceof Error ? err.message : 'Unable to connect to payment gateway.'
      setErrorMessage(message)
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (isLoading) return
    setIsSuccess(false)
    setErrorMessage(null)
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="training-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isLoading) {
          handleClose()
        }
      }}
    >
      <div className="relative w-full max-w-xl max-h-[92vh] flex flex-col rounded-3xl border border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-900 overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-gray-100 px-6 py-5 dark:border-gray-800 sm:px-8">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300">
                <Sparkles className="h-3.5 w-3.5" />
                Training Program Enrolment
              </span>
              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                {program.fee}
              </span>
            </div>
            <h2
              id="training-modal-title"
              className="mt-2 text-xl font-bold tracking-tight text-gray-950 dark:text-white sm:text-2xl"
            >
              Apply for {program.title}
            </h2>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={isLoading}
            className="rounded-xl p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300 transition-colors disabled:opacity-50"
            aria-label="Close dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6 sm:px-8">
          {isSuccess ? (
            <div className="py-8 text-center animate-in zoom-in-95 duration-200">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                <CheckCircle2 className="h-10 w-10 stroke-[2.5]" />
              </div>
              <h3 className="text-2xl font-bold text-gray-950 dark:text-white">
                Enrolment Confirmed!
              </h3>
              <p className="mx-auto mt-2 max-w-md text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Thank you for enrolling in the{' '}
                <span className="font-semibold text-gray-900 dark:text-gray-200">
                  {program.title}
                </span>. Your payment was successful and your cohort details will be shared with you shortly.
              </p>

              <div className="mt-8 flex justify-center gap-3">
                <button
                  type="button"
                  onClick={() => router.push('/dashboard')}
                  className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-8 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all"
                >
                  Go to Dashboard
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Program Summary Mini Banner */}
              <div className="flex items-center justify-between rounded-2xl border border-gray-100 bg-gray-50/80 p-4 dark:border-gray-800 dark:bg-gray-800/50">
                <div>
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                    Selected Program
                  </p>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">
                    {program.title}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {program.duration} • {program.workMode}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                    Program Fee
                  </p>
                  <p className="text-lg font-black text-blue-600 dark:text-blue-400">
                    {program.fee}
                  </p>
                </div>
              </div>

              {errorMessage && (
                <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300 animate-in fade-in">
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Form Fields required by prompt: Name, City, College Name / Company Name, Age */}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label
                    htmlFor="training-name"
                    className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300"
                  >
                    Name <span className="text-blue-600">*</span>
                  </label>
                  <input
                    id="training-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800/50 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label
                      htmlFor="training-city"
                      className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300"
                    >
                      City <span className="text-blue-600">*</span>
                    </label>
                    <input
                      id="training-city"
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Mumbai, Bengaluru, Delhi"
                      className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800/50 dark:text-white"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label
                      htmlFor="training-age"
                      className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300"
                    >
                      Age <span className="text-blue-600">*</span>
                    </label>
                    <input
                      id="training-age"
                      type="number"
                      required
                      min={15}
                      max={90}
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      placeholder="e.g. 21"
                      className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800/50 dark:text-white"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="training-college-company"
                    className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300"
                  >
                    College Name / Company Name <span className="text-blue-600">*</span>
                  </label>
                  <input
                    id="training-college-company"
                    type="text"
                    required
                    value={collegeOrCompany}
                    onChange={(e) => setCollegeOrCompany(e.target.value)}
                    placeholder="Enter your College Name or Current Organization"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800/50 dark:text-white"
                  />
                </div>
              </div>

              {/* Payment Info Callout */}
              <div className="flex items-center gap-3 rounded-xl border border-blue-100 bg-blue-50/60 p-3.5 text-xs text-blue-800 dark:border-blue-900/40 dark:bg-blue-950/30 dark:text-blue-300">
                <ShieldCheck className="h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" />
                <span>
                  After clicking proceed, you will be redirected to the secure Razorpay payment gateway to pay{' '}
                  <strong className="font-bold">{program.fee}</strong>.
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isLoading}
                  className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Connecting Gateway...</span>
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4" />
                      <span>Proceed to Payment ({program.fee.split(' ')[0]})</span>
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

