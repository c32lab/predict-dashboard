import { useMemo } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LineChart,
  Line,
  Legend,
} from 'recharts'
import { useDecayActive, useDecayModels } from '../../hooks/usePredictApi'

const CURVE_COLORS = ['#60a5fa', '#a78bfa', '#34d399', '#fbbf24', '#f87171', '#fb923c']

function generateDecayCurve(model: string, coefficient: number, impactPct: number, elapsedDays: number) {
  // Estimate initial impact from current state
  let initialImpact: number
  if (model === 'exponential') {
    initialImpact = elapsedDays > 0 ? impactPct / Math.pow(coefficient, elapsedDays) : impactPct
  } else {
    // linear: impact = initial * (1 - elapsed/total), coefficient ~ (1 - 1/total_days)
    const rate = 1 - coefficient
    initialImpact = rate > 0 && elapsedDays > 0 ? impactPct / Math.max(0.01, 1 - rate * elapsedDays) : impactPct
  }

  const totalDays = Math.max(Math.ceil(elapsedDays) + 10, 14)
  const points: Array<{ day: number; [key: string]: number }> = []
  for (let d = 0; d <= totalDays; d++) {
    let value: number
    if (model === 'exponential') {
      value = initialImpact * Math.pow(coefficient, d)
    } else {
      const rate = 1 - coefficient
      value = initialImpact * Math.max(0, 1 - rate * d)
    }
    points.push({ day: d, value: Math.round(value * 1000) / 1000 })
  }
  return points
}

export function DecayDashboard() {
  const { data: activeData, isLoading: activeLoading, error: activeError } = useDecayActive()
  const { data: modelsData, isLoading: modelsLoading, error: modelsError } = useDecayModels()

  const sortedDetails = useMemo(() => {
    if (!activeData?.details) return []
    return [...activeData.details].sort(
      (a, b) => Math.abs(b.current_impact_pct) - Math.abs(a.current_impact_pct)
    )
  }, [activeData])

  const coefficientBars = useMemo(() => {
    if (!activeData?.details) return []
    return activeData.details.map((d) => ({
      label: `${d.type} (${d.model})`,
      coefficient: d.decay_coefficient,
      impact: d.current_impact_pct,
    }))
  }, [activeData])

  // Generate decay curves for each active event
  const decayCurves = useMemo(() => {
    if (!activeData?.details?.length) return { data: [] as Array<Record<string, number>>, keys: [] as string[] }
    const details = activeData.details
    const keys = details.map((d) => `${d.type} (${d.model})`)

    // Generate individual curves
    const curves = details.map((d) =>
      generateDecayCurve(d.model, d.decay_coefficient, d.current_impact_pct, d.elapsed_days)
    )

    // Merge into single dataset keyed by day
    const maxDays = Math.max(...curves.map((c) => c.length))
    const merged: Array<Record<string, number>> = []
    for (let i = 0; i < maxDays; i++) {
      const point: Record<string, number> = { day: i }
      curves.forEach((curve, idx) => {
        point[keys[idx]] = curve[i]?.value ?? 0
      })
      merged.push(point)
    }
    return { data: merged, keys }
  }, [activeData])

  const isLoading = activeLoading || modelsLoading
  const error = activeError || modelsError

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse py-4">
        <div className="h-6 bg-gray-800 rounded w-48" />
        <div className="h-32 bg-gray-800 rounded" />
        <div className="h-48 bg-gray-800 rounded" />
      </div>
    )
  }

  if (error) {
    const is404 = error?.message?.includes('404')
    return (
      <div className={`text-sm ${is404 ? 'text-gray-400' : 'text-red-400'} text-center py-8`}>
        {is404
          ? 'No decay data available yet.'
          : `Failed to load decay data: ${String(error?.message ?? error)}`}
      </div>
    )
  }

  if (!activeData) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
        <p className="text-gray-500 text-sm text-center py-8">No active decay data available</p>
      </div>
    )
  }

  const impactColor = activeData.net_impact_pct >= 0 ? 'text-green-400' : 'text-red-400'

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-4">
      <h3 className="text-sm font-semibold text-gray-200">Decay Dashboard</h3>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-gray-800 rounded-lg p-3 text-center">
          <div className="text-xs text-gray-500 mb-1">Net Impact</div>
          <div className={`text-lg font-semibold ${impactColor}`}>
            {activeData.net_impact_pct >= 0 ? '+' : ''}{activeData.net_impact_pct.toFixed(2)}%
          </div>
        </div>
        <div className="bg-gray-800 rounded-lg p-3 text-center">
          <div className="text-xs text-gray-500 mb-1">Direction</div>
          <div className="text-lg font-semibold text-gray-200">{activeData.direction}</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-3 text-center">
          <div className="text-xs text-gray-500 mb-1">Active Decays</div>
          <div className="text-lg font-semibold text-gray-200">{activeData.active_count}</div>
        </div>
      </div>

      {/* Net Impact Gauge */}
      <div>
        <h4 className="text-xs text-gray-500 uppercase tracking-wider mb-2">Impact Gauge</h4>
        <div className="bg-gray-800 rounded-lg p-3">
          {(() => {
            const impact = activeData.net_impact_pct
            const maxRange = 10
            const clampedImpact = Math.max(-maxRange, Math.min(maxRange, impact))
            const pct = ((clampedImpact + maxRange) / (2 * maxRange)) * 100
            return (
              <div>
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>-{maxRange}%</span>
                  <span>0%</span>
                  <span>+{maxRange}%</span>
                </div>
                <div className="relative h-4 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="absolute top-0 left-1/2 w-px h-full bg-gray-500"
                    aria-hidden="true"
                  />
                  <div
                    className="absolute top-0 h-full rounded-full transition-all"
                    data-testid="impact-gauge-fill"
                    style={{
                      left: impact >= 0 ? '50%' : `${pct}%`,
                      width: `${Math.abs(pct - 50)}%`,
                      backgroundColor: impact >= 0 ? '#22c55e' : '#ef4444',
                    }}
                  />
                </div>
                <div className="text-center mt-1">
                  <span className={`text-sm font-medium ${impactColor}`}>
                    {impact >= 0 ? '+' : ''}{impact.toFixed(2)}%
                  </span>
                </div>
              </div>
            )
          })()}
        </div>
      </div>

      {/* No active events message */}
      {sortedDetails.length === 0 && (
        <p className="text-gray-500 text-sm text-center py-4">No active decay events</p>
      )}

      {/* Decay Curves */}
      {decayCurves.data.length > 0 && (
        <div>
          <h4 className="text-xs text-gray-500 uppercase tracking-wider mb-2">Decay Curves</h4>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={decayCurves.data} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
                <XAxis
                  dataKey="day"
                  tick={{ fill: '#6b7280', fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  label={{ value: 'Days', position: 'insideBottomRight', offset: -5, style: { fill: '#6b7280', fontSize: 10 } }}
                />
                <YAxis
                  tick={{ fill: '#6b7280', fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  width={50}
                  tickFormatter={(v) => `${v}%`}
                />
                <Tooltip
                  contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 6, fontSize: 12 }}
                  formatter={(value: number | undefined) => [`${(value ?? 0).toFixed(3)}%`, '']}
                  labelFormatter={(v) => `Day ${v}`}
                />
                <Legend wrapperStyle={{ fontSize: 11, color: '#9ca3af' }} />
                {decayCurves.keys.map((key, i) => (
                  <Line
                    key={key}
                    type="monotone"
                    dataKey={key}
                    stroke={CURVE_COLORS[i % CURVE_COLORS.length]}
                    strokeWidth={2}
                    dot={false}
                    connectNulls
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Active Decay Events Table */}
      {sortedDetails.length > 0 && (
        <div>
          <h4 className="text-xs text-gray-500 uppercase tracking-wider mb-2">Active Decay Events</h4>
          <div className="overflow-x-auto max-h-64 overflow-y-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-500 text-xs">
                  <th className="text-left py-1 font-medium">Type</th>
                  <th className="text-left py-1 font-medium">Model</th>
                  <th className="text-right py-1 font-medium">Days</th>
                  <th className="text-right py-1 font-medium">Coefficient</th>
                  <th className="text-right py-1 font-medium">Impact</th>
                </tr>
              </thead>
              <tbody>
                {sortedDetails.map((d, i) => (
                  <tr key={i} className="border-t border-gray-800">
                    <td className="py-1.5 text-gray-300">{d.type}</td>
                    <td className="py-1.5 text-gray-400 truncate max-w-[120px]">{d.model}</td>
                    <td className="py-1.5 text-right text-gray-400">{d.elapsed_days.toFixed(1)}</td>
                    <td className="py-1.5 text-right text-gray-400">{d.decay_coefficient.toFixed(4)}</td>
                    <td className="py-1.5 text-right">
                      <span className={d.current_impact_pct >= 0 ? 'text-green-400' : 'text-red-400'}>
                        {d.current_impact_pct >= 0 ? '+' : ''}{d.current_impact_pct.toFixed(2)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Decay Coefficient Bar Chart */}
      {coefficientBars.length > 0 && (
        <div>
          <h4 className="text-xs text-gray-500 uppercase tracking-wider mb-2">Decay Coefficients</h4>
          <div className="h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={coefficientBars} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                <XAxis
                  dataKey="label"
                  tick={{ fill: '#6b7280', fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  interval={0}
                  angle={-30}
                  textAnchor="end"
                  height={60}
                />
                <YAxis
                  tick={{ fill: '#6b7280', fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  width={50}
                />
                <Tooltip
                  contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 6, fontSize: 12 }}
                  formatter={(value: number | undefined) => [(value ?? 0).toFixed(4), 'Coefficient']}
                />
                <Bar dataKey="coefficient" radius={[4, 4, 0, 0]}>
                  {coefficientBars.map((entry, i) => (
                    <Cell key={i} fill={entry.impact >= 0 ? '#22c55e' : '#ef4444'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Decay Models Reference */}
      {modelsData && modelsData.models.length > 0 && (
        <div>
          <h4 className="text-xs text-gray-500 uppercase tracking-wider mb-2">Decay Models</h4>
          <div className="overflow-x-auto max-h-48 overflow-y-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-500 text-xs">
                  <th className="text-left py-1 font-medium">Name</th>
                  <th className="text-left py-1 font-medium">Type</th>
                  <th className="text-right py-1 font-medium">Initial Impact</th>
                  <th className="text-left py-1 font-medium">Description</th>
                </tr>
              </thead>
              <tbody>
                {modelsData.models.map((m) => (
                  <tr key={m.name} className="border-t border-gray-800">
                    <td className="py-1.5 text-gray-300">{m.name}</td>
                    <td className="py-1.5 text-gray-400">{m.decay_type}</td>
                    <td className="py-1.5 text-right text-gray-400">{m.initial_impact.toFixed(2)}</td>
                    <td className="py-1.5 text-gray-500 truncate max-w-[200px]">{m.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
