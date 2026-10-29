'use client'

import React, { useState, useRef, useEffect } from 'react'
import { ChevronDown, User, UserPen, Sparkles } from 'lucide-react'
import { EditProfileModal } from './EditProfileModal'
import { type ProfileData, type ExperienceLevel } from '@/app/dashboard/actions'

export interface DashboardProfileMenuProps {
  initialProfile: {
    fullName: string
    email?: string
    collegeName?: string
    experience?: ExperienceLevel
    interests?: string[]
    avatarUrl?: string | null
  }
}

export function DashboardProfileMenu({ initialProfile }: DashboardProfileMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [profile, setProfile] = useState<ProfileData>({
    fullName: initialProfile.fullName || 'Guest',
    collegeName: initialProfile.collegeName || '',
    experience: initialProfile.experience || 'Fresher',
    interests: initialProfile.interests || [],
  })

  const menuRef = useRef<HTMLDivElement>(null)

  const firstName = profile.fullName.trim().split(' ')[0] || 'User'
  const avatarUrl = initialProfile.avatarUrl || null

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('touchstart', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  const handleProfileUpdated = (updated: ProfileData) => {
    setProfile(updated)
  }

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      {/* Clickable Header User Pill */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="User profile menu"
        className="flex items-center gap-2.5 rounded-xl px-2 py-1.5 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800/80 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
      >
        {avatarUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={avatarUrl}
            alt={profile.fullName}
            className="w-8 h-8 rounded-full border border-gray-200 dark:border-gray-700 shadow-sm object-cover"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-sm shrink-0">
            {firstName.charAt(0).toUpperCase()}
          </div>
        )}

        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          {firstName}
        </span>

        <ChevronDown
          className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-blue-600 dark:text-blue-400' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          role="menu"
          aria-orientation="vertical"
          className="absolute right-0 top-full mt-2 w-64 origin-top-right rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-2 shadow-xl shadow-gray-900/10 dark:shadow-black/50 ring-1 ring-black/5 z-50 animate-in fade-in zoom-in-95 duration-150"
        >
          {/* User Info Header */}
          <div className="px-3 py-2.5">
            <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
              {profile.fullName}
            </p>
            {initialProfile.email && (
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                {initialProfile.email}
              </p>
            )}
            <div className="mt-2 flex items-center gap-1.5">
              <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border border-blue-100 dark:border-blue-900/40">
                {profile.experience}
              </span>
              {profile.collegeName && (
                <span className="truncate text-[11px] text-gray-500 dark:text-gray-400">
                  • {profile.collegeName}
                </span>
              )}
            </div>
          </div>

          <div className="my-1.5 border-t border-gray-100 dark:border-gray-800" />

          {/* Menu Items */}
          <div className="space-y-0.5">
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setIsOpen(false)
                setIsModalOpen(true)
              }}
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 transition-colors hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950/40 dark:hover:text-blue-400 text-left"
            >
              <UserPen className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span>Edit Profile</span>
            </button>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={{
          ...profile,
          email: initialProfile.email,
          avatarUrl,
        }}
        onProfileUpdated={handleProfileUpdated}
      />
    </div>
  )
}
