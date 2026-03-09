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

  it('renders edge strength section', () => {
    render(<ChainLegend />)
    expect(screen.getByText('Edge strength')).toBeInTheDocument()
    expect(screen.getByText('weak')).toBeInTheDocument()
    expect(screen.getByText('strong')).toBeInTheDocument()
  })

  it('renders all known node types', () => {
    render(<ChainLegend />)
    expect(screen.getByText('asset')).toBeInTheDocument()
    expect(screen.getByText('theme')).toBeInTheDocument()
    expect(screen.getByText('sector')).toBeInTheDocument()
    expect(screen.getByText('macro')).toBeInTheDocument()
  })

  it('renders all known edge relations', () => {
    render(<ChainLegend />)
    expect(screen.getByText('chain_member')).toBeInTheDocument()
    expect(screen.getByText('affects_ticker')).toBeInTheDocument()
    expect(screen.getByText('has_ticker')).toBeInTheDocument()
    expect(screen.getByText('correlation')).toBeInTheDocument()
    expect(screen.getByText('transmits')).toBeInTheDocument()
  })
})
