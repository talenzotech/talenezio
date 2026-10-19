import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { checkTestAccess } from '@/lib/tests/access'
import { isTestCategory } from '@/lib/tests/catalog'
import { QUESTIONS_PER_TEST, TEST_QUESTION_BANK } from '@/lib/tests/questions'

type RouteContext = { params: Promise<{ category: string }> }

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status, headers: { 'Cache-Control': 'no-store' } })
}

async function getAuthorizedTest(
  categoryParam: string,
  requestedType: string | null,
) {
  if (!isTestCategory(categoryParam)) {
    return { response: jsonError('Unknown test category.', 404) } as const
  }
  if (requestedType !== 'free' && requestedType !== 'pro') {
    return { response: jsonError('Select a valid test type.', 400) } as const
  }

  if (requestedType === 'free') {
    return { user: null, category: categoryParam, type: requestedType } as const
  }

  if (requestedType === 'pro' && process.env.NODE_ENV === 'development') {
    return { user: null, category: categoryParam, type: requestedType } as const
  }

  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { response: jsonError('Sign in to access this test.', 401) } as const
  }

  const access = await checkTestAccess(supabase, user.id, categoryParam, requestedType)
  if (!access.allowed) {
    if (access.reason === 'verification_unavailable') {
      return { response: jsonError('We could not verify test access. Please try again later.', 503) } as const
    }
    return { response: jsonError('A verified purchase or approved free unlock is required for this test.', 403) } as const
  }

  return { supabase, user, category: categoryParam, type: requestedType } as const
}

export async function GET(request: Request, { params }: RouteContext) {
  const { category } = await params
  const type = new URL(request.url).searchParams.get('type')
  const authorized = await getAuthorizedTest(category, type)
  if ('response' in authorized) return authorized.response

  const limit = QUESTIONS_PER_TEST[authorized.type]
  const questions = TEST_QUESTION_BANK[authorized.category].slice(0, limit).map(question => ({
    id: question.id,
    text: question.text,
    options: question.options,
  }))

  return NextResponse.json(
    { category: authorized.category, type: authorized.type, questions },
    { headers: { 'Cache-Control': 'no-store' } },
  )
}

export async function POST(request: Request, { params }: RouteContext) {
  const { category } = await params
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return jsonError('The test submission was not valid JSON.', 400)
  }

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return jsonError('The test submission is invalid.', 400)
  }
  const submission = body as { type?: unknown; answers?: unknown }
  if (submission.type !== 'free' && submission.type !== 'pro') {
    return jsonError('Select a valid test type.', 400)
  }
  if (!submission.answers || typeof submission.answers !== 'object' || Array.isArray(submission.answers)) {
    return jsonError('Answers must be supplied as a question-to-option map.', 400)
  }

  const authorized = await getAuthorizedTest(category, submission.type)
  if ('response' in authorized) return authorized.response

  const questions = TEST_QUESTION_BANK[authorized.category].slice(0, QUESTIONS_PER_TEST[authorized.type])
  const answers = submission.answers as Record<string, unknown>
  const questionIds = new Set(questions.map(question => question.id))
  if (Object.keys(answers).some(id => !questionIds.has(id))) {
    return jsonError('The submission contains an unknown question.', 400)
  }
  for (const [id, selected] of Object.entries(answers)) {
    const question = questions.find(item => item.id === id)
    if (!question || !Number.isInteger(selected) || (selected as number) < 0 || (selected as number) >= question.options.length) {
      return jsonError('One or more selected answers are invalid.', 400)
    }
  }

  const review = questions.map(question => {
    const selected = answers[question.id] as number | undefined
    const correct = selected === question.correct
    return {
      questionId: question.id,
      question: question.text,
      options: question.options,
      selectedAnswer: selected === undefined ? null : selected,
      correctAnswer: question.correct,
      isCorrect: correct,
      explanation: question.explanation,
    }
  })
  const correctAnswers = review.filter(answer => answer.isCorrect).length
  const totalQuestions = questions.length

  return NextResponse.json(
    {
      category: authorized.category,
      type: authorized.type,
      totalQuestions,
      correctAnswers,
      incorrectAnswers: totalQuestions - correctAnswers,
      percentage: Math.round((correctAnswers / totalQuestions) * 100),
      recipientName: typeof authorized.user?.user_metadata?.full_name === 'string'
        ? authorized.user.user_metadata.full_name
        : 'Talenzo learner',
      completedAt: new Date().toISOString(),
      review,
    },
    { headers: { 'Cache-Control': 'no-store' } },
  )
}
