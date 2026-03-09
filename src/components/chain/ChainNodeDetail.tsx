import { useEventChainLinks } from '../../hooks/usePredictApi'

export function ChainNodeDetail({
  nodeId,
  nodeName,
  onClose,
}: {
  nodeId: string
  nodeName: string
  onClose: () => void
}) {
  const { data, error, isLoading } = useEventChainLinks(nodeId)

  return (
    <div className="absolute right-0 top-0 h-full w-80 bg-gray-900 border-l border-gray-700 shadow-xl z-10 flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
        <h3 className="text-sm font-semibold text-gray-100 truncate" title={nodeName}>
          {nodeName}
        </h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-200 text-lg leading-none"
          aria-label="Close panel"
        >
          &times;
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
        {isLoading && <p className="text-gray-500 text-xs">Loading events…</p>}

        {error && (
          <p className="text-red-400 text-xs">
            Failed to load events: {String(error?.message ?? error)}
          </p>
        )}

        {data && data.events.length === 0 && (
          <p className="text-gray-500 text-xs">No linked events found</p>
        )}

        {data?.events.map((ev, i) => (
          <div key={i} className="bg-gray-800 rounded px-3 py-2 text-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">{ev.date}</span>
              <span className="text-gray-500">{ev.category}</span>
            </div>
            {ev.symbol && (
              <div className="text-blue-400 font-medium">{ev.symbol}</div>
            )}
            <p className="text-gray-200 leading-relaxed">{ev.event}</p>
            <div className="text-right">
              <span
                className={
                  ev.price_change > 0
                    ? 'text-green-400'
                    : ev.price_change < 0
                      ? 'text-red-400'
                      : 'text-gray-400'
                }
              >
                {ev.price_change > 0 ? '+' : ''}
                {ev.price_change.toFixed(2)}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
