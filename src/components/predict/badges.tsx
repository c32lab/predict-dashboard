export function DirectionBadge({ direction }: { direction: string }) {
  const isLong = direction?.toUpperCase() === 'LONG'
  return (
    <span
      className={`px-2 py-0.5 rounded text-xs font-bold ${
        isLong ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'
      }`}
    >
      {direction}
    </span>
  )
}

export function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; cls: string; tip: string }> = {
    active:     { label: '🟢 Active', cls: 'bg-blue-900 text-blue-300', tip: 'Prediction issued, awaiting market validation' },
    validating: { label: '🔄 Validating', cls: 'bg-yellow-900 text-yellow-300', tip: '1d validation done, awaiting 3d/7d validation' },
    validated:  { label: '✅ Validated', cls: 'bg-green-900 text-green-300', tip: 'All time windows validated' },
    expired:    { label: '⏰ Expired', cls: 'bg-gray-700 text-gray-400', tip: 'Exceeded validation window' },
    completed:  { label: '✅ Completed', cls: 'bg-green-900 text-green-300', tip: 'Prediction flow completed' },
    failed:     { label: '❌ Failed', cls: 'bg-red-900 text-red-300', tip: 'Prediction missed' },
  }
  const c = config[status?.toLowerCase()] ?? { label: status, cls: 'bg-gray-700 text-gray-400', tip: status }
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-bold ${c.cls}`} title={c.tip}>
      {c.label}
    </span>
  )
}
