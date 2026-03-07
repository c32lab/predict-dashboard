import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { EventTable } from '../../../components/predict/EventTable'
import type { Event } from '../../../types/predict'

function makeEvent(overrides: Partial<Event> = {}): Event {
  return {
    id: 1,
    date: '2026-03-06',
    symbol: 'BTC/USDT',
    price_change: 2.5,
    close_price: 65000,
    category: 'Whale Alert',
    event: 'Large BTC transfer detected',
    tags: ['whale', 'transfer'],
    lesson: '',
    pattern_name: '',
    source: 'CryptoQuant',
    created_at: '2026-03-06',
    sources_json: [],
    url: '',
    affected_symbols_json: [],
    structured_sources_json: [],
    ...overrides,
  }
}

describe('EventTable', () => {
  it('renders table headers', () => {
    render(<EventTable events={[]} />)
    expect(screen.getByText('Date')).toBeInTheDocument()
    expect(screen.getByText('Symbol')).toBeInTheDocument()
    expect(screen.getByText('Event')).toBeInTheDocument()
    expect(screen.getByText('Category')).toBeInTheDocument()
    expect(screen.getByText('Source')).toBeInTheDocument()
  })

  it('renders event data', () => {
    render(<EventTable events={[makeEvent()]} />)
    expect(screen.getByText('2026-03-06')).toBeInTheDocument()
    expect(screen.getByText('BTC/USDT')).toBeInTheDocument()
    expect(screen.getByText('Large BTC transfer detected')).toBeInTheDocument()
    expect(screen.getByText('Whale Alert')).toBeInTheDocument()
  })

  it('shows positive price change with + prefix', () => {
    render(<EventTable events={[makeEvent({ price_change: 2.5 })]} />)
    expect(screen.getByText('+2.50%')).toBeInTheDocument()
  })

  it('shows negative price change', () => {
    render(<EventTable events={[makeEvent({ price_change: -1.23 })]} />)
    expect(screen.getByText('-1.23%')).toBeInTheDocument()
  })

  it('shows dash for null price change', () => {
    render(<EventTable events={[makeEvent({ price_change: null as unknown as number })]} />)
    expect(screen.getByText('—')).toBeInTheDocument()
  })

  it('renders source as link when url is present', () => {
    render(<EventTable events={[makeEvent({ url: 'https://example.com', source: 'CQ' })]} />)
    const link = screen.getByText('CQ')
    expect(link.tagName).toBe('A')
    expect(link).toHaveAttribute('href', 'https://example.com')
  })

  it('renders source as text when no url', () => {
    render(<EventTable events={[makeEvent({ url: '', source: 'Twitter' })]} />)
    expect(screen.getByText('Twitter')).toBeInTheDocument()
  })

  it('renders tags', () => {
    render(<EventTable events={[makeEvent({ tags: ['btc', 'alert', 'whale'] })]} />)
    expect(screen.getByText('btc')).toBeInTheDocument()
    expect(screen.getByText('alert')).toBeInTheDocument()
    expect(screen.getByText('whale')).toBeInTheDocument()
  })

  it('limits to max 3 tags', () => {
    render(<EventTable events={[makeEvent({ tags: ['a', 'b', 'c', 'd'] })]} />)
    expect(screen.getByText('a')).toBeInTheDocument()
    expect(screen.getByText('b')).toBeInTheDocument()
    expect(screen.getByText('c')).toBeInTheDocument()
    expect(screen.queryByText('d')).toBeNull()
  })

  it('sorts by date descending and limits to 20', () => {
    const events = Array.from({ length: 25 }, (_, i) => makeEvent({
      id: i,
      date: `2026-03-${String(i + 1).padStart(2, '0')}`,
    }))
    const { container } = render(<EventTable events={events} />)
    const rows = container.querySelectorAll('tbody tr')
    expect(rows).toHaveLength(20)
  })

  it('truncates long event text', () => {
    const longText = 'A'.repeat(80)
    render(<EventTable events={[makeEvent({ event: longText })]} />)
    const truncated = screen.getByText(/^A+…$/)
    expect(truncated.textContent!.length).toBeLessThan(80)
  })

  it('handles empty tags array', () => {
    render(<EventTable events={[makeEvent({ tags: [] })]} />)
    // Should still render without error
    expect(screen.getByText('BTC/USDT')).toBeInTheDocument()
  })

  it('shows zero price change with gray color', () => {
    render(<EventTable events={[makeEvent({ price_change: 0 })]} />)
    expect(screen.getByText('0.00%')).toBeInTheDocument()
  })
})
