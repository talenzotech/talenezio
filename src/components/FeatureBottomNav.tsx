'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FileText, GraduationCap, Home, Video } from 'lucide-react'

const links = [
  { href: '/dashboard', label: 'Home', Icon: Home },
  { href: '/tests', label: 'Skill Tests', Icon: GraduationCap },
  { href: '/resume-builder', label: 'Resume', Icon: FileText },
  { href: '/services/interview-prep', label: 'Interview', Icon: Video },
]

export default function FeatureBottomNav() {
  const pathname = usePathname()

  return (
    <nav aria-label="Main navigation" className="sticky bottom-0 z-40 border-t border-gray-200 bg-white/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_16px_rgba(15,23,42,0.06)] backdrop-blur">
      <ul className="mx-auto grid max-w-xl grid-cols-4">
        {links.map(({ href, label, Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`)

          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? 'page' : undefined}
                className={`flex min-h-16 flex-col items-center justify-center gap-1 px-1 text-xs font-medium transition-colors ${active ? 'text-blue-700' : 'text-gray-500 hover:text-gray-900'}`}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
                <span>{label}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
