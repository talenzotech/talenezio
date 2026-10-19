import Link from 'next/link'
import { ArrowRight, BadgeCheck, BrainCircuit, Code2, Megaphone, TrendingUp } from 'lucide-react'
import { TEST_CATEGORIES } from '@/lib/tests/catalog'

const icons = { ai: BrainCircuit, technology: Code2, finance: TrendingUp, 'digital-marketing': Megaphone }
const colors = {
  blue: 'border-sky-200 bg-sky-50 text-sky-700',
  emerald: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  rose: 'border-rose-200 bg-rose-50 text-rose-700',
  purple: 'border-purple-200 bg-purple-50 text-purple-700',
}

export default async function TestsPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string | string[] }>
}) {
  const params = await searchParams
  const requestedType = Array.isArray(params.type) ? params.type[0] : params.type
  const paidTestSelected = requestedType === 'pro'
  const freeTestOnly = requestedType === 'free'

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="max-w-2xl">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-800">
            <BadgeCheck className="h-4 w-4" /> Skill Assessments
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Industry-Standard Skill Tests</h1>
          <p className="mt-3 text-gray-600">{freeTestOnly ? 'Choose a subject to start a free assessment with relevant questions, scored results, and answer explanations.' : 'Choose a subject to explore its free and premium assessments. Each test includes relevant questions, scored results, and answer explanations.'}</p>
        </header>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {TEST_CATEGORIES.map(category => {
            const Icon = icons[category.id]
            return (
              <Link
                key={category.id}
                href={`/tests/${category.id}${paidTestSelected ? '?type=pro' : freeTestOnly ? '?type=free' : ''}`}
                className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-sky-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <div className={`mb-5 inline-flex rounded-xl border p-3 ${colors[category.color]}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">{category.title}</h2>
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800">Free test available</span>
                  {!freeTestOnly && <span className="rounded-full bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-800">Premium test · ₹32</span>}
                </div>
                <p className="mt-2 min-h-16 text-sm leading-6 text-gray-600">{category.description}</p>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {category.topics.map(topic => <span key={topic} className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600">{topic}</span>)}
                </div>
                <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-sky-700">
                  Explore tests <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </main>
  )
}
