import { BrainCircuit, Code2, Megaphone, TrendingUp } from 'lucide-react'

export const TEST_CATEGORIES = [
  {
    id: 'technology',
    title: 'Technology & Software',
    description: 'Algorithms, data structures, databases, networking, and modern software development.',
    topics: ['Algorithms', 'Data Structures', 'Databases', 'Web Development'],
    icon: Code2,
    color: 'blue',
  },
  {
    id: 'finance',
    title: 'Finance',
    description: 'Financial statements, valuation, portfolio risk, and core investment principles.',
    topics: ['Financial Statements', 'Valuation', 'Portfolio Risk', 'Investments'],
    icon: TrendingUp,
    color: 'emerald',
  },
  {
    id: 'digital-marketing',
    title: 'Digital Marketing',
    description: 'SEO, analytics, paid acquisition, conversion, and content strategy.',
    topics: ['SEO', 'Analytics', 'Paid Search', 'Content Strategy'],
    icon: Megaphone,
    color: 'rose',
  },
  {
    id: 'ai',
    title: 'Artificial Intelligence',
    description: 'Machine learning, model evaluation, neural networks, and responsible AI.',
    topics: ['Machine Learning', 'Neural Networks', 'Evaluation', 'Responsible AI'],
    icon: BrainCircuit,
    color: 'purple',
  },
] as const

export type TestCategoryId = typeof TEST_CATEGORIES[number]['id']

export const isTestCategory = (category: string): category is TestCategoryId =>
  TEST_CATEGORIES.some(item => item.id === category)

export const getTestCategory = (category: TestCategoryId) =>
  TEST_CATEGORIES.find(item => item.id === category)!

export const PAID_TEST_PRODUCT_CODE = (category: TestCategoryId) => `skill-test:${category}:pro`
export const FREE_UNLOCK_SKILL_TEST_CODE = 'skill_test_pro'
