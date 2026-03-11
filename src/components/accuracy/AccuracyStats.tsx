import DeltaBadge from '../ui/DeltaBadge'
import AnomalyBadge from '../ui/AnomalyBadge'

export function AccuracyStats({
  total,
  correct,
  accuracyPct,
  previousAccuracy,
}: {
  total: number
  correct: number
  accuracyPct: number
  previousAccuracy?: number
}) {
  const colorClass =
    accuracyPct > 50 ? 'text-green-400' : accuracyPct >= 40 ? 'text-yellow-400' : 'text-red-400'

  if (total === 0) {
    return (
      <p className="text-center text-gray-500 py-6 text-sm">
        No validations for selected filter
      </p>
    )
  }

  return (
    <div className="flex flex-wrap gap-4 sm:gap-6">
      <div className="flex flex-col items-center gap-1 min-w-[100px] sm:min-w-[120px]">
        <span className="text-xs text-gray-500 uppercase tracking-wider">Total</span>
        <span className="text-3xl sm:text-4xl font-bold font-mono text-gray-100">{total}</span>
        <span className="text-sm text-gray-400">predictions</span>
      </div>
      <div className="flex flex-col items-center gap-1 min-w-[100px] sm:min-w-[120px]">
        <span className="text-xs text-gray-500 uppercase tracking-wider">Correct</span>
        <span className="text-3xl sm:text-4xl font-bold font-mono text-green-400">{correct}</span>
        <span className="text-sm text-gray-400">of {total}</span>
      </div>
      <div className="flex flex-col items-center gap-1 min-w-[100px] sm:min-w-[120px]">
        <span className="text-xs text-gray-500 uppercase tracking-wider">Accuracy</span>
        <div className="flex items-center gap-2">
          <span className={`text-3xl sm:text-4xl font-bold font-mono ${colorClass}`}>
            {accuracyPct.toFixed(1)}%
          </span>
          {previousAccuracy !== undefined && (
            <DeltaBadge current={accuracyPct} previous={previousAccuracy} format="percent" />
          )}
        </div>
        <span className="text-sm text-gray-400">from validations</span>
        {accuracyPct < 50 && (
          <div className="mt-1">
            <AnomalyBadge level="critical" message="Accuracy below 50%" />
          </div>
        )}
      </div>
    </div>
  )
}
