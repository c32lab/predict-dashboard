import ReasoningFlowGraph from '../ReasoningFlowGraph'
import type { ReasoningGraph } from '../../../types/predict'

export function ReasoningGraphSection({
  graphData,
  isLoading,
}: {
  graphData: ReasoningGraph | undefined
  isLoading: boolean
}) {
  return (
    <section className="bg-gray-900 rounded-xl border border-gray-800">
      <div className="px-4 py-3 border-b border-gray-800">
        <h2 className="text-sm font-semibold text-gray-200">Reasoning Graph</h2>
      </div>
      <div className="p-4">
        {isLoading ? (
          <div className="text-gray-500 text-sm py-8 text-center">Loading reasoning graph...</div>
        ) : graphData && graphData.nodes.length > 0 ? (
          <ReasoningFlowGraph graph={graphData} />
        ) : (
          <div className="text-gray-600 text-sm py-8 text-center">No reasoning graph data</div>
        )}
      </div>
    </section>
  )
}
