import { formatDateTime } from '../../../utils/format'
import type { MatchedEvent } from '../../../types/predict'

export function MatchedEventsSection({ events }: { events: MatchedEvent[] }) {
  if (!events || events.length === 0) return null

  return (
    <section className="bg-gray-900 rounded-xl border border-gray-800">
      <div className="px-4 py-3 border-b border-gray-800">
        <h2 className="text-sm font-semibold text-gray-200">
          Matched Events
          <span className="ml-2 text-xs text-gray-500">({events.length})</span>
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
            {events.map((ev) => (
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
  )
}
