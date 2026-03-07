import { Fragment, useState } from 'react'
import { Link } from 'react-router-dom'
import { DirectionBadge, StatusBadge } from './badges'
import { formatDateTime, formatPrice } from '../../utils/format'
import type { Prediction } from '../../types/predict'
import { DetailPanel } from './DetailPanel'

export function PredictionHistoryTable({ predictions }: { predictions: Prediction[] }) {
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const sorted = [...predictions].sort((a, b) =>
    (b.created_at ?? b.timestamp ?? '').localeCompare(a.created_at ?? a.timestamp ?? '')
  )
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-gray-500 border-b border-gray-800">
            <th className="text-left py-2 px-3 font-medium">Time</th>
            <th className="text-left py-2 px-3 font-medium">Symbol</th>
            <th className="text-left py-2 px-3 font-medium">Direction</th>
            <th className="text-left py-2 px-3 font-medium">Confidence</th>
            <th className="text-left py-2 px-3 font-medium">Trigger Pattern</th>
            <th className="text-left py-2 px-3 font-medium">Expected Impact</th>
            <th className="text-left py-2 px-3 font-medium">Price</th>
            <th className="text-left py-2 px-3 font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((p) => (
            <Fragment key={p.id}>
              <tr
                className="border-b border-gray-800 hover:bg-gray-800/40 transition-colors cursor-pointer"
                onClick={() => setSelectedId(selectedId === p.id ? null : p.id)}
              >
                <td className="py-2 px-3 text-gray-500 whitespace-nowrap">
                  {formatDateTime(p.created_at ?? p.timestamp)}
                </td>
                <td className="py-2 px-3 font-mono">
                  <Link to={`/predictions/${p.id}`} className="text-blue-300 hover:text-blue-200 underline underline-offset-2">
                    {p.symbol}
                  </Link>
                </td>
                <td className="py-2 px-3">
                  <DirectionBadge direction={p.direction} />
                </td>
                {/* confidence: decimal_0_1 → ×100 */}
                <td className="py-2 px-3 text-gray-300">{(p.confidence * 100).toFixed(0)}%</td>
                <td className="py-2 px-3 text-gray-400 truncate max-w-[160px]" title={p.trigger_pattern}>
                  {p.trigger_pattern}
                </td>
                {/* expected_impact is already_pct — direct display, no ×100 */}
                <td className="py-2 px-3 text-gray-300">
                  {p.expected_impact != null ? `${p.expected_impact.toFixed(1)}%` : '—'}
                </td>
                <td className="py-2 px-3 font-mono text-gray-300">
                  {p.price_at_prediction != null ? formatPrice(p.price_at_prediction, p.symbol) : '—'}
                </td>
                <td className="py-2 px-3">
                  <StatusBadge status={p.status} />
                </td>
              </tr>
              {selectedId === p.id && (
                <tr key={`${p.id}-detail`} className="border-b border-gray-800">
                  <td colSpan={8} className="bg-gray-950 border-l-2 border-blue-500">
                    <DetailPanel id={p.id} reasoning={p.reasoning ?? ''} />
                  </td>
                </tr>
              )}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  )
}
