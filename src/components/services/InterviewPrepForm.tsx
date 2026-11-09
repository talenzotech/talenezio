'use client'

import React, { useState, useRef } from 'react'
import {
  UploadCloud,
  FileText,
  Trash2,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Phone,
  Mail,
  User,
} from 'lucide-react'
import {
  INTERVIEW_PREP_BATCHES,
  isValidPhoneNumber,
  isValidResumeFile,
  type InterviewPrepBatch,
} from '@/lib/interview-prep/batches'

interface InterviewPrepFormProps {
  onSuccess?: () => void
  userProfile?: {
    fullName?: string
    email?: string
  }
  isModal?: boolean
}

export function InterviewPrepForm({
  onSuccess,
  userProfile,
}: InterviewPrepFormProps) {
  const [fullName, setFullName] = useState(userProfile?.fullName || '')
  const [email, setEmail] = useState(userProfile?.email || '')
  const [phone, setPhone] = useState('')
  const [selectedBatch, setSelectedBatch] = useState<InterviewPrepBatch>('23 November to 30 November')
  const [domain, setDomain] = useState('Software Engineering')
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage(null)
    const file = e.target.files?.[0]
    if (!file) return

    const validation = isValidResumeFile({ name: file.name, size: file.size })
    if (!validation.valid) {
      setErrorMessage(validation.error || 'Invalid file')
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }

    setResumeFile(file)
  }

  const handleRemoveFile = () => {
    setResumeFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    const trimmedName = fullName.trim()
    const trimmedEmail = email.trim()
    const trimmedPhone = phone.trim()

    if (!trimmedName || trimmedName.length < 2) {
      setErrorMessage('Please enter your full name (at least 2 characters).')
      return
    }

    if (!trimmedEmail || !trimmedEmail.includes('@') || !trimmedEmail.includes('.')) {
      setErrorMessage('Please enter a valid email address.')
      return
    }

    if (!trimmedPhone || !isValidPhoneNumber(trimmedPhone)) {
      setErrorMessage('Please enter a valid contact number (at least 10 digits).')
      return
    }

    if (!selectedBatch) {
      setErrorMessage('Please select one of the available batches.')
      return
    }

    if (!resumeFile) {
      setErrorMessage('Resume upload is mandatory. Please upload your resume in PDF or DOCX format.')
      return
    }

    setIsSubmitting(true)

    try {
      const formData = new FormData()
      formData.append('fullName', trimmedName)
      formData.append('email', trimmedEmail)
      formData.append('phone', trimmedPhone)
      formData.append('batch', selectedBatch)
      formData.append('domain', domain)
      formData.append('resume', resumeFile)

      const response = await fetch('/api/interview-prep/apply', {
        method: 'POST',
        body: formData,
      })

      let data: Record<string, unknown> = {}
      try {
        const text = await response.text()
        data = text ? JSON.parse(text) : {}
      } catch {
        data = {}
      }

      if (!response.ok) {
        setErrorMessage(
          typeof data.error === 'string'
            ? data.error
            : 'Failed to submit application. Please try again.'
        )
        setIsSubmitting(false)
        return
      }

      setIsSuccess(true)
      setIsSubmitting(false)
      onSuccess?.()
    } catch (err) {
      console.error('Submission error:', err)
      setErrorMessage('A network error occurred. Please try again.')
      setIsSubmitting(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  if (isSuccess) {
    return (
      <div className="py-8 text-center animate-in zoom-in-95 duration-200">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
          <CheckCircle2 className="h-10 w-10 stroke-[2.5]" />
        </div>
        <h3 className="text-2xl font-bold text-gray-950 dark:text-white">
          Application Submitted Successfully!
        </h3>
        <p className="mx-auto mt-2 max-w-md text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
          Thank you, <span className="font-semibold text-gray-900 dark:text-gray-200">{fullName}</span>!
          Your application and resume have been received. Our team will review your profile and reach out to you shortly.
        </p>
        <div className="mx-auto mt-4 max-w-md rounded-2xl border border-purple-100 bg-purple-50/50 p-4 text-left text-xs text-purple-900 dark:border-purple-900/40 dark:bg-purple-950/30 dark:text-purple-200">
          <p className="font-semibold mb-1">Confirmed Details:</p>
          <p>• <strong>Batch Selected:</strong> {selectedBatch}</p>
          <p>• <strong>Track:</strong> {domain}</p>
          <p>• <strong>Contact:</strong> {phone}</p>
          <p>• <strong>Email:</strong> {email}</p>
          <p>• <strong>Resume Attachment:</strong> {resumeFile?.name}</p>
        </div>
        <p className="mx-auto mt-4 max-w-md text-xs text-gray-500 dark:text-gray-400">
          Our mentors will review your resume and reach out at <span className="font-semibold">{email}</span>.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errorMessage && (
        <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300 animate-in fade-in">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* SECTION: BATCH SELECTION (Prominent & Clear) */}
      <div className="space-y-2.5 rounded-2xl border-2 border-purple-200 bg-purple-50/40 p-4 dark:border-purple-900/40 dark:bg-purple-950/20 sm:p-5">
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-purple-900 dark:text-purple-200">
            <Calendar className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            <span>Select Your Batch <span className="text-purple-600">*</span></span>
          </label>
          <span className="text-[11px] font-semibold text-purple-700 dark:text-purple-300">
            8-Day Intensive Program
          </span>
        </div>
        <p className="text-xs text-gray-600 dark:text-gray-400">
          Choose the cohort schedule that fits your availability:
        </p>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 pt-1">
          {INTERVIEW_PREP_BATCHES.map((batchOption) => {
            const isSelected = selectedBatch === batchOption
            return (
              <button
                key={batchOption}
                type="button"
                onClick={() => setSelectedBatch(batchOption)}
                className={`relative flex flex-col items-start p-4 rounded-xl border-2 text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'border-purple-600 bg-white ring-4 ring-purple-600/10 shadow-md dark:border-purple-500 dark:bg-gray-900'
                    : 'border-gray-200 bg-white hover:border-purple-300 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-gray-700'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span
                    className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                      isSelected
                        ? 'border-purple-600 bg-purple-600'
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    {isSelected && <span className="h-2 w-2 rounded-full bg-white" />}
                  </span>
                  {batchOption === '23 November to 30 November' && (
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-700 bg-purple-100 dark:bg-purple-900/60 dark:text-purple-300 px-2 py-0.5 rounded-full">
                      Next Cohort
                    </span>
                  )}
                </div>
                <div className="mt-2.5 text-sm font-bold text-gray-950 dark:text-white">
                  {batchOption}
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Daily live sessions & mocks
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* SECTION: PERSONAL & CONTACT DETAILS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label
            htmlFor="prep-form-full-name"
            className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300"
          >
            Full Name <span className="text-purple-600">*</span>
          </label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              id="prep-form-full-name"
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Rahul Sharma"
              className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2.5 pl-10 pr-4 text-sm text-gray-900 outline-none transition-all focus:border-purple-600 focus:bg-white focus:ring-4 focus:ring-purple-600/10 dark:border-gray-800 dark:bg-gray-800/50 dark:text-white dark:focus:border-purple-500 dark:focus:bg-gray-800"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="prep-form-email"
            className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300"
          >
            Email Address <span className="text-purple-600">*</span>
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              id="prep-form-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="rahul@example.com"
              className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2.5 pl-10 pr-4 text-sm text-gray-900 outline-none transition-all focus:border-purple-600 focus:bg-white focus:ring-4 focus:ring-purple-600/10 dark:border-gray-800 dark:bg-gray-800/50 dark:text-white dark:focus:border-purple-500 dark:focus:bg-gray-800"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label
            htmlFor="prep-form-phone"
            className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300"
          >
            Contact Number <span className="text-purple-600">*</span>
          </label>
          <div className="relative">
            <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              id="prep-form-phone"
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. +91 9876543210"
              className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2.5 pl-10 pr-4 text-sm text-gray-900 outline-none transition-all focus:border-purple-600 focus:bg-white focus:ring-4 focus:ring-purple-600/10 dark:border-gray-800 dark:bg-gray-800/50 dark:text-white dark:focus:border-purple-500 dark:focus:bg-gray-800"
            />
          </div>
          <p className="text-[11px] text-gray-500 dark:text-gray-400">
            Mandatory. Required to schedule your 1-on-1 mock sessions.
          </p>
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="prep-form-domain"
            className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300"
          >
            Specialization / Track
          </label>
          <select
            id="prep-form-domain"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3.5 py-2.5 text-sm text-gray-900 outline-none transition-all focus:border-purple-600 focus:bg-white focus:ring-4 focus:ring-purple-600/10 dark:border-gray-800 dark:bg-gray-800/50 dark:text-white dark:focus:border-purple-500 dark:focus:bg-gray-800"
          >
            <option value="Software Engineering">Software Engineering / Full Stack</option>
            <option value="Digital Marketing">Digital Marketing & Growth</option>
            <option value="Finance">Finance, Valuation & Banking</option>
            <option value="Product & Business">Product & Business Development</option>
          </select>
        </div>
      </div>

      {/* SECTION: MANDATORY RESUME UPLOAD */}
      <div className="space-y-2">
        <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
          Upload Resume <span className="text-purple-600">*</span>{' '}
          <span className="font-normal text-gray-500 dark:text-gray-400">(PDF or DOCX, max 5MB)</span>
        </label>

        {!resumeFile ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50/60 p-6 text-center cursor-pointer transition-colors hover:border-purple-500 hover:bg-purple-50/40 dark:border-gray-800 dark:bg-gray-800/40 dark:hover:border-purple-500"
          >
            <UploadCloud className="h-10 w-10 text-purple-600 mb-2" />
            <p className="text-sm font-bold text-gray-800 dark:text-gray-200">
              Click to upload your resume
            </p>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Supported formats: PDF or DOCX (max 5MB)
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.doc,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        ) : (
          <div className="flex items-center justify-between rounded-2xl border border-purple-200 bg-purple-50/70 p-4 dark:border-purple-900/50 dark:bg-purple-950/30">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-600 text-white">
                <FileText className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-gray-900 dark:text-white">
                  {resumeFile.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {formatFileSize(resumeFile.size)} • Ready to attach
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleRemoveFile}
              className="ml-3 rounded-lg p-2 text-gray-400 hover:bg-white hover:text-red-600 dark:hover:bg-gray-800 transition-colors"
              title="Remove file"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>



      <div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-purple-600 py-4 text-sm font-bold text-white shadow-lg shadow-purple-600/25 hover:bg-purple-700 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Sending Resume & Registering for {selectedBatch}...</span>
            </>
          ) : (
            <span>Submit Application ({selectedBatch})</span>
          )}
        </button>
      </div>
    </form>
  )
}

