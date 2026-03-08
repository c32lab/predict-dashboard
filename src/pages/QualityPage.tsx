import { QualityReportPanel } from '../components/accuracy/QualityReportPanel'
import SectionErrorBoundary from '../components/SectionErrorBoundary'

export default function QualityPage() {
  return (
    <div className="p-2 sm:p-4 lg:p-6 space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-lg font-semibold text-gray-100">Quality Report</h1>
        <p className="text-sm text-gray-500 mt-1">Confidence distribution, category breakdown, and overall accuracy by horizon.</p>
      </div>

      <SectionErrorBoundary title="Quality Report">
        <QualityReportPanel />
      </SectionErrorBoundary>
    </div>
  )
}
