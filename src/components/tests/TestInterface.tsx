'use client'

import { useState, useEffect } from 'react'
import { Clock, ArrowRight, ArrowLeft, CheckCircle2, Award } from 'lucide-react'
import type { Question } from '@/utils/googleSheets'
import { consumeAttemptForSubmission } from '@/app/tests/actions'

export default function TestInterface({ 
  category, 
  type,
  initialQuestions
}: { 
  category: string, 
  type: 'free' | 'pro',
  initialQuestions: Question[]
}) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [isSubmitted, setIsSubmitted] = useState(false)
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
    setAnswers({ ...answers, [currentQuestion]: optionIndex })
  }

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(curr => curr + 1)
    }
  }

  const handlePrev = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(curr => curr - 1)
    }
  }

  const handleSubmit = async () => {
    if (confirm("Are you sure you want to submit the test?")) {
      const attempt = await consumeAttemptForSubmission()
      if (!attempt.success) return
      setIsSubmitted(true)
    }
  }

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  if (isSubmitted) {
    const score = Object.keys(answers).reduce((acc, qIndex) => {
      if (answers[parseInt(qIndex)] === questions[parseInt(qIndex)].correct) {
        return acc + 1
      }
      return acc
    }, 0)
    
    return (
      <div className="max-w-2xl mx-auto bg-white dark:bg-gray-900 rounded-3xl p-8 border border-gray-200 dark:border-gray-800 shadow-sm text-center">
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <Award className="w-10 h-10" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Test Completed!</h2>
        <p className="text-gray-500 mb-8">You scored {score} out of {questions.length}</p>
        
        <div className="bg-gray-50 dark:bg-gray-950 p-6 rounded-2xl mb-8 border border-gray-100 dark:border-gray-800">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Your Certificate is ready</h3>
          <p className="text-sm text-gray-500 mb-4">Download your verified certificate for {category.toUpperCase()}.</p>
          <button className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
            Download Certificate (PDF)
          </button>
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
          <p className="text-sm text-gray-500">{type === 'free' ? 'Free Tier (20 Questions)' : 'Pro Tier (45 Questions)'}</p>
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
                ${answers[currentQuestion] === idx 
                  ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-900 dark:text-blue-100' 
                  : 'border-gray-100 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 text-gray-700 dark:text-gray-300'
                }`}
            >
              <span>{opt}</span>
              {answers[currentQuestion] === idx && <CheckCircle2 className="w-5 h-5 text-blue-600" />}
            </button>
          ))}
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
        
        {currentQuestion === questions.length - 1 ? (
          <button
            onClick={handleSubmit}
            className="flex items-center gap-2 px-8 py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white font-medium shadow-sm transition-colors"
          >
            Submit Test <CheckCircle2 className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="flex items-center gap-2 px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm transition-colors"
          >
            Next <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  )
}
