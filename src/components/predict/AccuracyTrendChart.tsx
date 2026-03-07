import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

const SYMBOL_COLORS: Record<string, string> = {
  BTC: '#60a5fa',
  ETH: '#a78bfa',
  SOL: '#22d3ee',
  BNB: '#fbbf24',
  XRP: '#34d399',
}

function getSymbolColor(symbol: string): string {
  const base = symbol.replace('/USDT', '').replace('/USD', '')
  return SYMBOL_COLORS[base] ?? '#9ca3af'
}

export function AccuracyTrendChart({
  trendData,
  chartSymbols,
}: {
  trendData: Record<string, string | number>[]
  chartSymbols: string[]
}) {
  if (trendData.length === 0) return null

  return (
    <div>
      <h3 className="text-xs text-gray-500 uppercase tracking-wider mb-2">Accuracy Trend</h3>
      <div className="h-[180px] sm:h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={trendData} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
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
              labelStyle={{ color: '#9ca3af' }}
              itemStyle={{ color: '#e5e7eb' }}
              formatter={(value: number | undefined, name?: string) => [`${Number(value ?? 0).toFixed(1)}%`, name ?? '']}
            />
            {chartSymbols.length > 1 && (
              <Legend wrapperStyle={{ fontSize: 12, color: '#9ca3af' }} />
            )}
            {chartSymbols.map((sym) => (
              <Line
                key={sym}
                type="monotone"
                dataKey={sym}
                stroke={getSymbolColor(sym)}
                strokeWidth={2}
                dot={false}
                connectNulls
                name={sym}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
