import SectionErrorBoundary from '../../SectionErrorBoundary'
import { PredictionTable } from '../PredictionTable'
import type { Prediction } from '../../../types/predict'

export function ActivePredictionsSection({ predictions }: { predictions: Prediction[] }) {
  return (
    <SectionErrorBoundary title="Active Predictions">
      <section className="bg-gray-900 rounded-xl border border-gray-800">
        <div className="px-4 py-3 border-b border-gray-800">
          <h2 className="text-sm font-semibold text-gray-200">
            Active Predictions
            <span className="ml-2 text-xs text-gray-500">({predictions.length})</span>
          </h2>
        </div>
        <div className="p-2">
          {predictions.length === 0 ? (
            <p className="text-center text-gray-600 py-8 text-sm">No active predictions</p>
          ) : (
            <PredictionTable predictions={predictions} />
          )}
        </div>
      </section>
    </SectionErrorBoundary>
  )
}
