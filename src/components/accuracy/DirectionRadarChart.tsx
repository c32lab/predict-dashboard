import { useMemo } from 'react'
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import type { Validation } from '../../types/predict'

interface Props {
  validations: Validation[]
}

export function DirectionRadarChart({ validations }: Props) {
  const radarData = useMemo(() => {
    if (!validations.length) return []

    // Group by trigger_event (pattern) and direction
    const patternMap = new Map<string, { longCorrect: number; longTotal: number; shortCorrect: number; shortTotal: number }>()

    for (const v of validations) {
      const pattern = v.trigger_event || 'unknown'
      if (!patternMap.has(pattern)) {
        patternMap.set(pattern, { longCorrect: 0, longTotal: 0, shortCorrect: 0, shortTotal: 0 })
      }
      const entry = patternMap.get(pattern)!
      if (v.direction === 'LONG') {
        entry.longTotal++
        if (v.is_correct) entry.longCorrect++
      } else {
        entry.shortTotal++
        if (v.is_correct) entry.shortCorrect++
      }
    }

    // Only include patterns with at least 2 predictions total
    return Array.from(patternMap.entries())
      .filter(([, v]) => v.longTotal + v.shortTotal >= 2)
      .slice(0, 8) // limit to 8 axes for readability
      .map(([pattern, v]) => ({
        pattern: pattern.length > 16 ? pattern.slice(0, 14) + '…' : pattern,
        LONG: v.longTotal > 0 ? Math.round((v.longCorrect / v.longTotal) * 100) : 0,
        SHORT: v.shortTotal > 0 ? Math.round((v.shortCorrect / v.shortTotal) * 100) : 0,
      }))
  }, [validations])

  if (radarData.length < 3) {
    return (
      <div>
        <h4 className="text-xs text-gray-500 uppercase tracking-wider mb-2">Direction Comparison</h4>
        <div className="text-xs text-gray-600 py-4 text-center">
          Need at least 3 patterns to display radar chart
        </div>
      </div>
    )
  }

  return (
    <div>
      <h4 className="text-xs text-gray-500 uppercase tracking-wider mb-2">Direction Comparison</h4>
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
            <PolarGrid stroke="#374151" />
            <PolarAngleAxis dataKey="pattern" tick={{ fill: '#9ca3af', fontSize: 10 }} />
            <PolarRadiusAxis domain={[0, 100]} tick={{ fill: '#6b7280', fontSize: 10 }} tickFormatter={(v) => `${v}%`} />
            <Tooltip
              contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 6, fontSize: 12 }}
              formatter={(value) => [`${value ?? 0}%`, '']}
            />
            <Legend wrapperStyle={{ fontSize: 12, color: '#9ca3af' }} />
            <Radar name="LONG" dataKey="LONG" stroke="#22c55e" fill="#22c55e" fillOpacity={0.2} />
            <Radar name="SHORT" dataKey="SHORT" stroke="#ef4444" fill="#ef4444" fillOpacity={0.2} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
