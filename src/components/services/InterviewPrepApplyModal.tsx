'use client'

import React, { useEffect } from 'react'
import { X, Video } from 'lucide-react'
import { InterviewPrepForm } from './InterviewPrepForm'

interface InterviewPrepApplyModalProps {
  isOpen: boolean
  onClose: () => void
  userProfile?: {
    fullName?: string
    email?: string
  }
}

export function InterviewPrepApplyModal({
  isOpen,
  onClose,
  userProfile,
}: InterviewPrepApplyModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="interview-prep-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose()
        }
      }}
    >
      <div className="relative w-full max-w-xl max-h-[92vh] flex flex-col rounded-3xl border border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-900 overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-gray-100 px-6 py-5 dark:border-gray-800 sm:px-8">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-50 px-2.5 py-1 text-xs font-bold text-purple-700 dark:bg-purple-950/50 dark:text-purple-300">
                <Video className="h-3.5 w-3.5" />
                Interview Preparation Program
              </span>
              <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                8 Days Intensive
              </span>
            </div>
            <h2
              id="interview-prep-modal-title"
              className="mt-2 text-xl font-bold tracking-tight text-gray-950 dark:text-white sm:text-2xl"
            >
              Apply for Interview Preparation
            </h2>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Select your batch, enter contact number, and upload your resume.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300 transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6 sm:px-8">
          <InterviewPrepForm userProfile={userProfile} isModal={true} />
        </div>
      </div>
    </div>
  )
}
