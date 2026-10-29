'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  X,
  UploadCloud,
  FileText,
  Trash2,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Briefcase,
} from 'lucide-react'
import { type InternshipOpportunity } from '@/lib/internships-training/data'

interface InternshipApplyModalProps {
  internship: InternshipOpportunity | null
  isOpen: boolean
  onClose: () => void
  userProfile?: {
    fullName?: string
    email?: string
    collegeName?: string
  }
}

export function InternshipApplyModal({
  internship,
  isOpen,
  onClose,
  userProfile,
}: InternshipApplyModalProps) {
  const router = useRouter()
  const [fullName, setFullName] = useState(userProfile?.fullName || '')
  const [email, setEmail] = useState(userProfile?.email || '')
  const [phone, setPhone] = useState('')
  const [college, setCollege] = useState(userProfile?.collegeName || '')
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)

  if (!isOpen || !internship) return null

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage(null)
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('Resume file size must be less than 5MB.')
      return
    }

    const ext = file.name.split('.').pop()?.toLowerCase()
    if (!['pdf', 'doc', 'docx'].includes(ext || '')) {
      setErrorMessage('Please upload a PDF, DOC, or DOCX file.')
      return
    }

    setResumeFile(file)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    if (!fullName.trim() || fullName.trim().length < 2) {
      setErrorMessage('Please enter your full name.')
      return
    }

    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address.')
      return
    }

    if (!phone.trim() || phone.trim().length < 7) {
      setErrorMessage('Please enter a valid phone number.')
      return
    }

    if (!resumeFile) {
      setErrorMessage('Please upload your resume to complete your application.')
      return
    }

    setIsSubmitting(true)

    try {
      const formData = new FormData()
      formData.append('internshipId', internship.id)
      formData.append('internshipTitle', internship.title)
      formData.append('fullName', fullName.trim())
      formData.append('email', email.trim())
      formData.append('phone', phone.trim())
      formData.append('college', college.trim())
      formData.append('resume', resumeFile)

      const response = await fetch('/api/internships/apply', {
        method: 'POST',
        body: formData,
      })

      if (response.status === 401) {
        router.push(`/login?next=/services`)
        return
      }

      let data: Record<string, any> = {}
      try {
        const text = await response.text()
        data = text ? JSON.parse(text) : {}
      } catch {
        data = {}
      }

      if (!response.ok) {
        setErrorMessage(data.error || 'Failed to submit application. Please try again.')
        setIsSubmitting(false)
        return
      }

      setIsSuccess(true)
      setIsSubmitting(false)
    } catch {
      setErrorMessage('A network error occurred. Please try again.')
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (isSubmitting) return
    setIsSuccess(false)
    setErrorMessage(null)
    setResumeFile(null)
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="internship-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) {
          handleClose()
        }
      }}
    >
      <div className="relative w-full max-w-xl max-h-[92vh] flex flex-col rounded-3xl border border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-900 overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-gray-100 px-6 py-5 dark:border-gray-800 sm:px-8">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700 dark:bg-blue-950/50 dark:text-blue-300">
                <Briefcase className="h-3.5 w-3.5" />
                Internship Application
              </span>
              <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                {internship.duration}
              </span>
            </div>
            <h2
              id="internship-modal-title"
              className="mt-2 text-xl font-bold tracking-tight text-gray-950 dark:text-white sm:text-2xl"
            >
              Apply for {internship.title}
            </h2>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
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
                Application Received!
              </h3>
              <p className="mx-auto mt-2 max-w-md text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Thank you for applying for the{' '}
                <span className="font-semibold text-gray-900 dark:text-gray-200">
                  {internship.title}
                </span>{' '}
                position. Our recruiting team will review your resume and contact you at{' '}
                <span className="font-semibold text-blue-600 dark:text-blue-400">
                  {email}
                </span>.
              </p>

              <button
                type="button"
                onClick={handleClose}
                className="mt-8 inline-flex items-center justify-center rounded-xl bg-blue-600 px-8 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all"
              >
                Done
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {errorMessage && (
                <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300 animate-in fade-in">
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Personal Details */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label
                    htmlFor="internship-full-name"
                    className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300"
                  >
                    Full Name <span className="text-blue-600">*</span>
                  </label>
                  <input
                    id="internship-full-name"
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800/50 dark:text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="internship-email"
                    className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300"
                  >
                    Email Address <span className="text-blue-600">*</span>
                  </label>
                  <input
                    id="internship-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.email@example.com"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800/50 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label
                    htmlFor="internship-phone"
                    className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300"
                  >
                    Phone Number <span className="text-blue-600">*</span>
                  </label>
                  <input
                    id="internship-phone"
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800/50 dark:text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="internship-college"
                    className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300"
                  >
                    College / University Name
                  </label>
                  <input
                    id="internship-college"
                    type="text"
                    value={college}
                    onChange={(e) => setCollege(e.target.value)}
                    placeholder="e.g. DTU or IIT"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800/50 dark:text-white"
                  />
                </div>
              </div>

              {/* Resume Upload Section */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                  Upload Resume <span className="text-blue-600">*</span>
                </label>

                {resumeFile ? (
                  <div className="flex items-center justify-between rounded-2xl border border-blue-200 bg-blue-50/60 p-4 dark:border-blue-900/60 dark:bg-blue-950/40">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-950 dark:text-white truncate max-w-[240px] sm:max-w-xs">
                          {resumeFile.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {(resumeFile.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setResumeFile(null)}
                      className="rounded-xl p-2 text-gray-400 hover:bg-white hover:text-red-600 dark:hover:bg-gray-800 transition-colors"
                      title="Remove resume"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <label
                    htmlFor="resume-upload-input"
                    className="group relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50/50 p-6 text-center hover:border-blue-500 hover:bg-blue-50/30 dark:border-gray-700 dark:bg-gray-800/40 dark:hover:border-blue-500 dark:hover:bg-blue-950/20 cursor-pointer transition-all"
                  >
                    <input
                      id="resume-upload-input"
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileChange}
                      className="sr-only"
                    />
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm group-hover:scale-105 dark:bg-gray-800 transition-transform">
                      <UploadCloud className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <p className="mt-3 text-sm font-bold text-gray-900 dark:text-white">
                      Click to upload your resume
                    </p>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      PDF, DOC, or DOCX (Max 5MB)
                    </p>
                  </label>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Submitting Application...</span>
                    </>
                  ) : (
                    <span>Submit Application</span>
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

