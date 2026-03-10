import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ApiStatusIndicator } from '../../../components/layout/ApiStatusIndicator'

vi.mock('../../../hooks/usePredictApi', () => ({
  usePredictHealth: vi.fn(),
}))

import { usePredictHealth } from '../../../hooks/usePredictApi'
const mockUsePredictHealth = vi.mocked(usePredictHealth)

function makeSWR(overrides: Record<string, unknown>) {
  return {
    data: undefined,
    error: undefined,
    isLoading: false,
    isValidating: false,
    mutate: vi.fn(),
    ...overrides,
  } as ReturnType<typeof usePredictHealth>
}

describe('ApiStatusIndicator', () => {
  it('shows "Connecting..." while loading', () => {
    mockUsePredictHealth.mockReturnValue(makeSWR({ isLoading: true }))
    render(<ApiStatusIndicator />)
    expect(screen.getByText('Connecting...')).toBeInTheDocument()
    expect(screen.getByTestId('api-status').querySelector('.animate-pulse')).toBeInTheDocument()
  })

  it('shows "API Connected" on success', () => {
    mockUsePredictHealth.mockReturnValue(makeSWR({ data: { status: 'ok' } }))
    render(<ApiStatusIndicator />)
    expect(screen.getByText('API Connected')).toBeInTheDocument()
    expect(screen.getByTestId('api-status').querySelector('.bg-green-500')).toBeInTheDocument()
  })

  it('shows "API Disconnected" on error', () => {
    mockUsePredictHealth.mockReturnValue(makeSWR({ error: new Error('fail') }))
    render(<ApiStatusIndicator />)
    expect(screen.getByText('API Disconnected')).toBeInTheDocument()
    expect(screen.getByTestId('api-status').querySelector('.bg-red-500')).toBeInTheDocument()
  })

  it('shows "API Disconnected" when data is null', () => {
    mockUsePredictHealth.mockReturnValue(makeSWR({ data: undefined }))
    render(<ApiStatusIndicator />)
    expect(screen.getByText('API Disconnected')).toBeInTheDocument()
  })
})
