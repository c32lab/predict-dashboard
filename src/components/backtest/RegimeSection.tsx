import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import type { BaselineResults } from '../../types/backtest'
import { HORIZONS, HORIZON_COLORS, REGIME_COLORS, tooltipStyle, fmt } from './constants'
import { Section } from './Section'

export function RegimeSection({ regimes }: { regimes: BaselineResults['decay_model_backtest']['by_regime'] }) {
  const chartData = Object.entries(regimes).map(([regime, data]) => ({
    regime,
    count: data.count,
    '1d': data.horizons['1d']?.accuracy_pct ?? 0,
    '3d': data.horizons['3d']?.accuracy_pct ?? 0,
    '7d': data.horizons['7d']?.accuracy_pct ?? 0,
  }))

  return (
    <Section title="Regime Analysis (Decay Model)">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData} barCategoryGap="20%">
          <XAxis dataKey="regime" stroke="#9ca3af" />
          <YAxis stroke="#9ca3af" domain={[0, 100]} tickFormatter={v => `${v}%`} />
          <Tooltip contentStyle={tooltipStyle} formatter={(value: unknown) => fmt(value)} />
          <Legend />
          {HORIZONS.map(h => (
            <Bar key={h} dataKey={h} fill={HORIZON_COLORS[h]} radius={[4, 4, 0, 0]} />
          ))}
        </BarChart>
      </ResponsiveContainer>

      <div className="grid grid-cols-3 gap-4 mt-4">
        {Object.entries(regimes).map(([regime, data]) => (
          <div key={regime} className="rounded-lg border border-gray-800 p-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: REGIME_COLORS[regime] ?? '#6b7280' }} />
              <span className="font-medium capitalize">{regime}</span>
              <span className="text-xs text-gray-500">({data.count} events)</span>
            </div>
            {Object.entries(data.horizons).map(([h, s]) => (
              <div key={h} className="flex justify-between text-sm text-gray-400">
                <span>{h}</span>
                <span>{s.total ? `${s.accuracy_pct}% (${s.correct}/${s.total})` : '—'}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </Section>
  )
}
