'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Briefcase, Compass, FileText, GraduationCap, Home, Video } from 'lucide-react'

const navigationItems = [
  { label: 'Home', href: '/dashboard', path: '/dashboard', icon: Home },
  { label: 'Skill Tests', href: '/tests', path: '/tests', icon: GraduationCap },
  { label: 'Resume', href: '/resume-builder', path: '/resume-builder', icon: FileText },
  { label: 'Career', href: '/career', path: '/career', icon: Compass },
  { label: 'Interview', href: '/services/interview-prep', path: '/services/interview-prep', icon: Video },
  { label: 'Internships', href: '/services', path: '/services', icon: Briefcase },
]

export default function FeatureBottomNav() {
  const pathname = usePathname()

  return (
    <nav aria-label="Main navigation" className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_20px_rgba(0,0,0,0.05)] backdrop-blur dark:border-gray-800 dark:bg-gray-900/95">
      <div className="mx-auto grid max-w-xl grid-cols-6 py-2 px-1">
        {navigationItems.map(({ label, href, path, icon: Icon }) => {
          const active = path === '/dashboard'
            ? pathname === '/dashboard'
            : pathname === path || (path !== '/' && pathname.startsWith(`${path}/`))

          return (
            <Link
              key={label}
              href={href}
              aria-current={active ? 'page' : undefined}
              className={`relative flex min-h-12 flex-col items-center justify-center gap-1 px-0.5 text-center transition-colors ${
                active ? 'text-blue-600 dark:text-blue-400 font-semibold' : 'text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              <div className="relative">
                <Icon className="h-5 w-5" aria-hidden="true" />
                {active && (
                  <span className="absolute -top-1 -right-1 h-1.5 w-1.5 rounded-full bg-blue-600 dark:bg-blue-400" />
                )}
              </div>
              <span className="text-[10px] sm:text-[11px] leading-tight font-medium truncate max-w-full">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
