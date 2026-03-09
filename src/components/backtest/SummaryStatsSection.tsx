import type { FullResults, AccuracyBucket } from '../../types/backtest'
import { Section } from './Section'

interface Props {
  data: FullResults
}

export function SummaryStatsSection({ data }: Props) {
  const pb = data.prediction_backtest
  const dm = data.decay_model_backtest

  // Total events = prediction validations + decay matched events
  const totalEvents = pb.overall_total + dm.matched_events

  // Best/worst performing periods from by_day
  const dayEntries = Object.entries(pb.by_day ?? {})
  const bestDay = dayEntries.length > 0
    ? dayEntries.reduce((a, b) => b[1].accuracy_pct > a[1].accuracy_pct ? b : a)
    : null
  const worstDay = dayEntries.length > 0
    ? dayEntries.reduce((a, b) => b[1].accuracy_pct < a[1].accuracy_pct ? b : a)
    : null

  // Best/worst performing years from decay by_year
  const yearEntries = Object.entries(dm.by_year ?? {})
  const bestYear = yearEntries.length > 0
    ? yearEntries.reduce((a, b) => {
        const aAvg = avgHorizonAccuracy(a[1].horizons)
        const bAvg = avgHorizonAccuracy(b[1].horizons)
        return bAvg > aAvg ? b : a
      })
    : null
  const worstYear = yearEntries.length > 0
    ? yearEntries.reduce((a, b) => {
        const aAvg = avgHorizonAccuracy(a[1].horizons)
        const bAvg = avgHorizonAccuracy(b[1].horizons)
        return bAvg < aAvg ? b : a
      })
    : null

  // Best/worst patterns from by_trigger_pattern
  const patternEntries = Object.entries(pb.by_trigger_pattern ?? {})
  const bestPattern = patternEntries.length > 0
    ? patternEntries.reduce((a, b) => b[1].accuracy_pct > a[1].accuracy_pct ? b : a)
    : null
  const worstPattern = patternEntries.length > 0
    ? patternEntries.reduce((a, b) => b[1].accuracy_pct < a[1].accuracy_pct ? b : a)
    : null

  return (
    <Section title="Summary Statistics (2019–2026)">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Events Backtested"
          value={String(totalEvents)}
          sub={`${pb.overall_total} predictions + ${dm.matched_events} decay events`}
        />
        <StatCard
          label="Overall Accuracy"
          value={`${pb.overall_accuracy_pct}%`}
          sub={`${pb.overall_correct}/${pb.overall_total} validations`}
        />
        <StatCard
          label="Best Period"
          value={bestYear ? `${bestYear[0]} — ${avgHorizonAccuracy(bestYear[1].horizons).toFixed(1)}%` : bestDay ? `${bestDay[0]}` : '—'}
          sub={bestYear ? `${bestYear[1].count} events` : bestDay ? `${bestDay[1].accuracy_pct}% (${bestDay[1].correct}/${bestDay[1].total})` : undefined}
          variant="success"
        />
        <StatCard
          label="Worst Period"
          value={worstYear ? `${worstYear[0]} — ${avgHorizonAccuracy(worstYear[1].horizons).toFixed(1)}%` : worstDay ? `${worstDay[0]}` : '—'}
          sub={worstYear ? `${worstYear[1].count} events` : worstDay ? `${worstDay[1].accuracy_pct}% (${worstDay[1].correct}/${worstDay[1].total})` : undefined}
          variant="danger"
        />
        <StatCard
          label="Best Pattern"
          value={bestPattern ? bestPattern[0].replace(/_/g, ' ') : '—'}
          sub={bestPattern ? `${bestPattern[1].accuracy_pct}% (${bestPattern[1].correct}/${bestPattern[1].total})` : undefined}
          variant="success"
        />
        <StatCard
          label="Worst Pattern"
          value={worstPattern ? worstPattern[0].replace(/_/g, ' ') : '—'}
          sub={worstPattern ? `${worstPattern[1].accuracy_pct}% (${worstPattern[1].correct}/${worstPattern[1].total})` : undefined}
          variant="danger"
        />
        <StatCard
          label="Decay Models Used"
          value={String(dm.decay_models_used.length)}
          sub={dm.decay_models_used.slice(0, 3).join(', ') + (dm.decay_models_used.length > 3 ? '…' : '')}
        />
        <StatCard
          label="Prediction / Decay F1"
          value={pb.confusion_matrix ? `${pb.confusion_matrix.f1}%` : '—'}
          sub={pb.confusion_matrix ? `P: ${pb.confusion_matrix.precision_pct}% R: ${pb.confusion_matrix.recall_pct}%` : undefined}
        />
      </div>
    </Section>
  )
}

function avgHorizonAccuracy(horizons: Record<string, AccuracyBucket | { correct: number; total: number; accuracy_pct: number }>): number {
  const entries = Object.values(horizons)
  if (entries.length === 0) return 0
  return entries.reduce((sum, h) => sum + h.accuracy_pct, 0) / entries.length
}

function StatCard({ label, value, sub, variant }: { label: string; value: string; sub?: string; variant?: 'success' | 'danger' }) {
  const borderColor = variant === 'success' ? 'border-green-800' : variant === 'danger' ? 'border-red-800' : 'border-gray-800'
  return (
    <div className={`bg-gray-900 border ${borderColor} rounded-xl p-4`}>
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <div className="text-lg font-bold">{value}</div>
      {sub && <div className="text-xs text-gray-400 mt-1">{sub}</div>}
    </div>
  )
}
