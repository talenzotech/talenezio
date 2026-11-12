export default function Loading() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center px-6 py-16" role="status" aria-live="polite">
      <div className="flex items-center gap-3 text-sm font-medium text-gray-500">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-200 border-t-blue-600" aria-hidden="true" />
        Loading...
      </div>
    </div>
  )
}
