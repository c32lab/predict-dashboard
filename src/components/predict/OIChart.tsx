import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts'
import type { OpenInterestPoint } from '../../types/predict'
import { formatChartTime } from '../../utils/format'

const TOOLTIP_STYLE = { background: '#111827', border: '1px solid #374151', borderRadius: 6, fontSize: 12 }

function fmtOIValue(v: number): string {
  if (v >= 1e9) return `$${(v / 1e9).toFixed(1)}B`
  if (v >= 1e6) return `$${(v / 1e6).toFixed(0)}M`
  return `$${v.toLocaleString('en-US')}`
}

export function OIChart({ data, isLoading }: { data: OpenInterestPoint[] | undefined; isLoading: boolean }) {
  if (isLoading) {
    return <div className="h-[200px] flex items-center justify-center text-gray-500 text-sm">Loading...</div>
  }
  if (!data || data.length === 0) {
    return <div className="h-[200px] flex items-center justify-center text-gray-500 text-sm">No data available</div>
  }
  const sorted = [...data].sort((a, b) => a.timestamp - b.timestamp)
  const latest = sorted[sorted.length - 1]
  const chartData = sorted.map((p) => ({ time: formatChartTime(p.timestamp), value: p.sum_open_interest_value }))
  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-200">Open Interest</h3>
        {latest && <span className="text-xs font-mono text-blue-300">{fmtOIValue(latest.sum_open_interest_value)}</span>}
      </div>
      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="oiGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#60a5fa" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="time" tick={{ fill: '#6b7280', fontSize: 11 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
            <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} tickLine={false} axisLine={false} width={52} tickFormatter={fmtOIValue} />
            <Tooltip contentStyle={TOOLTIP_STYLE} labelStyle={{ color: '#9ca3af' }} itemStyle={{ color: '#e5e7eb' }} formatter={(v: number | undefined) => [fmtOIValue(v ?? 0), 'OI Value']} />
            <Area type="monotone" dataKey="value" stroke="#60a5fa" strokeWidth={2} fill="url(#oiGrad)" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
