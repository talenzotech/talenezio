'use client'

import { useState, useEffect } from 'react'
import { Clock, ArrowRight, ArrowLeft, CheckCircle2, Award, SkipForward } from 'lucide-react'
import type { PublicQuestion } from '@/lib/tests/questionBank'

export default function TestInterface({ 
  category, 
  type,
  attemptId,
  initialQuestions
}: { 
  category: string, 
  type: 'free' | 'pro',
  attemptId: string,
  initialQuestions: PublicQuestion[]
}) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [result, setResult] = useState<{ score: number; total: number; certificateId: string | null } | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [timeLeft, setTimeLeft] = useState(type === 'free' ? 20 * 60 : 45 * 60) // 20 mins free, 45 mins pro

  // Fallback to empty array if no questions
  const questions = initialQuestions && initialQuestions.length > 0 ? initialQuestions : []

  useEffect(() => {
    if (isSubmitted || timeLeft <= 0) return
    const timer = setInterval(() => setTimeLeft(t => t - 1), 1000)
    return () => clearInterval(timer)
  }, [isSubmitted, timeLeft])

  const handleOptionSelect = (optionIndex: number) => {
    if (isSubmitted) return
    setAnswers(currentAnswers => ({
      ...currentAnswers,
      [questions[currentQuestion].id]: optionIndex,
    }))
  }

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(curr => curr + 1)
    }
  }

  const handleSkip = () => {
    if (currentQuestion >= questions.length - 1) return

    setAnswers(currentAnswers => {
      const nextAnswers = { ...currentAnswers }
      delete nextAnswers[questions[currentQuestion].id]
      return nextAnswers
    })
    setCurrentQuestion(questionIndex => questionIndex + 1)
  }

  const handlePrev = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(curr => curr - 1)
    }
  }

  const handleSubmit = async () => {
    if (!confirm("Are you sure you want to submit the test?")) return
    setIsSubmitting(true)
    setSubmitError(null)
    const response = await fetch('/api/tests/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ attemptId, answers }),
    })
    const payload = await response.json().catch(() => null)
    setIsSubmitting(false)
    if (!response.ok) {
      setSubmitError(payload?.error || 'Could not submit the test')
      return
    }
    setResult(payload)
    setIsSubmitted(true)
  }

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  if (isSubmitted) {
    return (
      <div className="max-w-2xl mx-auto bg-white dark:bg-gray-900 rounded-3xl p-8 border border-gray-200 dark:border-gray-800 shadow-sm text-center">
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <Award className="w-10 h-10" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Test Completed!</h2>
         <p className="text-gray-500 mb-8">You scored {result?.score} out of {result?.total}</p>
        
        <div className="bg-gray-50 dark:bg-gray-950 p-6 rounded-2xl mb-8 border border-gray-100 dark:border-gray-800">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Your Certificate is ready</h3>
          <p className="text-sm text-gray-500 mb-4">Download your verified certificate for {category.toUpperCase()}.</p>
           {result?.certificateId ? (
             <a href={`/api/certificates/${result.certificateId}/download`} className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
               Download Certificate (PDF)
             </a>
           ) : <p className="text-sm text-amber-600">Your certificate is being prepared. Refresh shortly.</p>}
        </div>
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div className="max-w-4xl mx-auto text-center py-20">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">No questions available</h2>
        <p className="text-gray-500">We are currently updating the questions for {category}. Please check back later!</p>
      </div>
    )
  }

  const question = questions[currentQuestion]

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4 bg-white dark:bg-gray-900 p-4 sm:p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
        <div>
          <h1 className="text-xl font-bold capitalize text-gray-900 dark:text-white">{category.replace('-', ' ')} Assessment</h1>
           <p className="text-sm text-gray-500">{type === 'free' ? 'Free Tier (20 Questions)' : 'Pro Tier (3 sections of 15 questions)'}</p>
        </div>
        <div className="flex items-center gap-3 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-4 py-2 rounded-xl font-mono text-lg font-semibold">
          <Clock className="w-5 h-5" />
          {formatTime(timeLeft)}
        </div>
      </div>

      {/* Main Question Area */}
      <div className="bg-white dark:bg-gray-900 p-6 sm:p-10 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm mb-6 min-h-[400px] flex flex-col">
        <div className="mb-8">
           <span className="text-sm font-bold text-blue-600 uppercase tracking-wider mb-2 block">
             Question {currentQuestion + 1} of {questions.length}
           </span>
           {type === 'pro' && <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">{question.section}</span>}
          <h2 className="text-2xl text-gray-900 dark:text-white font-medium leading-relaxed">
            {question.text}
          </h2>
        </div>

        <div className="space-y-3 mt-auto">
          {question.options.map((opt, idx) => (
            <button
              key={idx}
              onClick={() => handleOptionSelect(idx)}
              className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center justify-between
                ${answers[question.id] === idx
                  ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-900 dark:text-blue-100' 
                  : 'border-gray-100 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 text-gray-700 dark:text-gray-300'
                }`}
            >
              <span>{opt}</span>
              {answers[question.id] === idx && <CheckCircle2 className="w-5 h-5 text-blue-600" />}
            </button>
          ))}
        </div>
      </div>

      {/* Question Number Navigator */}
      <div className="bg-white dark:bg-gray-900 p-5 sm:p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm mb-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-white">Question numbers</h2>
            <p className="text-sm text-gray-500">Select a number to review or change your answer.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-600" /> Current</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-green-500" /> Answered</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-gray-300 dark:bg-gray-700" /> Unanswered</span>
          </div>
        </div>
        <div className="grid grid-cols-5 sm:grid-cols-10 gap-2" role="list" aria-label="Question navigation">
          {questions.map((item, index) => {
            const isCurrent = currentQuestion === index
            const isAnswered = answers[item.id] !== undefined

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setCurrentQuestion(index)}
                aria-current={isCurrent ? 'step' : undefined}
                aria-label={`Question ${index + 1}${isAnswered ? ', answered' : ', unanswered'}${isCurrent ? ', current' : ''}`}
                className={`h-10 rounded-lg border-2 text-sm font-semibold transition-colors ${
                  isCurrent
                    ? 'border-blue-600 bg-blue-600 text-white'
                    : isAnswered
                      ? 'border-green-500 bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-300'
                      : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-400 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-gray-500'
                }`}
              >
                {index + 1}
              </button>
            )
          })}
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="flex items-center justify-between">
        <button
          onClick={handlePrev}
          disabled={currentQuestion === 0}
          className="flex items-center gap-2 px-6 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 font-medium disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Previous
        </button>
        
        <div className="flex items-center gap-2">
          {currentQuestion < questions.length - 1 && (
            <button
              type="button"
              onClick={handleSkip}
              className="flex items-center gap-2 px-5 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Skip Question <SkipForward className="w-4 h-4" />
            </button>
          )}
          {currentQuestion === questions.length - 1 ? (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-8 py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white font-medium shadow-sm transition-colors"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Test'} <CheckCircle2 className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleNext}
              className="flex items-center gap-2 px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm transition-colors"
            >
              Next <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
      {submitError && <p className="mt-4 text-center text-sm text-red-600">{submitError}</p>}
    </div>
  )
}
