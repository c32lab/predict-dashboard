import { usePredictionDetail, useReasoningGraph } from '../../hooks/usePredictApi'
import ReasoningFlowGraph from './ReasoningFlowGraph'
import { formatDateTime } from '../../utils/format'

export function DetailPanel({ id, reasoning }: { id: number; reasoning: string }) {
  const { data, error, isLoading } = usePredictionDetail(id)
  const { data: graphData, isLoading: graphLoading } = useReasoningGraph(id)

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 p-4 text-gray-500 text-sm">
        <span className="animate-spin">⏳</span> Loading details…
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 text-red-400 text-sm">
        Failed to load details: {String(error?.message ?? error)}
      </div>
    )
  }

  return (
    <div className="p-4 space-y-4 text-sm">
      {reasoning && (
        <div className="bg-gray-800 rounded px-3 py-2 text-gray-300 italic text-xs">
          {reasoning}
        </div>
      )}

      {data?.trigger_event_text && (
        <div>
          <div className="text-gray-500 font-semibold mb-1 uppercase tracking-wide text-xs">Trigger Event</div>
          <div className="bg-blue-950 border border-blue-800 rounded px-3 py-2 text-blue-200">
            {data.trigger_event_text}
          </div>
        </div>
      )}

      {data?.matched_events && data.matched_events.length > 0 && (
        <div>
          <div className="text-gray-500 font-semibold mb-1 uppercase tracking-wide text-xs">Matched Historical Events</div>
          <table className="w-full text-xs border border-gray-800 rounded overflow-hidden">
            <thead>
              <tr className="bg-gray-800 text-gray-400">
                <th className="text-left py-1.5 px-2 font-medium">Event</th>
                <th className="text-left py-1.5 px-2 font-medium">Date</th>
                <th className="text-left py-1.5 px-2 font-medium">Symbol</th>
                <th className="text-right py-1.5 px-2 font-medium">Price Change</th>
                <th className="text-right py-1.5 px-2 font-medium">Similarity</th>
              </tr>
            </thead>
            <tbody>
              {data.matched_events.map((ev) => (
                <tr key={ev.event_id} className="border-t border-gray-800">
                  <td className="py-1.5 px-2 text-gray-300 truncate max-w-[240px]" title={ev.event}>
                    {ev.event}
                  </td>
                  <td className="py-1.5 px-2 text-gray-500 whitespace-nowrap">{formatDateTime(ev.date)}</td>
                  <td className="py-1.5 px-2 font-mono text-blue-300">{ev.symbol}</td>
                  {/* price_change: already_pct — direct display */}
                  <td className={`py-1.5 px-2 text-right font-mono ${ev.price_change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {ev.price_change >= 0 ? '+' : ''}{ev.price_change.toFixed(2)}%
                  </td>
                  {/* similarity: decimal_0_1 → ×100 */}
                  <td className="py-1.5 px-2 text-right text-gray-300">
                    {(ev.similarity * 100).toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Reasoning Graph */}
      <div>
        <div className="text-gray-500 font-semibold mb-2 uppercase tracking-wide text-xs">Reasoning Chain</div>
        {graphLoading ? (
          <div className="text-gray-500 text-xs py-8 text-center">Loading reasoning graph…</div>
        ) : graphData && graphData.nodes.length > 0 ? (
          <ReasoningFlowGraph graph={graphData} />
        ) : (
          <div className="text-gray-600 text-xs py-4 text-center">No reasoning chain data</div>
        )}
      </div>

      {/* Confidence Factors */}
      {data?.confidence_factors && Object.keys(data.confidence_factors).length > 0 && (
        <div>
          <div className="text-gray-500 font-semibold mb-1 uppercase tracking-wide text-xs">Confidence Factors</div>
          <div className="space-y-1">
            {Object.entries(data.confidence_factors).map(([factor, weight]) => (
              <div key={factor} className="flex items-center gap-2">
                <span className="text-gray-400 text-xs w-32 shrink-0 truncate" title={factor}>{factor}</span>
                <div className="flex-1 bg-gray-800 rounded-full h-1.5">
                  <div
                    className="bg-blue-500 h-1.5 rounded-full"
                    style={{ width: `${Math.min(100, (weight * 100))}%` }}
                  />
                </div>
                <span className="text-gray-300 text-xs w-10 text-right">{(weight * 100).toFixed(0)}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
