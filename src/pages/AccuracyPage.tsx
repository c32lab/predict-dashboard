import { usePredictAccuracy } from '../hooks/usePredictApi'
import { AccuracyAndValidationsSection } from '../components/predict/AccuracyAndValidationsSection'

export default function AccuracyPage() {
  const { data, error, isLoading } = usePredictAccuracy()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500 text-sm">
        Loading accuracy data...
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 text-red-400 text-sm">
        Failed to load: {String(error?.message ?? error)}
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="p-2 sm:p-4 lg:p-6 space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-lg font-semibold text-gray-100">Prediction Accuracy</h1>
        <p className="text-sm text-gray-500 mt-1">Track prediction accuracy trends and recent validation results.</p>
      </div>
      <AccuracyAndValidationsSection
        accuracy={data.accuracy ?? {}}
        validations={data.recent_validations ?? []}
      />
    </div>
  )
}
