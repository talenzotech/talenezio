import TestsClient from './TestsClient'

export default async function TestsPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string }>
}) {
  const params = await searchParams
  const error = params?.error

  return <TestsClient error={error} />
}

