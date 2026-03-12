import SectionErrorBoundary from '../../SectionErrorBoundary'
import { PredictionTable } from '../PredictionTable'
import { ValidationsTable } from '../ValidationsTable'
import type { Prediction, Validation } from '../../../types/predict'

interface Props {
  predictions: Prediction[]
  validatedPredictions?: Validation[]
}

export function ActivePredictionsSection({ predictions, validatedPredictions = [] }: Props) {
  const showValidated = predictions.length === 0 && validatedPredictions.length > 0

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
          {predictions.length > 0 ? (
            <PredictionTable predictions={predictions} />
          ) : showValidated ? (
            <>
              <p className="text-xs text-blue-400 bg-blue-900/30 border border-blue-800/50 rounded px-3 py-1.5 mb-2">
                No active predictions. Showing recent results:
              </p>
              <ValidationsTable validations={validatedPredictions} />
            </>
          ) : (
            <p className="text-center text-gray-600 py-8 text-sm">No active predictions</p>
          )}
        </div>
      </section>
    </SectionErrorBoundary>
  )
}
