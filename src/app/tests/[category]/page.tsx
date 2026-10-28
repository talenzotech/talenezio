import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowLeft, ArrowRight, CheckCircle2, GraduationCap } from 'lucide-react'
import TestInterface from '@/components/tests/TestInterface'
import ProTestCheckout from '@/components/tests/ProTestCheckout'
import FeatureBottomNav from '@/components/FeatureBottomNav'
import { createClient } from '@/utils/supabase/server'
import { fetchGoogleSheetQuestions, QuestionBankError, toPublicQuestion, type Question } from '@/utils/googleSheets'
import { hasProTestAccess } from '@/lib/payments/access'
import { isTestCategory } from '@/lib/payments/products'
import { createAdminClient } from '@/lib/supabase/admin'
import { QuestionSelectionError, selectQuestions } from '@/lib/tests/questionSelection'
import { isLocalDemoSession } from '@/lib/auth/local-demo'

const CATEGORY_MAP: Record<string, { title: string; subtitle: string }> = {
  technology: {
    title: 'Technology & Software',
    subtitle: 'Algorithms, Data Structures, Modern Full-Stack Systems',
  },
  finance: {
    title: 'Finance',
    subtitle: '3-Statement Financial Models, Valuation & Markets',
  },
  'digital-marketing': {
    title: 'Digital Marketing',
    subtitle: 'SEO Architecture, Performance Ad Auctions & Growth',
  },
  ai: {
    title: 'Artificial Intelligence',
    subtitle: 'Neural Networks, Transformer Mechanics, Deep Learning',
  },
}

export default async function TestPage({
  params,
  searchParams,
}: {
  params: Promise<{ category: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedParams = await params
  const resolvedSearchParams = await searchParams
  
  const category = resolvedParams.category
  const requestedType = resolvedSearchParams.type

  // Validate category
  if (!isTestCategory(category)) {
    redirect('/tests')
  }

  const info = CATEGORY_MAP[category] || {
    title: category.charAt(0).toUpperCase() + category.slice(1),
    subtitle: 'Industry-standard assessment track',
  }

  // If no type is selected, render the dedicated career field page with Free and Paid options
  if (!requestedType) {
    return (
      <div className="min-h-screen bg-white pb-24 pt-8 dark:bg-gray-950 sm:pb-28">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <Link
            href="/tests"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Skill Tests
          </Link>

          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-100 pb-5 dark:border-gray-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                    Selected Career Field
                  </span>
                  <span className="inline-block h-1 w-1 rounded-full bg-gray-300 dark:bg-gray-700" />
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                    Official Syllabus Bank
                  </span>
                </div>
                <h1 className="mt-1 text-2xl font-extrabold text-gray-900 dark:text-white sm:text-3xl">
                  {info.title}
                </h1>
                <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
                  {info.subtitle}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                  <CheckCircle2 className="h-3.5 w-3.5" /> 260 Questions Available
                </span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
              {/* Free Test Card */}
              <div className="flex flex-col justify-between rounded-2xl border border-gray-200 bg-gray-50/70 p-5 dark:border-gray-800 dark:bg-gray-950/50">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="font-bold text-gray-900 dark:text-white text-lg">Free Test</h2>
                    <span className="rounded-full bg-emerald-100 px-3 py-0.5 text-xs font-bold text-emerald-800 uppercase dark:bg-emerald-950 dark:text-emerald-300">
                      Free
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                    Take the foundational test to assess core domain concepts.
                  </p>
                  <ul className="space-y-2.5 text-xs text-gray-600 dark:text-gray-400 mb-6">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" /> 20 Random Questions
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" /> Verified Accredited PDF Certificate
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" /> Instant Results & Performance Scoring
                    </li>
                  </ul>
                </div>
                <Link
                  href={`/tests/${category}?type=free`}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-3 text-xs font-bold text-white transition hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-white"
                >
                  Start Free Test <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              {/* Paid Test Card */}
              <div className="flex flex-col justify-between rounded-2xl border-2 border-blue-200 bg-blue-50/40 p-5 dark:border-blue-900/50 dark:bg-blue-950/20">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="font-bold text-blue-950 dark:text-blue-100 text-lg">Paid Test</h2>
                    <span className="rounded-full bg-blue-100 px-3 py-0.5 text-xs font-bold text-blue-800 uppercase dark:bg-blue-950 dark:text-blue-300">
                      ₹32 / Unlock
                    </span>
                  </div>
                  <p className="text-xs text-blue-900/80 dark:text-blue-200/80 mb-4">
                    Industry-standard rigorous assessment with official verified credentials.
                  </p>
                  <ul className="space-y-2.5 text-xs text-blue-900/80 dark:text-blue-200/80 mb-6">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0" /> 45 Comprehensive Questions (3 Sections)
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0" /> Official Signature & Verification Code
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0" /> Priority Placement Credential & Certificate
                    </li>
                  </ul>
                </div>
                <Link
                  href={`/tests/${category}?type=pro`}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-xs font-bold text-white transition hover:bg-blue-700 shadow-sm"
                >
                  Start Paid Test <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        <FeatureBottomNav />
      </div>
    )
  }

  const type = requestedType === 'pro' ? 'pro' : 'free'

  // Check auth
  const isDemo = await isLocalDemoSession()
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user && !isDemo) {
    redirect(`/login?next=/tests/${category}?type=${type}`)
  }

  if (type === 'pro' && user && !(await hasProTestAccess(user.id, category))) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-16 text-center dark:bg-gray-950 pb-28">
        <div className="mx-auto max-w-md rounded-3xl border border-blue-200 bg-white p-8 shadow-sm dark:border-blue-900/50 dark:bg-gray-900">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
            <GraduationCap className="h-7 w-7" />
          </div>
          <h2 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">Pro Assessment Required</h2>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 mb-6">
            Unlock the official verified assessment for {info.title} to receive accredited credentials with company signature.
          </p>
          <ProTestCheckout category={category} />
          <Link href={`/tests/${category}`} className="mt-4 block text-xs font-semibold text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
            ← Back to test options
          </Link>
        </div>
        <FeatureBottomNav />
      </div>
    )
  }

  let formattedQuestions: Question[]
  try {
    const questions = await fetchGoogleSheetQuestions(category, type)
    formattedQuestions = selectQuestions(questions, type)
  } catch (error) {
    const message = error instanceof QuestionBankError || error instanceof QuestionSelectionError
      ? error.message
      : 'The question bank is currently unavailable. Please try again later.'

    return (
      <div className="min-h-screen bg-gray-50 px-4 py-20 text-center dark:bg-gray-950">
        <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">Test unavailable</h2>
        <p className="mx-auto max-w-2xl whitespace-pre-line text-gray-500 mb-8">{message}</p>
        <Link
          href={`/tests/${category}`}
          className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
        >
          Return to Test Options
        </Link>
      </div>
    )
  }

  let attemptId = 'demo-attempt-session'
  let attemptCreationError: string | null = null
  if (user) {
    try {
      const expiresAtDate = new Date()
      expiresAtDate.setMinutes(expiresAtDate.getMinutes() + (type === 'free' ? 20 : 45))
      const expiresAt = expiresAtDate.toISOString()

      const admin = createAdminClient()
      const { data: attempt, error } = await admin.from('test_attempts').insert({
        user_id: user.id,
        category,
        test_type: type,
        question_snapshot: formattedQuestions,
        total_questions: formattedQuestions.length,
        expires_at: expiresAt,
      }).select('id').single()

      if (error || !attempt?.id) throw error ?? new Error('Attempt ID was not returned')
      attemptId = attempt.id
    } catch (attemptError) {
      console.error(
        'Could not create test attempt:',
        attemptError instanceof Error ? attemptError.message : JSON.stringify(attemptError),
      )
      attemptCreationError = 'We could not start this test securely. Please try again or contact support if the problem continues.'
    }
  }

  if (attemptCreationError) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-20 text-center dark:bg-gray-950">
        <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">Test unavailable</h2>
        <p className="mx-auto mb-8 max-w-2xl text-gray-500">{attemptCreationError}</p>
        <Link
          href={`/tests/${category}`}
          className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
        >
          Return to Test Options
        </Link>
      </div>
    )
  }
  const userFullName = user?.user_metadata?.full_name
    || user?.user_metadata?.name
    || (user?.email ? user.email.split('@')[0] : '')
    || (isDemo ? 'Demo User' : 'Talenezio Learner')

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12 px-4 sm:px-6 lg:px-8">
      <TestInterface
        category={category}
        type={type}
        attemptId={attemptId}
        initialQuestions={formattedQuestions.map(toPublicQuestion)}
        userName={userFullName}
      />
    </div>
  )
}
