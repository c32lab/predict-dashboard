import DeltaBadge from '../ui/DeltaBadge'
import AnomalyBadge from '../ui/AnomalyBadge'

interface KpiCardProps {
  label: string
  value: string
  sub?: string
  delta?: { current: number; previous: number; format: 'percent' | 'number'; invertColor?: boolean }
  anomaly?: { level: 'warning' | 'critical'; message: string }
}

export function KpiCard({ label, value, sub, delta, anomaly }: KpiCardProps) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <div className="flex items-center gap-2">
        <div className="text-2xl font-bold">{value}</div>
        {delta && <DeltaBadge {...delta} />}
      </div>
      {sub && <div className="text-xs text-gray-400 mt-1">{sub}</div>}
      {anomaly && (
        <div className="mt-2">
          <AnomalyBadge {...anomaly} />
        </div>
      )}
    </div>
  )
}
