import { usePredictHealth } from '../../hooks/usePredictApi'

/** API health status indicator — green/red/gray dot with label. */
export function ApiStatusIndicator() {
  const { data, error, isLoading } = usePredictHealth()

  if (isLoading) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-gray-500" data-testid="api-status">
        <span className="w-2 h-2 rounded-full bg-gray-500 animate-pulse" />
        Connecting...
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-red-400" data-testid="api-status">
        <span className="w-2 h-2 rounded-full bg-red-500" />
        API Disconnected
      </div>
    )
  }

  return (
    <div className="flex items-center gap-1.5 text-xs text-green-400" data-testid="api-status">
      <span className="w-2 h-2 rounded-full bg-green-500" />
      API Connected
    </div>
  )
}
