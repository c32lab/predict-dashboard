import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ChainLegend } from '../../../components/chain/ChainLegend'

describe('ChainLegend', () => {
  it('renders node types section', () => {
    render(<ChainLegend />)
    expect(screen.getByText('Node types')).toBeInTheDocument()
  })

  it('renders edge relations section', () => {
    render(<ChainLegend />)
    expect(screen.getByText('Edge relations')).toBeInTheDocument()
  })

  it('renders edge strength section with thresholds', () => {
    render(<ChainLegend />)
    expect(screen.getByText('Edge strength')).toBeInTheDocument()
    expect(screen.getByText('< 0.3')).toBeInTheDocument()
    expect(screen.getByText('0.3–0.7')).toBeInTheDocument()
    expect(screen.getByText('> 0.7')).toBeInTheDocument()
  })

  it('renders new node types (asset, theme, sector, macro)', () => {
    render(<ChainLegend />)
    expect(screen.getByText('asset')).toBeInTheDocument()
    expect(screen.getByText('theme')).toBeInTheDocument()
    expect(screen.getByText('sector')).toBeInTheDocument()
    expect(screen.getByText('macro')).toBeInTheDocument()
  })

  it('renders edge relation labels', () => {
    render(<ChainLegend />)
    expect(screen.getByText('chain_member')).toBeInTheDocument()
    expect(screen.getByText('affects_ticker')).toBeInTheDocument()
    expect(screen.getByText('has_ticker')).toBeInTheDocument()
    expect(screen.getByText('correlation')).toBeInTheDocument()
    expect(screen.getByText('transmits')).toBeInTheDocument()
  })
})
