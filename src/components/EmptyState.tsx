/**
 * Shared empty-state component for consistent "no data" messaging.
 * Renders a styled panel consistent with the dark-themed dashboard.
 */
export function EmptyState({ message = 'No data available' }: { message?: string }) {
  return (
    <div className="flex items-center justify-center h-64">
      <p className="text-gray-500 text-sm">{message}</p>
    </div>
  )
}
