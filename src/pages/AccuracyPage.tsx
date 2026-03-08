import { useAccuracyDetail } from '../hooks/usePredictApi'
import { AccuracyAndValidationsSection } from '../components/predict/AccuracyAndValidationsSection'
import { AccuracyTrendChart } from '../components/accuracy/AccuracyTrendChart'
import { SymbolAccuracyBreakdown } from '../components/accuracy/SymbolAccuracyBreakdown'
import { ConfidenceAccuracyScatter } from '../components/accuracy/ConfidenceAccuracyScatter'
import { QualityReportPanel } from '../components/accuracy/QualityReportPanel'
import { AccuracyHistoryChart } from '../components/accuracy/AccuracyHistoryChart'
import { DirectionRadarChart } from '../components/accuracy/DirectionRadarChart'
import { RollingAccuracyChart } from '../components/accuracy/RollingAccuracyChart'
import SectionErrorBoundary from '../components/SectionErrorBoundary'
import { PageSkeleton } from '../components/PageSkeleton'
import { EmptyState } from '../components/EmptyState'

export default function AccuracyPage() {
  const { accuracy: data, error, isLoading } = useAccuracyDetail()

  if (isLoading) {
    return <PageSkeleton />
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 text-red-400 text-sm">
        Failed to load: {String(error?.message ?? error)}
      </div>
    )
  }

  if (!data) return <EmptyState message="No accuracy data available" />

  const validations = data.recent_validations ?? []

  return (
    <div className="p-2 sm:p-4 lg:p-6 space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-lg font-semibold text-gray-100">Prediction Accuracy</h1>
        <p className="text-sm text-gray-500 mt-1">Track prediction accuracy trends and recent validation results.</p>
      </div>
      <SectionErrorBoundary title="Accuracy & Validations">
        <AccuracyAndValidationsSection
          accuracy={data.accuracy ?? {}}
          validations={validations}
        />
      </SectionErrorBoundary>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SectionErrorBoundary title="Accuracy Trend">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <AccuracyTrendChart validations={validations} />
          </div>
        </SectionErrorBoundary>

        <SectionErrorBoundary title="Symbol Breakdown">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <SymbolAccuracyBreakdown validations={validations} />
          </div>
        </SectionErrorBoundary>
      </div>

      <SectionErrorBoundary title="Confidence Analysis">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <ConfidenceAccuracyScatter validations={validations} />
        </div>
      </SectionErrorBoundary>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SectionErrorBoundary title="Direction Radar">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <DirectionRadarChart validations={validations} />
          </div>
        </SectionErrorBoundary>

        <SectionErrorBoundary title="Rolling Accuracy">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <RollingAccuracyChart validations={validations} />
          </div>
        </SectionErrorBoundary>
      </div>

      <SectionErrorBoundary title="Quality Report">
        <QualityReportPanel />
      </SectionErrorBoundary>

      <SectionErrorBoundary title="Accuracy History">
        <AccuracyHistoryChart />
      </SectionErrorBoundary>
    </div>
  )
}
