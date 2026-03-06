import { useIndustryChain } from '../hooks/usePredictApi'
import { IndustryChainSection } from '../components/predict/IndustryChainSection'

export default function ChainPage() {
  const { data, error, isLoading } = useIndustryChain()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500 text-sm">
        Loading industry chain...
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 text-red-400 text-sm">
        Failed to load: {String(error?.message ?? error)}
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="p-2 sm:p-4 lg:p-6 space-y-6">
      <h1 className="text-lg font-semibold text-gray-100">Industry Chain</h1>
      <IndustryChainSection nodes={data.nodes ?? []} edges={data.edges ?? []} />
    </div>
  )
}
