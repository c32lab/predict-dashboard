import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts'
import type { LongShortRatioPoint } from '../../types/predict'
import { formatChartTime } from '../../utils/format'

const TOOLTIP_STYLE = { background: '#111827', border: '1px solid #374151', borderRadius: 6, fontSize: 12 }

export function LSRChart({ data, isLoading }: { data: LongShortRatioPoint[] | undefined; isLoading: boolean }) {
  if (isLoading) {
    return <div className="h-[200px] flex items-center justify-center text-gray-500 text-sm">Loading...</div>
  }
  if (!data || data.length === 0) {
    return <div className="h-[200px] flex items-center justify-center text-gray-500 text-sm">No data available</div>
  }
  const sorted = [...data].sort((a, b) => a.timestamp - b.timestamp)
  const latest = sorted[sorted.length - 1]
  // long_account/short_account: decimal_0_1 → ×100 for display
  const chartData = sorted.map((p) => ({
    time: formatChartTime(p.timestamp),
    long: parseFloat((p.long_account * 100).toFixed(1)),
    short: parseFloat((p.short_account * 100).toFixed(1)),
  }))
  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-200">Long/Short Ratio</h3>
        {latest && <span className="text-xs font-mono text-gray-300">{latest.long_short_ratio.toFixed(2)}</span>}
      </div>
      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
            <XAxis dataKey="time" tick={{ fill: '#6b7280', fontSize: 11 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
            <YAxis domain={[0, 100]} tick={{ fill: '#6b7280', fontSize: 11 }} tickLine={false} axisLine={false} width={36} tickFormatter={(v: number) => `${v}%`} />
            <Tooltip contentStyle={TOOLTIP_STYLE} labelStyle={{ color: '#9ca3af' }} itemStyle={{ color: '#e5e7eb' }} formatter={(v: number | undefined, name: string | undefined) => [`${(v ?? 0).toFixed(1)}%`, name ?? '']} />
            <Bar dataKey="long" stackId="a" fill="#22c55e" name="Long %" />
            <Bar dataKey="short" stackId="a" fill="#ef4444" name="Short %" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
