'use client'

import { useState } from 'react'
import { signup } from '@/app/(auth)/actions'
import { ArrowRight, Mail, Lock, User } from 'lucide-react'

export default function RegisterForm({ next }: { next: string }) {
  const [error, setError] = useState<string | null>(null)

  const validatePasswords = (event: React.FormEvent<HTMLFormElement>) => {
    const form = event.currentTarget
    const password = form.elements.namedItem('password') as HTMLInputElement
    const confirmPassword = form.elements.namedItem('confirmPassword') as HTMLInputElement
    if (password.value !== confirmPassword.value) {
      event.preventDefault()
      setError('Passwords do not match.')
      confirmPassword.focus()
      return
    }
    setError(null)
  }

  return (
    <form className="space-y-5" action={signup} onSubmit={validatePasswords}>
      <input type="hidden" name="next" value={next} />
      {error && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600" role="alert">{error}</div>}
      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
        <div className="relative"><User className="pointer-events-none absolute inset-y-0 left-3 my-auto h-5 w-5 text-gray-400" /><input id="fullName" name="fullName" type="text" required className="block w-full rounded-xl border border-gray-300 bg-white py-3 pl-10 pr-3 text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-white" placeholder="John Doe" /></div>
      </div>
      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
        <div className="relative"><Mail className="pointer-events-none absolute inset-y-0 left-3 my-auto h-5 w-5 text-gray-400" /><input id="email" name="email" type="email" required className="block w-full rounded-xl border border-gray-300 bg-white py-3 pl-10 pr-3 text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-white" placeholder="you@example.com" /></div>
      </div>
      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
        <div className="relative"><Lock className="pointer-events-none absolute inset-y-0 left-3 my-auto h-5 w-5 text-gray-400" /><input id="password" name="password" type="password" minLength={8} required className="block w-full rounded-xl border border-gray-300 bg-white py-3 pl-10 pr-3 text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-white" placeholder="At least 8 characters" /></div>
      </div>
      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Confirm Password</label>
        <div className="relative"><Lock className="pointer-events-none absolute inset-y-0 left-3 my-auto h-5 w-5 text-gray-400" /><input id="confirmPassword" name="confirmPassword" type="password" minLength={8} required className="block w-full rounded-xl border border-gray-300 bg-white py-3 pl-10 pr-3 text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-white" placeholder="Repeat your password" /></div>
      </div>
      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Referral Code <span className="font-normal text-gray-400">(Optional)</span></label>
        <input id="referralCode" name="referralCode" type="text" className="block w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-white" placeholder="e.g. TALENEZIO2024" />
      </div>
      <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-700">
        Create account <ArrowRight className="h-4 w-4" />
      </button>
    </form>
  )
}
