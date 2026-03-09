import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, LineChart, Line,
} from 'recharts'
import type { BaselineResults } from '../../types/backtest'
import { HORIZONS, HORIZON_COLORS, REGIME_COLORS, tooltipStyle, fmt } from './constants'
import { Section } from './Section'

type ByYear = BaselineResults['decay_model_backtest']['by_year']
type ByRegime = BaselineResults['decay_model_backtest']['by_regime']

interface Props {
  byYear: ByYear
  byRegime: ByRegime
}

export function CycleComparisonSection({ byYear, byRegime }: Props) {
  // Year accuracy trend
  const yearData = Object.entries(byYear)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([year, data]) => {
      const row: Record<string, string | number> = { year, count: data.count }
      for (const h of HORIZONS) {
        row[h] = data.horizons[h]?.accuracy_pct ?? 0
      }
      return row
    })

  // Regime comparison
  const regimeData = Object.entries(byRegime).map(([regime, data]) => {
    const row: Record<string, string | number> = { regime, count: data.count }
    for (const h of HORIZONS) {
      row[h] = data.horizons[h]?.accuracy_pct ?? 0
    }
    return row
  })

  return (
    <Section title="Cycle Comparison — Year & Regime">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Year trend */}
        <div>
          <h3 className="text-sm font-medium text-gray-400 mb-3">Accuracy Trend by Year</h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={yearData}>
              <XAxis dataKey="year" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" domain={[0, 100]} tickFormatter={v => `${v}%`} />
              <Tooltip contentStyle={tooltipStyle} formatter={(value: unknown) => fmt(value)} />
              <Legend />
              {HORIZONS.map(h => (
                <Line key={h} type="monotone" dataKey={h} stroke={HORIZON_COLORS[h]} strokeWidth={2} dot={{ r: 4 }} />
              ))}
            </LineChart>
          </ResponsiveContainer>
          <div className="flex gap-3 mt-2 flex-wrap">
            {yearData.map(d => (
              <span key={d.year as string} className="text-xs text-gray-500">
                {d.year}: {d.count} events
              </span>
            ))}
          </div>
        </div>

        {/* Regime comparison */}
        <div>
          <h3 className="text-sm font-medium text-gray-400 mb-3">Bull vs Bear vs Sideways</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={regimeData} barCategoryGap="20%">
              <XAxis dataKey="regime" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" domain={[0, 100]} tickFormatter={v => `${v}%`} />
              <Tooltip contentStyle={tooltipStyle} formatter={(value: unknown) => fmt(value)} />
              <Legend />
              {HORIZONS.map(h => (
                <Bar key={h} dataKey={h} fill={HORIZON_COLORS[h]} radius={[4, 4, 0, 0]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
          <div className="flex gap-4 mt-2">
            {regimeData.map(d => (
              <span key={d.regime as string} className="flex items-center gap-1 text-xs text-gray-500">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: REGIME_COLORS[d.regime as string] ?? '#6b7280' }} />
                {d.regime}: {d.count} events
              </span>
            ))}
          </div>
        </div>
      </div>
    </Section>
  )
}
