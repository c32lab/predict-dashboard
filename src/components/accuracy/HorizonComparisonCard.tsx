import type { AccuracyEntry } from '../../types/predict'

const HORIZONS = ['1d', '3d', '7d'] as const

function accColor(pct: number): string {
  if (pct >= 50) return 'text-green-400'
  if (pct >= 40) return 'text-yellow-400'
  return 'text-red-400'
}

function deltaColor(delta: number): string {
  if (delta > 0) return 'text-green-400'
  if (delta < 0) return 'text-red-400'
  return 'text-gray-500'
}

function deltaArrow(delta: number): string {
  if (delta > 0) return '\u25B2'
  if (delta < 0) return '\u25BC'
  return '\u2014'
}

export function HorizonComparisonCard({
  accuracy,
}: {
  accuracy: Record<string, AccuracyEntry>
}) {
  const entries = HORIZONS
    .filter((h) => accuracy[h] && accuracy[h].total > 0)
    .map((h) => ({ horizon: h, ...accuracy[h] }))

  if (entries.length < 2) return null

  // Calculate deltas between adjacent horizons
  const deltas: (number | null)[] = entries.map((entry, i) => {
    if (i === 0) return null
    return entry.accuracy - entries[i - 1].accuracy
  })

  return (
    <section className="bg-gray-900 rounded-xl border border-gray-800 p-4">
      <h3 className="text-sm font-semibold text-gray-200 mb-3">Horizon Comparison</h3>
      <div className={`grid gap-3`} style={{ gridTemplateColumns: `repeat(${entries.length}, 1fr)` }}>
        {entries.map((entry, i) => (
          <div key={entry.horizon} className="bg-gray-800/60 rounded-lg p-3 text-center">
            <span className="text-xs text-gray-500 uppercase tracking-wider">{entry.horizon}</span>
            <p className={`text-2xl font-bold font-mono mt-1 ${accColor(entry.accuracy)}`}>
              {entry.accuracy.toFixed(1)}%
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              {entry.correct}/{entry.total} correct
            </p>
            {deltas[i] != null && (
              <p className={`text-xs font-mono mt-1 ${deltaColor(deltas[i]!)}`}>
                {deltaArrow(deltas[i]!)} {Math.abs(deltas[i]!).toFixed(1)}pp vs {entries[i - 1].horizon}
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
