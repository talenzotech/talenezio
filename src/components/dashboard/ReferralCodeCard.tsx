'use client'

import { useState } from 'react'

export default function ReferralCodeCard({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)

  async function copyCode() {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1800)
  }

  return (
    <section className="mb-12 rounded-3xl border border-blue-100 bg-blue-50 p-6 shadow-sm dark:border-blue-900/50 dark:bg-blue-950/30">
      <p className="text-sm font-semibold uppercase tracking-wider text-blue-700 dark:text-blue-300">Your referral code</p>
      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-mono text-2xl font-bold tracking-wider text-gray-900 dark:text-white">{code}</p>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">Share this code with someone joining Talenezio.</p>
        </div>
        <button type="button" onClick={copyCode} className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">
          {copied ? 'Copied' : 'Copy code'}
        </button>
      </div>
    </section>
  )
}
