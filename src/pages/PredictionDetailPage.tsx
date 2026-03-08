import { Link, useParams } from 'react-router-dom'
import { usePredictionDetail, useReasoningGraph, usePredictionExplain, usePredictionReview } from '../hooks/usePredictApi'
import {
  DetailHeaderCard,
  MatchedEventsSection,
  ReasoningChainSection,
  ConfidenceFactorsSection,
  ReasoningGraphSection,
  ExplainPanel,
  ReviewPanel,
} from '../components/predict/detail'
import SectionErrorBoundary from '../components/SectionErrorBoundary'

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
  const { data: explainData, error: explainError } = usePredictionExplain(numId)
  const { data: reviewData } = usePredictionReview(numId)

  if (isLoading) return <Skeleton />

  if (error) {
    return (
      <div className="p-6">
        <Link to="/" className="text-blue-400 hover:text-blue-300 text-sm mb-4 inline-block">
          &larr; Back
        </Link>
        <div className="text-red-400 text-sm mt-4">
          Failed to load: {String(error?.message ?? error)}
        </div>
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="p-2 sm:p-4 lg:p-6 space-y-6 max-w-5xl mx-auto">
      <Link to="/" className="text-blue-400 hover:text-blue-300 text-sm inline-block">
        &larr; Back
      </Link>

      <div className="flex justify-end">
        <Link
          to={`/review/${id}`}
          className="text-blue-300 hover:text-blue-200 underline underline-offset-2 text-sm"
        >
          View Review / Postmortem &rarr;
        </Link>
      </div>

      <SectionErrorBoundary title="Prediction Header">
        <DetailHeaderCard data={data} />
      </SectionErrorBoundary>
      <SectionErrorBoundary title="Matched Events">
        <MatchedEventsSection events={data.matched_events} />
      </SectionErrorBoundary>
      <SectionErrorBoundary title="Reasoning Chain">
        <ReasoningChainSection chain={data.reasoning_chain} />
      </SectionErrorBoundary>
      <SectionErrorBoundary title="Confidence Factors">
        <ConfidenceFactorsSection factors={data.confidence_factors} />
      </SectionErrorBoundary>
      <SectionErrorBoundary title="Reasoning Graph">
        <ReasoningGraphSection graphData={graphData} isLoading={graphLoading} />
      </SectionErrorBoundary>

      {/* AI Explanation — show "not available" on 404, render panel on success */}
      <SectionErrorBoundary title="AI Explanation">
        {explainData ? (
          <ExplainPanel data={explainData} />
        ) : explainError ? (
          <section className="bg-gray-900 rounded-xl border border-gray-800 p-4">
            <h2 className="text-lg font-semibold mb-2">AI Explanation</h2>
            <p className="text-gray-500 text-sm">Explanation not available</p>
          </section>
        ) : null}
      </SectionErrorBoundary>

      {/* Review — hide section when 404 (not yet validated), same pattern as #121 */}
      {reviewData && (
        <SectionErrorBoundary title="Postmortem Review">
          <ReviewPanel data={reviewData} />
        </SectionErrorBoundary>
      )}
    </div>
  )
}
