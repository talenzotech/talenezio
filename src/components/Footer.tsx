'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function Footer() {
  const pathname = usePathname()
  // Ensure extra clearance on all screens only for pages with a fixed bottom navigation bar
  const hasBottomNav =
    pathname?.startsWith('/tests') ||
    pathname === '/career' ||
    pathname?.startsWith('/services') ||
    pathname?.startsWith('/unlock-program')

  return (
    <footer
      className={`w-full border-t border-zinc-200 bg-white pt-8 dark:border-zinc-800 dark:bg-black ${
        hasBottomNav ? 'pb-[calc(5rem+env(safe-area-inset-bottom,0px))]' : 'pb-8'
      } mt-auto`}
    >
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
      </div>
    </footer>
  )
}
