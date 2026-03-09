import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ChainLegend } from '../../../components/predict/ChainLegend'

describe('ChainLegend', () => {
  it('renders node types section', () => {
    render(<ChainLegend />)
    expect(screen.getByText('Node types')).toBeInTheDocument()
  })

  it('renders edge relations section', () => {
    render(<ChainLegend />)
    expect(screen.getByText('Edge relations')).toBeInTheDocument()
  })

  it('renders edge thickness section', () => {
    render(<ChainLegend />)
    expect(screen.getByText('Edge thickness')).toBeInTheDocument()
    expect(screen.getByText('weak')).toBeInTheDocument()
    expect(screen.getByText('strong')).toBeInTheDocument()
  })

  it('renders all known node types', () => {
    render(<ChainLegend />)
    expect(screen.getByText('theme')).toBeInTheDocument()
    expect(screen.getByText('core')).toBeInTheDocument()
    expect(screen.getByText('ticker')).toBeInTheDocument()
    expect(screen.getByText('upstream')).toBeInTheDocument()
    expect(screen.getByText('downstream')).toBeInTheDocument()
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
