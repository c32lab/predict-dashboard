import { useMemo } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import type { Validation } from '../../types/predict'

interface Props {
  validations: Validation[]
}

interface SymbolEntry {
  symbol: string
  accuracy: number
  total: number
}

function getAccuracyColor(accuracy: number): string {
  if (accuracy > 60) return '#22c55e'
  if (accuracy >= 40) return '#eab308'
  return '#ef4444'
}

export function SymbolAccuracyBreakdown({ validations }: Props) {
  const data = useMemo(() => {
    const bySymbol = new Map<string, { correct: number; total: number }>()

    for (const v of validations) {
      const entry = bySymbol.get(v.symbol) ?? { correct: 0, total: 0 }
      entry.total += 1
      entry.correct += v.is_correct
      bySymbol.set(v.symbol, entry)
    }

    const entries: SymbolEntry[] = [...bySymbol.entries()]
      .map(([symbol, { correct, total }]) => ({
        symbol,
        accuracy: total > 0 ? (correct / total) * 100 : 0,
        total,
      }))
      .sort((a, b) => b.accuracy - a.accuracy)

    return entries
  }, [validations])

  if (data.length === 0) {
    return (
      <div className="text-sm text-gray-500 text-center py-8">
        No validation data available for symbol breakdown.
      </div>
    )
  }

  return (
    <div>
      <h3 className="text-xs text-gray-500 uppercase tracking-wider mb-2">Accuracy by Symbol</h3>
      <div style={{ height: Math.max(180, data.length * 36) }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
            <XAxis
              type="number"
              domain={[0, 100]}
              tick={{ fill: '#6b7280', fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${v}%`}
            />
            <YAxis
              type="category"
              dataKey="symbol"
              tick={{ fill: '#6b7280', fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              width={80}
            />
            <Tooltip
              contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 6, fontSize: 12 }}
              labelStyle={{ color: '#9ca3af' }}
              formatter={(value: number | undefined, _name?: string, props?: { payload?: SymbolEntry }) => [
                `${Number(value ?? 0).toFixed(1)}% (${props?.payload?.total ?? 0} predictions)`,
                'Accuracy',
              ]}
            />
            <Bar dataKey="accuracy" radius={[0, 4, 4, 0]}>
              {data.map((entry, index) => (
                <Cell key={entry.symbol ?? index} fill={getAccuracyColor(entry.accuracy)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
