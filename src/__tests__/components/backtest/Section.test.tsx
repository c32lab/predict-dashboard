import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Section } from '../../../components/backtest/Section'

describe('Section', () => {
  it('renders the title as an h2', () => {
    render(<Section title="Test Section"><p>content</p></Section>)
    const heading = screen.getByRole('heading', { level: 2 })
    expect(heading).toHaveTextContent('Test Section')
  })

  it('renders children', () => {
    render(
      <Section title="Wrapper">
        <span data-testid="child">Hello</span>
      </Section>
    )
    expect(screen.getByTestId('child')).toHaveTextContent('Hello')
  })
})
