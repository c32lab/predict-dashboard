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
  LineChart,
  Line,
  ReferenceLine,
} from 'recharts'
import { useQualityReport, useAccuracyHistory } from '../../hooks/usePredictApi'

function accuracyColor(accuracy: number): string {
  if (accuracy >= 60) return '#22c55e'
  if (accuracy >= 50) return '#eab308'
  return '#ef4444'
}

export function QualityReportPanel() {
  const { data, isLoading, error } = useQualityReport()
  const { data: historyData } = useAccuracyHistory()

  const directionBreakdown = useMemo(() => {
    if (!historyData?.by_direction) return []
    return Object.entries(historyData.by_direction).map(([dir, v]) => ({
      direction: dir,
      accuracy: v.accuracy ?? 0,
      total: v.total,
      correct: v.correct,
    }))
  }, [historyData])

  const confidenceBars = useMemo(() => {
    if (!data?.confidence_distribution) return []
    return Object.entries(data.confidence_distribution)
      .map(([bucket, v]) => ({
        bucket,
        count: v.count,
        accuracy: v.accuracy ?? 0,
      }))
      .sort((a, b) => a.bucket.localeCompare(b.bucket))
  }, [data])

  // Calibration chart: expected confidence (bucket midpoint) vs actual accuracy
  const calibrationData = useMemo(() => {
    if (!data?.confidence_distribution) return []
    return Object.entries(data.confidence_distribution)
      .map(([bucket, v]) => {
        const parts = bucket.split('-').map(Number)
        const midpoint = parts.length === 2 ? ((parts[0] + parts[1]) / 2) * 100 : parts[0] * 100
        return { expected: Math.round(midpoint), actual: v.accuracy ?? 0, bucket }
      })
      .sort((a, b) => a.expected - b.expected)
  }, [data])

  const categoryPie = useMemo(() => {
    if (!data?.category_distribution) return []
    return Object.entries(data.category_distribution).map(([name, value]) => ({
      name,
      value,
    }))
  }, [data])

  // Category bar chart sorted by count descending
  const categoryBars = useMemo(() => {
    if (!data?.category_distribution) return []
    return Object.entries(data.category_distribution)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
  }, [data])

  const horizonRows = useMemo(() => {
    if (!data?.overall_accuracy) return []
    return Object.entries(data.overall_accuracy).map(([horizon, accuracy]) => ({
      horizon,
      accuracy: accuracy ?? 0,
    }))
  }, [data])

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
    return (
      <div className="text-sm text-red-400 text-center py-8">
        Failed to load quality report: {String(error?.message ?? error)}
      </div>
    )
  }

  if (!data) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
        <p className="text-gray-500 text-sm text-center py-8">No quality report data available</p>
      </div>
    )
  }

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

      {/* Confidence Calibration Chart */}
      <div>
        <h4 className="text-xs text-gray-500 uppercase tracking-wider mb-2">Confidence Calibration</h4>
        {calibrationData.length === 0 ? (
          <div className="text-xs text-gray-600 py-4 text-center">No data</div>
        ) : (
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={calibrationData} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
                <XAxis
                  dataKey="expected"
                  tick={{ fill: '#6b7280', fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `${v}%`}
                  label={{ value: 'Expected', position: 'insideBottomRight', offset: -5, style: { fill: '#6b7280', fontSize: 10 } }}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fill: '#6b7280', fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  width={36}
                  tickFormatter={(v) => `${v}%`}
                  label={{ value: 'Actual', angle: -90, position: 'insideLeft', style: { fill: '#6b7280', fontSize: 10 } }}
                />
                <ReferenceLine
                  segment={[{ x: 0, y: 0 }, { x: 100, y: 100 }]}
                  stroke="#374151"
                  strokeDasharray="4 4"
                  ifOverflow="extendDomain"
                />
                <Tooltip
                  contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 6, fontSize: 12 }}
                  formatter={(value: number | undefined) => [`${(value ?? 0).toFixed(1)}%`, 'Actual Accuracy']}
                  labelFormatter={(v) => `Expected: ${v}%`}
                />
                <Line type="monotone" dataKey="actual" stroke="#60a5fa" strokeWidth={2} dot={{ fill: '#60a5fa', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Predictions by Category Bar Chart */}
      <div>
        <h4 className="text-xs text-gray-500 uppercase tracking-wider mb-2">Predictions by Category</h4>
        {categoryBars.length === 0 ? (
          <div className="text-xs text-gray-600 py-4 text-center">No data</div>
        ) : (
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryBars} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                <XAxis
                  dataKey="name"
                  tick={{ fill: '#6b7280', fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  interval={0}
                  angle={-20}
                  textAnchor="end"
                  height={40}
                />
                <YAxis
                  tick={{ fill: '#6b7280', fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  width={36}
                />
                <Tooltip
                  contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 6, fontSize: 12 }}
                  formatter={(value: number | undefined) => [value ?? 0, 'Predictions']}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {categoryBars.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Direction Accuracy Breakdown */}
      {directionBreakdown.length > 0 && (
        <div>
          <h4 className="text-xs text-gray-500 uppercase tracking-wider mb-2">Accuracy by Direction</h4>
          <div className="grid grid-cols-2 gap-3">
            {directionBreakdown.map((d) => (
              <div
                key={d.direction}
                className={`bg-gray-800/60 border rounded-lg p-3 text-center ${
                  d.direction === 'LONG' ? 'border-green-900/40' : 'border-red-900/40'
                }`}
              >
                <span className={`text-sm font-semibold ${
                  d.direction === 'LONG' ? 'text-green-400' : 'text-red-400'
                }`}>{d.direction}</span>
                <p className="text-2xl font-bold font-mono mt-1" style={{ color: accuracyColor(d.accuracy) }}>
                  {d.accuracy.toFixed(1)}%
                </p>
                <p className="text-xs text-gray-500 mt-0.5">{d.correct}/{d.total} correct</p>
              </div>
            ))}
          </div>
        </div>
      )}

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
