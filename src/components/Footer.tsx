'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Mail } from 'lucide-react'

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      width="18"
      height="18"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  )
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      width="18"
      height="18"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  )
}

export function Footer() {
  const pathname = usePathname()

  // Display the footer strictly on the landing page ('/')
  if (pathname !== '/') {
    return null
  }

  return (
    <footer className="w-full border-t border-zinc-200 bg-white py-8 dark:border-zinc-800 dark:bg-black mt-auto">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:px-6 md:flex-row lg:px-8">
        <div className="flex flex-col items-center md:items-start">
          <span className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Talenezio
          </span>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            © {new Date().getFullYear()} Talenezio. All rights reserved.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-6 text-sm text-zinc-600 dark:text-zinc-400">
          <Link
            href="/terms"
            className="transition-colors hover:text-zinc-900 dark:hover:text-zinc-100"
          >
            Terms & Conditions
          </Link>
          <Link
            href="/privacy"
            className="transition-colors hover:text-zinc-900 dark:hover:text-zinc-100"
          >
            Privacy Policy
          </Link>
          <Link
            href="/contact"
            className="transition-colors hover:text-zinc-900 dark:hover:text-zinc-100"
          >
            Contact Us
          </Link>
        </div>

        <div className="flex items-center gap-3 text-zinc-500 dark:text-zinc-400" aria-label="Social Profiles">
          <a
            href="https://www.linkedin.com/company/talenzoofficial/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Talenezio on LinkedIn"
            title="LinkedIn"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 transition-colors hover:text-blue-600 hover:border-blue-300 dark:hover:border-blue-700 shadow-sm touch-manipulation cursor-pointer"
          >
            <LinkedInIcon className="h-5 w-5 pointer-events-none" />
          </a>
          <a
            href="https://www.instagram.com/talenezio?dlrf=ZWVlcXRwNjJjd2xu"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Talenezio on Instagram"
            title="Instagram"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 transition-colors hover:text-pink-600 hover:border-pink-300 dark:hover:border-pink-700 shadow-sm touch-manipulation cursor-pointer"
          >
            <InstagramIcon className="h-5 w-5 pointer-events-none" />
          </a>
          <a
            href="mailto:taleneziocontact@gmail.com"
            aria-label="Email Talenezio"
            title="Email taleneziocontact@gmail.com"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 transition-colors hover:text-blue-600 hover:border-blue-300 dark:hover:border-blue-700 shadow-sm touch-manipulation cursor-pointer"
            onClick={() => {
              if (typeof window !== 'undefined') {
                window.location.href = 'mailto:taleneziocontact@gmail.com';
              }
            }}
          >
            <Mail className="h-5 w-5 pointer-events-none" />
          </a>
        </div>
      </div>
    </footer>
  )
}
