import type { FullResults } from '../../types/backtest'
import { Section } from './Section'

export function BeforeAfterSection({ data }: { data: FullResults['before_after_comparison'] }) {
  const { before, after, delta } = data
  const deltaColor = delta.accuracy_change_pp >= 0 ? 'text-green-400' : 'text-red-400'
  const deltaSign = delta.accuracy_change_pp >= 0 ? '+' : ''

  return (
    <Section title="Before / After Comparison">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Before card */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-gray-300 mb-3">Before</h3>
          <div className="text-2xl font-bold">{before.overall_accuracy_pct}%</div>
          <div className="text-xs text-gray-400">{before.overall_correct}/{before.overall_total} correct</div>
          <div className="text-xs text-gray-500 mt-1">{before.total_predictions} predictions</div>
          <div className="mt-3 space-y-1">
            {Object.entries(before.by_horizon).map(([h, s]) => (
              <div key={h} className="flex justify-between text-sm text-gray-400">
                <span>{h}</span>
                <span>{s.accuracy_pct}% ({s.correct}/{s.total})</span>
              </div>
            ))}
          </div>
        </div>

        {/* Delta card */}
        <div className="flex flex-col items-center justify-center bg-gray-800/30 border border-gray-700 rounded-xl p-4">
          <div className="text-xs text-gray-500 mb-2">Accuracy Change</div>
          <div className={`text-3xl font-bold ${deltaColor}`}>
            {deltaSign}{delta.accuracy_change_pp}pp
          </div>
          <div className="text-xs text-gray-500 mt-3">
            {delta.predictions_removed} predictions removed
          </div>
          <div className="text-xs text-gray-500">
            {delta.validations_removed} validations removed
          </div>
        </div>

        {/* After card */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-gray-300 mb-3">After</h3>
          <div className="text-2xl font-bold">{after.overall_accuracy_pct}%</div>
          <div className="text-xs text-gray-400">{after.overall_correct}/{after.overall_total} correct</div>
          <div className="text-xs text-gray-500 mt-1">{after.total_predictions} predictions</div>
          <div className="mt-3 space-y-1">
            {Object.entries(after.by_horizon).map(([h, s]) => (
              <div key={h} className="flex justify-between text-sm text-gray-400">
                <span>{h}</span>
                <span>{s.accuracy_pct}% ({s.correct}/{s.total})</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Section>
  )
}
