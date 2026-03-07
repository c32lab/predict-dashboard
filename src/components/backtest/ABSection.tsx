import { useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import type { ABResults } from '../../types/backtest'
import { HORIZONS, HORIZON_COLORS, tooltipStyle, fmt } from './constants'
import { Section } from './Section'

export function ABSection({ ab }: { ab: ABResults }) {
  const [showDesc, setShowDesc] = useState(false)
  const strategies = Object.keys(ab.summary).sort()

  const chartData = strategies.map(s => {
    const h = ab.summary[s].horizons
    return {
      strategy: s,
      '1d': h['1d']?.accuracy_pct ?? 0,
      '3d': h['3d']?.accuracy_pct ?? 0,
      '7d': h['7d']?.accuracy_pct ?? 0,
    }
  })

  const bestStrategy = strategies.reduce((best, s) => {
    const h = ab.summary[s].horizons
    const cur = h['1d']?.total ? h['1d'].accuracy_pct : 0
    const prev = ab.summary[best].horizons['1d']?.total ? ab.summary[best].horizons['1d'].accuracy_pct : 0
    return cur > prev ? s : best
  })

  return (
    <Section title="A/B Strategy Comparison">
      <div className="mb-4">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} barCategoryGap="20%">
            <XAxis dataKey="strategy" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" domain={[0, 100]} tickFormatter={v => `${v}%`} />
            <Tooltip contentStyle={tooltipStyle} formatter={(value: unknown) => fmt(value)} />
            <Legend />
            {HORIZONS.map(h => (
              <Bar key={h} dataKey={h} fill={HORIZON_COLORS[h]} radius={[4, 4, 0, 0]} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800 text-gray-400">
              <th className="text-left py-2 pr-4">Strategy</th>
              {HORIZONS.map(h => (
                <th key={h} className="text-right py-2 px-3">{h} Acc%</th>
              ))}
              {HORIZONS.map(h => (
                <th key={`n-${h}`} className="text-right py-2 px-3">{h} N</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {strategies.map(s => {
              const h = ab.summary[s].horizons
              const isBest = s === bestStrategy
              return (
                <tr key={s} className={`border-b border-gray-800/50 ${isBest ? 'bg-blue-950/30' : ''}`}>
                  <td className="py-2 pr-4 font-mono">
                    {s}{isBest && <span className="ml-2 text-xs text-blue-400">best</span>}
                  </td>
                  {HORIZONS.map(hz => (
                    <td key={hz} className="text-right py-2 px-3">
                      {h[hz]?.total ? `${h[hz].accuracy_pct}%` : '—'}
                    </td>
                  ))}
                  {HORIZONS.map(hz => (
                    <td key={`n-${hz}`} className="text-right py-2 px-3 text-gray-500">
                      {h[hz]?.total ?? 0}
                      {h[hz]?.neutral_skipped ? <span className="text-gray-600 ml-1">(+{h[hz].neutral_skipped} skip)</span> : null}
                    </td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <button
        className="mt-4 text-xs text-gray-500 hover:text-gray-300 underline"
        onClick={() => setShowDesc(!showDesc)}
      >
        {showDesc ? 'Hide' : 'Show'} strategy descriptions
      </button>
      {showDesc && (
        <div className="mt-2 space-y-1 text-xs text-gray-400">
          {Object.entries(ab.strategy_descriptions).map(([k, v]) => (
            <div key={k}><span className="font-mono text-gray-300">{k}:</span> {v}</div>
          ))}
        </div>
      )}
    </Section>
  )
}
