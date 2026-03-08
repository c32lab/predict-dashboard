import { useMemo } from 'react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { useAccuracyHistory } from '../../hooks/usePredictApi'

export function AccuracyHistoryChart() {
  const { data, isLoading, error } = useAccuracyHistory()

  const directionBars = useMemo(() => {
    if (!data?.by_direction) return []
    return Object.entries(data.by_direction).map(([dir, v]) => ({
      direction: dir,
      accuracy: v.accuracy,
      total: v.total,
    }))
  }, [data])

  const patternRows = useMemo(() => {
    if (!data?.by_pattern) return []
    return Object.entries(data.by_pattern)
      .map(([pattern, v]) => ({ pattern, ...v }))
      .sort((a, b) => b.total - a.total)
  }, [data])

  if (isLoading) {
    return (
      <div className="text-sm text-gray-500 text-center py-8">
        Loading accuracy history...
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-sm text-red-400 text-center py-8">
        Failed to load accuracy history: {String(error?.message ?? error)}
      </div>
    )
  }

  if (!data) return null

  const history = data.accuracy_history ?? []

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-200">Accuracy History</h3>
        <span className="text-xs text-gray-500">
          Overall: {data.overall.accuracy.toFixed(1)}% ({data.overall.total} predictions, window={data.window})
        </span>
      </div>

      {/* Daily Accuracy Trend */}
      <div>
        <h4 className="text-xs text-gray-500 uppercase tracking-wider mb-2">Daily Accuracy Trend</h4>
        {history.length === 0 ? (
          <div className="text-xs text-gray-600 py-4 text-center">No history data</div>
        ) : (
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={history} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
                <XAxis
                  dataKey="date"
                  tick={{ fill: '#6b7280', fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  interval="preserveStartEnd"
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
                  formatter={(value: number | undefined) => [`${(value ?? 0).toFixed(1)}%`, 'Accuracy']}
                />
                <Line type="monotone" dataKey="accuracy" stroke="#60a5fa" strokeWidth={2} dot={false} connectNulls />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Accuracy by Direction */}
      <div>
        <h4 className="text-xs text-gray-500 uppercase tracking-wider mb-2">Accuracy by Direction</h4>
        {directionBars.length === 0 ? (
          <div className="text-xs text-gray-600 py-4 text-center">No direction data</div>
        ) : (
          <div className="h-[120px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={directionBars} layout="vertical" margin={{ top: 0, right: 16, bottom: 0, left: 50 }}>
                <XAxis type="number" domain={[0, 100]} tick={{ fill: '#6b7280', fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} />
                <YAxis type="category" dataKey="direction" tick={{ fill: '#9ca3af', fontSize: 12 }} tickLine={false} axisLine={false} width={50} />
                <Tooltip
                  contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 6, fontSize: 12 }}
                  formatter={(value: number | undefined, _name: string | undefined, item: { payload?: { total: number } }) => [`${(value ?? 0).toFixed(1)}% (n=${item.payload?.total ?? 0})`, 'Accuracy']}
                />
                <Bar dataKey="accuracy" radius={[0, 4, 4, 0]}>
                  {directionBars.map((entry, i) => (
                    <Cell key={i} fill={entry.direction === 'LONG' ? '#22c55e' : '#ef4444'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Accuracy by Pattern Table */}
      {patternRows.length > 0 && (
        <div>
          <h4 className="text-xs text-gray-500 uppercase tracking-wider mb-2">Accuracy by Pattern</h4>
          <div className="overflow-x-auto max-h-48 overflow-y-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-500 text-xs">
                  <th className="text-left py-1 font-medium">Pattern</th>
                  <th className="text-right py-1 font-medium">Total</th>
                  <th className="text-right py-1 font-medium">Correct</th>
                  <th className="text-right py-1 font-medium">Accuracy</th>
                </tr>
              </thead>
              <tbody>
                {patternRows.map((row) => (
                  <tr key={row.pattern} className="border-t border-gray-800">
                    <td className="py-1.5 text-gray-300 truncate max-w-[200px]">{row.pattern}</td>
                    <td className="py-1.5 text-right text-gray-400">{row.total}</td>
                    <td className="py-1.5 text-right text-gray-400">{row.correct}</td>
                    <td className="py-1.5 text-right">
                      <span className={row.accuracy >= 50 ? 'text-green-400' : 'text-red-400'}>
                        {row.accuracy.toFixed(1)}%
                      </span>
                    </td>
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
