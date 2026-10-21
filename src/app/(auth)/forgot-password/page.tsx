import Link from 'next/link'
import { requestPasswordReset } from '../actions'
import { safeNextPath } from '@/lib/auth/redirect'

export default async function ForgotPasswordPage({
  searchParams,
}: { searchParams?: Promise<{ error?: string; message?: string; next?: string }> }) {
  const params = await searchParams
  const next = safeNextPath(params?.next)

  return (
    <div className="w-full">
      <div className="mb-10 text-center">
        <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">Reset your password</h1>
        <p className="text-gray-500 dark:text-gray-400">Enter your email and we&apos;ll send a secure reset link.</p>
      </div>
      {params?.error && <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600" role="alert">{params.error}</div>}
      {params?.message && <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-600" role="status">{params.message}</div>}
      <form action={requestPasswordReset} className="space-y-5">
        <input type="hidden" name="next" value={next} />
        <div><label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label><input id="email" name="email" type="email" required className="block w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-white" placeholder="you@example.com" /></div>
        <button className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-medium text-white hover:bg-blue-700">Send reset link</button>
      </form>
      <p className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400"><Link href={`/login?next=${encodeURIComponent(next)}`} className="font-medium text-blue-600 hover:text-blue-500">Back to sign in</Link></p>
    </div>
  )
}
