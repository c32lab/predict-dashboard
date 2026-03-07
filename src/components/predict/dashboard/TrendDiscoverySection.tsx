import SectionErrorBoundary from '../../SectionErrorBoundary'
import { TrendsSection } from '../TrendsSection'
import type { Trend } from '../../../types/predict'

export function TrendDiscoverySection({
  trends,
  isLoading,
}: {
  trends: Trend[]
  isLoading: boolean
}) {
  return (
    <SectionErrorBoundary title="Trend Discovery">
      <section className="bg-gray-900 rounded-xl border border-gray-800">
        <div className="px-4 py-3 border-b border-gray-800">
          <h2 className="text-sm font-semibold text-gray-200">
            Trend Discovery
            {!isLoading && trends.length > 0 && (
              <span className="ml-2 text-xs text-gray-500">({trends.length})</span>
            )}
          </h2>
        </div>
        <div className="p-4">
          {isLoading ? (
            <p className="text-center text-gray-600 py-8 text-sm">Loading…</p>
          ) : (
            <TrendsSection trends={trends} />
          )}
        </div>
      </section>
    </SectionErrorBoundary>
  )
}
