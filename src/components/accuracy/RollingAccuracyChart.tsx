import { useMemo } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'
import type { Validation } from '../../types/predict'

interface Props {
  validations: Validation[]
  windowDays?: number
}

export function RollingAccuracyChart({ validations, windowDays = 7 }: Props) {
  const rollingData = useMemo(() => {
    if (!validations.length) return []

    // Sort validations by date
    const sorted = [...validations].sort(
      (a, b) => new Date(a.validated_at).getTime() - new Date(b.validated_at).getTime()
    )

    // Group by date
    const byDate = new Map<string, { correct: number; total: number }>()
    for (const v of sorted) {
      const date = v.validated_at.slice(0, 10) // YYYY-MM-DD
      if (!byDate.has(date)) byDate.set(date, { correct: 0, total: 0 })
      const entry = byDate.get(date)!
      entry.total++
      if (v.is_correct) entry.correct++
    }

    const dates = Array.from(byDate.keys()).sort()
    if (dates.length < 2) return []

    // Sliding window
    const result: Array<{ date: string; accuracy: number; total: number }> = []
    for (let i = 0; i < dates.length; i++) {
      const endDate = new Date(dates[i])
      const startDate = new Date(endDate)
      startDate.setDate(startDate.getDate() - windowDays + 1)

      let windowCorrect = 0
      let windowTotal = 0
      for (let j = 0; j <= i; j++) {
        const d = new Date(dates[j])
        if (d >= startDate && d <= endDate) {
          const entry = byDate.get(dates[j])!
          windowCorrect += entry.correct
          windowTotal += entry.total
        }
      }

      if (windowTotal > 0) {
        result.push({
          date: dates[i],
          accuracy: Math.round((windowCorrect / windowTotal) * 1000) / 10,
          total: windowTotal,
        })
      }
    }

    return result
  }, [validations, windowDays])

  if (rollingData.length < 2) {
    return (
      <div>
        <h4 className="text-xs text-gray-500 uppercase tracking-wider mb-2">
          Rolling {windowDays}-Day Accuracy
        </h4>
        <div className="text-xs text-gray-600 py-4 text-center">Not enough data for rolling window</div>
      </div>
    )
  }

  return (
    <div>
      <h4 className="text-xs text-gray-500 uppercase tracking-wider mb-2">
        Rolling {windowDays}-Day Accuracy
      </h4>
      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={rollingData} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
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
            <ReferenceLine y={50} stroke="#374151" strokeDasharray="4 4" />
            <Tooltip
              contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 6, fontSize: 12 }}
              formatter={(value, _name, item) => [
                `${Number(value ?? 0).toFixed(1)}% (n=${(item as any).payload?.total ?? 0})`,
                'Accuracy',
              ]}
            />
            <Line type="monotone" dataKey="accuracy" stroke="#a78bfa" strokeWidth={2} dot={false} connectNulls />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
