import { useMemo } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from 'recharts'
import { useQualityReport } from '../../hooks/usePredictApi'

function accuracyColor(accuracy: number): string {
  if (accuracy >= 60) return '#22c55e'
  if (accuracy >= 50) return '#eab308'
  return '#ef4444'
}

export function QualityReportPanel() {
  const { data, isLoading, error } = useQualityReport()

  const confidenceBars = useMemo(() => {
    if (!data?.confidence_distribution) return []
    return Object.entries(data.confidence_distribution)
      .map(([bucket, v]) => ({
        bucket,
        count: v.count,
        accuracy: v.accuracy,
      }))
      .sort((a, b) => a.bucket.localeCompare(b.bucket))
  }, [data])

  const categoryPie = useMemo(() => {
    if (!data?.category_distribution) return []
    return Object.entries(data.category_distribution).map(([name, value]) => ({
      name,
      value,
    }))
  }, [data])

  const horizonRows = useMemo(() => {
    if (!data?.overall_accuracy) return []
    return Object.entries(data.overall_accuracy).map(([horizon, accuracy]) => ({
      horizon,
      accuracy,
    }))
  }, [data])

  if (isLoading) {
    return (
      <div className="text-sm text-gray-500 text-center py-8">
        Loading quality report...
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-sm text-red-400 text-center py-8">
        Failed to load quality report: {String(error?.message ?? error)}
      </div>
    )
  }

  if (!data) return null

  const PIE_COLORS = ['#60a5fa', '#a78bfa', '#34d399', '#fbbf24', '#f87171', '#fb923c', '#818cf8', '#2dd4bf']

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-200">Quality Report</h3>
        <span className="text-xs text-gray-500">{data.total_predictions} predictions</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Confidence vs Accuracy */}
        <div>
          <h4 className="text-xs text-gray-500 uppercase tracking-wider mb-2">Confidence vs Accuracy</h4>
          {confidenceBars.length === 0 ? (
            <div className="text-xs text-gray-600 py-4 text-center">No data</div>
          ) : (
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={confidenceBars} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                  <XAxis dataKey="bucket" tick={{ fill: '#6b7280', fontSize: 11 }} tickLine={false} axisLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fill: '#6b7280', fontSize: 11 }} tickLine={false} axisLine={false} width={36} tickFormatter={(v) => `${v}%`} />
                  <Tooltip
                    contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 6, fontSize: 12 }}
                    formatter={(value: number | undefined) => [`${(value ?? 0).toFixed(1)}%`, 'Accuracy']}
                  />
                  <Bar dataKey="accuracy" radius={[4, 4, 0, 0]}>
                    {confidenceBars.map((entry, i) => (
                      <Cell key={i} fill={accuracyColor(entry.accuracy)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Category Distribution */}
        <div>
          <h4 className="text-xs text-gray-500 uppercase tracking-wider mb-2">Category Distribution</h4>
          {categoryPie.length === 0 ? (
            <div className="text-xs text-gray-600 py-4 text-center">No data</div>
          ) : (
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryPie}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={2}
                    label={({ name, percent }: { name?: string; percent?: number }) => `${name ?? ''} ${((percent ?? 0) * 100).toFixed(0)}%`}
                  >
                    {categoryPie.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 6, fontSize: 12 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Overall Accuracy Table */}
      {horizonRows.length > 0 && (
        <div>
          <h4 className="text-xs text-gray-500 uppercase tracking-wider mb-2">Overall Accuracy by Horizon</h4>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-500 text-xs">
                <th className="text-left py-1 font-medium">Horizon</th>
                <th className="text-right py-1 font-medium">Accuracy</th>
              </tr>
            </thead>
            <tbody>
              {horizonRows.map((row) => (
                <tr key={row.horizon} className="border-t border-gray-800">
                  <td className="py-1.5 text-gray-300">{row.horizon}</td>
                  <td className="py-1.5 text-right">
                    <span style={{ color: accuracyColor(row.accuracy) }}>
                      {row.accuracy.toFixed(1)}%
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
