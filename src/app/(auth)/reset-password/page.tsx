import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { safeNextPath } from '@/lib/auth/redirect'
import ResetPasswordForm from '@/components/auth/ResetPasswordForm'

export default async function ResetPasswordPage({
  searchParams,
}: { searchParams?: Promise<{ error?: string; next?: string }> }) {
  const params = await searchParams
  const next = safeNextPath(params?.next)
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/forgot-password?error=${encodeURIComponent('This reset link is invalid or expired. Request a new one.')}&next=${encodeURIComponent(next)}`)
  }

  return (
    <div className="w-full">
      <div className="mb-10 text-center"><h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">Choose a new password</h1><p className="text-gray-500 dark:text-gray-400">Use a password with at least 8 characters.</p></div>
      {params?.error && <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600" role="alert">{params.error}</div>}
      <ResetPasswordForm next={next} />
      <p className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400"><Link href={`/login?next=${encodeURIComponent(next)}`} className="font-medium text-blue-600 hover:text-blue-500">Back to sign in</Link></p>
    </div>
  )
}
