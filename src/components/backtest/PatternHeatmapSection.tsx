import type { AccuracyBucket } from '../../types/backtest'
import { Section } from './Section'

function patternColor(pct: number) {
  if (pct >= 70) return 'bg-green-900 text-green-200'
  if (pct >= 50) return 'bg-green-950 text-green-300'
  return 'bg-red-900/60 text-red-200'
}

export function PatternHeatmapSection({ patterns }: { patterns: Record<string, AccuracyBucket> }) {
  const sorted = Object.entries(patterns).sort((a, b) => b[1].accuracy_pct - a[1].accuracy_pct)
  return (
    <Section title="Pattern Accuracy Heatmap">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {sorted.map(([pattern, s]) => (
          <div key={pattern} className={`rounded-lg p-3 ${patternColor(s.accuracy_pct)}`}>
            <div className="font-mono text-sm">{pattern}</div>
            <div className="flex justify-between mt-1 text-xs">
              <span>{s.correct}/{s.total}</span>
              <span className="font-bold">{s.accuracy_pct}%</span>
            </div>
          </div>
        ))}
      </div>
    </Section>
  )
}
