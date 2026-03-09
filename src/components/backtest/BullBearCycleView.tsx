import type { FullResults } from '../../types/backtest'
import { Section } from './Section'

type BeforeAfterData = FullResults['before_after_comparison']

interface Props {
  data: BeforeAfterData
}

function DeltaBadge({ before, after }: { before: number; after: number }) {
  const diff = after - before
  const sign = diff >= 0 ? '+' : ''
  const color = diff >= 0 ? 'text-green-400' : 'text-red-400'
  const bg = diff >= 0 ? 'bg-green-900/30' : 'bg-red-900/30'
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${color} ${bg}`}>
      {sign}{diff.toFixed(1)}pp
    </span>
  )
}

function MetricRow({ label, before, after }: { label: string; before: number; after: number }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-gray-800/50 last:border-0">
      <span className="text-sm text-gray-400">{label}</span>
      <div className="flex items-center gap-3 text-sm">
        <span className="text-gray-500 w-14 text-right">{before.toFixed(1)}%</span>
        <span className="text-gray-300 font-medium w-14 text-right">{after.toFixed(1)}%</span>
        <DeltaBadge before={before} after={after} />
      </div>
    </div>
  )
}

export function BullBearCycleView({ data }: Props) {
  const { before, after, delta } = data

  const horizonKeys = Array.from(new Set([
    ...Object.keys(before.by_horizon),
    ...Object.keys(after.by_horizon),
  ])).sort()

  const directionKeys = Array.from(new Set([
    ...Object.keys(before.by_direction),
    ...Object.keys(after.by_direction),
  ])).sort()

  return (
    <Section title="Bull / Bear Cycle Comparison">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Before Card */}
        <div className="bg-gray-800/40 border border-gray-700 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-300">Before Cleanup</h3>
            <span className="text-xs text-gray-500">{before.total_predictions} predictions</span>
          </div>
          <div className="text-3xl font-bold mb-1">{before.overall_accuracy_pct}%</div>
          <div className="text-xs text-gray-500 mb-4">{before.overall_correct}/{before.overall_total} correct</div>

          <div className="space-y-1">
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">By Horizon</div>
            {horizonKeys.map(h => {
              const s = before.by_horizon[h]
              return s ? (
                <div key={h} className="flex justify-between text-sm text-gray-400">
                  <span>{h}</span>
                  <span>{s.accuracy_pct}% ({s.correct}/{s.total})</span>
                </div>
              ) : null
            })}
          </div>

          <div className="mt-3 space-y-1">
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">By Direction</div>
            {directionKeys.map(d => {
              const s = before.by_direction[d]
              return s ? (
                <div key={d} className="flex justify-between text-sm text-gray-400">
                  <span>{d}</span>
                  <span>{s.accuracy_pct}% ({s.correct}/{s.total})</span>
                </div>
              ) : null
            })}
          </div>
        </div>

        {/* After Card */}
        <div className="bg-gray-800/40 border border-gray-700 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-300">After Cleanup</h3>
            <span className="text-xs text-gray-500">{after.total_predictions} predictions</span>
          </div>
          <div className="text-3xl font-bold mb-1">{after.overall_accuracy_pct}%</div>
          <div className="text-xs text-gray-500 mb-4">{after.overall_correct}/{after.overall_total} correct</div>

          <div className="space-y-1">
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">By Horizon</div>
            {horizonKeys.map(h => {
              const s = after.by_horizon[h]
              return s ? (
                <div key={h} className="flex justify-between text-sm text-gray-400">
                  <span>{h}</span>
                  <span>{s.accuracy_pct}% ({s.correct}/{s.total})</span>
                </div>
              ) : null
            })}
          </div>

          <div className="mt-3 space-y-1">
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">By Direction</div>
            {directionKeys.map(d => {
              const s = after.by_direction[d]
              return s ? (
                <div key={d} className="flex justify-between text-sm text-gray-400">
                  <span>{d}</span>
                  <span>{s.accuracy_pct}% ({s.correct}/{s.total})</span>
                </div>
              ) : null
            })}
          </div>
        </div>
      </div>

      {/* Delta Summary */}
      <div className="mt-6 bg-gray-800/30 border border-gray-700 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-gray-300 mb-3">Change Summary</h3>
        <MetricRow label="Overall Accuracy" before={before.overall_accuracy_pct} after={after.overall_accuracy_pct} />
        {horizonKeys.map(h => {
          const b = before.by_horizon[h]
          const a = after.by_horizon[h]
          return b && a ? (
            <MetricRow key={h} label={`Horizon ${h}`} before={b.accuracy_pct} after={a.accuracy_pct} />
          ) : null
        })}
        {directionKeys.map(d => {
          const b = before.by_direction[d]
          const a = after.by_direction[d]
          return b && a ? (
            <MetricRow key={d} label={`Direction ${d}`} before={b.accuracy_pct} after={a.accuracy_pct} />
          ) : null
        })}
        <div className="flex gap-6 mt-3 pt-3 border-t border-gray-800">
          <div className="text-xs text-gray-500">
            <span className="text-gray-400 font-medium">{delta.predictions_removed}</span> predictions removed
          </div>
          <div className="text-xs text-gray-500">
            <span className="text-gray-400 font-medium">{delta.validations_removed}</span> validations removed
          </div>
        </div>
      </div>
    </Section>
  )
}
