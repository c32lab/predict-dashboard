import SectionErrorBoundary from '../../SectionErrorBoundary'
import { PredictionHistoryTable } from '../PredictionHistoryTable'
import type { Prediction } from '../../../types/predict'

export function PredictionHistorySection({
  predictions,
  total,
  isLoading,
  page,
  totalPages,
  onPageChange,
}: {
  predictions: Prediction[] | undefined
  total: number
  isLoading: boolean
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}) {
  const PAGE_SIZE = 20

  return (
    <SectionErrorBoundary title="Prediction History">
      <section className="bg-gray-900 rounded-xl border border-gray-800">
        <div className="px-4 py-3 border-b border-gray-800">
          <h2 className="text-sm font-semibold text-gray-200">
            Prediction History
            <span className="ml-2 text-xs text-gray-500">
              {isLoading ? 'loading…' : `(${total})`}
            </span>
          </h2>
        </div>
        <div className="p-2">
          {isLoading ? (
            <p className="text-center text-gray-600 py-8 text-sm">Loading…</p>
          ) : !predictions || predictions.length === 0 ? (
            <p className="text-center text-gray-600 py-8 text-sm">No prediction history</p>
          ) : (
            <PredictionHistoryTable predictions={predictions} />
          )}
        </div>
        {total > PAGE_SIZE && (
          <div className="flex items-center justify-center gap-3 px-4 py-3 border-t border-gray-800">
            <button
              onClick={() => onPageChange(Math.max(0, page - 1))}
              disabled={page === 0}
              className="px-3 py-1 text-xs rounded border border-gray-700 text-gray-400 hover:text-gray-200 hover:border-gray-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              Prev
            </button>
            <span className="text-xs text-gray-500">
              {page + 1} / {totalPages}
            </span>
            <button
              onClick={() => onPageChange(Math.min(totalPages - 1, page + 1))}
              disabled={page >= totalPages - 1}
              className="px-3 py-1 text-xs rounded border border-gray-700 text-gray-400 hover:text-gray-200 hover:border-gray-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </section>
    </SectionErrorBoundary>
  )
}
