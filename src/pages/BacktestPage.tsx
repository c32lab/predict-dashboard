import useSWR from 'swr'
import type { FullResults, ABResults } from '../types/backtest'
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
} from '../components/backtest'
import SectionErrorBoundary from '../components/SectionErrorBoundary'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function BacktestPage() {
  const { data: baseline, error: e1 } = useSWR<FullResults>('/backtest-full-results.json', fetcher)
  const { data: ab, error: e2 } = useSWR<ABResults>('/backtest-ab-results.json', fetcher)

  if (e1 || e2) return <div className="p-8 text-red-400">Failed to load backtest data.</div>
  if (!baseline || !ab) return <div className="p-8 text-gray-500">Loading backtest data...</div>

  const pb = baseline.prediction_backtest
  const dm = baseline.decay_model_backtest
  const sweep = baseline.parameter_sweep

  const horizonEntries = Object.entries(pb.by_horizon)
  const best = horizonEntries.reduce((a, b) => b[1].accuracy_pct > a[1].accuracy_pct ? b : a)
  const worst = horizonEntries.reduce((a, b) => b[1].accuracy_pct < a[1].accuracy_pct ? b : a)

  return (
    <div className="p-2 sm:p-4 lg:p-6 space-y-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold">Backtest Results</h1>
      <p className="text-xs text-gray-500">Generated {baseline.generated_at}</p>

      <SectionErrorBoundary title="KPI Summary">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <KpiCard label="Total Predictions" value={String(pb.total_predictions)} />
          <KpiCard label="Overall Accuracy" value={`${pb.overall_accuracy_pct}%`} sub={`${pb.overall_correct}/${pb.overall_total}`} />
          <KpiCard label="Best Horizon" value={`${best[0]} ${best[1].accuracy_pct}%`} sub={`${best[1].correct}/${best[1].total}`} />
          <KpiCard label="Worst Horizon" value={`${worst[0]} ${worst[1].accuracy_pct}%`} sub={`${worst[1].correct}/${worst[1].total}`} />
          <KpiCard label="LONG Accuracy" value={`${pb.by_direction['LONG']?.accuracy_pct ?? 0}%`} sub={`${pb.by_direction['LONG']?.correct ?? 0}/${pb.by_direction['LONG']?.total ?? 0}`} />
          <KpiCard label="SHORT Accuracy" value={`${pb.by_direction['SHORT']?.accuracy_pct ?? 0}%`} sub={`${pb.by_direction['SHORT']?.correct ?? 0}/${pb.by_direction['SHORT']?.total ?? 0}`} />
        </div>
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
        <SymbolComparisonSection symbols={baseline.multi_symbol_conduction.by_symbol} />
      </SectionErrorBoundary>
      <SectionErrorBoundary title="Before/After Comparison">
        <BeforeAfterSection data={baseline.before_after_comparison} />
      </SectionErrorBoundary>
    </div>
  )
}
