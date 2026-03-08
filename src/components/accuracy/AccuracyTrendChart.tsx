import { useMemo } from 'react'
import {
  LineChart,
  Line,
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
}

export function AccuracyTrendChart({ validations }: Props) {
  const trendData = useMemo(() => {
    const byDateHorizon = new Map<string, { correct: number; total: number }>()

    for (const v of validations) {
      const date = formatDate(v.validated_at)
      const key = `${date}|${v.horizon}`
      const entry = byDateHorizon.get(key) ?? { correct: 0, total: 0 }
      entry.total += 1
      entry.correct += v.is_correct
      byDateHorizon.set(key, entry)
    }

    const dates = new Set<string>()
    for (const key of byDateHorizon.keys()) {
      dates.add(key.split('|')[0])
    }

    const sorted = [...dates].sort()
    const points: DayPoint[] = sorted.map((date) => {
      const point: DayPoint = { date }
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

  return (
    <div>
      <h3 className="text-xs text-gray-500 uppercase tracking-wider mb-2">Accuracy Over Time</h3>
      <div className="h-[180px] sm:h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={trendData} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
            <XAxis
              dataKey="date"
              tick={{ fill: '#6b7280', fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fill: '#6b7280', fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              width={36}
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip
              contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 6, fontSize: 12 }}
              labelStyle={{ color: '#9ca3af' }}
              itemStyle={{ color: '#e5e7eb' }}
              formatter={(value: number | undefined, name?: string) => [`${Number(value ?? 0).toFixed(1)}%`, name ?? '']}
            />
            <Legend wrapperStyle={{ fontSize: 12, color: '#9ca3af' }} />
            <Line type="monotone" dataKey="1d" stroke="#60a5fa" strokeWidth={2} dot={false} connectNulls name="1d" />
            <Line type="monotone" dataKey="3d" stroke="#a78bfa" strokeWidth={2} dot={false} connectNulls name="3d" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
