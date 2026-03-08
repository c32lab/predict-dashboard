import { Link, useParams } from 'react-router-dom'
import { usePredictionExplain, usePredictionReview } from '../hooks/usePredictApi'
import { DirectionBadge } from '../components/predict/badges'
import { formatDateTime } from '../utils/format'
import SectionErrorBoundary from '../components/SectionErrorBoundary'
import type {
  PredictionExplainResponse,
  PredictionReviewResponse,
  ExplainHistoricalMatch,
} from '../types/predict'

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

/* ---------- Summary Card ---------- */

function SummaryCard({ explain, review }: {
  explain: PredictionExplainResponse
  review: PredictionReviewResponse | undefined
}) {
  const isCorrect = review?.validation?.is_correct
  return (
    <section className="bg-gray-900 rounded-xl border border-gray-800 p-4 space-y-3">
      <h2 className="text-lg font-semibold">Summary</h2>
      <p className="text-gray-300 text-sm">{explain.summary}</p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
        <div>
          <span className="text-gray-500 block">Direction</span>
          <DirectionBadge direction={explain.reasoning_chain.direction_decision.direction} />
        </div>
        <div>
          <span className="text-gray-500 block">Symbol</span>
          <span>{explain.reasoning_chain.symbol_decision.symbol}</span>
        </div>
        <div>
          <span className="text-gray-500 block">Confidence</span>
          <span>{(explain.reasoning_chain.classification.confidence_score * 100).toFixed(0)}%</span>
        </div>
        {review && (
          <div>
            <span className="text-gray-500 block">Outcome</span>
            <span className={isCorrect ? 'text-green-400' : 'text-red-400'}>
              {isCorrect ? 'Correct' : 'Incorrect'}
            </span>
            <span className="text-gray-500 text-xs ml-1">
              ({review.validation.actual_price_change_pct > 0 ? '+' : ''}
              {review.validation.actual_price_change_pct.toFixed(2)}%)
            </span>
          </div>
        )}
      </div>
    </section>
  )
}

/* ---------- Reasoning Chain Steps ---------- */

const STEP_LABELS: Record<string, string> = {
  trigger: 'Trigger Event',
  classification: 'Pattern Classification',
  historical_matches: 'Historical Matches',
  decay_analysis: 'Decay Analysis',
  direction_decision: 'Direction Decision',
  symbol_decision: 'Symbol Selection',
}

function ReasoningChainViz({ chain }: { chain: PredictionExplainResponse['reasoning_chain'] }) {
  const steps = [
    { key: 'trigger', data: chain.trigger },
    { key: 'classification', data: chain.classification },
    { key: 'historical_matches', data: chain.historical_matches },
    { key: 'decay_analysis', data: chain.decay_analysis },
    { key: 'direction_decision', data: chain.direction_decision },
    { key: 'symbol_decision', data: chain.symbol_decision },
  ]

  return (
    <section className="bg-gray-900 rounded-xl border border-gray-800 p-4 space-y-3">
      <h2 className="text-lg font-semibold">Reasoning Chain</h2>
      <div className="space-y-0">
        {steps.map((step, i) => (
          <div key={step.key} className="flex items-start gap-3">
            {/* Vertical connector */}
            <div className="flex flex-col items-center">
              <div className="w-7 h-7 rounded-full bg-blue-900 text-blue-300 flex items-center justify-center text-xs font-bold shrink-0">
                {i + 1}
              </div>
              {i < steps.length - 1 && <div className="w-0.5 h-8 bg-gray-700" />}
            </div>
            {/* Content */}
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
  )
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

  // decay_analysis or unknown — render key-value
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

/* ---------- Historical Matches Table ---------- */

function HistoricalMatchesTable({ matches }: { matches: ExplainHistoricalMatch[] }) {
  if (!matches.length) return null
  return (
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
            {matches.map((m, i) => (
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
  )
}

/* ---------- Factors Section ---------- */

function FactorsSection({ factors }: { factors: PredictionExplainResponse['factors'] }) {
  if (!factors.length) return null
  return (
    <section className="bg-gray-900 rounded-xl border border-gray-800 p-4 space-y-3">
      <h2 className="text-lg font-semibold">Decision Factors</h2>
      <div className="space-y-2">
        {factors.map((f) => (
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
  )
}

/* ---------- Review / Postmortem Section ---------- */

interface ParsedReview {
  outcome?: string
  lessons?: string[]
  pattern_context?: string
  [key: string]: unknown
}

function ReviewSection({ review }: { review: PredictionReviewResponse }) {
  const isCorrect = review.validation.is_correct

  let parsed: ParsedReview = {}
  try {
    parsed = JSON.parse(review.review.review_text) as ParsedReview
  } catch {
    // review_text may not be valid JSON
  }

  return (
    <section className="bg-gray-900 rounded-xl border border-gray-800 p-4 space-y-4">
      <h2 className="text-lg font-semibold">Postmortem Review</h2>

      {/* Validation summary */}
      <div className={`p-3 rounded-lg border ${isCorrect ? 'border-green-800 bg-green-950/30' : 'border-red-800 bg-red-950/30'}`}>
        <div className="flex items-center gap-2 mb-1">
          <span className={`text-sm font-bold ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
            {isCorrect ? 'Correct' : 'Incorrect'}
          </span>
          <span className="text-gray-500 text-xs">
            Horizon: {review.validation.horizon} &middot; Validated: {formatDateTime(review.validation.validated_at)}
          </span>
        </div>
        <div className="text-sm text-gray-300">{review.review.outcome_summary}</div>
      </div>

      {/* Accuracy context */}
      <div className="text-sm text-gray-400">{review.review.accuracy_context}</div>

      {/* Parsed review_text */}
      {parsed.outcome && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-300">Outcome</h3>
          <p className="text-sm text-gray-400">{parsed.outcome}</p>
        </div>
      )}

      {parsed.lessons && parsed.lessons.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-300">Lessons Learned</h3>
          <ul className="list-disc list-inside text-sm text-gray-400 space-y-1">
            {parsed.lessons.map((l, i) => <li key={i}>{l}</li>)}
          </ul>
        </div>
      )}

      {parsed.pattern_context && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-300">Pattern Context</h3>
          <p className="text-sm text-gray-400">{parsed.pattern_context}</p>
        </div>
      )}

      {/* Fallback: show raw review_text if parsing failed and we have the string */}
      {!parsed.outcome && !parsed.lessons && review.review.review_text && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-300">Review Details</h3>
          <pre className="text-xs text-gray-400 bg-gray-800 rounded p-3 overflow-x-auto whitespace-pre-wrap">
            {review.review.review_text}
          </pre>
        </div>
      )}
    </section>
  )
}

/* ---------- Page ---------- */

export default function ReviewPage() {
  const { id } = useParams<{ id: string }>()
  const numId = id ? Number(id) : null
  const { data: explain, error: explainError, isLoading: explainLoading } = usePredictionExplain(numId)
  const { data: review } = usePredictionReview(numId)

  if (explainLoading) return <Skeleton />

  if (explainError) {
    return (
      <div className="p-6">
        <Link to={`/predictions/${id}`} className="text-blue-400 hover:text-blue-300 text-sm mb-4 inline-block">
          &larr; Back to Detail
        </Link>
        <div className="text-red-400 text-sm mt-4">
          Failed to load: {String((explainError as Error)?.message ?? explainError)}
        </div>
      </div>
    )
  }

  if (!explain) return null

  return (
    <div className="p-2 sm:p-4 lg:p-6 space-y-6 max-w-5xl mx-auto">
      <Link to={`/predictions/${id}`} className="text-blue-400 hover:text-blue-300 text-sm inline-block">
        &larr; Back to Detail
      </Link>

      <SectionErrorBoundary title="Summary">
        <SummaryCard explain={explain} review={review} />
      </SectionErrorBoundary>
      <SectionErrorBoundary title="Reasoning Chain">
        <ReasoningChainViz chain={explain.reasoning_chain} />
      </SectionErrorBoundary>
      <SectionErrorBoundary title="Historical Matches">
        <HistoricalMatchesTable matches={explain.reasoning_chain.historical_matches} />
      </SectionErrorBoundary>
      <SectionErrorBoundary title="Decision Factors">
        <FactorsSection factors={explain.factors} />
      </SectionErrorBoundary>
      {review && (
        <SectionErrorBoundary title="Postmortem Review">
          <ReviewSection review={review} />
        </SectionErrorBoundary>
      )}
    </div>
  )
}
