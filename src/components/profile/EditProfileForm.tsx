'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  User,
  GraduationCap,
  Check,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react'
import { updateUserProfile } from '@/app/dashboard/actions'
import {
  type ProfileData,
  type ExperienceLevel,
  VALID_EXPERIENCES,
  AVAILABLE_INTERESTS,
  validateProfileData,
} from '@/lib/profile/validation'

interface EditProfileFormProps {
  initialProfile: ProfileData & {
    email?: string
    avatarUrl?: string | null
  }
}

export function EditProfileForm({ initialProfile }: EditProfileFormProps) {
  const router = useRouter()
  const [fullName, setFullName] = useState(initialProfile.fullName || '')
  const [collegeName, setCollegeName] = useState(initialProfile.collegeName || '')
  const [experience, setExperience] = useState<ExperienceLevel>(
    initialProfile.experience || 'Fresher'
  )
  const [interests, setInterests] = useState<string[]>(
    initialProfile.interests || []
  )
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

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

    const validation = validateProfileData({
      fullName: trimmedName,
      collegeName: trimmedCollege,
      experience,
      interests,
    })

    if (!validation.isValid) {
      setErrorMessage(validation.error || 'Please fill in all required fields.')
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

      if (!result.success) {
        setErrorMessage(result.error || 'Failed to save changes. Please try again.')
        setIsSubmitting(false)
        return
      }

      setSuccessMessage('Profile updated successfully! Redirecting to dashboard...')

      // Redirect to dashboard after brief delay so user sees confirmation
      setTimeout(() => {
        router.push('/dashboard')
        router.refresh()
      }, 900)
    } catch (err: unknown) {
      console.error('Profile update error:', err)
      const message = err instanceof Error ? err.message : String(err)
      setErrorMessage(message || 'An unexpected error occurred while saving your profile.')
      setIsSubmitting(false)
    }
  }

  const avatarInitial = fullName.trim().charAt(0).toUpperCase() || 'U'

  return (
    <div className="w-full">
      {/* Top Banner Card with User Summary */}
      <div className="mb-6 flex items-center justify-between gap-4 rounded-3xl border border-blue-100 bg-gradient-to-r from-blue-50/80 to-indigo-50/50 p-6 sm:p-7 dark:border-blue-950/40 dark:from-blue-950/30 dark:to-indigo-950/20">
        <div className="flex items-center gap-4">
          {initialProfile.avatarUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={initialProfile.avatarUrl}
              alt={fullName}
              className="h-14 w-14 rounded-2xl border-2 border-white object-cover shadow-sm dark:border-gray-800"
            />
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-white bg-blue-600 text-xl font-bold text-white shadow-sm dark:border-gray-800">
              {avatarInitial}
            </div>
          )}
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-gray-950 dark:text-white">
              Edit Your Profile
            </h1>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {initialProfile.email || 'Manage your personal details and career preferences'}
            </p>
          </div>
        </div>
      </div>

      {/* Main Form Container */}
      <div className="rounded-3xl border border-gray-200 bg-white p-6 sm:p-10 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <form onSubmit={handleSubmit} className="space-y-7">
          {/* Status Messages */}
          {errorMessage && (
            <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300 animate-in fade-in">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300 animate-in fade-in">
              <CheckCircle2 className="h-5 w-5 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Section: Basic Details */}
          <div className="space-y-5">
            <h2 className="text-sm font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Personal Information
            </h2>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {/* Full Name */}
              <div className="space-y-2">
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
                    className="w-full rounded-xl border border-gray-200 bg-gray-50/50 pl-10 pr-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800/50 dark:text-white dark:focus:bg-gray-900 transition-all"
                  />
                </div>
              </div>

              {/* College Name */}
              <div className="space-y-2">
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
                    placeholder="e.g. Delhi Technological University"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50/50 pl-10 pr-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800/50 dark:text-white dark:focus:bg-gray-900 transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100 dark:border-gray-800" />

          {/* Section: Experience Level */}
          <div className="space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Experience Level <span className="text-blue-600">*</span>
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Select the option that best describes your current career stage
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
                    className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition-all ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50/70 text-blue-700 dark:border-blue-500 dark:bg-blue-950/40 dark:text-blue-300 shadow-sm ring-1 ring-blue-500/30'
                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/40 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <div
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors ${
                        isSelected
                          ? 'border-blue-600 bg-blue-600 text-white dark:border-blue-400 dark:bg-blue-400 dark:text-gray-950'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}
                    >
                      {isSelected && (
                        <div className="h-2 w-2 rounded-full bg-white dark:bg-gray-950" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-bold leading-tight">{option}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="border-t border-gray-100 dark:border-gray-800" />

          {/* Section: Career Interests */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <h2 className="text-sm font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                Career Interests <span className="text-blue-600">*</span>
              </h2>
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Select all that apply
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              These help tailor career services and recommendation opportunities for you
            </p>

            <div className="flex flex-wrap gap-2.5 pt-1">
              {AVAILABLE_INTERESTS.map((interest) => {
                const isSelected = interests.includes(interest)
                return (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => toggleInterest(interest)}
                    className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition-all ${
                      isSelected
                        ? 'border border-blue-500 bg-blue-600 text-white shadow-md shadow-blue-500/20 dark:bg-blue-600'
                        : 'border border-gray-200 dark:border-gray-700 bg-gray-50/70 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:border-blue-200 dark:hover:border-blue-800 hover:bg-blue-50/50'
                    }`}
                  >
                    {isSelected && <Check className="h-4 w-4 stroke-[2.5]" />}
                    <span>{interest}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
            <Link
              href="/dashboard"
              className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl border border-gray-200 dark:border-gray-700 px-6 py-3 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-8 py-3 text-sm font-bold text-white shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Saving Changes...</span>
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

