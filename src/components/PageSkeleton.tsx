import { SectionSkeleton } from './ui/SectionSkeleton'

/**
 * Shared page-level skeleton loader composed of SectionSkeleton blocks.
 */
export function PageSkeleton() {
  return (
    <div className="p-6 space-y-4">
      <div className="h-6 bg-gray-800 rounded w-48 animate-pulse" />
      <SectionSkeleton height="h-32" />
      <SectionSkeleton height="h-48" />
      <SectionSkeleton height="h-64" />
    </div>
  )
}
