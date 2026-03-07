export function AccuracyFilterBar({
  symbolFilter,
  onSymbolChange,
  timeRange,
  onTimeRangeChange,
  symbols,
}: {
  symbolFilter: string
  onSymbolChange: (value: string) => void
  timeRange: '7d' | '14d' | '30d' | 'all'
  onTimeRangeChange: (value: '7d' | '14d' | '30d' | 'all') => void
  symbols: string[]
}) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <select
        value={symbolFilter}
        onChange={(e) => onSymbolChange(e.target.value)}
        className="bg-gray-800 border border-gray-700 rounded px-3 py-1.5 text-sm text-gray-200 focus:outline-none focus:border-gray-600"
      >
        <option value="all">All Symbols</option>
        {symbols.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
      <div className="flex gap-1">
        {(['7d', '14d', '30d', 'all'] as const).map((r) => (
          <button
            key={r}
            onClick={() => onTimeRangeChange(r)}
            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
              timeRange === r
                ? 'bg-blue-700 text-blue-100'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            {r === 'all' ? 'All' : r}
          </button>
        ))}
      </div>
    </div>
  )
}
