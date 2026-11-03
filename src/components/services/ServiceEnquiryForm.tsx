'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ServiceEnquiryForm({ serviceCode }: { serviceCode: 'courses' | 'internships' }) {
  const router = useRouter()
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    const form = new FormData(event.currentTarget)
    const response = await fetch('/api/services/enquiries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        serviceCode,
        interest: form.get('interest'),
        message: form.get('message'),
      }),
    })
    const result = await response.json()
    if (response.status === 401) {
      router.push('/login?next=/services')
      return
    }
    if (!response.ok) {
      setError(result.error || 'Could not submit enquiry')
      return
    }
    setSubmitted(true)
  }

  if (submitted) return <p className="rounded-xl bg-emerald-50 p-4 text-sm font-medium text-emerald-700">Thanks. Your enquiry has been received.</p>

  return (
    <form onSubmit={submit} className="space-y-3">
      <input name="interest" required placeholder="What are you interested in?" className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm" />
      <textarea name="message" rows={3} placeholder="Add context (optional)" className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm" />
      {error && <p className="text-xs text-red-600" role="alert">{error}</p>}
      <button className="w-full rounded-xl bg-gray-900 px-5 py-3 text-sm font-bold text-white hover:bg-gray-700">Send enquiry</button>
    </form>
  )
}
