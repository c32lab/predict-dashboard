import { DirectionBadge, StatusBadge } from '../badges'
import { formatDateTime, formatPrice } from '../../../utils/format'
import type { PredictionDetail } from '../../../types/predict'

export function DetailHeaderCard({ data }: { data: PredictionDetail }) {
  return (
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

      {data.trigger_event_text && (
        <div>
          <div className="text-gray-500 text-xs uppercase mb-1">Trigger Event</div>
          <div className="bg-blue-950 border border-blue-800 rounded px-3 py-2 text-blue-200 text-sm">
            {data.trigger_event_text}
          </div>
        </div>
      )}

      {data.reasoning && (
        <div>
          <div className="text-gray-500 text-xs uppercase mb-1">Reasoning</div>
          <div className="bg-gray-800 rounded px-3 py-2 text-gray-300 text-sm italic">
            {data.reasoning}
          </div>
        </div>
      )}
    </section>
  )
}
