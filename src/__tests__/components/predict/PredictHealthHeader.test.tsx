import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PredictHealthHeader } from '../../../components/predict/PredictHealthHeader'
import type { PredictAccuracyResponse } from '../../../types/predict'

describe('PredictHealthHeader', () => {
  const baseProps = {
    serviceOk: true,
    activeCount: 5,
    eventCount: 42,
    macroScore: 7.5,
    accuracy: undefined as PredictAccuracyResponse | undefined,
  }

  it('shows Online when service is ok', () => {
    render(<PredictHealthHeader {...baseProps} />)
    expect(screen.getByText('Online')).toBeInTheDocument()
  })

  it('shows Down when service is not ok', () => {
    render(<PredictHealthHeader {...baseProps} serviceOk={false} />)
    expect(screen.getByText('Down')).toBeInTheDocument()
  })

  it('renders active prediction count', () => {
    render(<PredictHealthHeader {...baseProps} />)
    expect(screen.getByText('5')).toBeInTheDocument()
  })

  it('renders event count', () => {
    render(<PredictHealthHeader {...baseProps} />)
    expect(screen.getByText('42')).toBeInTheDocument()
  })

  it('renders macro score with 1 decimal', () => {
    render(<PredictHealthHeader {...baseProps} />)
    expect(screen.getByText('7.5')).toBeInTheDocument()
  })

  it('renders dash when macroScore is null', () => {
    render(<PredictHealthHeader {...baseProps} macroScore={null} />)
    const dashes = screen.getAllByText('—')
    expect(dashes.length).toBeGreaterThanOrEqual(1)
  })

  it('renders 1d accuracy when available', () => {
    const accuracy: PredictAccuracyResponse = {
      accuracy: {
        '1d': { total: 10, correct: 6, accuracy: 60 },
      },
      recent_validations: [],
    }
    render(<PredictHealthHeader {...baseProps} accuracy={accuracy} />)
    expect(screen.getByText('60.0%')).toBeInTheDocument()
    expect(screen.getByText('6/10')).toBeInTheDocument()
  })

  it('renders dash when accuracy is undefined', () => {
    render(<PredictHealthHeader {...baseProps} accuracy={undefined} />)
    const dashes = screen.getAllByText('—')
    expect(dashes.length).toBeGreaterThanOrEqual(1)
  })

  it('applies green color for accuracy >= 60%', () => {
    const accuracy: PredictAccuracyResponse = {
      accuracy: { '1d': { total: 10, correct: 7, accuracy: 70 } },
      recent_validations: [],
    }
    render(<PredictHealthHeader {...baseProps} accuracy={accuracy} />)
    const accElement = screen.getByText('70.0%')
    expect(accElement.className).toContain('text-green-400')
  })

  it('applies yellow color for accuracy >= 50% and < 60%', () => {
    const accuracy: PredictAccuracyResponse = {
      accuracy: { '1d': { total: 10, correct: 5, accuracy: 55 } },
      recent_validations: [],
    }
    render(<PredictHealthHeader {...baseProps} accuracy={accuracy} />)
    const accElement = screen.getByText('55.0%')
    expect(accElement.className).toContain('text-yellow-400')
  })

  it('applies red color for accuracy < 50%', () => {
    const accuracy: PredictAccuracyResponse = {
      accuracy: { '1d': { total: 10, correct: 3, accuracy: 30 } },
      recent_validations: [],
    }
    render(<PredictHealthHeader {...baseProps} accuracy={accuracy} />)
    const accElement = screen.getByText('30.0%')
    expect(accElement.className).toContain('text-red-400')
  })
})
