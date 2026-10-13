'use client'

import { useState } from 'react'
import { updatePassword } from '@/app/(auth)/actions'

export default function ResetPasswordForm({ next }: { next: string }) {
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
    <form action={updatePassword} onSubmit={validatePasswords} className="space-y-5">
      <input type="hidden" name="next" value={next} />
      {error && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600" role="alert">{error}</div>}
      <div><label htmlFor="password" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">New password</label><input id="password" name="password" type="password" minLength={8} required className="block w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-white" placeholder="At least 8 characters" /></div>
      <div><label htmlFor="confirmPassword" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Confirm new password</label><input id="confirmPassword" name="confirmPassword" type="password" minLength={8} required className="block w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-white" placeholder="Repeat your password" /></div>
      <button className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-medium text-white hover:bg-blue-700">Update password</button>
    </form>
  )
}
