import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import type { FullResults } from '../../types/backtest'
import { HORIZON_COLORS, tooltipStyle, fmt } from './constants'
import { Section } from './Section'

export function SymbolComparisonSection({ symbols }: { symbols: FullResults['multi_symbol_conduction']['by_symbol'] }) {
  const sorted = Object.entries(symbols).sort((a, b) => b[1].overall_accuracy_pct - a[1].overall_accuracy_pct)
  const horizonKeys = sorted.length > 0 ? Object.keys(sorted[0][1].horizons) : []

  const chartData = sorted.map(([symbol, s]) => {
    const row: Record<string, string | number> = { symbol }
    for (const h of horizonKeys) {
      row[h] = s.horizons[h]?.accuracy_pct ?? 0
    }
    return row
  })

  return (
    <Section title="Multi-Symbol Comparison">
      <ResponsiveContainer width="100%" height={Math.max(200, sorted.length * 50)}>
        <BarChart data={chartData} layout="vertical" barCategoryGap="20%">
          <XAxis type="number" stroke="#9ca3af" domain={[0, 100]} tickFormatter={v => `${v}%`} />
          <YAxis type="category" dataKey="symbol" stroke="#9ca3af" width={90} />
          <Tooltip contentStyle={tooltipStyle} formatter={(value: unknown) => fmt(value)} />
          <Legend />
          {horizonKeys.map(h => (
            <Bar key={h} dataKey={h} fill={HORIZON_COLORS[h as keyof typeof HORIZON_COLORS] ?? '#6b7280'} radius={[0, 4, 4, 0]} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </Section>
  )
}
