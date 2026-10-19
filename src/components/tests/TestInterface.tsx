'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { jsPDF } from 'jspdf'
import { ArrowLeft, ArrowRight, Award, CheckCircle2, Clock, Download, Loader2, RotateCcw, XCircle } from 'lucide-react'
import { getTestCategory, type TestCategoryId } from '@/lib/tests/catalog'

type PublicQuestion = {
  id: string
  text: string
  options: string[]
}

type QuestionReview = {
  questionId: string
  question: string
  options: string[]
  selectedAnswer: number | null
  correctAnswer: number
  isCorrect: boolean
  explanation: string
}

type TestResult = {
  totalQuestions: number
  correctAnswers: number
  incorrectAnswers: number
  percentage: number
  recipientName: string
  completedAt: string
  review: QuestionReview[]
}

type Props = { category: TestCategoryId; type: 'free' | 'pro' }

const TIME_LIMITS = { free: 20 * 60, pro: 45 * 60 }

export default function TestInterface({ category, type }: Props) {
  const [questions, setQuestions] = useState<PublicQuestion[]>([])
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [timeLeft, setTimeLeft] = useState(TIME_LIMITS[type])
  const [result, setResult] = useState<TestResult | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showReview, setShowReview] = useState(false)
  const [isDownloadingCertificate, setIsDownloadingCertificate] = useState(false)
  const timeoutSubmitted = useRef(false)

  useEffect(() => {
    let cancelled = false
    async function loadQuestions() {
      setIsLoading(true)
      setError(null)
      try {
        const response = await fetch(`/api/tests/${category}?type=${type}`, { cache: 'no-store' })
        const data: unknown = await response.json()
        if (!response.ok) {
          const message = data && typeof data === 'object' && 'error' in data && typeof data.error === 'string'
            ? data.error
            : 'Could not load this test.'
          throw new Error(message)
        }
        if (!data || typeof data !== 'object' || !('questions' in data) || !Array.isArray(data.questions)) {
          throw new Error('The test response was invalid.')
        }
        if (!cancelled) setQuestions(data.questions as PublicQuestion[])
      } catch (loadError) {
        if (!cancelled) setError(loadError instanceof Error ? loadError.message : 'Could not load this test.')
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    void loadQuestions()
    return () => { cancelled = true }
  }, [category, type])

  const submitTest = useCallback(async (submittedAnswers: Record<string, number>) => {
    if (isSubmitting || result) return
    setIsSubmitting(true)
    setError(null)
    try {
      const response = await fetch(`/api/tests/${category}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, answers: submittedAnswers }),
      })
      const data: unknown = await response.json()
      if (!response.ok) {
        const message = data && typeof data === 'object' && 'error' in data && typeof data.error === 'string'
          ? data.error
          : 'Could not submit your answers.'
        throw new Error(message)
      }
      if (!data || typeof data !== 'object' || !('review' in data) || !Array.isArray(data.review)) {
        throw new Error('The result response was invalid.')
      }
      setResult(data as TestResult)
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Could not submit your answers.')
    } finally {
      setIsSubmitting(false)
    }
  }, [category, isSubmitting, result, type])

  useEffect(() => {
    if (isLoading || result || isSubmitting || questions.length === 0 || timeLeft <= 0) return
    const timer = window.setInterval(() => {
      setTimeLeft(current => Math.max(current - 1, 0))
    }, 1000)
    return () => window.clearInterval(timer)
  }, [isLoading, isSubmitting, questions.length, result, timeLeft])

  useEffect(() => {
    if (timeLeft === 0 && !timeoutSubmitted.current && !result && !isSubmitting) {
      timeoutSubmitted.current = true
      void submitTest(answers)
    }
  }, [answers, isSubmitting, result, submitTest, timeLeft])

  const resetTest = () => {
    setAnswers({})
    setCurrentQuestion(0)
    setTimeLeft(TIME_LIMITS[type])
    setResult(null)
    setShowReview(false)
    setError(null)
    timeoutSubmitted.current = false
  }

  const downloadCertificate = () => {
    if (!result || isDownloadingCertificate) return

    setIsDownloadingCertificate(true)
    setError(null)
    try {
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      const centerText = (text: string, y: number) => pdf.text(text, pageWidth / 2, y, { align: 'center' })
      const categoryTitle = getTestCategory(category).title
      const completedDate = new Date(result.completedAt).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })

      pdf.setDrawColor(4, 120, 87)
      pdf.setLineWidth(1.2)
      pdf.rect(10, 10, pageWidth - 20, pageHeight - 20)
      pdf.setLineWidth(0.35)
      pdf.rect(14, 14, pageWidth - 28, pageHeight - 28)
      pdf.setTextColor(4, 120, 87)
      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(13)
      centerText('TALENZO  |  SKILL ASSESSMENT', 38)
      pdf.setTextColor(17, 24, 39)
      pdf.setFontSize(30)
      centerText('Certificate of Completion', 58)
      pdf.setFont('helvetica', 'normal')
      pdf.setTextColor(75, 85, 99)
      pdf.setFontSize(14)
      centerText('This certifies that', 77)
      pdf.setTextColor(17, 24, 39)
      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(25)
      centerText(result.recipientName, 91)
      pdf.setFont('helvetica', 'normal')
      pdf.setFontSize(14)
      const completionText = `completed the ${type === 'free' ? 'free' : 'premium'} ${categoryTitle} assessment`
      centerText(completionText, 107)
      centerText(`with a score of ${result.percentage}% (${result.correctAnswers} of ${result.totalQuestions} correct).`, 116)
      pdf.setFontSize(11)
      pdf.setTextColor(75, 85, 99)
      centerText(`Completed ${completedDate}`, 137)
      pdf.setFontSize(9)
      centerText('Assessment result calculated by Talenzo from submitted answers.', 155)

      const filename = `talenzo-${category}-certificate.pdf`
      pdf.save(filename)
    } catch (downloadError) {
      console.error('Could not generate assessment certificate.', downloadError)
      setError('Could not download your certificate. Please try again.')
    } finally {
      setIsDownloadingCertificate(false)
    }
  }

  const formatTime = (seconds: number) => `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`

  if (isLoading) {
    return <div className="mx-auto flex min-h-72 max-w-4xl items-center justify-center gap-3 text-gray-600"><Loader2 className="h-5 w-5 animate-spin" /> Loading assessment…</div>
  }

  if (error && questions.length === 0) {
    return (
      <div className="mx-auto max-w-xl rounded-2xl border border-red-200 bg-white p-8 text-center">
        <h1 className="text-xl font-bold text-gray-900">Unable to load test</h1>
        <p className="mt-2 text-sm text-red-700">{error}</p>
        <Link href={`/tests/${category}`} className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-blue-700"><ArrowLeft className="h-4 w-4" /> Back to assessment options</Link>
      </div>
    )
  }

  if (result) {
    return (
      <div className="mx-auto max-w-3xl space-y-5">
        <section className="rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm sm:p-9">
          <Award className="mx-auto h-12 w-12 text-emerald-600" />
          <h1 className="mt-3 text-2xl font-bold text-gray-900">Assessment complete</h1>
          <p className="mt-1 text-gray-600">{category.replace('-', ' ')} · {type === 'free' ? 'Free' : 'Premium'} test</p>
          <div className="mx-auto mt-6 grid max-w-lg grid-cols-3 gap-3">
            <div className="rounded-xl bg-gray-50 p-3"><div className="text-2xl font-bold text-gray-900">{result.correctAnswers}</div><div className="text-xs text-gray-500">Correct</div></div>
            <div className="rounded-xl bg-gray-50 p-3"><div className="text-2xl font-bold text-gray-900">{result.incorrectAnswers}</div><div className="text-xs text-gray-500">Incorrect</div></div>
            <div className="rounded-xl bg-emerald-50 p-3"><div className="text-2xl font-bold text-emerald-800">{result.percentage}%</div><div className="text-xs text-emerald-700">Score</div></div>
          </div>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button type="button" onClick={downloadCertificate} disabled={isDownloadingCertificate} className="inline-flex items-center gap-2 rounded-lg border border-emerald-700 px-4 py-2.5 text-sm font-semibold text-emerald-800 hover:bg-emerald-50 disabled:cursor-wait disabled:opacity-60"><Download className="h-4 w-4" />{isDownloadingCertificate ? 'Preparing download…' : 'Download Certificate'}</button>
            <button type="button" onClick={() => setShowReview(value => !value)} className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50">{showReview ? 'Hide answer review' : 'Review answers'}</button>
            <button type="button" onClick={resetTest} className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800"><RotateCcw className="h-4 w-4" /> Retake test</button>
            <Link href={`/tests/${category}`} className="rounded-lg px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50">Back to tests</Link>
          </div>
          {error && <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        </section>
        {showReview && <section className="space-y-4">{result.review.map((item, index) => (
          <article key={item.questionId} className="rounded-xl border border-gray-200 bg-white p-5">
            <div className="flex items-start gap-3">
              {item.isCorrect ? <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" /> : <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />}
              <div className="min-w-0 flex-1">
                <h2 className="font-semibold text-gray-900">{index + 1}. {item.question}</h2>
                <p className="mt-2 text-sm text-gray-600">Your answer: {item.selectedAnswer === null ? 'Not answered' : item.options[item.selectedAnswer]}</p>
                {!item.isCorrect && <p className="mt-1 text-sm text-emerald-800">Correct answer: {item.options[item.correctAnswer]}</p>}
                <p className="mt-2 text-sm text-gray-500">{item.explanation}</p>
              </div>
            </div>
          </article>
        ))}</section>}
      </div>
    )
  }

  if (questions.length === 0) {
    return <div className="mx-auto max-w-xl rounded-2xl border border-gray-200 bg-white p-8 text-center text-gray-600">No questions are currently available for this assessment.</div>
  }

  const question = questions[currentQuestion]
  const answeredCount = Object.keys(answers).length

  return (
    <div className="mx-auto max-w-4xl">
      <header className="mb-5 flex flex-col justify-between gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:p-5">
        <div><h1 className="text-xl font-bold capitalize text-gray-900">{category.replace('-', ' ')} assessment</h1><p className="mt-1 text-sm text-gray-500">{type === 'free' ? 'Free assessment' : 'Premium assessment'} · {answeredCount} of {questions.length} answered</p></div>
        <div className={`flex w-fit items-center gap-2 rounded-xl px-4 py-2 font-mono text-lg font-semibold ${timeLeft < 60 ? 'bg-red-50 text-red-700' : 'bg-sky-50 text-sky-800'}`}><Clock className="h-5 w-5" />{formatTime(timeLeft)}</div>
      </header>
      <nav aria-label="Question progress" className="mb-5 flex flex-wrap gap-2">
        {questions.map((item, index) => <button key={item.id} type="button" onClick={() => setCurrentQuestion(index)} aria-label={`Go to question ${index + 1}`} aria-current={currentQuestion === index ? 'step' : undefined} className={`h-9 w-9 rounded-lg text-sm font-semibold ${currentQuestion === index ? 'bg-emerald-700 text-white' : answers[item.id] !== undefined ? 'bg-emerald-100 text-emerald-800' : 'bg-white text-gray-600 ring-1 ring-gray-200'}`}>{index + 1}</button>)}
      </nav>
      <section className="mb-5 flex min-h-[380px] flex-col rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-8">
        <div className="mb-6"><p className="text-sm font-bold uppercase tracking-wide text-emerald-700">Question {currentQuestion + 1} of {questions.length}</p><h2 className="mt-2 text-xl font-semibold leading-relaxed text-gray-900 sm:text-2xl">{question.text}</h2></div>
        <div className="mt-auto space-y-3">
          {question.options.map((option, index) => <button key={`${question.id}-${index}`} type="button" onClick={() => setAnswers(previous => ({ ...previous, [question.id]: index }))} className={`flex w-full items-center justify-between gap-3 rounded-xl border-2 p-4 text-left text-sm sm:text-base ${answers[question.id] === index ? 'border-emerald-600 bg-emerald-50 text-emerald-950' : 'border-gray-200 text-gray-700 hover:border-gray-300'}`}><span>{option}</span>{answers[question.id] === index && <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-700" />}</button>)}
        </div>
      </section>
      {error && <p role="alert" className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <footer className="flex items-center justify-between gap-3">
        <button type="button" onClick={() => setCurrentQuestion(index => Math.max(index - 1, 0))} disabled={currentQuestion === 0 || isSubmitting} className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 disabled:opacity-50"><ArrowLeft className="h-4 w-4" /> Previous</button>
        {currentQuestion < questions.length - 1
          ? <button type="button" onClick={() => setCurrentQuestion(index => Math.min(index + 1, questions.length - 1))} className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800">Next <ArrowRight className="h-4 w-4" /></button>
          : <button type="button" onClick={() => { if (window.confirm('Submit your answers and see your score?')) void submitTest(answers) }} disabled={isSubmitting} className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-60">{isSubmitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Submitting…</> : <>Submit assessment <CheckCircle2 className="h-4 w-4" /></>}</button>}
      </footer>
    </div>
  )
}
