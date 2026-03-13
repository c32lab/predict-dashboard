import { useMemo } from 'react'
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import type { Validation } from '../../types/predict'
import { formatDate } from '../../utils/format'

interface Props {
  validations: Validation[]
}

interface DayPoint {
  date: string
  '1d'?: number
  '3d'?: number
  count: number
}

export function AccuracyTrendChart({ validations }: Props) {
  const trendData = useMemo(() => {
    const byDateHorizon = new Map<string, { correct: number; total: number }>()
    const countByDate = new Map<string, number>()

    for (const v of validations) {
      const date = formatDate(v.validated_at)
      const key = `${date}|${v.horizon}`
      const entry = byDateHorizon.get(key) ?? { correct: 0, total: 0 }
      entry.total += 1
      entry.correct += v.is_correct
      byDateHorizon.set(key, entry)
      countByDate.set(date, (countByDate.get(date) ?? 0) + 1)
    }

    const dates = new Set<string>()
    for (const key of byDateHorizon.keys()) {
      dates.add(key.split('|')[0])
    }

    const sorted = [...dates].sort()
    const points: DayPoint[] = sorted.map((date) => {
      const point: DayPoint = { date, count: countByDate.get(date) ?? 0 }
      for (const horizon of ['1d', '3d'] as const) {
        const entry = byDateHorizon.get(`${date}|${horizon}`)
        if (entry && entry.total > 0) {
          point[horizon] = (entry.correct / entry.total) * 100
        }
      }
      return point
    })

    return points
  }, [validations])

  if (trendData.length === 0) {
    return (
      <div className="text-sm text-gray-500 text-center py-8">
        No validation data available for trend chart.
      </div>
    )
  }

  const maxCount = Math.max(...trendData.map((d) => d.count), 1)

  return (
    <div>
      <h3 className="text-xs text-gray-500 uppercase tracking-wider mb-2">Accuracy Over Time</h3>
      <div className="h-[180px] sm:h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={trendData} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
            <XAxis
              dataKey="date"
              tick={{ fill: '#6b7280', fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              yAxisId="accuracy"
              domain={[0, 100]}
              tick={{ fill: '#6b7280', fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              width={36}
              tickFormatter={(v) => `${v}%`}
            />
            <YAxis
              yAxisId="count"
              orientation="right"
              domain={[0, maxCount * 2]}
              tick={{ fill: '#6b7280', fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              width={30}
              hide
            />
            <Tooltip
              contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 6, fontSize: 12 }}
              labelStyle={{ color: '#9ca3af' }}
              itemStyle={{ color: '#e5e7eb' }}
              formatter={(value, name) => {
                if (name === 'Predictions') return [value ?? 0, name]
                return [`${Number(value ?? 0).toFixed(1)}%`, name ?? '']
              }}
            />
            <Legend wrapperStyle={{ fontSize: 12, color: '#9ca3af' }} />
            <Bar
              yAxisId="count"
              dataKey="count"
              fill="#374151"
              opacity={0.5}
              radius={[2, 2, 0, 0]}
              name="Predictions"
            />
            <Line yAxisId="accuracy" type="monotone" dataKey="1d" stroke="#60a5fa" strokeWidth={2} dot={false} connectNulls name="1d" />
            <Line yAxisId="accuracy" type="monotone" dataKey="3d" stroke="#a78bfa" strokeWidth={2} dot={false} connectNulls name="3d" />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
