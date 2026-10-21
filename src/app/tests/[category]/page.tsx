import { redirect } from 'next/navigation'
import TestInterface from '@/components/tests/TestInterface'
import { createClient } from '@/utils/supabase/server'
import { fetchGoogleSheetQuestions, toPublicQuestion } from '@/utils/googleSheets'
import { hasProTestAccess } from '@/lib/payments/access'
import { isTestCategory } from '@/lib/payments/products'
import { createAdminClient } from '@/lib/supabase/admin'

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
  const type = requestedType === 'pro' ? 'pro' : 'free'

  // Validate category
  if (!isTestCategory(category)) {
    redirect('/tests')
  }

  // Check auth
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/login?next=/tests/${category}?type=${type}`)
  }

  if (type === 'pro' && !(await hasProTestAccess(user.id, category))) {
    redirect('/tests?error=payment_required')
  }

  // Fetch questions from Google Sheets
  const questions = await fetchGoogleSheetQuestions(category, type)

  // For free tier, we could limit it. The sheet might have all of them.
  let formattedQuestions = questions
  if (type === 'free' && formattedQuestions.length > 20) {
    formattedQuestions = formattedQuestions.slice(0, 20)
  } else if (type === 'pro' && formattedQuestions.length > 45) {
    formattedQuestions = formattedQuestions.slice(0, 45)
  }

  if (formattedQuestions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-20 text-center dark:bg-gray-950">
        <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">No questions available</h2>
        <p className="text-gray-500">We are currently updating the questions for {category}. Please check back later!</p>
      </div>
    )
  }

  const expiresAtDate = new Date()
  expiresAtDate.setMinutes(expiresAtDate.getMinutes() + (type === 'free' ? 20 : 45))
  const expiresAt = expiresAtDate.toISOString()
  const admin = createAdminClient()
  const { data: attempt, error: attemptError } = await admin.from('test_attempts').insert({
    user_id: user.id,
    category,
    test_type: type,
    question_snapshot: formattedQuestions,
    total_questions: formattedQuestions.length,
    expires_at: expiresAt,
  }).select('id').single()

  if (attemptError || !attempt) {
    console.error('Unable to create test attempt:', attemptError)
    redirect('/tests?error=Could%20not%20start%20test')
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12 px-4 sm:px-6 lg:px-8">
        <TestInterface
          category={category}
          type={type}
          attemptId={attempt.id}
          initialQuestions={formattedQuestions.map(toPublicQuestion)}
      />
    </div>
  )
}
