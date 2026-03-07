import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts'
import type { TakerVolumePoint } from '../../types/predict'
import { formatChartTime } from '../../utils/format'

const TOOLTIP_STYLE = { background: '#111827', border: '1px solid #374151', borderRadius: 6, fontSize: 12 }

export function TakerVolumeChart({ data, isLoading }: { data: TakerVolumePoint[] | undefined; isLoading: boolean }) {
  if (isLoading) {
    return <div className="h-[200px] flex items-center justify-center text-gray-500 text-sm">Loading...</div>
  }
  if (!data || data.length === 0) {
    return <div className="h-[200px] flex items-center justify-center text-gray-500 text-sm">No data available</div>
  }
  const sorted = [...data].sort((a, b) => a.timestamp - b.timestamp)
  const latest = sorted[sorted.length - 1]
  const chartData = sorted.map((p) => ({
    time: formatChartTime(p.timestamp),
    buy: p.buy_vol,
    sell: p.sell_vol,
  }))
  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-200">Taker Buy/Sell Volume</h3>
        {latest && <span className="text-xs font-mono text-gray-300">{latest.buy_sell_ratio.toFixed(3)}</span>}
      </div>
      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
            <XAxis dataKey="time" tick={{ fill: '#6b7280', fontSize: 11 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
            <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} tickLine={false} axisLine={false} width={44} tickFormatter={(v: number) => v >= 1e6 ? `${(v / 1e6).toFixed(0)}M` : String(v)} />
            <Tooltip contentStyle={TOOLTIP_STYLE} labelStyle={{ color: '#9ca3af' }} itemStyle={{ color: '#e5e7eb' }} />
            <Bar dataKey="buy" fill="#22c55e" name="Buy Vol" />
            <Bar dataKey="sell" fill="#ef4444" name="Sell Vol" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
