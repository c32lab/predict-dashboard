import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ValidationsTable } from '../../../components/predict/ValidationsTable'
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

describe('ValidationsTable', () => {
  it('shows empty message when no validations', () => {
    render(<ValidationsTable validations={[]} />)
    expect(screen.getByText('No validation records')).toBeInTheDocument()
  })

  it('renders table headers', () => {
    render(<ValidationsTable validations={[makeValidation()]} />)
    expect(screen.getByText('Time')).toBeInTheDocument()
    expect(screen.getByText('Symbol')).toBeInTheDocument()
    expect(screen.getByText('Direction')).toBeInTheDocument()
    expect(screen.getByText('Confidence')).toBeInTheDocument()
    expect(screen.getByText('Result')).toBeInTheDocument()
  })

  it('renders validation data', () => {
    render(<ValidationsTable validations={[makeValidation()]} />)
    expect(screen.getByText('BTC/USDT')).toBeInTheDocument()
    expect(screen.getByText('LONG')).toBeInTheDocument()
    expect(screen.getByText('85%')).toBeInTheDocument()
  })

  it('shows correct result badge for correct prediction', () => {
    render(<ValidationsTable validations={[makeValidation({ is_correct: 1 })]} />)
    expect(screen.getByText(/Correct/)).toBeInTheDocument()
  })

  it('shows wrong result badge for incorrect prediction', () => {
    render(<ValidationsTable validations={[makeValidation({ is_correct: 0 })]} />)
    expect(screen.getByText(/Wrong/)).toBeInTheDocument()
  })

  it('formats actual_change with sign', () => {
    render(<ValidationsTable validations={[makeValidation({ actual_change: 2.5 })]} />)
    expect(screen.getByText('+2.50%')).toBeInTheDocument()
  })

  it('shows negative actual_change with red color', () => {
    render(<ValidationsTable validations={[makeValidation({ actual_change: -3.1 })]} />)
    expect(screen.getByText('-3.10%')).toBeInTheDocument()
  })

  it('shows zero actual_change with gray color', () => {
    render(<ValidationsTable validations={[makeValidation({ actual_change: 0 })]} />)
    expect(screen.getByText('0.00%')).toBeInTheDocument()
  })

  it('truncates long trigger event text', () => {
    const longTrigger = 'A'.repeat(50)
    render(<ValidationsTable validations={[makeValidation({ trigger_event: longTrigger })]} />)
    const truncated = screen.getByText(/^A+…$/)
    expect(truncated.textContent!.length).toBeLessThan(50)
  })

  it('shows full trigger event text when short', () => {
    render(<ValidationsTable validations={[makeValidation({ trigger_event: 'Short text' })]} />)
    expect(screen.getByText('Short text')).toBeInTheDocument()
  })
})
