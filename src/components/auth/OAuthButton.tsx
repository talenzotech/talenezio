'use client'

import { useFormStatus } from 'react-dom'
import { Loader2 } from 'lucide-react'

interface OAuthButtonProps {
  label: string
  icon: React.ReactNode
}

export function OAuthButton({ label, icon }: OAuthButtonProps) {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      aria-disabled={pending}
      className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl shadow-sm bg-white dark:bg-gray-900 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {pending ? (
        <>
          <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
          <span>Redirecting to {label}...</span>
        </>
      ) : (
        <>
          {icon}
          <span>{label}</span>
        </>
      )}
    </button>
  )
}
