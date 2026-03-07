import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AccuracyAndValidationsSection } from '../../../components/predict/AccuracyAndValidationsSection'
import type { Validation } from '../../../types/predict'

function makeValidation(overrides: Partial<Validation> = {}): Validation {
  return {
    id: 1,
    prediction_id: 1,
    horizon: '1d',
    actual_change: 2.5,
    is_correct: 1,
    price_at_validation: 66000,
    validated_at: '2026-03-06T10:00:00Z',
    symbol: 'BTC/USDT',
    direction: 'LONG',
    trigger_event: 'Whale accumulation detected',
    price_at_prediction: 65000,
    confidence: 0.85,
    ...overrides,
  }
}

describe('AccuracyAndValidationsSection', () => {
  it('renders section titles', () => {
    render(
      <AccuracyAndValidationsSection
        accuracy={{}}
        validations={[]}
      />
    )
    expect(screen.getByText('Prediction Accuracy')).toBeInTheDocument()
    expect(screen.getByText('Recent Validations')).toBeInTheDocument()
  })

  it('shows no validations message when empty', () => {
    render(
      <AccuracyAndValidationsSection accuracy={{}} validations={[]} />
    )
    expect(screen.getByText('No validation records')).toBeInTheDocument()
  })

  it('displays accuracy stats from validations', () => {
    const validations = [
      makeValidation({ id: 1, is_correct: 1 }),
      makeValidation({ id: 2, is_correct: 1 }),
      makeValidation({ id: 3, is_correct: 0 }),
    ]
    render(
      <AccuracyAndValidationsSection accuracy={{}} validations={validations} />
    )
    expect(screen.getByText('3')).toBeInTheDocument() // total
    expect(screen.getByText('66.7%')).toBeInTheDocument() // accuracy
  })

  it('renders validation rows with direction badges', () => {
    render(
      <AccuracyAndValidationsSection
        accuracy={{}}
        validations={[makeValidation()]}
      />
    )
    // Use getAllByText since BTC/USDT appears in both filter and table
    expect(screen.getAllByText('BTC/USDT').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('LONG')).toBeInTheDocument()
  })

  it('shows correct/wrong result badges', () => {
    const validations = [
      makeValidation({ id: 1, is_correct: 1 }),
      makeValidation({ id: 2, is_correct: 0, symbol: 'ETH/USDT' }),
    ]
    render(
      <AccuracyAndValidationsSection accuracy={{}} validations={validations} />
    )
    // Use getAllByText since "Correct" also appears in stats area
    expect(screen.getAllByText(/Correct/).length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText(/Wrong/)).toBeInTheDocument()
  })

  it('filters by symbol', async () => {
    const user = userEvent.setup()
    const validations = [
      makeValidation({ id: 1, symbol: 'BTC/USDT' }),
      makeValidation({ id: 2, symbol: 'ETH/USDT' }),
    ]
    render(
      <AccuracyAndValidationsSection accuracy={{}} validations={validations} />
    )
    const select = screen.getByRole('combobox')
    await user.selectOptions(select, 'BTC/USDT')
    // After filtering, total should be 1
    const totalSection = screen.getByText('predictions')
    const totalValue = totalSection.parentElement?.querySelector('.text-3xl, .text-4xl')
    expect(totalValue?.textContent).toBe('1')
  })

  it('has time range filter buttons', () => {
    render(
      <AccuracyAndValidationsSection accuracy={{}} validations={[makeValidation()]} />
    )
    expect(screen.getByText('7d')).toBeInTheDocument()
    expect(screen.getByText('14d')).toBeInTheDocument()
    expect(screen.getByText('30d')).toBeInTheDocument()
    expect(screen.getByText('All')).toBeInTheDocument()
  })

  it('applies green color for accuracy > 50%', () => {
    const validations = [
      makeValidation({ id: 1, is_correct: 1 }),
      makeValidation({ id: 2, is_correct: 1 }),
      makeValidation({ id: 3, is_correct: 0 }),
    ]
    render(
      <AccuracyAndValidationsSection accuracy={{}} validations={validations} />
    )
    const pctEl = screen.getByText('66.7%')
    expect(pctEl.className).toContain('text-green-400')
  })

  it('filters chart symbols when a specific symbol is selected', async () => {
    const user = userEvent.setup()
    const validations = [
      makeValidation({ id: 1, symbol: 'BTC/USDT', validated_at: '2026-03-06T10:00:00Z' }),
      makeValidation({ id: 2, symbol: 'ETH/USDT', validated_at: '2026-03-06T10:00:00Z' }),
    ]
    render(
      <AccuracyAndValidationsSection accuracy={{}} validations={validations} />
    )
    const select = screen.getByRole('combobox')
    await user.selectOptions(select, 'ETH/USDT')
    // After filtering to ETH, accuracy should be computed for 1 validation
    const totalSection = screen.getByText('predictions')
    const totalValue = totalSection.parentElement?.querySelector('.text-3xl, .text-4xl')
    expect(totalValue?.textContent).toBe('1')
  })
})
