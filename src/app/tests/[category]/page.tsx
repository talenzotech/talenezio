import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowLeft, ArrowRight, CheckCircle2, Clock, LockKeyhole } from 'lucide-react'
import TestInterface from '@/components/tests/TestInterface'
import { createClient } from '@/utils/supabase/server'
import { checkTestAccess } from '@/lib/tests/access'
import { getTestCategory, isTestCategory } from '@/lib/tests/catalog'
import { QUESTIONS_PER_TEST } from '@/lib/tests/questions'

export default async function TestPage({
  params,
  searchParams,
}: {
  params: Promise<{ category: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { category: categoryId } = await params
  const resolvedSearchParams = await searchParams
  if (!isTestCategory(categoryId)) redirect('/tests')

  const category = getTestCategory(categoryId)
  const requestedType = resolvedSearchParams.type
  const testType = requestedType === 'free' || requestedType === 'pro' ? requestedType : null
  if (requestedType !== undefined && !testType) redirect(`/tests/${categoryId}`)

  const developmentPaidTestBypass = process.env.NODE_ENV === 'development'
  if (testType === 'free' || (testType === 'pro' && developmentPaidTestBypass)) {
    return (
      <main className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6">
        <TestInterface category={categoryId} type={testType} />
      </main>
    )
  }

  const supabase = developmentPaidTestBypass ? null : await createClient()
  let user = null
  let authStatusUnavailable = false
  if (supabase) {
    try {
      const { data, error } = await supabase.auth.getUser()
      if (error) {
        console.error('Could not check optional skill-test sign-in status.', error)
        authStatusUnavailable = true
      } else {
        user = data.user
      }
    } catch (authError) {
      console.error('Could not check optional skill-test sign-in status.', authError)
      authStatusUnavailable = true
    }
  }

  if (testType) {
    if (testType === 'pro') {
      const access = authStatusUnavailable
        ? { allowed: false as const, reason: 'verification_unavailable' as const }
        : user && supabase
          ? await checkTestAccess(supabase, user.id, categoryId, 'pro')
          : { allowed: false as const, reason: 'payment_required' as const }
      if (!access.allowed) {
        return (
          <main className="min-h-screen bg-gray-50 px-4 py-12 sm:px-6">
            <div className="mx-auto max-w-xl rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm sm:p-10">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-700"><LockKeyhole className="h-6 w-6" /></div>
              <h1 className="text-2xl font-bold text-gray-900">Premium test locked</h1>
              <p className="mt-2 text-gray-600">
                {access.reason === 'verification_unavailable'
                  ? 'We could not verify your access right now. Please try again later.'
                  : 'A completed payment or an administrator-approved free unlock is required before this test can be opened.'}
              </p>
              {access.reason === 'payment_required' && (
                <div className="mt-5 rounded-lg bg-gray-50 p-4 text-sm text-gray-600">
                  Paid checkout is not configured for this project yet. The test remains locked until a verified payment is recorded; you can also request free access for review.
                </div>
              )}
              <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                <Link href="/unlock-program?feature=skill_test_pro" className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700">Request free access <ArrowRight className="h-4 w-4" /></Link>
                <Link href={`/tests/${categoryId}`} className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 px-5 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"><ArrowLeft className="h-4 w-4" /> Back to tests</Link>
              </div>
            </div>
          </main>
        )
      }
    }

    return (
      <main className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6">
        <TestInterface category={categoryId} type={testType} />
      </main>
    )
  }

  const paidAccess = user && supabase ? await checkTestAccess(supabase, user.id, categoryId, 'pro') : null
  const hasPaidAccess = developmentPaidTestBypass || paidAccess?.allowed === true
  const paidUnavailable = authStatusUnavailable
    || (paidAccess && !paidAccess.allowed && paidAccess.reason === 'verification_unavailable')

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-4xl">
        <Link href="/tests" className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"><ArrowLeft className="h-4 w-4" /> All test categories</Link>
        <header className="mt-5 max-w-2xl">
          <p className="text-sm font-semibold text-sky-700">Skill Assessment</p>
          <h1 className="mt-1 text-3xl font-bold text-gray-900">{category.title}</h1>
          <p className="mt-2 text-gray-600">{category.description}</p>
          <div className="mt-4 flex flex-wrap gap-2">{category.topics.map(topic => <span key={topic} className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs text-gray-600">{topic}</span>)}</div>
        </header>

        <div className="mt-7 grid gap-4 sm:grid-cols-2">
          <section className="rounded-2xl border border-emerald-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-start justify-between">
              <div><h2 className="text-lg font-semibold text-gray-900">Free Assessment</h2><p className="mt-1 text-sm text-gray-500">Open to everyone. No account required.</p></div>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">FREE</span>
            </div>
            <ul className="mt-5 space-y-3 text-sm text-gray-600">
              <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-600" />{QUESTIONS_PER_TEST.free} skill-specific questions</li>
              <li className="flex items-center gap-2"><Clock className="h-4 w-4 text-gray-400" />20 minute time limit</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-600" />Score and answer explanations</li>
            </ul>
            <Link href={`/tests/${categoryId}?type=free`} className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-700 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-800">Start Free Test <ArrowRight className="h-4 w-4" /></Link>
          </section>

          <section className="rounded-2xl border border-sky-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-start justify-between">
              <div><h2 className="text-lg font-semibold text-gray-900">Premium Assessment</h2><p className="mt-1 text-sm text-gray-500">Expanded assessment and premium result.</p></div>
              <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-bold text-sky-800">₹32</span>
            </div>
            <ul className="mt-5 space-y-3 text-sm text-gray-600">
              <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-sky-600" />{QUESTIONS_PER_TEST.pro} skill-specific questions</li>
              <li className="flex items-center gap-2"><Clock className="h-4 w-4 text-gray-400" />45 minute time limit</li>
              <li className="flex items-center gap-2"><LockKeyhole className="h-4 w-4 text-gray-400" />{developmentPaidTestBypass ? 'Payment skipped in local development' : 'Requires verified payment or approved free access'}</li>
            </ul>
            {hasPaidAccess ? (
              <>
                <p className="mt-5 text-sm font-medium text-emerald-700">{developmentPaidTestBypass ? 'Available in local development; payment is skipped.' : 'Premium access verified'}</p>
                <Link href={`/tests/${categoryId}?type=pro`} className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-sky-700 px-4 py-3 text-sm font-semibold text-white hover:bg-sky-800">Start Premium Test <ArrowRight className="h-4 w-4" /></Link>
              </>
            ) : (
              <div className="mt-6">
                <p className="mb-3 text-center text-sm text-gray-600">
                  {paidUnavailable ? 'We could not verify access right now.' : 'Premium access requires a verified payment or approval of your free-access request.'}
                </p>
                <Link href="/unlock-program?feature=skill_test_pro&request=1" className="flex w-full items-center justify-center gap-2 rounded-lg bg-sky-700 px-4 py-3 text-sm font-semibold text-white hover:bg-sky-800">Request free access for review <ArrowRight className="h-4 w-4" /></Link>
                <p className="mt-2 text-center text-xs text-gray-500">Paid checkout is not configured yet. No payment will be taken here.</p>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  )
}
