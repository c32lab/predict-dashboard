import { Link, useParams } from 'react-router-dom'
import { usePredictionDetail, useReasoningGraph } from '../hooks/usePredictApi'
import { DirectionBadge, StatusBadge } from '../components/predict/badges'
import { formatDateTime, formatPrice } from '../utils/format'
import ReasoningFlowGraph from '../components/predict/ReasoningFlowGraph'

function Skeleton() {
  return (
    <div className="p-6 space-y-4 animate-pulse">
      <div className="h-6 bg-gray-800 rounded w-48" />
      <div className="h-32 bg-gray-800 rounded" />
      <div className="h-48 bg-gray-800 rounded" />
      <div className="h-64 bg-gray-800 rounded" />
    </div>
  )
}

export default function PredictionDetailPage() {
  const { id } = useParams<{ id: string }>()
  const numId = id ? Number(id) : null
  const { data, error, isLoading } = usePredictionDetail(numId)
  const { data: graphData, isLoading: graphLoading } = useReasoningGraph(numId)

  if (isLoading) return <Skeleton />

  if (error) {
    return (
      <div className="p-6">
        <Link to="/" className="text-blue-400 hover:text-blue-300 text-sm mb-4 inline-block">
          &larr; 返回
        </Link>
        <div className="text-red-400 text-sm mt-4">
          加载失败：{String(error?.message ?? error)}
        </div>
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="p-2 sm:p-4 lg:p-6 space-y-6 max-w-5xl mx-auto">
      {/* Back */}
      <Link to="/" className="text-blue-400 hover:text-blue-300 text-sm inline-block">
        &larr; 返回
      </Link>

      {/* Header card */}
      <section className="bg-gray-900 rounded-xl border border-gray-800 p-4 space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-mono text-lg text-blue-300">{data.symbol}</span>
          <DirectionBadge direction={data.direction} />
          <StatusBadge status={data.status} />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 text-sm">
          <div>
            <span className="text-gray-500 text-xs uppercase">Confidence</span>
            <div className="text-gray-200 font-mono">{(data.confidence * 100).toFixed(0)}%</div>
          </div>
          <div>
            <span className="text-gray-500 text-xs uppercase">Price</span>
            <div className="text-gray-200 font-mono">
              {data.price_at_prediction != null ? formatPrice(data.price_at_prediction, data.symbol) : '—'}
            </div>
          </div>
          <div>
            <span className="text-gray-500 text-xs uppercase">Macro Score</span>
            <div className="text-gray-200 font-mono">{data.macro_score ?? '—'}</div>
          </div>
          <div>
            <span className="text-gray-500 text-xs uppercase">Fear & Greed</span>
            <div className="text-gray-200 font-mono">{data.fear_greed ?? '—'}</div>
          </div>
          <div>
            <span className="text-gray-500 text-xs uppercase">Expected Impact</span>
            <div className="text-gray-200 font-mono">
              {data.expected_impact != null ? `${data.expected_impact}%` : '—'}
            </div>
          </div>
          <div>
            <span className="text-gray-500 text-xs uppercase">Horizon</span>
            <div className="text-gray-200">{data.expected_horizon ?? '—'}</div>
          </div>
          <div className="col-span-2">
            <span className="text-gray-500 text-xs uppercase">Time</span>
            <div className="text-gray-200">{formatDateTime(data.created_at ?? data.timestamp)}</div>
          </div>
        </div>

        {/* Trigger event */}
        {data.trigger_event_text && (
          <div>
            <div className="text-gray-500 text-xs uppercase mb-1">Trigger Event</div>
            <div className="bg-blue-950 border border-blue-800 rounded px-3 py-2 text-blue-200 text-sm">
              {data.trigger_event_text}
            </div>
          </div>
        )}

        {/* Reasoning */}
        {data.reasoning && (
          <div>
            <div className="text-gray-500 text-xs uppercase mb-1">Reasoning</div>
            <div className="bg-gray-800 rounded px-3 py-2 text-gray-300 text-sm italic">
              {data.reasoning}
            </div>
          </div>
        )}
      </section>

      {/* Matched Events */}
      {data.matched_events && data.matched_events.length > 0 && (
        <section className="bg-gray-900 rounded-xl border border-gray-800">
          <div className="px-4 py-3 border-b border-gray-800">
            <h2 className="text-sm font-semibold text-gray-200">
              Matched Events
              <span className="ml-2 text-xs text-gray-500">({data.matched_events.length})</span>
            </h2>
          </div>
          <div className="p-2 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-500 border-b border-gray-800">
                  <th className="text-left py-2 px-3 font-medium">Event</th>
                  <th className="text-left py-2 px-3 font-medium">Date</th>
                  <th className="text-left py-2 px-3 font-medium">Symbol</th>
                  <th className="text-right py-2 px-3 font-medium">Price Change</th>
                  <th className="text-right py-2 px-3 font-medium">Similarity</th>
                </tr>
              </thead>
              <tbody>
                {data.matched_events.map((ev) => (
                  <tr key={ev.event_id} className="border-b border-gray-800">
                    <td className="py-2 px-3 text-gray-300 truncate max-w-[240px]" title={ev.event}>
                      {ev.event}
                    </td>
                    <td className="py-2 px-3 text-gray-500 whitespace-nowrap">{formatDateTime(ev.date)}</td>
                    <td className="py-2 px-3 font-mono text-blue-300">{ev.symbol}</td>
                    {/* price_change: already_pct */}
                    <td className={`py-2 px-3 text-right font-mono ${ev.price_change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {ev.price_change >= 0 ? '+' : ''}{ev.price_change.toFixed(2)}%
                    </td>
                    {/* similarity: decimal_0_1 → ×100 */}
                    <td className="py-2 px-3 text-right text-gray-300">
                      {(ev.similarity * 100).toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Reasoning Chain */}
      {data.reasoning_chain && data.reasoning_chain.length > 0 && (
        <section className="bg-gray-900 rounded-xl border border-gray-800">
          <div className="px-4 py-3 border-b border-gray-800">
            <h2 className="text-sm font-semibold text-gray-200">Reasoning Chain</h2>
          </div>
          <div className="p-4 space-y-3">
            {data.reasoning_chain.map((s, i) => (
              <div key={i} className="flex gap-3">
                <span className="text-xs font-mono text-blue-400 bg-blue-950 border border-blue-800 rounded px-2 py-1 h-fit shrink-0 uppercase">
                  {s.step}
                </span>
                <span className="text-sm text-gray-300">{s.content}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Confidence Factors */}
      {data.confidence_factors && Object.keys(data.confidence_factors).length > 0 && (
        <section className="bg-gray-900 rounded-xl border border-gray-800">
          <div className="px-4 py-3 border-b border-gray-800">
            <h2 className="text-sm font-semibold text-gray-200">Confidence Factors</h2>
          </div>
          <div className="p-4 space-y-2">
            {Object.entries(data.confidence_factors).map(([factor, weight]) => (
              <div key={factor} className="flex items-center gap-3">
                <span className="text-gray-400 text-sm w-40 shrink-0 truncate" title={factor}>{factor}</span>
                <div className="flex-1 bg-gray-800 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: `${Math.min(100, weight * 100)}%` }}
                  />
                </div>
                <span className="text-gray-300 text-sm w-12 text-right font-mono">{(weight * 100).toFixed(0)}%</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Reasoning Graph */}
      <section className="bg-gray-900 rounded-xl border border-gray-800">
        <div className="px-4 py-3 border-b border-gray-800">
          <h2 className="text-sm font-semibold text-gray-200">Reasoning Graph</h2>
        </div>
        <div className="p-4">
          {graphLoading ? (
            <div className="text-gray-500 text-sm py-8 text-center">Loading reasoning graph...</div>
          ) : graphData && graphData.nodes.length > 0 ? (
            <ReasoningFlowGraph graph={graphData} />
          ) : (
            <div className="text-gray-600 text-sm py-8 text-center">No reasoning graph data</div>
          )}
        </div>
      </section>
    </div>
  )
}
