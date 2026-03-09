import { useState } from 'react'
import useSWR from 'swr'
import type { FullResults, ABResults } from '../types/backtest'
import type { MarketCycle } from '../components/backtest/TimeRangeSelector'
import {
  KpiCard,
  ABSection,
  RegimeSection,
  SweepSection,
  FindingsSection,
  PatternHeatmapSection,
  ConfusionMatrixSection,
  ConfidenceBucketSection,
  SymbolComparisonSection,
  BeforeAfterSection,
  SummaryStatsSection,
  CycleComparisonSection,
  EnhancedMetricsSection,
  TimeRangeSelector,
  YearDetailCard,
  MarketCycleSelector,
  BullBearCycleView,
  MultiSymbolHeatmap,
  FindingsCards,
} from '../components/backtest'
import SectionErrorBoundary from '../components/SectionErrorBoundary'
import { PageSkeleton } from '../components/PageSkeleton'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function BacktestPage() {
  const { data: baseline, error: e1 } = useSWR<FullResults>('/backtest-full-results.json', fetcher)
  const { data: ab, error: e2 } = useSWR<ABResults>('/backtest-ab-results.json', fetcher)
  const [selectedYear, setSelectedYear] = useState<string | null>(null)
  const [selectedCycle, setSelectedCycle] = useState<MarketCycle>('all')

  if (e1 || e2) return <div className="p-8 text-red-400">Failed to load backtest data.</div>
  if (!baseline || !ab) return <PageSkeleton />

  const pb = baseline.prediction_backtest
  const dm = baseline.decay_model_backtest
  const sweep = baseline.parameter_sweep

  const horizonEntries = Object.entries(pb.by_horizon ?? {})
  const best = horizonEntries.length > 0
    ? horizonEntries.reduce((a, b) => b[1].accuracy_pct > a[1].accuracy_pct ? b : a)
    : null
  const worst = horizonEntries.length > 0
    ? horizonEntries.reduce((a, b) => b[1].accuracy_pct < a[1].accuracy_pct ? b : a)
    : null

  return (
    <div className="p-2 sm:p-4 lg:p-6 space-y-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold">Backtest Results</h1>
      <p className="text-xs text-gray-500">Generated {baseline.generated_at}</p>

      {/* Time Range Selector */}
      <SectionErrorBoundary title="Time Range">
        <TimeRangeSelector
          byYear={dm.by_year ?? {}}
          selected={selectedYear}
          onSelect={setSelectedYear}
        />
        {selectedYear && dm.by_year?.[selectedYear] && (
          <div className="mt-3">
            <YearDetailCard year={selectedYear} data={dm.by_year[selectedYear]} />
          </div>
        )}
      </SectionErrorBoundary>

      <SectionErrorBoundary title="KPI Summary">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <KpiCard label="Total Predictions" value={String(pb.total_predictions)} />
          <KpiCard label="Overall Accuracy" value={`${pb.overall_accuracy_pct}%`} sub={`${pb.overall_correct}/${pb.overall_total}`} />
          <KpiCard label="Best Horizon" value={best ? `${best[0]} ${best[1].accuracy_pct}%` : '—'} sub={best ? `${best[1].correct}/${best[1].total}` : undefined} />
          <KpiCard label="Worst Horizon" value={worst ? `${worst[0]} ${worst[1].accuracy_pct}%` : '—'} sub={worst ? `${worst[1].correct}/${worst[1].total}` : undefined} />
          <KpiCard label="LONG Accuracy" value={`${pb.by_direction['LONG']?.accuracy_pct ?? 0}%`} sub={`${pb.by_direction['LONG']?.correct ?? 0}/${pb.by_direction['LONG']?.total ?? 0}`} />
          <KpiCard label="SHORT Accuracy" value={`${pb.by_direction['SHORT']?.accuracy_pct ?? 0}%`} sub={`${pb.by_direction['SHORT']?.correct ?? 0}/${pb.by_direction['SHORT']?.total ?? 0}`} />
        </div>
      </SectionErrorBoundary>

      {/* Summary Statistics */}
      <SectionErrorBoundary title="Summary Statistics">
        <SummaryStatsSection data={baseline} />
      </SectionErrorBoundary>

      {/* Cycle Comparison View */}
      <SectionErrorBoundary title="Cycle Comparison">
        <CycleComparisonSection byYear={dm.by_year ?? {}} byRegime={dm.by_regime ?? {}} />
      </SectionErrorBoundary>

      {/* Enhanced Metrics */}
      <SectionErrorBoundary title="Enhanced Metrics">
        <EnhancedMetricsSection data={baseline} />
      </SectionErrorBoundary>

      <SectionErrorBoundary title="A/B Comparison">
        <ABSection ab={ab} />
      </SectionErrorBoundary>
      <SectionErrorBoundary title="Regime Analysis">
        <RegimeSection regimes={dm.by_regime} />
      </SectionErrorBoundary>
      <SectionErrorBoundary title="Parameter Sweep">
        <SweepSection sweep={sweep} />
      </SectionErrorBoundary>
      <SectionErrorBoundary title="Findings & Suggestions">
        <FindingsSection findings={baseline.findings} suggestions={baseline.suggestions} />
      </SectionErrorBoundary>
      <SectionErrorBoundary title="Pattern Heatmap">
        <PatternHeatmapSection patterns={pb.by_trigger_pattern} />
      </SectionErrorBoundary>
      <SectionErrorBoundary title="Confusion Matrix">
        <ConfusionMatrixSection cm={pb.confusion_matrix} />
      </SectionErrorBoundary>
      <SectionErrorBoundary title="Confidence Buckets">
        <ConfidenceBucketSection buckets={pb.by_confidence_bucket} />
      </SectionErrorBoundary>
      <SectionErrorBoundary title="Symbol Comparison">
        <SymbolComparisonSection symbols={baseline.multi_symbol_conduction?.by_symbol ?? {}} />
      </SectionErrorBoundary>
      <SectionErrorBoundary title="Before/After Comparison">
        <BeforeAfterSection data={baseline.before_after_comparison ?? {}} />
      </SectionErrorBoundary>

      {/* --- Expanded Backtest Visualizations (issue #193) --- */}
      <SectionErrorBoundary title="Bull/Bear Cycle View">
        <BullBearCycleView data={baseline.before_after_comparison ?? {}} />
      </SectionErrorBoundary>
      <SectionErrorBoundary title="Multi-Symbol Heatmap">
        <MultiSymbolHeatmap symbols={baseline.multi_symbol_conduction?.by_symbol ?? {}} />
      </SectionErrorBoundary>
      <SectionErrorBoundary title="Market Cycle Filter">
        <MarketCycleSelector selected={selectedCycle} onSelect={setSelectedCycle} />
      </SectionErrorBoundary>
      <SectionErrorBoundary title="Findings & Action Items">
        <FindingsCards findings={baseline.findings} suggestions={baseline.suggestions} />
      </SectionErrorBoundary>
    </div>
  )
}
