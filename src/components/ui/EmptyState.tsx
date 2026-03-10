/** Centered icon + message empty state with styled container. */
export function EmptyState({
  icon = '📭',
  message = 'No data available',
}: {
  icon?: string
  message?: string
}) {
  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 flex flex-col items-center justify-center h-48">
      <span className="text-3xl mb-2">{icon}</span>
      <p className="text-gray-500 text-sm">{message}</p>
    </div>
  )
}
