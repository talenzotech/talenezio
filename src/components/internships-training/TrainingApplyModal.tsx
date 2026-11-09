'use client'

import React, { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  X,
  Sparkles,
  Loader2,
  AlertCircle,
  CheckCircle2,
  UploadCloud,
  FileText,
  Trash2,
  Phone,
  Mail,
  Calendar,
  User,
  Building,
  MapPin,
} from 'lucide-react'
import { type TrainingProgram } from '@/lib/internships-training/data'
import { isValidPhoneNumber, isValidResumeFile } from '@/lib/interview-prep/batches'


interface TrainingApplyModalProps {
  program: TrainingProgram | null
  isOpen: boolean
  onClose: () => void
  userProfile?: {
    fullName?: string
    email?: string
    collegeName?: string
  }
}

const TRAINING_BATCHES = [
  'Upcoming Monthly Cohort (1st of Next Month)',
  'Weekend Intensive Batch (Saturday & Sunday)',
  'Weekday Evening Batch (Mon - Fri, 7 PM - 9 PM)',
]

export function TrainingApplyModal({
  program,
  isOpen,
  onClose,
  userProfile,
}: TrainingApplyModalProps) {
  const router = useRouter()
  const [name, setName] = useState(userProfile?.fullName || '')
  const [email, setEmail] = useState(userProfile?.email || '')
  const [phone, setPhone] = useState('')
  const [city, setCity] = useState('')
  const [collegeOrCompany, setCollegeOrCompany] = useState(userProfile?.collegeName || '')
  const [age, setAge] = useState<string>('')
  const [batch, setBatch] = useState(TRAINING_BATCHES[0])
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!isOpen || !program) return null

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

    const trimmedName = name.trim()
    const trimmedEmail = email.trim()
    const trimmedPhone = phone.trim()
    const trimmedCity = city.trim()
    const trimmedCollegeOrCompany = collegeOrCompany.trim()
    const parsedAge = parseInt(age, 10)

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
      const formData = new FormData()
      formData.append('programTitle', program.title)
      formData.append('productCode', program.productCode)
      formData.append('fee', program.fee)
      formData.append('fullName', trimmedName)
      formData.append('email', trimmedEmail)
      formData.append('phone', trimmedPhone)
      formData.append('city', trimmedCity)
      formData.append('collegeOrCompany', trimmedCollegeOrCompany)
      formData.append('age', String(parsedAge))
      formData.append('batch', batch)
      if (resumeFile) {
        formData.append('resume', resumeFile)
      }

      const response = await fetch('/api/training/apply', {
        method: 'POST',
        body: formData,
      })

      if (response.status === 401) {
        router.push('/login?next=/internships')
        return
      }

      let data: Record<string, unknown> = {}
      try {
        const text = await response.text()
        data = text ? JSON.parse(text) : {}
      } catch {
        data = {}
      }

      if (!response.ok) {
        throw new Error(
          (typeof data.error === 'string' && data.error) ||
            'Failed to submit training application. Please try again.'
        )
      }

      setIsSuccess(true)
      setIsLoading(false)
    } catch (err: unknown) {
      console.error('Training application error:', err)
      const message = err instanceof Error ? err.message : 'Unable to submit training application.'
      setErrorMessage(message)
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (isLoading) return
    setIsSuccess(false)
    setErrorMessage(null)
    setResumeFile(null)
    onClose()
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
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
                Training Program Application
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
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Submit your details to register for the cohort.
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={isLoading}
            className="rounded-xl p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300 transition-colors disabled:opacity-50 cursor-pointer"
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
                Thank you, <span className="font-semibold text-gray-900 dark:text-gray-200">{name}</span>!
                Your application for <span className="font-semibold text-indigo-600 dark:text-indigo-400">{program.title}</span> ({batch}) has been recorded.
              </p>

              <div className="mx-auto mt-4 max-w-md rounded-2xl border border-indigo-100 bg-indigo-50/50 p-4 text-left text-xs text-indigo-900 dark:border-indigo-900/40 dark:bg-indigo-950/30 dark:text-indigo-200">
                <p className="font-semibold mb-1">Application Summary:</p>
                <p>• <strong>Program:</strong> {program.title}</p>
                <p>• <strong>Batch:</strong> {batch}</p>
                <p>• <strong>Contact:</strong> {phone}</p>
                <p>• <strong>Email:</strong> {email}</p>
                <p>• <strong>City:</strong> {city}</p>
                {resumeFile && <p>• <strong>Resume:</strong> {resumeFile.name} (Attached)</p>}
              </div>

              <div className="mt-8 flex justify-center gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-8 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 transition-all cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
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
                  <p className="text-lg font-black text-indigo-600 dark:text-indigo-400">
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

              {/* Batch Selection */}
              <div className="space-y-1.5">
                <label
                  htmlFor="training-batch"
                  className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300"
                >
                  Select Batch <span className="text-indigo-600">*</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <select
                    id="training-batch"
                    value={batch}
                    onChange={(e) => setBatch(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2.5 pl-10 pr-4 text-sm text-gray-900 outline-none transition-all focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-600/10 dark:border-gray-800 dark:bg-gray-800/50 dark:text-white"
                  >
                    {TRAINING_BATCHES.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Personal Details */}
              <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label
                    htmlFor="training-name"
                    className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300"
                  >
                    Full Name <span className="text-indigo-600">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      id="training-name"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Rahul Sharma"
                      className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2.5 pl-10 pr-4 text-sm text-gray-900 outline-none transition-all focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-600/10 dark:border-gray-800 dark:bg-gray-800/50 dark:text-white"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="training-email"
                    className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300"
                  >
                    Email Address <span className="text-indigo-600">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      id="training-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="rahul@example.com"
                      className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2.5 pl-10 pr-4 text-sm text-gray-900 outline-none transition-all focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-600/10 dark:border-gray-800 dark:bg-gray-800/50 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Contact Number & City */}
              <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label
                    htmlFor="training-phone"
                    className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300"
                  >
                    Contact Number <span className="text-indigo-600">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      id="training-phone"
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 9876543210"
                      className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2.5 pl-10 pr-4 text-sm text-gray-900 outline-none transition-all focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-600/10 dark:border-gray-800 dark:bg-gray-800/50 dark:text-white"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="training-city"
                    className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300"
                  >
                    City <span className="text-indigo-600">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      id="training-city"
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Bengaluru, Mumbai"
                      className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2.5 pl-10 pr-4 text-sm text-gray-900 outline-none transition-all focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-600/10 dark:border-gray-800 dark:bg-gray-800/50 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* College/Company & Age */}
              <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
                <div className="space-y-1.5 sm:col-span-2">
                  <label
                    htmlFor="training-college-company"
                    className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300"
                  >
                    College / Current Company <span className="text-indigo-600">*</span>
                  </label>
                  <div className="relative">
                    <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      id="training-college-company"
                      type="text"
                      required
                      value={collegeOrCompany}
                      onChange={(e) => setCollegeOrCompany(e.target.value)}
                      placeholder="e.g. IIT Delhi or Infosys"
                      className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2.5 pl-10 pr-4 text-sm text-gray-900 outline-none transition-all focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-600/10 dark:border-gray-800 dark:bg-gray-800/50 dark:text-white"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="training-age"
                    className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300"
                  >
                    Age <span className="text-indigo-600">*</span>
                  </label>
                  <input
                    id="training-age"
                    type="number"
                    required
                    min={15}
                    max={90}
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="21"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2.5 px-4 text-sm text-gray-900 outline-none transition-all focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-600/10 dark:border-gray-800 dark:bg-gray-800/50 dark:text-white"
                  />
                </div>
              </div>

              {/* Optional Resume Upload */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                  Resume (Optional) <span className="font-normal text-gray-500">(PDF or DOCX, max 5MB)</span>
                </label>

                {!resumeFile ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/50 p-4 text-center cursor-pointer transition-colors hover:border-indigo-500 hover:bg-indigo-50/30 dark:border-gray-800 dark:bg-gray-800/30"
                  >
                    <UploadCloud className="h-6 w-6 text-gray-400 mb-1" />
                    <p className="text-xs font-semibold text-gray-700 dark:text-gray-200">
                      Click to upload resume (Optional)
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.docx,.doc"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-between rounded-xl border border-indigo-200 bg-indigo-50/60 p-3 dark:border-indigo-900/50 dark:bg-indigo-950/30">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <FileText className="h-4 w-4 text-indigo-600 shrink-0" />
                      <p className="truncate text-xs font-semibold text-gray-900 dark:text-white">
                        {resumeFile.name} ({formatFileSize(resumeFile.size)})
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveFile}
                      className="rounded p-1 text-gray-400 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isLoading}
                  className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Submitting Application...</span>
                    </>
                  ) : (
                    <span>Submit Training Application</span>
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
