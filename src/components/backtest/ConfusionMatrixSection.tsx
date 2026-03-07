import type { FullResults } from '../../types/backtest'
import { Section } from './Section'

export function ConfusionMatrixSection({ cm }: { cm: FullResults['prediction_backtest']['confusion_matrix'] }) {
  return (
    <Section title="Confusion Matrix">
      <div className="grid grid-cols-2 gap-3 max-w-md">
        <div className="bg-green-900/40 border border-green-800 rounded-lg p-4 text-center">
          <div className="text-xs text-gray-400">True Positive</div>
          <div className="text-2xl font-bold text-green-300">{cm.TP}</div>
        </div>
        <div className="bg-red-900/40 border border-red-800 rounded-lg p-4 text-center">
          <div className="text-xs text-gray-400">False Positive</div>
          <div className="text-2xl font-bold text-red-300">{cm.FP}</div>
        </div>
        <div className="bg-red-900/40 border border-red-800 rounded-lg p-4 text-center">
          <div className="text-xs text-gray-400">False Negative</div>
          <div className="text-2xl font-bold text-red-300">{cm.FN}</div>
        </div>
        <div className="bg-green-900/40 border border-green-800 rounded-lg p-4 text-center">
          <div className="text-xs text-gray-400">True Negative</div>
          <div className="text-2xl font-bold text-green-300">{cm.TN}</div>
        </div>
      </div>
      <div className="flex gap-6 mt-4 text-sm text-gray-300">
        <span>Precision: <strong>{cm.precision_pct}%</strong></span>
        <span>Recall: <strong>{cm.recall_pct}%</strong></span>
        <span>F1: <strong>{cm.f1}</strong></span>
        <span>Accuracy: <strong>{cm.accuracy_pct}%</strong></span>
      </div>
    </Section>
  )
}
