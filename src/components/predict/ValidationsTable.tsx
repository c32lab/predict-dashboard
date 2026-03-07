import { DirectionBadge } from './badges'
import type { Validation } from '../../types/predict'
import { formatDateTime, formatPrice } from '../../utils/format'

export function ValidationsTable({ validations }: { validations: Validation[] }) {
  if (validations.length === 0) {
    return <p className="text-center text-gray-600 py-8 text-sm">No validation records</p>
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-gray-500 border-b border-gray-800">
            <th className="text-left py-2 px-3 font-medium">Time</th>
            <th className="text-left py-2 px-3 font-medium">Symbol</th>
            <th className="text-left py-2 px-3 font-medium">Direction</th>
            <th className="text-left py-2 px-3 font-medium">Confidence</th>
            <th className="text-left py-2 px-3 font-medium">Actual Δ</th>
            <th className="text-left py-2 px-3 font-medium">Result</th>
            <th className="text-left py-2 px-3 font-medium">Price Entry→Exit</th>
            <th className="text-left py-2 px-3 font-medium">Trigger</th>
          </tr>
        </thead>
        <tbody>
          {validations.map((v) => (
            <tr key={v.id} className="border-b border-gray-800 hover:bg-gray-800/40 transition-colors">
              <td className="py-2 px-3 text-gray-500 whitespace-nowrap">
                {formatDateTime(v.validated_at)}
              </td>
              <td className="py-2 px-3 font-mono text-blue-300">{v.symbol}</td>
              <td className="py-2 px-3">
                <DirectionBadge direction={v.direction} />
              </td>
              {/* confidence: decimal_0_1 → ×100 */}
              <td className="py-2 px-3 text-gray-300">{(v.confidence * 100).toFixed(0)}%</td>
              {/* actual_change: already_pct — direct display, no ×100 */}
              <td
                className={`py-2 px-3 font-mono font-bold ${
                  v.actual_change > 0
                    ? 'text-green-400'
                    : v.actual_change < 0
                    ? 'text-red-400'
                    : 'text-gray-400'
                }`}
              >
                {v.actual_change > 0 ? '+' : ''}{v.actual_change.toFixed(2)}%
              </td>
              <td className="py-2 px-3 whitespace-nowrap">
                {v.is_correct === 1 ? (
                  <span className="text-green-400 font-medium">✅ Correct</span>
                ) : (
                  <span className="text-red-400 font-medium">❌ Wrong</span>
                )}
              </td>
              <td className="py-2 px-3 font-mono text-gray-300 whitespace-nowrap">
                {formatPrice(v.price_at_prediction, v.symbol)} → {formatPrice(v.price_at_validation, v.symbol)}
              </td>
              <td className="py-2 px-3 text-gray-500 max-w-[200px]">
                <span title={v.trigger_event} className="cursor-help">
                  {v.trigger_event?.length > 40
                    ? v.trigger_event.slice(0, 40) + '…'
                    : v.trigger_event}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
