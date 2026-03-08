/**
 * Shared page-level skeleton loader using the animate-pulse pattern
 * already established in PredictionDetailPage.
 */
export function PageSkeleton() {
  return (
    <div className="p-6 space-y-4 animate-pulse">
      <div className="h-6 bg-gray-800 rounded w-48" />
      <div className="h-32 bg-gray-800 rounded" />
      <div className="h-48 bg-gray-800 rounded" />
      <div className="h-64 bg-gray-800 rounded" />
    </div>
  )
}
