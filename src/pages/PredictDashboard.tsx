import { useState } from 'react'
import useSWR from 'swr'
import {
  usePrediction,
  usePredictHealth,
  useTrends,
  usePredictAccuracy,
} from '../hooks/usePredictApi'
import { predictApi } from '../api/predict'
import SectionErrorBoundary from '../components/SectionErrorBoundary'
import { PageSkeleton } from '../components/PageSkeleton'
import { EmptyState } from '../components/EmptyState'
import type { Trend } from '../types/predict'
import {
  AccuracyAndValidationsSection,
  DerivativesOverviewSection,
  PredictHealthHeader,
} from '../components/predict'
import { DecayDashboard } from '../components/predict/DecayDashboard'
import { DeepHealthPanel } from '../components/predict/DeepHealthPanel'
import {
  MacroOverviewSection,
  ActivePredictionsSection,
  EventLibrarySection,
  PatternsAndChartSection,
  PredictionHistorySection,
  TrendDiscoverySection,
} from '../components/predict/dashboard'

const PAGE_SIZE = 20

export default function PredictDashboard() {
  const { data, error, isLoading } = usePrediction()
  const { data: healthData, isLoading: healthLoading } = usePredictHealth()
  const [histPage, setHistPage] = useState(0)
  const { data: allPredictionsData, isLoading: histLoading } = useSWR(
    `predict/predictions/all?page=${histPage}`,
    () => predictApi.predictions({ limit: PAGE_SIZE, offset: histPage * PAGE_SIZE }),
    { refreshInterval: 30_000 }
  )
  const histTotal = allPredictionsData?.total ?? 0
  const histTotalPages = Math.max(1, Math.ceil(histTotal / PAGE_SIZE))
  const { data: accuracyData } = usePredictAccuracy()
  const { data: trendsData, isLoading: trendsLoading } = useTrends()

  if (isLoading) {
    return <PageSkeleton />
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 text-red-400 text-sm">
        Failed to load: {error.message}
      </div>
    )
  }

  if (!data) return <EmptyState message="No prediction data available" />

  const { macro, event_kb, predictions, macro_history, accuracy, recent_validations } = data
  const activeList = predictions?.active ?? []
  const events = event_kb?.events ?? []
  const patterns = event_kb?.patterns ?? []
  const trends = Array.isArray(trendsData) ? trendsData : (trendsData as unknown as { trends?: Trend[] })?.trends ?? []

  return (
    <div className="p-2 sm:p-4 lg:p-6 space-y-4 sm:space-y-6">
      <SectionErrorBoundary title="Predict Health">
        <PredictHealthHeader
          serviceOk={healthLoading ? null : healthData?.status === 'ok'}
          activeCount={activeList.length}
          eventCount={events.length}
          macroScore={macro?.score ?? null}
          accuracy={accuracyData}
        />
      </SectionErrorBoundary>

      <MacroOverviewSection macro={macro} />
      <ActivePredictionsSection predictions={activeList} />
      <EventLibrarySection events={events} />
      <PatternsAndChartSection patterns={patterns} macroHistory={macro_history} />

      <PredictionHistorySection
        predictions={allPredictionsData?.predictions}
        total={histTotal}
        isLoading={histLoading}
        page={histPage}
        totalPages={histTotalPages}
        onPageChange={setHistPage}
      />

      <TrendDiscoverySection trends={trends} isLoading={trendsLoading} />

      <SectionErrorBoundary title="Prediction Accuracy">
        <AccuracyAndValidationsSection
          accuracy={accuracyData?.accuracy ?? accuracy ?? {}}
          validations={accuracyData?.recent_validations ?? recent_validations ?? []}
        />
      </SectionErrorBoundary>

      <SectionErrorBoundary title="Derivatives Overview">
        <DerivativesOverviewSection />
      </SectionErrorBoundary>

      <SectionErrorBoundary title="Decay Dashboard">
        <DecayDashboard />
      </SectionErrorBoundary>

      <SectionErrorBoundary title="Deep Health">
        <DeepHealthPanel />
      </SectionErrorBoundary>
    </div>
  )
}
