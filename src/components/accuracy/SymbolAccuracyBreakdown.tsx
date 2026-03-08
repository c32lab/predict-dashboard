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
import { getSymbolColor } from './constants'

interface Props {
  validations: Validation[]
}

interface SymbolEntry {
  symbol: string
  accuracy: number
  total: number
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
      <div className="h-[180px] sm:h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
            <XAxis
              dataKey="symbol"
              tick={{ fill: '#6b7280', fontSize: 11 }}
              tickLine={false}
              axisLine={false}
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
              formatter={(value: number | undefined) => [
                `${Number(value ?? 0).toFixed(1)}%`,
                'Accuracy',
              ]}
            />
            <Bar dataKey="accuracy" radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={entry.symbol ?? index} fill={getSymbolColor(entry.symbol ?? '')} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
