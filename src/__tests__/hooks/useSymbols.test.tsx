import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SymbolsProvider, useSymbols } from '../../hooks/useSymbols'

function TestConsumer() {
  const symbols = useSymbols()
  return (
    <ul>
      {symbols.map((s) => (
        <li key={s}>{s}</li>
      ))}
    </ul>
  )
}

describe('useSymbols', () => {
  it('provides fallback symbols through context', () => {
    render(
      <SymbolsProvider>
        <TestConsumer />
      </SymbolsProvider>
    )
    expect(screen.getByText('BTC/USDT')).toBeInTheDocument()
    expect(screen.getByText('ETH/USDT')).toBeInTheDocument()
    expect(screen.getByText('SOL/USDT')).toBeInTheDocument()
    expect(screen.getByText('BNB/USDT')).toBeInTheDocument()
    expect(screen.getByText('XRP/USDT')).toBeInTheDocument()
  })

  it('returns empty array when used outside provider', () => {
    render(<TestConsumer />)
    const items = screen.queryAllByRole('listitem')
    expect(items).toHaveLength(0)
  })
})
