import { formatDateTime } from '../../../utils/format'
import type { PredictionReviewResponse } from '../../../types/predict'

interface ParsedReview {
  outcome?: string
  prediction_recap?: string
  actual_result?: string
  lessons?: string[]
  pattern_context?: string
  [key: string]: unknown
}

export function ReviewPanel({ data }: { data: PredictionReviewResponse }) {
  const isCorrect = data.validation.is_correct

  let parsed: ParsedReview = {}
  try {
    parsed = JSON.parse(data.review.review_text) as ParsedReview
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
            Horizon: {data.validation.horizon} &middot; Validated: {formatDateTime(data.validation.validated_at)}
          </span>
        </div>
        <div className="text-sm text-gray-300">{data.review.outcome_summary}</div>
      </div>

      {/* Prediction vs actual comparison */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
        <div>
          <span className="text-gray-500 block">Predicted</span>
          <span>{data.prediction.direction}</span>
          <span className="text-gray-500 ml-1">({(data.prediction.confidence * 100).toFixed(0)}%)</span>
        </div>
        <div>
          <span className="text-gray-500 block">Actual Change</span>
          <span className={`font-mono ${data.validation.actual_price_change_pct >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {data.validation.actual_price_change_pct >= 0 ? '+' : ''}{data.validation.actual_price_change_pct.toFixed(2)}%
          </span>
        </div>
        <div>
          <span className="text-gray-500 block">Status</span>
          <span>{data.status}</span>
        </div>
      </div>

      {/* Accuracy context */}
      <div className="text-sm text-gray-400">{data.review.accuracy_context}</div>

      {/* Parsed review_text structured fields */}
      {parsed.outcome && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-300">Outcome</h3>
          <p className="text-sm text-gray-400">{parsed.outcome}</p>
        </div>
      )}

      {parsed.prediction_recap && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-300">Prediction Recap</h3>
          <p className="text-sm text-gray-400">{parsed.prediction_recap}</p>
        </div>
      )}

      {parsed.actual_result && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-300">Actual Result</h3>
          <p className="text-sm text-gray-400">{parsed.actual_result}</p>
        </div>
      )}

      {parsed.pattern_context && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-300">Pattern Context</h3>
          <p className="text-sm text-gray-400">{parsed.pattern_context}</p>
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

      {/* Fallback: show raw review_text if parsing failed */}
      {!parsed.outcome && !parsed.lessons && data.review.review_text && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-300">Review Details</h3>
          <pre className="text-xs text-gray-400 bg-gray-800 rounded p-3 overflow-x-auto whitespace-pre-wrap">
            {data.review.review_text}
          </pre>
        </div>
      )}
    </section>
  )
}
