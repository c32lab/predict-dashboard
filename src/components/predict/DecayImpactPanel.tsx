import { useMemo } from 'react'
import { useDecayActive } from '../../hooks/usePredictApi'

export function DecayImpactPanel() {
  const { data, isLoading, error } = useDecayActive()

  const sortedDetails = useMemo(() => {
    if (!data?.details) return []
    return [...data.details].sort(
      (a, b) => Math.abs(b.current_impact_pct) - Math.abs(a.current_impact_pct)
    )
  }, [data])

  if (isLoading) {
    return (
      <div className="text-sm text-gray-500 text-center py-8">
        Loading decay impact...
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-sm text-red-400 text-center py-8">
        Failed to load decay impact: {String(error?.message ?? error)}
      </div>
    )
  }

  if (!data) return null

  const impactColor = data.net_impact_pct >= 0 ? 'text-green-400' : 'text-red-400'

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-4">
      <h3 className="text-sm font-semibold text-gray-200">Decay Impact</h3>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-gray-800 rounded-lg p-3 text-center">
          <div className="text-xs text-gray-500 mb-1">Net Impact</div>
          <div className={`text-lg font-semibold ${impactColor}`}>
            {data.net_impact_pct >= 0 ? '+' : ''}{data.net_impact_pct.toFixed(2)}%
          </div>
        </div>
        <div className="bg-gray-800 rounded-lg p-3 text-center">
          <div className="text-xs text-gray-500 mb-1">Direction</div>
          <div className="text-lg font-semibold text-gray-200">{data.direction}</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-3 text-center">
          <div className="text-xs text-gray-500 mb-1">Active Decays</div>
          <div className="text-lg font-semibold text-gray-200">{data.active_count}</div>
        </div>
      </div>

      {/* Decay details table */}
      {sortedDetails.length > 0 && (
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
      )}
    </div>
  )
}
