import { useHealthDeep } from '../../hooks/usePredictApi'
import AnomalyBadge from '../ui/AnomalyBadge'

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  if (days > 0) return `${days}d ${hours}h ${mins}m`
  if (hours > 0) return `${hours}h ${mins}m`
  return `${mins}m`
}

export function DeepHealthPanel() {
  const { data, isLoading, error } = useHealthDeep()

  if (isLoading) {
    return (
      <div className="text-sm text-gray-500 text-center py-8">
        Loading deep health...
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-sm text-red-400 text-center py-8">
        Failed to load deep health: {String(error?.message ?? error)}
      </div>
    )
  }

  if (!data) return null

  const isOk = data.status === 'ok'
  const statusColor = isOk ? 'bg-green-500' : 'bg-yellow-500'
  const statusText = isOk ? 'Healthy' : 'Degraded'

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-200">Deep Health</h3>
        <div className="flex items-center gap-2">
          <span className={`inline-block w-2 h-2 rounded-full ${statusColor}`} />
          <span className={`text-xs font-medium ${isOk ? 'text-green-400' : 'text-yellow-400'}`}>
            {statusText}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-gray-800 rounded-lg p-3">
          <div className="text-xs text-gray-500 mb-1">Service</div>
          <div className="text-sm font-medium text-gray-200">{data.service}</div>
          <div className="text-xs text-gray-500 mt-0.5">v{data.version}</div>
        </div>

        <div className="bg-gray-800 rounded-lg p-3">
          <div className="text-xs text-gray-500 mb-1">DB File</div>
          <div className="text-sm font-medium text-gray-200">{formatBytes(data.db_file.size_bytes)}</div>
          <div className={`text-xs mt-0.5 ${data.db_file.readable ? 'text-green-500' : 'text-red-400'}`}>
            {data.db_file.readable ? 'Readable' : 'Not readable'}
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-3">
          <div className="text-xs text-gray-500 mb-1">Tables</div>
          <div className="text-sm font-medium text-gray-200">
            {data.db_tables.tables_checked.length} checked
          </div>
          <div className={`text-xs mt-0.5 ${data.db_tables.ok ? 'text-green-500' : 'text-red-400'}`}>
            {data.db_tables.ok
              ? 'All present'
              : `${data.db_tables.missing_tables.length} missing`}
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-3">
          <div className="text-xs text-gray-500 mb-1">Predictions (24h)</div>
          <div className="text-sm font-medium text-gray-200">{data.predictions_24h.count_24h}</div>
          {data.predictions_24h.count_24h === 0 && (
            <div className="mt-1">
              <AnomalyBadge level="critical" message="No predictions in 24h" />
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gray-800 rounded-lg p-3">
          <div className="text-xs text-gray-500 mb-1">Memory (RSS)</div>
          <div className="text-sm font-medium text-gray-200">{data.memory.rss_mb.toFixed(1)} MB</div>
        </div>

        <div className="bg-gray-800 rounded-lg p-3">
          <div className="text-xs text-gray-500 mb-1">Uptime</div>
          <div className="text-sm font-medium text-gray-200">{formatUptime(data.uptime_seconds)}</div>
        </div>
      </div>
    </div>
  )
}
