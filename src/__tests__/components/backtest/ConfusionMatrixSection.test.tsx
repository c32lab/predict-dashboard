import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ConfusionMatrixSection } from '../../../components/backtest/ConfusionMatrixSection'
import type { FullResults } from '../../../types/backtest'

const cm: FullResults['prediction_backtest']['confusion_matrix'] = {
  TP: 40, FP: 10, TN: 30, FN: 5,
  NEUTRAL_pred: 3, NEUTRAL_actual: 2,
  total: 90, accuracy_pct: 77.8, precision_pct: 80.0, recall_pct: 88.9, f1: 0.84,
}

describe('ConfusionMatrixSection', () => {
  it('renders TP, FP, TN, FN values', () => {
    render(<ConfusionMatrixSection cm={cm} />)
    expect(screen.getByText('40')).toBeInTheDocument()
    expect(screen.getByText('10')).toBeInTheDocument()
    expect(screen.getByText('30')).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument()
  })

  it('renders cell labels', () => {
    render(<ConfusionMatrixSection cm={cm} />)
    expect(screen.getByText('True Positive')).toBeInTheDocument()
    expect(screen.getByText('False Positive')).toBeInTheDocument()
    expect(screen.getByText('False Negative')).toBeInTheDocument()
    expect(screen.getByText('True Negative')).toBeInTheDocument()
  })

  it('renders precision, recall, f1, accuracy metrics', () => {
    render(<ConfusionMatrixSection cm={cm} />)
    expect(screen.getByText('80%')).toBeInTheDocument()
    expect(screen.getByText('88.9%')).toBeInTheDocument()
    expect(screen.getByText('0.84')).toBeInTheDocument()
    expect(screen.getByText('77.8%')).toBeInTheDocument()
  })
})
