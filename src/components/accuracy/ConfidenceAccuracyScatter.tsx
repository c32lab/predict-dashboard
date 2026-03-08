import { useMemo } from 'react'
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import type { Validation } from '../../types/predict'

interface Props {
  validations: Validation[]
}

interface ScatterPoint {
  confidence: number
  is_correct: number
}

export function ConfidenceAccuracyScatter({ validations }: Props) {
  const { points, summary } = useMemo(() => {
    const pts: ScatterPoint[] = validations.map((v) => ({
      confidence: v.confidence * 100,
      is_correct: v.is_correct,
    }))

    const high = validations.filter((v) => v.confidence > 0.7)
    const low = validations.filter((v) => v.confidence < 0.5)

    const highAcc = high.length > 0
      ? (high.filter((v) => v.is_correct === 1).length / high.length) * 100
      : null
    const lowAcc = low.length > 0
      ? (low.filter((v) => v.is_correct === 1).length / low.length) * 100
      : null

    return {
      points: pts,
      summary: { highAcc, lowAcc, highCount: high.length, lowCount: low.length },
    }
  }, [validations])

  if (points.length === 0) {
    return (
      <div className="text-sm text-gray-500 text-center py-8">
        No validation data available for confidence analysis.
      </div>
    )
  }

  return (
    <div>
      <h3 className="text-xs text-gray-500 uppercase tracking-wider mb-2">Confidence vs Accuracy</h3>
      <div className="h-[180px] sm:h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
            <XAxis
              dataKey="confidence"
              type="number"
              domain={[0, 100]}
              tick={{ fill: '#6b7280', fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              name="Confidence"
              unit="%"
            />
            <YAxis
              dataKey="is_correct"
              type="number"
              domain={[0, 1]}
              ticks={[0, 1]}
              tick={{ fill: '#6b7280', fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              width={36}
              tickFormatter={(v) => (v === 1 ? 'Yes' : 'No')}
              name="Correct"
            />
            <Tooltip
              contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 6, fontSize: 12 }}
              formatter={(value: number | undefined, name?: string) => {
                const v = Number(value ?? 0)
                if (name === 'Correct') return [v === 1 ? 'Yes' : 'No', name]
                return [`${v.toFixed(1)}%`, name ?? '']
              }}
            />
            <Scatter data={points} fill="#60a5fa" opacity={0.6} />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 text-xs text-gray-400 space-y-1" data-testid="confidence-summary">
        {summary.highAcc !== null && (
          <p>
            High confidence (&gt;70%): <span className="text-gray-200">{summary.highAcc.toFixed(1)}% accurate</span>{' '}
            ({summary.highCount} predictions)
          </p>
        )}
        {summary.lowAcc !== null && (
          <p>
            Low confidence (&lt;50%): <span className="text-gray-200">{summary.lowAcc.toFixed(1)}% accurate</span>{' '}
            ({summary.lowCount} predictions)
          </p>
        )}
        {summary.highAcc !== null && summary.lowAcc !== null && (
          <p className="text-gray-500">
            {summary.highAcc > summary.lowAcc
              ? 'Higher confidence correlates with better accuracy.'
              : summary.highAcc < summary.lowAcc
                ? 'Higher confidence does not correlate with better accuracy.'
                : 'No significant correlation between confidence and accuracy.'}
          </p>
        )}
      </div>
    </div>
  )
}
