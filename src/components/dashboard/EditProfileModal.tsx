'use client'

import React, { useState, useEffect } from 'react'
import {
  X,
  User,
  GraduationCap,
  Briefcase,
  Sparkles,
  Check,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react'
import {
  type ProfileData,
  type ExperienceLevel,
  VALID_EXPERIENCES,
  AVAILABLE_INTERESTS,
  updateUserProfile,
} from '@/app/dashboard/actions'

interface EditProfileModalProps {
  isOpen: boolean
  onClose: () => void
  initialData: ProfileData & { email?: string; avatarUrl?: string | null }
  onProfileUpdated: (updated: ProfileData) => void
}

export function EditProfileModal({
  isOpen,
  onClose,
  initialData,
  onProfileUpdated,
}: EditProfileModalProps) {
  const [fullName, setFullName] = useState(initialData.fullName || '')
  const [collegeName, setCollegeName] = useState(initialData.collegeName || '')
  const [experience, setExperience] = useState<ExperienceLevel>(
    initialData.experience || 'Fresher'
  )
  const [interests, setInterests] = useState<string[]>(
    initialData.interests || []
  )
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Reset values when modal opens or initialData changes
  useEffect(() => {
    if (isOpen) {
      setFullName(initialData.fullName || '')
      setCollegeName(initialData.collegeName || '')
      setExperience(initialData.experience || 'Fresher')
      setInterests(initialData.interests || [])
      setErrorMessage(null)
      setSuccessMessage(null)
      setIsSubmitting(false)
    }
  }, [isOpen, initialData])

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSubmitting) {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, isSubmitting, onClose])

  if (!isOpen) return null

  const toggleInterest = (interest: string) => {
    setErrorMessage(null)
    setInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((item) => item !== interest)
        : [...prev, interest]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)
    setSuccessMessage(null)

    const trimmedName = fullName.trim()
    const trimmedCollege = collegeName.trim()

    // Validation
    if (!trimmedName || trimmedName.length < 2) {
      setErrorMessage('Full name is required (minimum 2 characters).')
      return
    }

    if (!VALID_EXPERIENCES.includes(experience)) {
      setErrorMessage('Please select a valid experience level.')
      return
    }

    if (interests.length === 0) {
      setErrorMessage('Please select at least one career interest.')
      return
    }

    setIsSubmitting(true)

    try {
      const result = await updateUserProfile({
        fullName: trimmedName,
        collegeName: trimmedCollege,
        experience,
        interests,
      })

      if (!result.success || !result.profile) {
        setErrorMessage(result.error || 'Failed to save changes. Please try again.')
        setIsSubmitting(false)
        return
      }

      setSuccessMessage('Profile changes saved successfully!')
      onProfileUpdated(result.profile)

      // Automatically close modal after brief delay
      setTimeout(() => {
        setIsSubmitting(false)
        onClose()
      }, 700)
    } catch {
      setErrorMessage('An unexpected error occurred. Please try again.')
      setIsSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-profile-title"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) {
          onClose()
        }
      }}
    >
      <div className="relative w-full max-w-lg max-h-[90vh] flex flex-col rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-2xl shadow-blue-900/10 dark:shadow-black/60 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 px-6 py-5 sm:px-7">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
              <User className="h-5 w-5" />
            </div>
            <div>
              <h2
                id="edit-profile-title"
                className="text-lg font-bold text-gray-900 dark:text-white"
              >
                Edit Profile
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Update your personal and academic details
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-xl p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300 transition-colors disabled:opacity-50"
            aria-label="Close dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-6 sm:px-7 space-y-5">
          {/* Status Banners */}
          {errorMessage && (
            <div className="flex items-center gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3.5 text-sm font-medium text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300 animate-in fade-in">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="flex items-center gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-sm font-medium text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300 animate-in fade-in">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Full Name */}
          <div className="space-y-1.5">
            <label
              htmlFor="profile-full-name"
              className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300"
            >
              Full Name <span className="text-blue-600">*</span>
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                <User className="h-4 w-4" />
              </div>
              <input
                id="profile-full-name"
                type="text"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value)
                  setErrorMessage(null)
                }}
                placeholder="Enter your full name"
                required
                className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 pl-10 pr-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>
          </div>

          {/* College Name */}
          <div className="space-y-1.5">
            <label
              htmlFor="profile-college-name"
              className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300"
            >
              College / University Name
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                <GraduationCap className="h-4 w-4" />
              </div>
              <input
                id="profile-college-name"
                type="text"
                value={collegeName}
                onChange={(e) => {
                  setCollegeName(e.target.value)
                  setErrorMessage(null)
                }}
                placeholder="e.g. Stanford University or Delhi University"
                className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 pl-10 pr-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>
          </div>

          {/* Experience */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
              Experience Level <span className="text-blue-600">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {VALID_EXPERIENCES.map((option) => {
                const isSelected = experience === option
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => {
                      setExperience(option)
                      setErrorMessage(null)
                    }}
                    className={`flex items-center gap-2.5 rounded-xl border p-3 text-left transition-all ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50/70 text-blue-700 dark:border-blue-500 dark:bg-blue-950/40 dark:text-blue-300 shadow-sm'
                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/40 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <div
                      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-colors ${
                        isSelected
                          ? 'border-blue-600 bg-blue-600 text-white dark:border-blue-400 dark:bg-blue-400 dark:text-gray-950'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}
                    >
                      {isSelected && <div className="h-1.5 w-1.5 rounded-full bg-white dark:bg-gray-950" />}
                    </div>
                    <span className="text-xs font-semibold leading-tight">
                      {option}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Interests */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                Interests <span className="text-blue-600">*</span>
              </label>
              <span className="text-xs text-gray-400">
                Select all that apply
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_INTERESTS.map((interest) => {
                const isSelected = interests.includes(interest)
                return (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => toggleInterest(interest)}
                    className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
                      isSelected
                        ? 'border border-blue-500 bg-blue-600 text-white shadow-sm shadow-blue-500/20 dark:bg-blue-600'
                        : 'border border-gray-200 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:border-blue-200 dark:hover:border-blue-800 hover:bg-blue-50/40'
                    }`}
                  >
                    {isSelected && <Check className="h-3.5 w-3.5 stroke-[2.5]" />}
                    <span>{interest}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100 dark:border-gray-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-xl border border-gray-200 dark:border-gray-700 px-4 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save Changes</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
