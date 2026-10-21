import { redirect } from 'next/navigation'
import TestInterface from '@/components/tests/TestInterface'
import { createClient } from '@/utils/supabase/server'
import { fetchGoogleSheetQuestions } from '@/utils/googleSheets'
import { hasProTestAccess } from '@/lib/payments/access'
import { isTestCategory } from '@/lib/payments/products'

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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12 px-4 sm:px-6 lg:px-8">
      <TestInterface 
        category={category} 
        type={type} 
        initialQuestions={formattedQuestions} 
      />
    </div>
  )
}
