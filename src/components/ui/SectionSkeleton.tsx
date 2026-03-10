/** Section-level animate-pulse skeleton for loading states. */
export function SectionSkeleton({ height = 'h-32' }: { height?: string }) {
  return (
    <div className={`bg-gray-900 rounded-xl border border-gray-800 p-4 animate-pulse ${height}`}>
      <div className="space-y-3">
        <div className="h-4 bg-gray-800 rounded w-1/3" />
        <div className="h-3 bg-gray-800 rounded w-2/3" />
        <div className="h-3 bg-gray-800 rounded w-1/2" />
      </div>
    </div>
  )
}
