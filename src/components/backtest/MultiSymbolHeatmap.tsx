import type { FullResults } from '../../types/backtest'
import { Section } from './Section'

type SymbolData = FullResults['multi_symbol_conduction']['by_symbol']

interface Props {
  symbols: SymbolData
}

function cellColor(accuracy: number): string {
  if (accuracy >= 65) return 'bg-green-600/60 text-green-100'
  if (accuracy >= 55) return 'bg-green-800/40 text-green-200'
  if (accuracy >= 50) return 'bg-yellow-800/40 text-yellow-200'
  if (accuracy >= 45) return 'bg-orange-800/40 text-orange-200'
  return 'bg-red-800/40 text-red-200'
}

export function MultiSymbolHeatmap({ symbols }: Props) {
  const sorted = Object.entries(symbols).sort((a, b) => b[1].overall_accuracy_pct - a[1].overall_accuracy_pct)

  if (sorted.length === 0) {
    return (
      <Section title="Multi-Symbol Heatmap">
        <p className="text-sm text-gray-500">No symbol data available</p>
      </Section>
    )
  }

  const horizonKeys = Array.from(
    new Set(sorted.flatMap(([, s]) => Object.keys(s.horizons)))
  ).sort()

  return (
    <Section title="Multi-Symbol Heatmap">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-gray-500 border-b border-gray-800">
              <th className="text-left py-2 px-3">Symbol</th>
              <th className="text-center py-2 px-3">Overall</th>
              {horizonKeys.map(h => (
                <th key={h} className="text-center py-2 px-3">{h}</th>
              ))}
              <th className="text-center py-2 px-3">Correct</th>
              <th className="text-center py-2 px-3">Total</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map(([symbol, s]) => (
              <tr key={symbol} className="border-b border-gray-800/50">
                <td className="py-2 px-3 font-mono text-gray-300">{symbol}</td>
                <td className="py-1.5 px-2 text-center">
                  <span className={`inline-block px-2 py-1 rounded text-xs font-bold ${cellColor(s.overall_accuracy_pct)}`}>
                    {s.overall_accuracy_pct}%
                  </span>
                </td>
                {horizonKeys.map(h => {
                  const hs = s.horizons[h]
                  return (
                    <td key={h} className="py-1.5 px-2 text-center">
                      {hs ? (
                        <span className={`inline-block px-2 py-1 rounded text-xs font-bold ${cellColor(hs.accuracy_pct)}`}>
                          {hs.accuracy_pct}%
                        </span>
                      ) : (
                        <span className="text-gray-600">—</span>
                      )}
                    </td>
                  )
                })}
                <td className="py-2 px-3 text-center text-gray-400">{s.overall_correct}</td>
                <td className="py-2 px-3 text-center text-gray-500">{s.overall_total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center gap-3 mt-4 text-xs text-gray-500">
        <span>Legend:</span>
        <span className="inline-flex items-center gap-1"><span className="w-3 h-3 rounded bg-green-600/60" /> &ge;65%</span>
        <span className="inline-flex items-center gap-1"><span className="w-3 h-3 rounded bg-green-800/40" /> 55-64%</span>
        <span className="inline-flex items-center gap-1"><span className="w-3 h-3 rounded bg-yellow-800/40" /> 50-54%</span>
        <span className="inline-flex items-center gap-1"><span className="w-3 h-3 rounded bg-orange-800/40" /> 45-49%</span>
        <span className="inline-flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-800/40" /> &lt;45%</span>
      </div>
    </Section>
  )
}
