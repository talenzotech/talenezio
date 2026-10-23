import Link from 'next/link'
import { BrainCircuit, MonitorSmartphone, TrendingUp, Megaphone, CheckCircle2 } from 'lucide-react'
import ProTestCheckout from '@/components/tests/ProTestCheckout'

const TEST_CATEGORIES = [
  {
    id: 'ai',
    title: 'Artificial Intelligence',
    description: 'Test your knowledge on machine learning, neural networks, and prompt engineering.',
    icon: BrainCircuit,
    color: 'bg-purple-500',
  },
  {
    id: 'technology',
    title: 'Technology & Software',
    description: 'Assess your skills in modern software development and computer science principles.',
    icon: MonitorSmartphone,
    color: 'bg-blue-500',
  },
  {
    id: 'finance',
    title: 'Finance & Economics',
    description: 'Evaluate your understanding of financial markets, accounting, and investments.',
    icon: TrendingUp,
    color: 'bg-emerald-500',
  },
  {
    id: 'digital-marketing',
    title: 'Digital Marketing',
    description: 'Challenge yourself on SEO, content strategy, and performance marketing concepts.',
    icon: Megaphone,
    color: 'bg-rose-500',
  },
]

export default async function TestsPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string }>
}) {
  const params = await searchParams
  const error = params?.error

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            Skill Assessment Tests
          </h1>
          <p className="text-lg md:text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            Take our industry-standard tests to evaluate your proficiency, earn certificates, and boost your resume.
          </p>
        </div>

        {error && (
          <div
            role="alert"
            className="max-w-2xl mx-auto rounded-2xl border border-amber-200 bg-amber-50 dark:border-amber-900/40 dark:bg-amber-950/40 p-4 text-center text-sm text-amber-800 dark:text-amber-300"
          >
            {error === 'payment_required'
              ? 'Pro assessment requires payment or an approved free unlock. Please purchase Pro access or take the free test below.'
              : decodeURIComponent(error)}
          </div>
        )}

        {/* Categories Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8">
          {TEST_CATEGORIES.map((category) => (
            <div 
              key={category.id}
              className="group bg-white dark:bg-gray-900 rounded-3xl p-8 border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-xl transition-all duration-300 relative overflow-hidden"
            >
              <div className={`absolute top-0 right-0 w-32 h-32 opacity-10 rounded-bl-full ${category.color}`}></div>
              
              <div className="flex items-start gap-6 relative z-10">
                <div className={`p-4 rounded-2xl text-white shadow-lg ${category.color}`}>
                  <category.icon className="w-8 h-8" />
                </div>
                
                <div className="space-y-4 flex-1">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      {category.title}
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400">
                      {category.description}
                    </p>
                  </div>

                  {/* Test Options (Free vs Paid) */}
                  <div className="grid sm:grid-cols-2 gap-4 mt-6">
                    {/* Free Tier */}
                    <div className="p-4 rounded-xl border-2 border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-950">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-semibold text-gray-900 dark:text-white">Free Test</span>
                        <span className="text-xs font-bold bg-green-100 text-green-700 px-2 py-1 rounded-full uppercase tracking-wider">Free</span>
                      </div>
                      <ul className="text-sm text-gray-500 space-y-2 mb-4">
                        <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> 20 Questions</li>
                        <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> Basic Certificate</li>
                      </ul>
                      <Link 
                        href={`/tests/${category.id}?type=free`}
                        className="block text-center w-full py-2 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-900 dark:text-white rounded-lg text-sm font-medium transition-colors"
                      >
                        Start Free Test
                      </Link>
                    </div>

                    {/* Pro Tier */}
                    <div className="p-4 rounded-xl border-2 border-blue-100 dark:border-blue-900/30 bg-blue-50 dark:bg-blue-950/20 relative">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-semibold text-blue-900 dark:text-blue-100">Pro Test</span>
                        <span className="text-xs font-bold bg-blue-100 text-blue-700 px-2 py-1 rounded-full uppercase tracking-wider">₹32</span>
                      </div>
                      <ul className="text-sm text-blue-800/70 dark:text-blue-200/70 space-y-2 mb-4">
                        <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-blue-500" /> 45 Questions (3 Sec)</li>
                        <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-blue-500" /> Premium Certificate</li>
                      </ul>
                      <ProTestCheckout category={category.id} />
                    </div>
                  </div>

                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
