import { useIndustryChain } from '../hooks/usePredictApi'
import { IndustryChainSection } from '../components/predict/IndustryChainSection'
import SectionErrorBoundary from '../components/SectionErrorBoundary'
import { PageSkeleton } from '../components/PageSkeleton'
import { EmptyState } from '../components/EmptyState'
import { ApiError } from '../components/ui/ApiError'

export default function ChainPage() {
  const { data, error, isLoading } = useIndustryChain()

  if (isLoading) {
    return <PageSkeleton />
  }

  if (error) {
    return <ApiError message={`Failed to load: ${String(error?.message ?? error)}`} />
  }

  if (!data) return <EmptyState message="No industry chain data available" />

  const nodes = data.nodes ?? []
  const edges = data.edges ?? []

  if (nodes.length === 0) {
    return (
      <div className="p-2 sm:p-4 lg:p-6 space-y-6">
        <h1 className="text-lg font-semibold text-gray-100">Industry Chain</h1>
        <EmptyState message="No chain nodes found" />
      </div>
    )
  }

  return (
    <div className="p-2 sm:p-4 lg:p-6 space-y-6">
      <h1 className="text-lg font-semibold text-gray-100">Industry Chain</h1>
      <SectionErrorBoundary title="Industry Chain">
        <IndustryChainSection nodes={nodes} edges={edges} />
      </SectionErrorBoundary>
    </div>
  )
}
