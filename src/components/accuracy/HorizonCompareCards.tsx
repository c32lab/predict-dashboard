import { useMemo } from 'react'
import type { AccuracyEntry, Validation } from '../../types/predict'

const HORIZONS = ['1d', '3d', '7d'] as const

function accColor(pct: number): string {
  if (pct >= 50) return 'text-green-400'
  if (pct >= 40) return 'text-yellow-400'
  return 'text-red-400'
}

function borderColor(pct: number): string {
  if (pct >= 50) return 'border-green-900/40'
  if (pct >= 40) return 'border-yellow-900/40'
  return 'border-red-900/40'
}

function deltaArrow(delta: number): string {
  if (delta > 0) return '\u25B2'
  if (delta < 0) return '\u25BC'
  return '\u2014'
}

function deltaColor(delta: number): string {
  if (delta > 0) return 'text-green-400'
  if (delta < 0) return 'text-red-400'
  return 'text-gray-500'
}

interface HorizonStat {
  horizon: string
  accuracy: number
  total: number
  correct: number
  delta: number | null
}

export function HorizonCompareCards({
  accuracy,
  validations = [],
}: {
  accuracy: Record<string, AccuracyEntry>
  validations?: Validation[]
}) {
  const stats = useMemo<HorizonStat[]>(() => {
    return HORIZONS
      .filter((h) => accuracy[h] && accuracy[h].total > 0)
      .map((h) => {
        const entry = accuracy[h]
        // Compute delta from previous period using validations
        const horizonVals = validations
          .filter((v) => v.horizon === h)
          .sort((a, b) => new Date(b.validated_at).getTime() - new Date(a.validated_at).getTime())

        let delta: number | null = null
        if (horizonVals.length >= 4) {
          const mid = Math.floor(horizonVals.length / 2)
          const recentCorrect = horizonVals.slice(0, mid).filter((v) => v.is_correct === 1).length
          const recentTotal = mid
          const olderCorrect = horizonVals.slice(mid).filter((v) => v.is_correct === 1).length
          const olderTotal = horizonVals.length - mid
          const recentAcc = (recentCorrect / recentTotal) * 100
          const olderAcc = (olderCorrect / olderTotal) * 100
          delta = recentAcc - olderAcc
        }

        return {
          horizon: h,
          accuracy: entry.accuracy,
          total: entry.total,
          correct: entry.correct,
          delta,
        }
      })
  }, [accuracy, validations])

  if (stats.length === 0) return null

  return (
    <section className="bg-gray-900 rounded-xl border border-gray-800 p-4">
      <h3 className="text-sm font-semibold text-gray-200 mb-3">Horizon Comparison</h3>
      <div
        className="grid gap-3"
        style={{ gridTemplateColumns: `repeat(${stats.length}, 1fr)` }}
      >
        {stats.map((s) => (
          <div
            key={s.horizon}
            className={`bg-gray-800/60 border ${borderColor(s.accuracy)} rounded-lg p-4 text-center`}
          >
            <span className="text-xs text-gray-500 uppercase tracking-wider font-medium">
              {s.horizon}
            </span>
            <p className={`text-3xl font-bold font-mono mt-2 ${accColor(s.accuracy)}`}>
              {s.accuracy.toFixed(1)}%
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {s.correct}/{s.total} samples
            </p>
            {s.delta != null && (
              <p className={`text-xs font-mono mt-2 ${deltaColor(s.delta)}`}>
                {deltaArrow(s.delta)} {Math.abs(s.delta).toFixed(1)}pp vs prev
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
