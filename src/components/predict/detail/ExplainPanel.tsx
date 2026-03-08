import { DirectionBadge } from '../badges'
import { formatDateTime } from '../../../utils/format'
import type {
  PredictionExplainResponse,
  ExplainHistoricalMatch,
} from '../../../types/predict'

const STEP_LABELS: Record<string, string> = {
  trigger: 'Trigger Event',
  classification: 'Pattern Classification',
  historical_matches: 'Historical Matches',
  decay_analysis: 'Decay Analysis',
  direction_decision: 'Direction Decision',
  symbol_decision: 'Symbol Selection',
}

function StepContent({ stepKey, data }: { stepKey: string; data: unknown }) {
  if (!data) return <span className="text-gray-500 text-xs">N/A</span>

  if (stepKey === 'trigger') {
    const t = data as PredictionExplainResponse['reasoning_chain']['trigger']
    return (
      <div className="text-xs text-gray-300 space-y-0.5">
        <div>{t.event}</div>
        <div className="text-gray-500">Source: {t.source} &middot; {formatDateTime(t.timestamp)}</div>
      </div>
    )
  }
  if (stepKey === 'classification') {
    const c = data as PredictionExplainResponse['reasoning_chain']['classification']
    return (
      <div className="text-xs text-gray-300">
        Pattern: <span className="text-blue-300">{c.pattern}</span>
        {' '}&middot; Category: {c.category}
        {' '}&middot; Score: {(c.confidence_score * 100).toFixed(0)}%
      </div>
    )
  }
  if (stepKey === 'historical_matches') {
    const matches = data as ExplainHistoricalMatch[]
    if (!matches.length) return <span className="text-gray-500 text-xs">No matches</span>
    return (
      <div className="text-xs text-gray-400">
        {matches.length} match{matches.length > 1 ? 'es' : ''} found
      </div>
    )
  }
  if (stepKey === 'direction_decision') {
    const d = data as PredictionExplainResponse['reasoning_chain']['direction_decision']
    return (
      <div className="text-xs text-gray-300 flex items-center gap-2">
        <DirectionBadge direction={d.direction} />
        <span>Confidence: {(d.confidence * 100).toFixed(0)}%</span>
      </div>
    )
  }
  if (stepKey === 'symbol_decision') {
    const s = data as PredictionExplainResponse['reasoning_chain']['symbol_decision']
    return <div className="text-xs text-gray-300">{s.symbol}</div>
  }

  const obj = data as Record<string, unknown>
  const entries = Object.entries(obj)
  if (!entries.length) return <span className="text-gray-500 text-xs">No data</span>
  return (
    <div className="text-xs text-gray-400">
      {entries.map(([k, v]) => (
        <div key={k}>{k}: {typeof v === 'object' ? JSON.stringify(v) : String(v)}</div>
      ))}
    </div>
  )
}

export function ExplainPanel({ data }: { data: PredictionExplainResponse }) {
  const chain = data.reasoning_chain
  const steps = [
    { key: 'trigger', data: chain.trigger },
    { key: 'classification', data: chain.classification },
    { key: 'historical_matches', data: chain.historical_matches },
    { key: 'decay_analysis', data: chain.decay_analysis },
    { key: 'direction_decision', data: chain.direction_decision },
    { key: 'symbol_decision', data: chain.symbol_decision },
  ]

  return (
    <div className="space-y-6">
      {/* Summary */}
      <section className="bg-gray-900 rounded-xl border border-gray-800 p-4 space-y-3">
        <h2 className="text-lg font-semibold">AI Explanation</h2>
        <p className="text-gray-300 text-sm">{data.summary}</p>
      </section>

      {/* Reasoning Chain */}
      <section className="bg-gray-900 rounded-xl border border-gray-800 p-4 space-y-3">
        <h2 className="text-lg font-semibold">Reasoning Chain</h2>
        <div className="space-y-0">
          {steps.map((step, i) => (
            <div key={step.key} className="flex items-start gap-3">
              <div className="flex flex-col items-center">
                <div className="w-7 h-7 rounded-full bg-blue-900 text-blue-300 flex items-center justify-center text-xs font-bold shrink-0">
                  {i + 1}
                </div>
                {i < steps.length - 1 && <div className="w-0.5 h-8 bg-gray-700" />}
              </div>
              <div className="pb-4 min-w-0">
                <div className="text-sm font-medium text-blue-300">
                  {STEP_LABELS[step.key] ?? step.key}
                </div>
                <StepContent stepKey={step.key} data={step.data} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Historical Matches Table */}
      {chain.historical_matches.length > 0 && (
        <section className="bg-gray-900 rounded-xl border border-gray-800 p-4 space-y-3">
          <h2 className="text-lg font-semibold">Historical Matches</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-500 border-b border-gray-800 text-left">
                  <th className="py-2 px-3">Event</th>
                  <th className="py-2 px-3">Date</th>
                  <th className="py-2 px-3 text-right">Similarity</th>
                  <th className="py-2 px-3">Direction</th>
                  <th className="py-2 px-3 text-right">Price Change</th>
                </tr>
              </thead>
              <tbody>
                {chain.historical_matches.map((m, i) => (
                  <tr key={i} className="border-b border-gray-800/50 hover:bg-gray-800/40 transition-colors">
                    <td className="py-2 px-3 max-w-xs truncate">{m.event}</td>
                    <td className="py-2 px-3 text-gray-500 whitespace-nowrap">{m.date}</td>
                    <td className="py-2 px-3 text-right font-mono">{(m.similarity * 100).toFixed(1)}%</td>
                    <td className="py-2 px-3"><DirectionBadge direction={m.outcome.direction} /></td>
                    <td className={`py-2 px-3 text-right font-mono ${m.outcome.price_change_pct >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {m.outcome.price_change_pct >= 0 ? '+' : ''}{m.outcome.price_change_pct.toFixed(2)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Decision Factors */}
      {data.factors.length > 0 && (
        <section className="bg-gray-900 rounded-xl border border-gray-800 p-4 space-y-3">
          <h2 className="text-lg font-semibold">Decision Factors</h2>
          <div className="space-y-2">
            {data.factors.map((f) => (
              <div key={f.name} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>{f.name}</span>
                  <span className="text-gray-400">{(f.weight * 100).toFixed(0)}%</span>
                </div>
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full" style={{ width: `${f.weight * 100}%` }} />
                </div>
                <div className="text-xs text-gray-500">{f.contribution}</div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
