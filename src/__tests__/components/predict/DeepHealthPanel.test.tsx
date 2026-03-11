import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('../../../hooks/usePredictApi', () => ({
  useHealthDeep: vi.fn(),
}))

import { useHealthDeep } from '../../../hooks/usePredictApi'
import { DeepHealthPanel } from '../../../components/predict/DeepHealthPanel'

function mockReturn(overrides: Partial<ReturnType<typeof useHealthDeep>>) {
  vi.mocked(useHealthDeep).mockReturnValue({
    data: undefined,
    error: undefined,
    isLoading: false,
    isValidating: false,
    mutate: vi.fn(),
    ...overrides,
  } as ReturnType<typeof useHealthDeep>)
}

const sampleData = {
  status: 'ok',
  service: 'amani-predict',
  version: '1.2.3',
  db: {},
  db_file: { readable: true, path: '/data/predict.db', size_bytes: 5242880 },
  db_tables: { tables_checked: ['predictions', 'events', 'validations'], missing_tables: [], ok: true },
  predictions_24h: { count_24h: 42 },
  memory: { rss_mb: 128.5 },
  uptime_seconds: 86520,
}

describe('DeepHealthPanel', () => {
  it('shows loading state', () => {
    mockReturn({ isLoading: true })
    render(<DeepHealthPanel />)
    expect(screen.getByText('Loading deep health...')).toBeInTheDocument()
  })

  it('shows error state', () => {
    mockReturn({ error: new Error('connection refused') })
    render(<DeepHealthPanel />)
    expect(screen.getByText(/Failed to load deep health/)).toBeInTheDocument()
  })

  it('returns null when no data', () => {
    mockReturn({})
    const { container } = render(<DeepHealthPanel />)
    expect(container.innerHTML).toBe('')
  })

  it('renders healthy status with data', () => {
    mockReturn({ data: sampleData })
    render(<DeepHealthPanel />)
    expect(screen.getByText('Deep Health')).toBeInTheDocument()
    expect(screen.getByText('Healthy')).toBeInTheDocument()
    expect(screen.getByText('amani-predict')).toBeInTheDocument()
    expect(screen.getByText('v1.2.3')).toBeInTheDocument()
    expect(screen.getByText('5.0 MB')).toBeInTheDocument()
    expect(screen.getByText('Readable')).toBeInTheDocument()
    expect(screen.getByText('3 checked')).toBeInTheDocument()
    expect(screen.getByText('All present')).toBeInTheDocument()
    expect(screen.getByText('42')).toBeInTheDocument()
    expect(screen.getByText('128.5 MB')).toBeInTheDocument()
    expect(screen.getByText('1d 0h 2m')).toBeInTheDocument()
  })

  it('renders degraded status', () => {
    mockReturn({
      data: {
        ...sampleData,
        status: 'degraded',
        db_tables: { tables_checked: ['predictions', 'events'], missing_tables: ['validations'], ok: false },
      },
    })
    render(<DeepHealthPanel />)
    expect(screen.getByText('Degraded')).toBeInTheDocument()
    expect(screen.getByText('1 missing')).toBeInTheDocument()
  })

  it('formats bytes correctly for small files', () => {
    mockReturn({
      data: {
        ...sampleData,
        db_file: { readable: true, path: '/data/predict.db', size_bytes: 512 },
      },
    })
    render(<DeepHealthPanel />)
    expect(screen.getByText('512 B')).toBeInTheDocument()
  })

  it('shows critical anomaly when predictions count is zero', () => {
    mockReturn({
      data: {
        ...sampleData,
        predictions_24h: { count_24h: 0 },
      },
    })
    render(<DeepHealthPanel />)
    expect(screen.getByText('No predictions in 24h')).toBeInTheDocument()
  })

  it('does not show anomaly badge when predictions count is positive', () => {
    mockReturn({ data: sampleData })
    render(<DeepHealthPanel />)
    expect(screen.queryByText('No predictions in 24h')).not.toBeInTheDocument()
  })
})
