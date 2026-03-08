import { DecayDashboard } from '../components/predict/DecayDashboard'
import SectionErrorBoundary from '../components/SectionErrorBoundary'

export default function DecayPage() {
  return (
    <div className="p-2 sm:p-4 lg:p-6 space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-lg font-semibold text-gray-100">Decay Analysis</h1>
        <p className="text-sm text-gray-500 mt-1">Active decay impact, event details, and decay model reference.</p>
      </div>

      <SectionErrorBoundary title="Decay Dashboard">
        <DecayDashboard />
      </SectionErrorBoundary>
    </div>
  )
}
