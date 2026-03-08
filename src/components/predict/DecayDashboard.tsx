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
import { useDecayActive, useDecayModels } from '../../hooks/usePredictApi'

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

  const isLoading = activeLoading || modelsLoading
  const error = activeError || modelsError

  if (isLoading) {
    return (
      <div className="text-sm text-gray-500 text-center py-8">
        Loading decay dashboard...
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-sm text-red-400 text-center py-8">
        Failed to load decay data: {String(error?.message ?? error)}
      </div>
    )
  }

  if (!activeData) return null

  const impactColor = activeData.net_impact_pct >= 0 ? 'text-green-400' : 'text-red-400'

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-4">
      <h3 className="text-sm font-semibold text-gray-200">Decay Dashboard</h3>

      {/* KPI Cards */}
      <div className="grid grid-cols-3 gap-3">
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

      {/* Active Decay Events Table */}
      {sortedDetails.length > 0 && (
        <div>
          <h4 className="text-xs text-gray-500 uppercase tracking-wider mb-2">Active Decay Events</h4>
          <div className="overflow-auto max-h-64">
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
          <div className="overflow-auto max-h-48">
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
