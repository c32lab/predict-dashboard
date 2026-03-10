/** Error message panel with optional retry button. */
export function ApiError({
  message = 'Failed to load data',
  onRetry,
}: {
  message?: string
  onRetry?: () => void
}) {
  return (
    <div className="bg-gray-900 rounded-xl border border-red-800 p-4 flex flex-col items-center justify-center h-48 gap-3">
      <p className="text-red-400 text-sm">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="px-3 py-1.5 text-xs rounded bg-red-900/50 text-red-300 hover:bg-red-900 transition-colors"
        >
          Retry
        </button>
      )}
    </div>
  )
}
